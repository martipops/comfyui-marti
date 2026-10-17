type Attrs = Record<string, string | number | boolean | null | undefined>;
type Child = Node | string | null | undefined | false;

/** Tiny hyperscript helper: h("button.ld-btn", { title: "Add" }, "+"). */
export function h<K extends keyof HTMLElementTagNameMap>(
  tag: K | `${K}.${string}`,
  attrs: Attrs = {},
  ...children: Child[]
): HTMLElementTagNameMap[K] {
  const [name, ...classes] = tag.split(".");
  const el = document.createElement(name as K);
  if (classes.length) el.className = classes.join(" ");
  for (const [key, value] of Object.entries(attrs)) {
    if (value === false || value == null) continue;
    el.setAttribute(key, value === true ? "" : String(value));
  }
  for (const child of children) {
    if (child) el.append(child);
  }
  return el;
}

/** Stop events from reaching the graph canvas (panning, shortcuts, zoom). */
export function isolateFromCanvas(el: HTMLElement, events: string[] = ["pointerdown", "wheel", "keydown", "contextmenu"]) {
  for (const type of events) el.addEventListener(type, (e) => e.stopPropagation());
}
