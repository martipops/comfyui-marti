// Bundles src/ into a single ES module in web/ (ComfyUI loads every .js in web/).
// ComfyUI's own modules (../../scripts/*.js) stay external and resolve at runtime.
import * as esbuild from "esbuild";
import { rmSync } from "node:fs";

const args = new Set(process.argv.slice(2));

const shared = {
  bundle: true,
  format: "esm",
  target: "es2022",
  loader: { ".css": "text" },
  logLevel: "info",
};

if (args.has("--tests")) {
  rmSync(".test-build", { recursive: true, force: true });
  await esbuild.build({
    ...shared,
    entryPoints: ["tests/*.test.ts"],
    outdir: ".test-build",
    platform: "node",
    outExtension: { ".js": ".mjs" },
  });
} else {
  const ctx = await esbuild.context({
    ...shared,
    entryPoints: { marti: "src/index.ts" },
    outdir: "web",
    external: ["../../scripts/*"],
    minify: !args.has("--watch"),
    sourcemap: args.has("--watch") ? "inline" : false,
    legalComments: "none",
  });
  if (args.has("--watch")) {
    await ctx.watch();
  } else {
    await ctx.rebuild();
    await ctx.dispose();
  }
}
