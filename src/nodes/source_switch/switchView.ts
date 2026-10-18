import type { ComfyNode } from "../../shared/comfy";
import { h, isolateFromCanvas } from "../../shared/dom";
import { createStepper } from "../../shared/stepper";
import type { WidgetView, WidgetViewEvents } from "../../shared/widget";
import { channelLabel, defaultConfig, MAX_CHANNELS, MAX_OUTPUTS, nextChannel, normalizeConfig, type SwitchConfig } from "./model";
import { relabel, syncSockets } from "./sockets";

/** Fixed panel size: the node's sockets start right below it (see index.ts). */
export const LAYOUT = { rowHeight: 26, gap: 6, padding: 6 } as const;
export const PANEL_HEIGHT = LAYOUT.rowHeight * 2 + LAYOUT.gap + LAYOUT.padding * 2;

export class SwitchView implements WidgetView<SwitchConfig> {
  readonly el = h("div.mt-root.ss-switch");
  readonly minHeight = PANEL_HEIGHT;
  private value: SwitchConfig = defaultConfig();
  private readonly select = h("select.ss-select", { "aria-label": "Active channel" });
  private readonly modeBtn = h("button.mt-btn.ss-mode", { type: "button", title: "Switch to the next channel after each queued run" }, "⟳ Cycle");
  private readonly channels = createStepper("Channels", 1, MAX_CHANNELS, (d) =>
    this.update(() => {
      this.value.channels += d;
      this.value.active = Math.min(this.value.active, this.value.channels - 1);
    }, true),
  );
  private readonly outputs = createStepper("Outputs", 1, MAX_OUTPUTS, (d) => this.update(() => (this.value.outputs += d), true));
  private syncQueued = false;

  constructor(private readonly events: WidgetViewEvents, private readonly node: ComfyNode) {
    for (const [key, px] of Object.entries(LAYOUT)) this.el.style.setProperty(`--ss-${key}`, `${px}px`);
    this.el.append(
      h("div.ss-row", {}, h("label.ss-caption", {}, "Channel"), this.select, this.modeBtn),
      h("div.ss-row", {}, this.channels.el, this.outputs.el),
    );
    isolateFromCanvas(this.el);

    this.select.addEventListener("change", () => this.update(() => (this.value.active = Number(this.select.value))));
    this.modeBtn.addEventListener("click", () =>
      this.update(() => (this.value.mode = this.value.mode === "cycle" ? "fixed" : "cycle")),
    );

    const onConnectionsChange = node.onConnectionsChange;
    node.onConnectionsChange = (...args) => {
      onConnectionsChange?.apply(node, args);
      relabel(node, this.value);
    };

    this.render();
    this.scheduleSync();
  }

  get data(): SwitchConfig {
    return this.value;
  }

  setData(raw: unknown) {
    this.value = normalizeConfig(raw);
    this.render();
    this.scheduleSync();
  }

  afterQueued() {
    if (this.value.mode === "cycle") this.update(() => (this.value.active = nextChannel(this.value)));
  }

  dispose() {}

  private update(fn: () => void, sockets = false) {
    fn();
    this.render();
    if (sockets) this.scheduleSync();
    this.events.onChange(false);
  }

  /**
   * Batched to the next frame so loading a workflow finishes restoring links first.
   * Waits (a few frames at most) for a freshly created node to be added to the graph.
   */
  private scheduleSync(attempts = 30) {
    if (this.syncQueued) return;
    this.syncQueued = true;
    requestAnimationFrame(() => {
      this.syncQueued = false;
      if (!this.node.graph) {
        if (attempts > 0) this.scheduleSync(attempts - 1);
        return;
      }
      syncSockets(this.node, this.value);
      this.events.onChange(true);
    });
  }

  private render() {
    const { channels, outputs, active, mode } = this.value;
    if (this.select.options.length !== channels) {
      this.select.replaceChildren(
        ...Array.from({ length: channels }, (_, c) => h("option", { value: c }, channelLabel(c))),
      );
    }
    this.select.value = String(active);
    this.modeBtn.setAttribute("aria-pressed", String(mode === "cycle"));
    this.channels.set(channels);
    this.outputs.set(outputs);
  }
}
