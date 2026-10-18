import assert from "node:assert/strict";
import { test } from "node:test";
import { describePath, fuzzyScore } from "../src/shared/text";
import { rawRows } from "../src/shared/value";

test("rawRows reads objects and JSON strings, tolerates junk", () => {
  assert.deepEqual(rawRows({ rows: [1, 2] }), [1, 2]);
  assert.deepEqual(rawRows('{"rows":[3]}'), [3]);
  for (const junk of [undefined, null, "nope", { rows: "x" }, 5]) assert.deepEqual(rawRows(junk), []);
});

test("describePath splits folder and strips extension", () => {
  assert.deepEqual(describePath("styles\\anime\\cool.safetensors"), { name: "cool", folder: "styles/anime" });
  assert.deepEqual(describePath("plain.pt"), { name: "plain", folder: "" });
});

test("fuzzyScore ranks name substrings over folder and scattered matches", () => {
  const name = fuzzyScore("krea", "misc/wm_krea2.safetensors");
  const folder = fuzzyScore("krea", "krea/other.safetensors");
  const scattered = fuzzyScore("krea", "k_r_e_a.safetensors");
  assert.ok(name > folder && folder > scattered && scattered > 0);
  assert.equal(fuzzyScore("zzz", "abc"), -1);
  assert.equal(fuzzyScore("", "abc"), 0);
});
