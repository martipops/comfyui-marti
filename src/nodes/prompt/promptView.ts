import { h, isolateFromCanvas } from "../../shared/dom";
import type { WidgetView, WidgetViewEvents } from "../../shared/widget";

const TOOLBAR_HEIGHT = 40;
const MIN_TEXT_HEIGHT = 160;
/** Typing grows the box up to here, then it scrolls. A bigger node still stretches it further. */
const MAX_TEXT_HEIGHT = 480;

const FONT_MIN = 10;
const FONT_MAX = 32;
const FONT_DEFAULT = 17;
/** Per device (a phone wants a different size than a desktop), shared by every Marti Prompt box. */
const FONT_KEY = "marti.prompt.fontSize";
const FONT_EVENT = "marti-prompt-font";

const wordCount = (text: string) => text.split(/\s+/).filter(Boolean).length;

let fontSize = Number(localStorage.getItem(FONT_KEY)) || FONT_DEFAULT;
document.documentElement.style.setProperty("--mp-font", `${fontSize}px`);

function setFontSize(size: number) {
  fontSize = Math.min(Math.max(size, FONT_MIN), FONT_MAX);
  localStorage.setItem(FONT_KEY, String(fontSize));
  document.documentElement.style.setProperty("--mp-font", `${fontSize}px`);
  window.dispatchEvent(new Event(FONT_EVENT));
}

/** A− size A+, kept in sync across every box and the full-screen editor. */
class FontControls {
  private readonly down = h("button.mt-btn.mp-btn.mp-font-btn", { type: "button", title: "Smaller text" }, "A−");
  private readonly up = h("button.mt-btn.mp-btn.mp-font-btn", { type: "button", title: "Bigger text" }, "A+");
  private readonly label = h("span.mp-font-size");
  readonly el = h("span.mp-font", {}, this.down, this.label, this.up);
  private readonly sync = () => {
    this.label.textContent = String(fontSize);
    this.down.disabled = fontSize <= FONT_MIN;
    this.up.disabled = fontSize >= FONT_MAX;
  };

  constructor() {
    // Keep focus (and the iOS keyboard) in the text while tapping these.
    this.el.addEventListener("mousedown", (e) => e.preventDefault());
    this.down.addEventListener("click", () => setFontSize(fontSize - 1));
    this.up.addEventListener("click", () => setFontSize(fontSize + 1));
    window.addEventListener(FONT_EVENT, this.sync);
    this.sync();
  }

  dispose() {
    window.removeEventListener(FONT_EVENT, this.sync);
  }
}

export class PromptView implements WidgetView<string> {
  readonly el = h("div.mt-root.mp-prompt");
  readonly stretches = true;
  private readonly text = h("textarea.mp-text", { placeholder: "Prompt…", rows: 1, "aria-label": "Prompt" });
  private readonly count = h("span.mp-count");
  private readonly font = new FontControls();
  /** Text height changes with the font size. */
  private readonly onFont = () => this.render();
  private readonly fullBtn = h("button.mt-btn.mp-btn", { type: "button", title: "Edit full screen" }, "⤢ Full");
  private value = "";
  private textHeight = MIN_TEXT_HEIGHT;
  private lastWidth = 0;
  private readonly resizeObserver = new ResizeObserver(() => {
    if (this.text.clientWidth !== this.lastWidth) this.autosize();
  });
  private sheet: FullScreenEditor | null = null;

  constructor(private readonly events: WidgetViewEvents) {
    this.el.append(this.text, h("div.mp-toolbar", {}, this.font.el, this.count, this.fullBtn));
    this.el.style.setProperty("--mp-min", `${MIN_TEXT_HEIGHT}px`);
    isolateFromCanvas(this.el);

    this.text.addEventListener("input", () => this.edit(this.text.value));
    this.fullBtn.addEventListener("click", () => this.openSheet());
    window.addEventListener(FONT_EVENT, this.onFont);
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
    this.render();
  }

  dispose() {
    this.resizeObserver.disconnect();
    window.removeEventListener(FONT_EVENT, this.onFont);
    this.font.dispose();
    this.sheet?.close();
  }

  private edit(value: string) {
    this.value = value;
    this.render();
    this.events.onChange(false);
  }

  private render() {
    if (this.text.value !== this.value) this.text.value = this.value;
    const words = wordCount(this.value);
    this.count.textContent = `${words} ${words === 1 ? "word" : "words"}`;
    this.autosize();
  }

  /** Grows the box to fit the text, so nothing has to be resized by hand (iOS can't drag textarea corners). */
  private autosize() {
    this.lastWidth = this.text.clientWidth;
    // Measure without flex stretching, which would report the node's height instead of the text's.
    this.text.style.flexGrow = "0";
    this.text.style.height = "0px";
    const height = Math.min(Math.max(this.text.scrollHeight, MIN_TEXT_HEIGHT), MAX_TEXT_HEIGHT);
    this.text.style.height = `${height}px`;
    this.text.style.flexGrow = "";
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
  private readonly font = new FontControls();
  private readonly done = h("button.mp-done", { type: "button" }, "Done");
  private readonly el = h(
    "div.mt-root.mp-sheet",
    { role: "dialog", "aria-modal": "true", "aria-label": "Edit prompt" },
    h("div.mp-sheet-bar", {}, h("span.mp-sheet-title", {}, "Prompt"), this.font.el, this.done),
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
    this.done.addEventListener("click", () => this.close());
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
    this.font.dispose();
    this.el.remove();
    this.onClose();
  }
}
