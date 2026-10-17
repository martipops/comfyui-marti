import { clampStrength, formatStrength, STRENGTH } from "../model";
import { h } from "./dom";

export interface Scrubber {
  el: HTMLElement;
  set(value: number): void;
}

const DRAG_THRESHOLD_PX = 3;
const UNITS_PER_PX = 0.01;
const FILL_RANGE = 2; // fill bar shows 0..2 as 0..100%

/**
 * Number field you can drag horizontally to scrub, click to type into,
 * nudge with arrow keys, and double-click to reset.
 * Shift = fine (x0.1), Ctrl/Cmd = coarse (x10).
 */
export function createScrubber(label: string, onChange: (value: number, commit: boolean) => void): Scrubber {
  const fill = h("span.ld-scrub-fill");
  const text = h("span.ld-scrub-text");
  const input = h("input.ld-scrub-input", { type: "text", inputmode: "decimal", "aria-label": label });
  const el = h("div.ld-scrub", { tabindex: 0, role: "spinbutton", "aria-label": label,
    "aria-valuemin": STRENGTH.min, "aria-valuemax": STRENGTH.max }, fill, text, input);

  let value: number = STRENGTH.default;

  const render = () => {
    text.textContent = formatStrength(value);
    el.setAttribute("aria-valuenow", String(value));
    const pct = Math.min(1, Math.abs(value) / FILL_RANGE) * 100;
    fill.style.width = `${pct}%`;
    el.classList.toggle("ld-negative", value < 0);
    el.classList.toggle("ld-zero", value === 0);
  };

  const update = (next: number, commit: boolean) => {
    next = clampStrength(next, value);
    if (next === value && !commit) return;
    value = next;
    render();
    onChange(value, commit);
  };

  const modifier = (e: { shiftKey: boolean; ctrlKey: boolean; metaKey: boolean }) =>
    e.shiftKey ? 0.1 : e.ctrlKey || e.metaKey ? 10 : 1;

  // --- drag to scrub / click to edit -------------------------------------
  el.addEventListener("pointerdown", (e) => {
    if (e.button !== 0 || el.classList.contains("ld-editing")) return;
    e.preventDefault();
    const startX = e.clientX;
    const startValue = value;
    let dragging = false;
    el.setPointerCapture(e.pointerId);

    const move = (ev: PointerEvent) => {
      const dx = ev.clientX - startX;
      if (!dragging && Math.abs(dx) < DRAG_THRESHOLD_PX) return;
      dragging = true;
      el.classList.add("ld-scrubbing");
      const raw = startValue + dx * UNITS_PER_PX * modifier(ev);
      const step = ev.shiftKey ? 0.01 : STRENGTH.step;
      update(Math.round(raw / step) * step, false);
    };
    const up = () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
      el.classList.remove("ld-scrubbing");
      if (dragging) update(value, true);
      else startEditing();
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
  });

  el.addEventListener("dblclick", () => {
    stopEditing(false);
    update(STRENGTH.default, true);
  });

  el.addEventListener("keydown", (e) => {
    if (el.classList.contains("ld-editing")) return;
    const dir = e.key === "ArrowUp" || e.key === "ArrowRight" ? 1 : e.key === "ArrowDown" || e.key === "ArrowLeft" ? -1 : 0;
    if (dir) {
      e.preventDefault();
      update(value + dir * STRENGTH.step * modifier(e), true);
    } else if (e.key === "Enter") {
      e.preventDefault();
      startEditing();
    }
  });

  // --- inline text editing -----------------------------------------------
  function startEditing() {
    el.classList.add("ld-editing");
    input.value = formatStrength(value);
    input.focus();
    input.select();
  }

  function stopEditing(commit: boolean) {
    if (!el.classList.contains("ld-editing")) return;
    el.classList.remove("ld-editing");
    if (commit) update(clampStrength(input.value, value), true);
  }

  input.addEventListener("keydown", (e) => {
    e.stopPropagation();
    if (e.key === "Enter") {
      stopEditing(true);
      el.focus();
    } else if (e.key === "Escape") {
      stopEditing(false);
      el.focus();
    }
  });
  input.addEventListener("blur", () => stopEditing(true));
  input.addEventListener("pointerdown", (e) => e.stopPropagation());

  render();
  return {
    el,
    set(next) {
      value = clampStrength(next);
      render();
    },
  };
}
