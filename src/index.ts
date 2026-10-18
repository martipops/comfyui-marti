import { loraDeck } from "./nodes/lora_deck";
import { app } from "./shared/comfy";
import type { MartiNode } from "./shared/node";
import theme from "./shared/theme.css";

const NODES: MartiNode[] = [loraDeck];

function injectStyles() {
  const id = "comfyui-marti-styles";
  if (document.getElementById(id)) return;
  const style = document.createElement("style");
  style.id = id;
  style.textContent = [theme, ...NODES.map((n) => n.styles ?? "")].join("\n");
  document.head.append(style);
}

app.registerExtension({
  name: "comfyui-marti",
  setup: injectStyles,
  getCustomWidgets: () => Object.assign({}, ...NODES.map((n) => n.widgets ?? {})),
});
