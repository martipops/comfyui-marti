import { h } from "./dom";

export interface Toggle {
  el: HTMLButtonElement;
  set(on: boolean, mixed?: boolean): void;
}

/** Accessible switch. Visual state only; the owner decides what a click means. */
export function createToggle(label: string): Toggle {
  const el = h("button.ld-toggle", { type: "button", role: "switch", "aria-label": label }, h("span.ld-toggle-knob"));
  return {
    el,
    set(on, mixed = false) {
      el.setAttribute("aria-checked", mixed ? "mixed" : String(on));
    },
  };
}

/**
 * Lets the user press on one toggle and drag across others to set them all to
 * the same state, like painting checkboxes in a spreadsheet.
 */
export function enableTogglePainting(
  container: HTMLElement,
  resolve: (target: EventTarget | null) => { current: boolean; apply(on: boolean): void } | null | undefined,
) {
  let paintValue: boolean | null = null;
  const stop = () => {
    paintValue = null;
    window.removeEventListener("pointerup", stop);
  };

  container.addEventListener("pointerdown", (e) => {
    if (e.button !== 0) return;
    const hit = resolve(e.target);
    if (!hit) return;
    e.preventDefault();
    paintValue = !hit.current;
    hit.apply(paintValue);
    window.addEventListener("pointerup", stop);
  });

  container.addEventListener("pointerover", (e) => {
    if (paintValue === null || !(e.buttons & 1)) return;
    const hit = resolve(e.target);
    if (hit && hit.current !== paintValue) hit.apply(paintValue);
  });

  // Keyboard users still get normal button behaviour.
  container.addEventListener("keydown", (e) => {
    if (e.key !== " " && e.key !== "Enter") return;
    const hit = resolve(e.target);
    if (!hit) return;
    e.preventDefault();
    hit.apply(!hit.current);
  });
}
