import json
import unittest

from marti.source_switch.switch import MAX_CHANNELS, MAX_SOURCES, Slot, input_name, parse_config

CONFIG = {
    "version": 1,
    "sources": [{"slot": 0, "name": "Krea 2"}, {"slot": 3, "name": " SDXL "}],
    "channels": [{"slot": 0, "name": "MODEL"}, {"slot": 2, "name": "VAE"}],
    "active": 3,
    "mode": "fixed",
}


class ParseConfigTests(unittest.TestCase):
    def test_parses_dict_and_json(self):
        for value in (CONFIG, json.dumps(CONFIG)):
            cfg = parse_config(value)
            self.assertEqual(cfg.sources, (Slot(0, "Krea 2"), Slot(3, "SDXL")))
            self.assertEqual(cfg.channels, (Slot(0, "MODEL"), Slot(2, "VAE")))
            self.assertEqual(cfg.active_source, Slot(3, "SDXL"))

    def test_active_inputs_map_channel_slots_to_outputs(self):
        self.assertEqual(parse_config(CONFIG).active_inputs(), [(0, "s3_c0"), (2, "s3_c2")])

    def test_unknown_active_selects_nothing(self):
        cfg = parse_config({**CONFIG, "active": 7})
        self.assertIsNone(cfg.active_source)
        self.assertEqual(cfg.active_inputs(), [])

    def test_drops_out_of_range_duplicate_and_bad_slots(self):
        cfg = parse_config({"sources": [
            {"slot": 1}, {"slot": 1, "name": "dup"}, {"slot": MAX_SOURCES}, {"slot": -1},
            {"slot": True}, {"slot": "2"}, "junk",
        ], "channels": [{"slot": MAX_CHANNELS - 1, "name": ""}]})
        self.assertEqual(cfg.sources, (Slot(1, "#2"),))
        self.assertEqual(cfg.channels, (Slot(MAX_CHANNELS - 1, f"#{MAX_CHANNELS}"),))

    def test_bad_values_give_empty_config(self):
        for value in (None, "", "{bad", 5, []):
            cfg = parse_config(value)
            self.assertEqual((cfg.sources, cfg.channels, cfg.active), ((), (), None))

    def test_input_names_are_unique_per_slot_pair(self):
        names = {input_name(s, c) for s in range(MAX_SOURCES) for c in range(MAX_CHANNELS)}
        self.assertEqual(len(names), MAX_SOURCES * MAX_CHANNELS)


if __name__ == "__main__":
    unittest.main()
