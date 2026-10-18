import { h, isolateFromCanvas, syncKeyed } from "../../shared/dom";
import { modelFolder } from "../../shared/modelFolder";
import { openPicker } from "../../shared/picker";
import { createScrubber, type Scrubber } from "../../shared/scrubber";
import { describePath } from "../../shared/text";
import { createToggle, enableTogglePainting, type Toggle } from "../../shared/toggle";
import type { WidgetView, WidgetViewEvents } from "../../shared/widget";
import { createRow, emptyDeck, isActive, normalizeDeck, STRENGTH, type DeckRow, type DeckValue } from "./model";

const loras = modelFolder("loras", "LoRA");

/** Layout metrics shared with the stylesheet via CSS variables. */
export const LAYOUT = { headerHeight: 30, rowHeight: 30, rowGap: 4, emptyHeight: 44, padding: 6 } as const;

interface RowView {
  el: HTMLElement;
  toggle: Toggle;
  name: HTMLButtonElement;
  scrubber: Scrubber;
}

export class DeckView implements WidgetView<DeckValue> {
  readonly el = h("div.mt-root.ld-deck");
  private value: DeckValue = emptyDeck();
  private readonly views = new Map<string, RowView>();
  private readonly rowsEl = h("div.ld-rows", { role: "list" });
  private readonly masterToggle = createToggle("Toggle all LoRAs");
  private readonly countEl = h("span.ld-count");
  private readonly addBtn = h("button.mt-btn.ld-add", { type: "button", title: "Add a LoRA" }, "+ Add LoRA");
  private readonly emptyEl = h("button.ld-empty", { type: "button" }, "No LoRAs yet — click to add one");
  private readonly unsubscribe: () => void;

  constructor(private readonly events: WidgetViewEvents) {
    for (const [key, px] of Object.entries(LAYOUT)) this.el.style.setProperty(`--ld-${key}`, `${px}px`);

    this.masterToggle.el.classList.add("ld-master");
    this.el.append(
      h("div.ld-header", {}, this.masterToggle.el, this.countEl, this.addBtn),
      this.rowsEl,
      this.emptyEl,
    );
    isolateFromCanvas(this.el);

    this.addBtn.addEventListener("click", () => this.pickNew(this.addBtn));
    this.emptyEl.addEventListener("click", () => this.pickNew(this.emptyEl));
    this.masterToggle.el.addEventListener("click", () => {
      const turnOn = !this.value.rows.every((r) => r.on);
      this.mutate(() => this.value.rows.forEach((r) => (r.on = turnOn)));
    });
    enableTogglePainting(this.rowsEl, (target) => {
      const row = this.rowFromEvent(target, ".mt-toggle");
      return row && { current: row.on, apply: (on) => this.mutate(() => (row.on = on)) };
    });
    this.rowsEl.addEventListener("click", (e) => this.onRowClick(e));

    this.unsubscribe = loras.onChanged(() => this.render());
    loras.load();
    this.render();
  }

  get data(): DeckValue {
    return this.value;
  }

  setData(raw: unknown) {
    this.value = normalizeDeck(raw);
    this.render();
  }

  get minHeight(): number {
    const n = this.value.rows.length;
    const body = n ? n * LAYOUT.rowHeight + (n - 1) * LAYOUT.rowGap : LAYOUT.emptyHeight;
    return LAYOUT.headerHeight + LAYOUT.rowGap + body + LAYOUT.padding * 2;
  }

  dispose() {
    this.unsubscribe();
  }

  // --- state ---------------------------------------------------------------

  private mutate(fn: () => void, structural = false) {
    fn();
    this.render();
    this.events.onChange(structural);
  }

  private findRow(id: string | undefined): DeckRow | undefined {
    return id ? this.value.rows.find((r) => r.id === id) : undefined;
  }

  private rowFromEvent(target: EventTarget | null, selector: string): DeckRow | undefined {
    const hit = (target as HTMLElement | null)?.closest?.(selector);
    return hit ? this.findRow(hit.closest<HTMLElement>(".ld-row")?.dataset.id) : undefined;
  }

  private pickNew(anchor: HTMLElement) {
    openPicker({
      source: loras,
      anchor,
      inUse: new Set(this.value.rows.map((r) => r.lora)),
      onPick: (lora) => this.mutate(() => this.value.rows.push(createRow(lora)), true),
    });
  }

  private onRowClick(e: MouseEvent) {
    const target = e.target as HTMLElement;
    const row = this.rowFromEvent(target, ".ld-row");
    if (!row) return;
    if (target.closest(".ld-remove")) {
      this.mutate(() => (this.value.rows = this.value.rows.filter((r) => r !== row)), true);
    } else if (target.closest(".ld-name")) {
      openPicker({
        source: loras,
        anchor: this.views.get(row.id)!.name,
        current: row.lora,
        inUse: new Set(this.value.rows.map((r) => r.lora)),
        onPick: (lora) => this.mutate(() => (row.lora = lora)),
      });
    }
  }

  // --- rendering -------------------------------------------------------------

  private render() {
    const { rows } = this.value;
    syncKeyed(this.rowsEl, this.views, rows, (row) => this.createRowView(row), (view, row) => this.updateRowView(view, row));

    const active = rows.filter(isActive).length;
    this.masterToggle.set(rows.length > 0 && active === rows.length, active > 0 && active < rows.length);
    this.masterToggle.el.disabled = rows.length === 0;
    this.countEl.textContent = rows.length ? `${active} of ${rows.length} active` : "";
    this.emptyEl.hidden = rows.length > 0;
    this.rowsEl.hidden = rows.length === 0;
  }

  private createRowView(row: DeckRow): RowView {
    const toggle = createToggle("Enable LoRA");
    const name = h("button.ld-name", { type: "button" });
    const { id } = row;
    const scrubber = createScrubber("Strength", STRENGTH, (value, commit) => {
      // Look the row up by id: setData() replaces row objects but keeps views.
      const current = this.findRow(id);
      if (!current) return;
      current.strength = value;
      // Live-update while dragging; only notify the graph once the drag ends.
      if (commit) this.mutate(() => {});
      else this.render();
    });
    const remove = h("button.mt-icon-btn.ld-remove", { type: "button", title: "Remove", "aria-label": "Remove LoRA" }, "×");
    const el = h("div.ld-row", { role: "listitem", "data-id": row.id }, toggle.el, name, scrubber.el, remove);
    return { el, toggle, name, scrubber };
  }

  private updateRowView(view: RowView, row: DeckRow) {
    const { name, folder } = describePath(row.lora);
    const missing = loras.isMissing(row.lora);
    view.toggle.set(row.on);
    view.scrubber.set(row.strength);
    view.el.classList.toggle("ld-off", !row.on);
    view.el.classList.toggle("ld-missing", missing);
    view.name.title = missing ? `Not found in models/loras: ${row.lora}` : row.lora || "Choose a LoRA";
    view.name.replaceChildren(
      h("span.ld-name-text", {}, name || "Choose a LoRA…"),
      folder ? h("span.ld-name-folder", {}, folder) : "",
      missing ? h("span.ld-warn", { "aria-hidden": true }, "⚠") : "",
    );
  }
}
