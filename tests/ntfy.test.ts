import assert from "node:assert/strict";
import { test } from "node:test";
import { formatDuration, ntfyBody, ntfyTitle, ntfyUrl } from "../src/ntfy/message";

test("ntfyTitle is the workflow name and run time", () => {
  assert.equal(ntfyTitle({ ok: true, workflow: "portrait", durationMs: 83_000 }), "portrait · 1m 23s");
  assert.equal(ntfyTitle({ ok: false }), "ComfyUI job failed");
});

test("ntfyBody stays minimal but explains failures", () => {
  assert.equal(ntfyBody({ ok: true }), "Done");
  assert.equal(ntfyBody({ ok: false, nodeType: "KSampler", error: "out of\nmemory" }), "Failed at KSampler: out of memory");
});

test("ntfyUrl is disabled without a topic and defaults the server", () => {
  assert.equal(ntfyUrl("https://ntfy.sh", "  ", {}), null);
  assert.equal(ntfyUrl("", "my topic", { title: "x y" }), "https://ntfy.sh/my%20topic?title=x+y");
  assert.match(ntfyUrl("http://box:8080//", "t", {})!, /^http:\/\/box:8080\/t\?$/);
});

test("formatDuration scales units", () => {
  assert.equal(formatDuration(4_400), "4s");
  assert.equal(formatDuration(3_725_000), "1h 2m");
});
