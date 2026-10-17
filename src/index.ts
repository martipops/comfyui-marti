import { app, type ComfyNode } from "./comfy";
import type { DeckValue } from "./model";
import styles from "./styles.css";
import { DeckView } from "./ui/deckView";

const WIDGET_TYPE = "LORA_DECK"; // must match lora_deck/nodes.py

function injectStyles() {
  const id = "lora-deck-styles";
  if (document.getElementById(id)) return;
  const style = document.createElement("style");
  style.id = id;
  style.textContent = styles;
  document.head.append(style);
}

function createDeckWidget(node: ComfyNode, inputName: string) {
  const fitNode = () => {
    const [, minHeight] = node.computeSize();
    node.setSize([node.size[0], minHeight]);
  };

  const view = new DeckView({
    onChange(structural) {
      if (structural) fitNode();
      node.setDirtyCanvas(true, true);
    },
  });

  const widget = node.addDOMWidget<DeckValue>(inputName, WIDGET_TYPE, view.el, {
    getValue: () => view.data,
    setValue: (value) => view.setData(value),
    getMinHeight: () => view.minHeight,
    hideOnZoom: true,
    margin: 4,
  });

  const onRemoved = node.onRemoved;
  node.onRemoved = function () {
    view.dispose();
    onRemoved?.call(this);
  };

  requestAnimationFrame(fitNode);
  return { widget, minWidth: 340 };
}

app.registerExtension({
  name: "LoraDeck",
  setup: injectStyles,
  getCustomWidgets: () => ({ [WIDGET_TYPE]: createDeckWidget }),
});
