import assert from "node:assert/strict";
import { test } from "node:test";
import { civitaiThumb, formatBytes, formatCount, progressFraction, progressText } from "../src/downloader/format";

test("formatBytes picks a unit", () => {
  assert.equal(formatBytes(0), "");
  assert.equal(formatBytes(512), "512 B");
  assert.equal(formatBytes(1536), "1.5 KB");
  assert.equal(formatBytes(6_938_040_682), "6.5 GB");
});

test("formatCount abbreviates", () => {
  assert.equal(formatCount(999), "999");
  assert.equal(formatCount(1234), "1.2k");
  assert.equal(formatCount(56_000), "56k");
  assert.equal(formatCount(1_557_669), "1.6M");
});

test("civitaiThumb asks for a small rendition", () => {
  const base = "https://image.civitai.com/key/uuid";
  assert.equal(civitaiThumb(`${base}/width=450/a.jpeg`), `${base}/width=160/a.jpeg`);
  assert.equal(civitaiThumb(`${base}/original=true/a.jpeg`, 200), `${base}/width=200/a.jpeg`);
  assert.equal(civitaiThumb("https://other.host/a.jpeg"), "https://other.host/a.jpeg");
});

test("progress text covers each state", () => {
  const job = { status: "downloading", size: 2 * 1024 ** 3, done: 1024 ** 3, speed: 50 * 1024 ** 2, error: null };
  assert.equal(progressFraction(job), 0.5);
  assert.equal(progressText(job), "50% · 1 GB of 2 GB · 50 MB/s");
  assert.equal(progressFraction({ ...job, size: null }), null);
  assert.equal(progressText({ ...job, size: null, speed: 0, done: 1.25 * 1024 ** 3 }), "1.3 GB");
  assert.equal(progressText({ ...job, status: "error", error: "HTTP 401" }), "HTTP 401");
  assert.equal(progressText({ ...job, status: "done" }), "Done · 2 GB");
});
