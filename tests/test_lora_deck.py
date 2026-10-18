import json
import os
import tempfile
import unittest

from marti.lora_deck.cache import LoraFileCache
from marti.lora_deck.deck import STRENGTH_MAX, LoraRow, active_rows, parse_deck


class ParseDeckTests(unittest.TestCase):
    RAW = {"version": 1, "rows": [
        {"id": "a", "on": True, "lora": " a.safetensors ", "strength": 0.8, "strengthClip": None},
        {"id": "b", "on": False, "lora": "b.safetensors", "strength": 1},
        {"id": "c", "on": True, "lora": "c.safetensors", "strength": 0},
        {"id": "d", "on": True, "lora": "", "strength": 1},
        {"lora": 5}, "junk",
    ]}

    def test_parses_dict_and_json_string(self):
        for value in (self.RAW, json.dumps(self.RAW)):
            rows = parse_deck(value)
            self.assertEqual(len(rows), 4)
            self.assertEqual(rows[0], LoraRow("a.safetensors", 0.8, None, True))

    def test_bad_input_yields_no_rows(self):
        for value in (None, "", "{bad", 3, {"rows": "x"}):
            self.assertEqual(parse_deck(value), [])

    def test_active_rows_skip_off_zero_and_empty(self):
        self.assertEqual([r.lora for r in active_rows(self.RAW, has_clip=False)], ["a.safetensors"])

    def test_clip_strength(self):
        row = LoraRow("x", strength=0.5, strength_clip=None)
        self.assertEqual(row.strengths(has_clip=True), (0.5, 0.5))
        self.assertEqual(row.strengths(has_clip=False), (0.5, 0.0))
        self.assertEqual(LoraRow("x", 0.0, 0.7).strengths(True), (0.0, 0.7))
        self.assertTrue(LoraRow("x", 0.0, 0.7).is_active(has_clip=True))
        self.assertFalse(LoraRow("x", 0.0, 0.7).is_active(has_clip=False))

    def test_strength_is_clamped(self):
        rows = parse_deck({"rows": [{"lora": "x", "strength": 1e9}, {"lora": "y", "strength": "nan"}]})
        self.assertEqual(rows[0].strength, STRENGTH_MAX)
        self.assertEqual(rows[1].strength, 1.0)


class _Sized:
    def __init__(self, nbytes):
        self.nbytes = nbytes


class LoraFileCacheTests(unittest.TestCase):
    def setUp(self):
        self.dir = tempfile.TemporaryDirectory()
        self.loads = []

    def tearDown(self):
        self.dir.cleanup()

    def _file(self, name):
        path = os.path.join(self.dir.name, name)
        with open(path, "w") as f:
            f.write(name)
        return path

    def _cache(self, max_bytes):
        def loader(path):
            self.loads.append(os.path.basename(path))
            return {"w": _Sized(100)}, None
        return LoraFileCache(loader, max_bytes)

    def test_hits_avoid_reloading(self):
        cache, a = self._cache(1000), self._file("a")
        cache.get(a)
        cache.get(a)
        self.assertEqual(self.loads, ["a"])

    def test_reload_when_file_changes(self):
        cache, a = self._cache(1000), self._file("a")
        cache.get(a)
        os.utime(a, (1, 1))
        cache.get(a)
        self.assertEqual(self.loads, ["a", "a"])

    def test_evicts_least_recently_used(self):
        cache = self._cache(250)
        a, b, c = self._file("a"), self._file("b"), self._file("c")
        cache.get(a)
        cache.get(b)
        cache.get(a)  # a is now most recent
        cache.get(c)  # over budget: evicts b
        cache.get(a)
        cache.get(b)
        self.assertEqual(self.loads, ["a", "b", "c", "b"])


if __name__ == "__main__":
    unittest.main()
