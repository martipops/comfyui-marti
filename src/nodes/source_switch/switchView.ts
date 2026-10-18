import type { ComfyNode } from "../../shared/comfy";
import { h, isolateFromCanvas } from "../../shared/dom";
import type { WidgetView, WidgetViewEvents } from "../../shared/widget";
import {
  defaultConfig,
  freeSourceSlot,
  MAX_CHANNELS,
  nextSource,
  normalizeConfig,
  sourceLabel,
  type SwitchConfig,
} from "./model";
import { channelTypes, relabel, removeChannelSockets, syncSockets } from "./sockets";

/** Layout metrics shared with the stylesheet via CSS variables. */
export const LAYOUT = { rowHeight: 26, gap: 6, padding: 6 } as const;

export class SwitchView implements WidgetView<SwitchConfig> {
  readonly el = h("div.mt-root.ss-switch");
  private value: SwitchConfig = defaultConfig();
  private readonly tabsEl = h("div.ss-tabs", { role: "tablist", "aria-label": "Sources" });
  private readonly addSourceBtn = h("button.mt-icon-btn.ss-add", { type: "button", title: "Add source" }, "+");
  private readonly modeBtn = h("button.mt-btn.ss-mode", { type: "button", title: "Cycle: switch to the next source after each queued run" }, "⟳ Cycle");
  private readonly channelsEl = h("div.ss-channels");
  private readonly addChannelBtn = h("button.mt-icon-btn.ss-add", { type: "button", title: "Add output" }, "+");
  private syncQueued = false;

  constructor(private readonly events: WidgetViewEvents, private readonly node: ComfyNode) {
    for (const [key, px] of Object.entries(LAYOUT)) this.el.style.setProperty(`--ss-${key}`, `${px}px`);
    this.el.append(
      h("div.ss-row", {}, this.tabsEl, this.addSourceBtn, this.modeBtn),
      h("div.ss-row", {}, h("span.ss-caption", {}, "Outputs"), this.channelsEl, this.addChannelBtn),
    );
    isolateFromCanvas(this.el);

    this.tabsEl.addEventListener("click", (e) => this.onTabClick(e));
    this.tabsEl.addEventListener("dblclick", (e) => this.renameSource(e));
    this.tabsEl.addEventListener("keydown", (e) => this.onTabKey(e));
    this.addSourceBtn.addEventListener("click", () => this.addSource());
    this.modeBtn.addEventListener("click", () =>
      this.update(() => (this.value.mode = this.value.mode === "cycle" ? "fixed" : "cycle")),
    );
    this.channelsEl.addEventListener("click", (e) => this.onChannelClick(e));
    this.channelsEl.addEventListener("change", (e) => this.onChannelRename(e));
    this.addChannelBtn.addEventListener("click", () => this.addChannel());

    const onConnectionsChange = node.onConnectionsChange;
    node.onConnectionsChange = (...args) => {
      onConnectionsChange?.apply(node, args);
      relabel(node, this.value);
      this.render();
    };

    this.render();
    this.scheduleSync();
  }

  get data(): SwitchConfig {
    return this.value;
  }

  get minHeight(): number {
    return LAYOUT.rowHeight * 2 + LAYOUT.gap + LAYOUT.padding * 2;
  }

  setData(raw: unknown) {
    this.value = normalizeConfig(raw);
    this.render();
    this.scheduleSync();
  }

  afterQueued() {
    if (this.value.mode !== "cycle") return;
    const next = nextSource(this.value);
    if (next !== null) this.update(() => (this.value.active = next));
  }

  dispose() {}

  // --- state ---------------------------------------------------------------

  private update(fn: () => void, sockets = false) {
    fn();
    this.render();
    if (sockets) this.scheduleSync();
    else relabel(this.node, this.value);
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
      this.render();
      this.events.onChange(true);
    });
  }

  private addSource() {
    const slot = freeSourceSlot(this.value);
    if (slot === null) return;
    this.update(() => this.value.sources.push({ slot, name: String.fromCharCode(65 + this.value.sources.length) }), true);
  }

  private addChannel() {
    const { channels } = this.value;
    if (channels.length >= MAX_CHANNELS) return;
    this.update(() => channels.push({ slot: channels.length, name: "" }), true);
  }

  private onTabClick(e: MouseEvent) {
    const tab = (e.target as HTMLElement).closest<HTMLElement>("[data-slot]");
    if (!tab) return;
    const slot = Number(tab.dataset.slot);
    if ((e.target as HTMLElement).closest(".ss-tab-remove")) {
      this.update(() => {
        const sources = this.value.sources.filter((s) => s.slot !== slot);
        this.value.sources = sources;
        if (this.value.active === slot) this.value.active = sources[0]?.slot ?? null;
      }, true);
    } else {
      this.update(() => (this.value.active = slot));
    }
  }

  private onTabKey(e: KeyboardEvent) {
    const dir = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    const { sources } = this.value;
    const i = sources.findIndex((s) => s.slot === this.value.active);
    const next = sources[(i + dir + sources.length) % sources.length];
    if (!next) return;
    this.update(() => (this.value.active = next.slot));
    this.tabsEl.querySelector<HTMLElement>(`[data-slot="${next.slot}"]`)?.focus();
  }

  private renameSource(e: MouseEvent) {
    const tab = (e.target as HTMLElement).closest<HTMLElement>("[data-slot]");
    const source = this.value.sources.find((s) => s.slot === Number(tab?.dataset.slot));
    if (!tab || !source) return;
    const input = h("input.ss-tab-input", { type: "text", value: source.name, "aria-label": "Source name" });
    const finish = (commit: boolean) => {
      if (!input.isConnected) return;
      input.remove();
      if (commit) this.update(() => (source.name = input.value.trim()));
      else this.render();
    };
    input.addEventListener("keydown", (ev) => {
      ev.stopPropagation();
      if (ev.key === "Enter") finish(true);
      else if (ev.key === "Escape") finish(false);
    });
    input.addEventListener("blur", () => finish(true));
    tab.replaceChildren(input);
    input.focus();
    input.select();
  }

  private onChannelClick(e: MouseEvent) {
    const remove = (e.target as HTMLElement).closest<HTMLElement>(".ss-chip-remove");
    if (!remove) return;
    const c = Number(remove.dataset.channel);
    removeChannelSockets(this.node, c);
    this.update(() => {
      this.value.channels = this.value.channels.filter((_, i) => i !== c).map((ch, i) => ({ ...ch, slot: i }));
    }, true);
  }

  private onChannelRename(e: Event) {
    const input = e.target as HTMLInputElement;
    const channel = this.value.channels[Number(input.dataset.channel)];
    if (channel) this.update(() => (channel.name = input.value.trim()));
  }

  // --- rendering -------------------------------------------------------------

  private render() {
    const { sources, channels, active, mode } = this.value;
    this.tabsEl.replaceChildren(
      ...sources.map((s) =>
        h(`div.ss-tab${s.slot === active ? ".ss-active" : ""}`,
          { role: "tab", tabindex: s.slot === active ? 0 : -1, "aria-selected": s.slot === active,
            "data-slot": s.slot, title: "Click to activate · double-click to rename" },
          h("span.ss-tab-label", {}, sourceLabel(s)),
          sources.length > 1 ? h("button.ss-tab-remove", { type: "button", title: "Remove source", "aria-label": "Remove source" }, "×") : null,
        ),
      ),
    );
    this.addSourceBtn.disabled = freeSourceSlot(this.value) === null;
    this.modeBtn.setAttribute("aria-pressed", String(mode === "cycle"));

    const types = channelTypes(this.node, this.value);
    // Keep focus if the user is typing in a chip.
    const focused = this.channelsEl.contains(document.activeElement);
    if (!focused || this.channelsEl.children.length !== channels.length) {
      this.channelsEl.replaceChildren(
        ...channels.map((c, i) =>
          h("span.ss-chip", {},
            h("input.ss-chip-input", { type: "text", value: c.name, placeholder: types[i] !== "*" ? types[i] : `out ${i + 1}`,
              "data-channel": i, "aria-label": `Output ${i + 1} name`, size: 6 }),
            channels.length > 1 ? h("button.ss-chip-remove", { type: "button", "data-channel": i, title: "Remove output", "aria-label": "Remove output" }, "×") : null,
          ),
        ),
      );
    }
    this.addChannelBtn.disabled = channels.length >= MAX_CHANNELS;
  }
}
