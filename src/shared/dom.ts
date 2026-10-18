type Attrs = Record<string, string | number | boolean | null | undefined>;
type Child = Node | string | null | undefined | false;

/** Tiny hyperscript helper: h("button.mt-btn", { title: "Add" }, "+"). */
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

/**
 * Keyed list rendering: reuses the view for each item id, drops stale views, and
 * only touches the DOM order when it actually changed (so in-progress drags survive).
 */
export function syncKeyed<T extends { id: string }, V extends { el: HTMLElement }>(
  container: HTMLElement,
  views: Map<string, V>,
  items: readonly T[],
  create: (item: T) => V,
  update: (view: V, item: T) => void,
) {
  const ids = new Set(items.map((item) => item.id));
  for (const id of views.keys()) if (!ids.has(id)) views.delete(id);

  const ordered = items.map((item) => {
    let view = views.get(item.id);
    if (!view) views.set(item.id, (view = create(item)));
    update(view, item);
    return view.el;
  });
  const current = container.children;
  if (current.length !== ordered.length || ordered.some((el, i) => current[i] !== el)) {
    container.replaceChildren(...ordered);
  }
}
