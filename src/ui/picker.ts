import { getLoras, loadLoras } from "../loras";
import { describeLora, fuzzyScore } from "../model";
import { h, isolateFromCanvas } from "./dom";

export interface PickOptions {
  anchor: HTMLElement;
  current?: string;
  /** Files already in the deck, shown with a marker. */
  inUse?: ReadonlySet<string>;
  onPick: (lora: string) => void;
}

const MAX_RESULTS = 200;

/**
 * One shared popover for every LoRA Deck node: fuzzy search, keyboard
 * navigation, and a refresh action. Created lazily on first use.
 */
class Picker {
  private readonly root = h("div.ld-picker", { role: "dialog", "aria-label": "Choose LoRA" });
  private readonly search = h("input.ld-picker-search", {
    type: "search", placeholder: "Search LoRAs…", spellcheck: false, autocomplete: "off",
    role: "combobox", "aria-expanded": true, "aria-controls": "ld-picker-list",
  });
  private readonly refresh = h("button.ld-icon-btn", { type: "button", title: "Rescan LoRA folder" }, "⟳");
  private readonly list = h("ul.ld-picker-list", { id: "ld-picker-list", role: "listbox" });
  private readonly status = h("div.ld-picker-status");
  private options: PickOptions | null = null;
  private results: string[] = [];
  private active = 0;

  constructor() {
    this.root.append(h("div.ld-picker-head", {}, this.search, this.refresh), this.list, this.status);
    isolateFromCanvas(this.root);

    this.search.addEventListener("input", () => this.filter());
    this.search.addEventListener("keydown", (e) => this.onKey(e));
    this.refresh.addEventListener("click", async () => {
      this.setStatus("Rescanning…");
      await loadLoras(true);
      this.filter();
    });
    this.list.addEventListener("pointerdown", (e) => e.preventDefault()); // keep focus in search
    this.list.addEventListener("click", (e) => {
      const item = (e.target as HTMLElement).closest<HTMLElement>("[data-index]");
      if (item) this.choose(Number(item.dataset.index));
    });
    this.list.addEventListener("pointermove", (e) => {
      const item = (e.target as HTMLElement).closest<HTMLElement>("[data-index]");
      if (item) this.highlight(Number(item.dataset.index), false);
    });
  }

  open(options: PickOptions) {
    this.options = options;
    if (!this.root.isConnected) document.body.append(this.root);
    this.root.hidden = false;
    this.search.value = "";
    this.position(options.anchor);
    this.filter();
    this.search.focus();
    document.addEventListener("pointerdown", this.onOutside, true);
    window.addEventListener("blur", this.close);

    if (!getLoras().length) {
      this.setStatus("Loading…");
      loadLoras().then(() => this.options === options && this.filter());
    }
  }

  close = () => {
    if (!this.options) return;
    this.options = null;
    this.root.hidden = true;
    document.removeEventListener("pointerdown", this.onOutside, true);
    window.removeEventListener("blur", this.close);
  };

  private onOutside = (e: PointerEvent) => {
    if (!this.root.contains(e.target as Node)) this.close();
  };

  private position(anchor: HTMLElement) {
    const rect = anchor.getBoundingClientRect();
    const width = Math.max(rect.width, 320);
    const maxHeight = 360;
    const below = window.innerHeight - rect.bottom;
    const top = below >= maxHeight || below >= rect.top ? rect.bottom + 4 : Math.max(8, rect.top - maxHeight - 4);
    const left = Math.min(Math.max(8, rect.left), window.innerWidth - width - 8);
    Object.assign(this.root.style, { top: `${top}px`, left: `${left}px`, width: `${width}px`, maxHeight: `${maxHeight}px` });
  }

  private filter() {
    const query = this.search.value.trim();
    const all = getLoras();
    const matches = query
      ? all
          .map((file) => [file, fuzzyScore(query, file)] as const)
          .filter(([, score]) => score >= 0)
          .sort((a, b) => b[1] - a[1])
          .map(([file]) => file)
      : all;
    this.results = matches.slice(0, MAX_RESULTS);
    this.render();
    const currentIndex = this.options?.current ? this.results.indexOf(this.options.current) : -1;
    this.highlight(currentIndex >= 0 && !query ? currentIndex : 0, true);

    const hidden = matches.length - this.results.length;
    this.setStatus(
      !all.length ? "No LoRAs found in models/loras" :
      !this.results.length ? "No matches" :
      hidden > 0 ? `${hidden} more — refine your search` : "",
    );
  }

  private render() {
    const { current, inUse } = this.options ?? {};
    this.list.replaceChildren(
      ...this.results.map((file, i) => {
        const { name, folder } = describeLora(file);
        return h(`li.ld-picker-item${file === current ? ".ld-current" : ""}`,
          { role: "option", "data-index": i, title: file },
          h("span.ld-picker-name", {}, name),
          folder ? h("span.ld-picker-folder", {}, folder) : null,
          inUse?.has(file) ? h("span.ld-picker-badge", { title: "Already in this deck" }, "in deck") : null,
        );
      }),
    );
  }

  private highlight(index: number, scroll: boolean) {
    if (!this.results.length) return;
    this.active = (index + this.results.length) % this.results.length;
    this.list.querySelector(".ld-active")?.classList.remove("ld-active");
    const item = this.list.children[this.active] as HTMLElement | undefined;
    item?.classList.add("ld-active");
    if (item) this.search.setAttribute("aria-activedescendant", item.id = `ld-opt-${this.active}`);
    if (scroll) item?.scrollIntoView({ block: "nearest" });
  }

  private choose(index: number) {
    const file = this.results[index];
    const options = this.options;
    if (!file || !options) return;
    this.close();
    options.onPick(file);
  }

  private onKey(e: KeyboardEvent) {
    const moves: Record<string, number> = { ArrowDown: 1, ArrowUp: -1, PageDown: 8, PageUp: -8 };
    if (e.key in moves) {
      e.preventDefault();
      this.highlight(this.active + moves[e.key], true);
    } else if (e.key === "Enter") {
      e.preventDefault();
      this.choose(this.active);
    } else if (e.key === "Escape") {
      e.preventDefault();
      const anchor = this.options?.anchor;
      this.close();
      anchor?.focus();
    }
  }

  private setStatus(text: string) {
    this.status.textContent = text;
    this.status.hidden = !text;
  }
}

let instance: Picker | null = null;
export const openPicker = (options: PickOptions) => (instance ??= new Picker()).open(options);
