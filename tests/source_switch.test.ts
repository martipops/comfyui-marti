import assert from "node:assert/strict";
import { test } from "node:test";
import { defaultConfig, desiredInputs, freeSourceSlot, MAX_SOURCES, nextSource, normalizeConfig } from "../src/nodes/source_switch/model";

test("normalizeConfig falls back to defaults on junk", () => {
  for (const junk of [undefined, null, "nope", 5, []]) assert.deepEqual(normalizeConfig(junk), defaultConfig());
});

test("normalizeConfig compacts channels and keeps source slots", () => {
  const cfg = normalizeConfig({
    sources: [{ slot: 4, name: " X " }, { slot: 4 }, { slot: 99 }, { slot: 1.5 }],
    channels: [{ slot: 3, name: "VAE" }, { slot: 6 }],
    active: 4,
    mode: "cycle",
  });
  assert.deepEqual(cfg.sources, [{ slot: 4, name: "X" }]);
  assert.deepEqual(cfg.channels, [{ slot: 0, name: "VAE" }, { slot: 1, name: "" }]);
  assert.equal(cfg.active, 4);
  assert.equal(cfg.mode, "cycle");
});

test("unknown active falls back to the first source", () => {
  assert.equal(normalizeConfig({ sources: [{ slot: 2 }, { slot: 5 }], channels: [], active: 9 }).active, 2);
});

test("desiredInputs groups by source then channel", () => {
  const cfg = normalizeConfig({ sources: [{ slot: 3 }, { slot: 0 }], channels: [{ slot: 0 }, { slot: 1 }], active: 3 });
  assert.deepEqual(desiredInputs(cfg), ["s3_c0", "s3_c1", "s0_c0", "s0_c1"]);
});

test("nextSource wraps and freeSourceSlot finds gaps", () => {
  const cfg = normalizeConfig({ sources: [{ slot: 0 }, { slot: 2 }], channels: [{ slot: 0 }], active: 2 });
  assert.equal(nextSource(cfg), 0);
  assert.equal(freeSourceSlot(cfg), 1);
  const full = normalizeConfig({ sources: Array.from({ length: MAX_SOURCES }, (_, slot) => ({ slot })), channels: [] });
  assert.equal(freeSourceSlot(full), null);
});
