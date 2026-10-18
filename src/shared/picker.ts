import { h, isolateFromCanvas } from "./dom";
import { describePath, fuzzyScore } from "./text";

/** A searchable list of strings, e.g. files in one models/ folder. */
export interface PickSource {
  /** Singular noun for labels, e.g. "LoRA". */
  noun: string;
  list(): readonly string[];
  load(force?: boolean): Promise<unknown>;
  emptyText: string;
}

export interface PickOptions {
  source: PickSource;
  anchor: HTMLElement;
  current?: string;
  /** Items already used by the caller, shown with a marker. */
  inUse?: ReadonlySet<string>;
  onPick: (item: string) => void;
}

const MAX_RESULTS = 200;

/**
 * One shared popover for every node: fuzzy search, keyboard navigation,
 * and a rescan action. Created lazily on first use.
 */
class Picker {
  private readonly root = h("div.mt-picker", { role: "dialog" });
  private readonly search = h("input.mt-picker-search", {
    type: "search", spellcheck: false, autocomplete: "off",
    role: "combobox", "aria-expanded": true, "aria-controls": "mt-picker-list",
  });
  private readonly refresh = h("button.mt-icon-btn", { type: "button", title: "Rescan" }, "⟳");
  private readonly list = h("ul.mt-picker-list", { id: "mt-picker-list", role: "listbox" });
  private readonly status = h("div.mt-picker-status");
  private options: PickOptions | null = null;
  private results: string[] = [];
  private active = 0;

  constructor() {
    this.root.append(h("div.mt-picker-head", {}, this.search, this.refresh), this.list, this.status);
    isolateFromCanvas(this.root);

    this.search.addEventListener("input", () => this.filter());
    this.search.addEventListener("keydown", (e) => this.onKey(e));
    this.refresh.addEventListener("click", async () => {
      this.setStatus("Rescanning…");
      await this.options?.source.load(true);
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
    const { noun } = options.source;
    this.root.setAttribute("aria-label", `Choose ${noun}`);
    this.search.placeholder = `Search ${noun}s…`;
    if (!this.root.isConnected) document.body.append(this.root);
    this.root.hidden = false;
    this.search.value = "";
    this.position(options.anchor);
    this.filter();
    this.search.focus();
    document.addEventListener("pointerdown", this.onOutside, true);
    window.addEventListener("blur", this.close);

    if (!options.source.list().length) {
      this.setStatus("Loading…");
      options.source.load().then(() => this.options === options && this.filter());
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
    if (!this.options) return;
    const all = this.options.source.list();
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
      !all.length ? this.options.source.emptyText :
      !this.results.length ? "No matches" :
      hidden > 0 ? `${hidden} more — refine your search` : "",
    );
  }

  private render() {
    const { current, inUse } = this.options ?? {};
    this.list.replaceChildren(
      ...this.results.map((file, i) => {
        const { name, folder } = describePath(file);
        return h(`li.mt-picker-item${file === current ? ".mt-current" : ""}`,
          { role: "option", "data-index": i, title: file },
          h("span.mt-picker-name", {}, name),
          folder ? h("span.mt-picker-folder", {}, folder) : null,
          inUse?.has(file) ? h("span.mt-picker-badge", { title: "Already in this deck" }, "in deck") : null,
        );
      }),
    );
  }

  private highlight(index: number, scroll: boolean) {
    if (!this.results.length) return;
    this.active = (index + this.results.length) % this.results.length;
    this.list.querySelector(".mt-active")?.classList.remove("mt-active");
    const item = this.list.children[this.active] as HTMLElement | undefined;
    item?.classList.add("mt-active");
    if (item) this.search.setAttribute("aria-activedescendant", item.id = `mt-opt-${this.active}`);
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
