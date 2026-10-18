// Mounts a DOM-based view as a ComfyUI widget. Every custom widget in the pack goes through here.
import type { ComfyNode, CustomWidgetFactory } from "./comfy";

export interface WidgetViewEvents {
  /** `structural` is true when the view's height may have changed, so the node gets refit. */
  onChange(structural: boolean): void;
}

export interface WidgetView<V> {
  readonly el: HTMLElement;
  readonly data: V;
  readonly minHeight: number;
  setData(raw: unknown): void;
  dispose(): void;
  /** Called by ComfyUI after each queued run (same hook as "control after generate"). */
  afterQueued?(): void;
}

export function domWidget<V>(
  type: string,
  createView: (events: WidgetViewEvents, node: ComfyNode) => WidgetView<V>,
  minWidth: number,
): CustomWidgetFactory {
  return (node, inputName) => {
    const fitNode = () => node.setSize([node.size[0], node.computeSize()[1]]);

    const view = createView(
      {
        onChange(structural) {
          if (structural) fitNode();
          node.setDirtyCanvas(true, true);
        },
      },
      node,
    );

    const widget = node.addDOMWidget<V>(inputName, type, view.el, {
      getValue: () => view.data,
      setValue: (value) => view.setData(value),
      getMinHeight: () => view.minHeight,
      hideOnZoom: true,
      margin: 4,
    });
    if (view.afterQueued) Object.assign(widget, { afterQueued: () => view.afterQueued!() });

    const onRemoved = node.onRemoved;
    node.onRemoved = function () {
      view.dispose();
      onRemoved?.call(this);
    };

    requestAnimationFrame(fitNode);
    return { widget, minWidth };
  };
}
