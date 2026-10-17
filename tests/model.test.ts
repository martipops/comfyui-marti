import assert from "node:assert/strict";
import { test } from "node:test";
import { clampStrength, createRow, describeLora, fuzzyScore, isActive, normalizeDeck, STRENGTH } from "../src/model";

test("normalizeDeck accepts objects and JSON strings, drops bad rows", () => {
  const raw = { rows: [{ id: "a", lora: " x.safetensors ", strength: "0.5", on: true }, { lora: 3 }, null] };
  for (const input of [raw, JSON.stringify(raw)]) {
    const deck = normalizeDeck(input);
    assert.equal(deck.rows.length, 1);
    assert.deepEqual(deck.rows[0], { id: "a", on: true, lora: "x.safetensors", strength: 0.5, strengthClip: null });
  }
  assert.deepEqual(normalizeDeck("not json").rows, []);
  assert.deepEqual(normalizeDeck(undefined).rows, []);
});

test("normalizeDeck assigns ids when missing", () => {
  const deck = normalizeDeck({ rows: [{ lora: "a" }, { lora: "b" }] });
  assert.ok(deck.rows[0].id && deck.rows[1].id);
  assert.notEqual(deck.rows[0].id, deck.rows[1].id);
});

test("clampStrength clamps and falls back", () => {
  assert.equal(clampStrength(99), STRENGTH.max);
  assert.equal(clampStrength(-99), STRENGTH.min);
  assert.equal(clampStrength("abc", 0.3), 0.3);
  assert.equal(clampStrength(0.1 + 0.2), 0.3);
});

test("isActive requires on, a file and a non-zero strength", () => {
  assert.equal(isActive(createRow("a")), true);
  assert.equal(isActive(createRow("a", { on: false })), false);
  assert.equal(isActive(createRow("")), false);
  assert.equal(isActive(createRow("a", { strength: 0 })), false);
  assert.equal(isActive(createRow("a", { strength: 0, strengthClip: 0.5 })), true);
});

test("describeLora splits folder and strips extension", () => {
  assert.deepEqual(describeLora("styles\\anime\\cool.safetensors"), { name: "cool", folder: "styles/anime" });
  assert.deepEqual(describeLora("plain.pt"), { name: "plain", folder: "" });
});

test("fuzzyScore ranks name substrings over folder and scattered matches", () => {
  const name = fuzzyScore("krea", "misc/wm_krea2.safetensors");
  const folder = fuzzyScore("krea", "krea/other.safetensors");
  const scattered = fuzzyScore("krea", "k_r_e_a.safetensors");
  assert.ok(name > folder && folder > scattered && scattered > 0);
  assert.equal(fuzzyScore("zzz", "abc"), -1);
  assert.equal(fuzzyScore("", "abc"), 0);
});
