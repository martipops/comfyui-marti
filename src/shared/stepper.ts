import { h } from "./dom";

export interface Stepper {
  el: HTMLElement;
  set(value: number): void;
}

/** "Label  − n +" counter. The owner decides what a step means and calls set() with the result. */
export function createStepper(label: string, min: number, max: number, onStep: (delta: -1 | 1) => void): Stepper {
  const minus = h("button.mt-icon-btn", { type: "button", "aria-label": `Fewer ${label.toLowerCase()}` }, "−");
  const plus = h("button.mt-icon-btn", { type: "button", "aria-label": `More ${label.toLowerCase()}` }, "+");
  const count = h("span.mt-stepper-count", { "aria-live": "polite" });
  const el = h("div.mt-stepper", { role: "group", "aria-label": label },
    h("span.mt-stepper-label", {}, label), minus, count, plus);

  minus.addEventListener("click", () => onStep(-1));
  plus.addEventListener("click", () => onStep(1));

  return {
    el,
    set(value) {
      count.textContent = String(value);
      minus.disabled = value <= min;
      plus.disabled = value >= max;
    },
  };
}
