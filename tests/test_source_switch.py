import json
import unittest

from marti.source_switch.switch import MAX_CHANNELS, MAX_OUTPUTS, SwitchConfig, input_name, parse_config

CONFIG = {"version": 2, "channels": 3, "outputs": 2, "active": 1, "mode": "fixed"}


class ParseConfigTests(unittest.TestCase):
    def test_parses_dict_and_json(self):
        for value in (CONFIG, json.dumps(CONFIG)):
            self.assertEqual(parse_config(value), SwitchConfig(channels=3, outputs=2, active=1))

    def test_active_inputs_map_outputs_in_order(self):
        self.assertEqual(parse_config(CONFIG).active_inputs(), [(0, "c1_o0"), (1, "c1_o1")])

    def test_active_out_of_range_selects_nothing(self):
        for active in (3, -1, "1", True, None):
            cfg = parse_config({**CONFIG, "active": active})
            self.assertFalse(cfg.has_active, active)
            self.assertEqual(cfg.active_inputs(), [])

    def test_connected_channel_overrides_and_wraps(self):
        cfg = parse_config(CONFIG)  # 3 channels, widget says C1
        self.assertEqual(cfg.select(None).active, 1)
        for channel, expected in ((0, 0), (2, 2), (3, 0), (7, 1), (-1, 2)):
            self.assertEqual(cfg.select(channel).active, expected, channel)
        self.assertEqual(cfg.select(5).active_inputs(), [(0, "c2_o0"), (1, "c2_o1")])

    def test_select_on_empty_config_is_noop(self):
        cfg = parse_config(None)
        self.assertEqual(cfg.select(4), cfg)

    def test_counts_are_clamped(self):
        cfg = parse_config({"channels": 99, "outputs": -4, "active": 0})
        self.assertEqual((cfg.channels, cfg.outputs), (MAX_CHANNELS, 0))

    def test_bad_values_give_empty_config(self):
        for value in (None, "", "{bad", 5, []):
            self.assertEqual(parse_config(value), SwitchConfig(channels=0, outputs=0, active=-1))

    def test_input_names_are_unique(self):
        names = {input_name(c, o) for c in range(MAX_CHANNELS) for o in range(MAX_OUTPUTS)}
        self.assertEqual(len(names), MAX_CHANNELS * MAX_OUTPUTS)


if __name__ == "__main__":
    unittest.main()
