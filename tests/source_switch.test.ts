import assert from "node:assert/strict";
import { test } from "node:test";
import { dropOptionalInputs, keepOutputs, type NodeDef } from "../src/shared/node";
import { defaultConfig, desiredInputs, INPUT_NAME, MAX_CHANNELS, nextChannel, normalizeConfig } from "../src/nodes/source_switch/model";

test("normalizeConfig falls back to defaults on junk", () => {
  for (const junk of [undefined, null, "nope", 5, []]) assert.deepEqual(normalizeConfig(junk), defaultConfig());
});

test("normalizeConfig clamps counts and active", () => {
  const cfg = normalizeConfig({ channels: 99, outputs: 0, active: 50, mode: "cycle" });
  assert.deepEqual(cfg, { version: 2, channels: MAX_CHANNELS, outputs: 1, active: MAX_CHANNELS - 1, mode: "cycle" });
  assert.equal(normalizeConfig({ channels: 3, outputs: 1, active: 1.5 }).active, 0);
});

test("desiredInputs groups by channel then output", () => {
  assert.deepEqual(desiredInputs(normalizeConfig({ channels: 2, outputs: 2 })), ["c0_o0", "c0_o1", "c1_o0", "c1_o1"]);
});

test("nextChannel wraps", () => {
  assert.equal(nextChannel(normalizeConfig({ channels: 3, outputs: 1, active: 2 })), 0);
  assert.equal(nextChannel(normalizeConfig({ channels: 3, outputs: 1, active: 0 })), 1);
});

test("node def patch helpers trim sockets", () => {
  const def: NodeDef = {
    input: { required: { config: [] }, optional: { c0_o0: [], c1_o0: [], keep: [] } },
    input_order: { required: ["config"], optional: ["c0_o0", "c1_o0", "keep"] },
    output: ["*", "*", "*"], output_is_list: [false, false, false], output_name: ["a", "b", "c"],
  };
  dropOptionalInputs(def, (n) => INPUT_NAME.test(n));
  keepOutputs(def, 1);
  assert.deepEqual(Object.keys(def.input!.optional!), ["keep"]);
  assert.deepEqual(def.input_order!.optional, ["keep"]);
  assert.deepEqual([def.output, def.output_name, def.output_tooltips], [["*"], ["a"], undefined]);
});
