import { h, isolateFromCanvas } from "../../shared/dom";
import type { WidgetView, WidgetViewEvents } from "../../shared/widget";

const TOOLBAR_HEIGHT = 40;
const MIN_TEXT_HEIGHT = 160;
/** The inline box stops growing here and scrolls; the full-screen editor has no limit. */
const MAX_TEXT_HEIGHT = 480;

const wordCount = (text: string) => text.split(/\s+/).filter(Boolean).length;

export class PromptView implements WidgetView<string> {
  readonly el = h("div.mt-root.mp-prompt");
  private readonly text = h("textarea.mp-text", { placeholder: "Prompt…", rows: 1, "aria-label": "Prompt" });
  private readonly count = h("span.mp-count");
  private readonly clearBtn = h("button.mt-btn.mp-btn", { type: "button" }, "Clear");
  private readonly fullBtn = h("button.mt-btn.mp-btn", { type: "button", title: "Edit full screen" }, "⤢ Full");
  private value = "";
  /** Text removed by Clear, until the next edit. */
  private cleared: string | null = null;
  private textHeight = MIN_TEXT_HEIGHT;
  private lastWidth = 0;
  private readonly resizeObserver = new ResizeObserver(() => {
    if (this.text.clientWidth !== this.lastWidth) this.autosize();
  });
  private sheet: FullScreenEditor | null = null;

  constructor(private readonly events: WidgetViewEvents) {
    this.el.append(this.text, h("div.mp-toolbar", {}, this.count, this.clearBtn, this.fullBtn));
    this.el.style.setProperty("--mp-min", `${MIN_TEXT_HEIGHT}px`);
    this.el.style.setProperty("--mp-max", `${MAX_TEXT_HEIGHT}px`);
    isolateFromCanvas(this.el);

    this.text.addEventListener("input", () => this.edit(this.text.value));
    this.clearBtn.addEventListener("click", () => {
      const undo = this.cleared;
      const old = this.value;
      this.edit(undo ?? "");
      if (undo === null) {
        this.cleared = old;
        this.render();
      }
    });
    this.fullBtn.addEventListener("click", () => this.openSheet());
    this.resizeObserver.observe(this.text);
    this.render();
  }

  get data(): string {
    return this.value;
  }

  get minHeight(): number {
    return this.textHeight + TOOLBAR_HEIGHT;
  }

  setData(raw: unknown) {
    this.value = typeof raw === "string" ? raw : "";
    this.cleared = null;
    this.render();
  }

  dispose() {
    this.resizeObserver.disconnect();
    this.sheet?.close();
  }

  private edit(value: string) {
    this.value = value;
    this.cleared = null;
    this.render();
    this.events.onChange(false);
  }

  private render() {
    if (this.text.value !== this.value) this.text.value = this.value;
    const words = wordCount(this.value);
    this.count.textContent = `${words} ${words === 1 ? "word" : "words"}`;
    this.clearBtn.textContent = this.cleared !== null ? "Undo" : "Clear";
    this.clearBtn.disabled = this.cleared === null && !this.value;
    this.autosize();
  }

  /** Grows the box to fit the text, so nothing has to be resized by hand (iOS can't drag textarea corners). */
  private autosize() {
    this.lastWidth = this.text.clientWidth;
    this.text.style.height = "0px";
    const height = Math.min(Math.max(this.text.scrollHeight, MIN_TEXT_HEIGHT), MAX_TEXT_HEIGHT);
    this.text.style.height = `${height}px`;
    if (height !== this.textHeight) {
      this.textHeight = height;
      this.events.onChange(true);
    }
  }

  private openSheet() {
    this.sheet = new FullScreenEditor(this.value, (value) => this.edit(value), () => {
      this.sheet = null;
      this.text.scrollTop = this.text.scrollHeight;
    });
  }
}

/**
 * Full-screen editor on document.body (the widget may sit in a transformed canvas
 * layer, where position: fixed doesn't work). Follows the visual viewport so on
 * iOS the text stays above the on-screen keyboard.
 */
class FullScreenEditor {
  private readonly text = h("textarea.mp-text.mp-sheet-text", { "aria-label": "Prompt" });
  private readonly el = h(
    "div.mt-root.mp-sheet",
    { role: "dialog", "aria-modal": "true", "aria-label": "Edit prompt" },
    h("div.mp-sheet-bar", {}, h("span.mp-sheet-title", {}, "Prompt"), h("button.mp-done", { type: "button" }, "Done")),
    this.text,
  );
  private readonly fit = () => {
    const vv = window.visualViewport;
    if (!vv) return;
    this.el.style.top = `${vv.offsetTop}px`;
    this.el.style.height = `${vv.height}px`;
  };

  constructor(value: string, onInput: (value: string) => void, private readonly onClose: () => void) {
    this.text.value = value;
    this.text.addEventListener("input", () => onInput(this.text.value));
    this.el.querySelector("button")!.addEventListener("click", () => this.close());
    this.el.addEventListener("keydown", (e) => {
      e.stopPropagation();
      if (e.key === "Escape") this.close();
    });
    window.visualViewport?.addEventListener("resize", this.fit);
    window.visualViewport?.addEventListener("scroll", this.fit);
    document.body.append(this.el);
    this.fit();
    // Focus inside the tap that opened the sheet, or iOS won't show the keyboard.
    this.text.focus();
    this.text.setSelectionRange(value.length, value.length);
  }

  close() {
    window.visualViewport?.removeEventListener("resize", this.fit);
    window.visualViewport?.removeEventListener("scroll", this.fit);
    this.el.remove();
    this.onClose();
  }
}
