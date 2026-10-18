import type { CustomWidgetFactory } from "./comfy";

/** Raw node definition from /object_info, as handed to extensions before registration. */
export interface NodeDef {
  input?: { required?: Record<string, unknown>; optional?: Record<string, unknown> };
  input_order?: { required?: string[]; optional?: string[] };
  output?: unknown[];
  output_is_list?: unknown[];
  output_name?: unknown[];
  output_tooltips?: unknown[];
}

/** What each node folder in src/nodes contributes to the single pack extension. */
export interface MartiNode {
  styles?: string;
  widgets?: Record<string, CustomWidgetFactory>;
  /** Node id (Python node_id) for the hooks below. */
  nodeId?: string;
  /** Adjust the definition before the frontend builds nodes and previews from it. */
  patchDef?(def: NodeDef): void;
  /** Adjust the node class (static layout properties etc.). */
  patchType?(nodeType: { prototype: object } & Record<string, unknown>): void;
}

/** Drops optional inputs (and their ordering entries) whose names match. */
export function dropOptionalInputs(def: NodeDef, match: (name: string) => boolean) {
  const optional = def.input?.optional;
  if (optional) for (const name of Object.keys(optional)) if (match(name)) delete optional[name];
  if (def.input_order?.optional) def.input_order.optional = def.input_order.optional.filter((n) => !match(n));
}

/** Keeps only the first `count` outputs. */
export function keepOutputs(def: NodeDef, count: number) {
  for (const key of ["output", "output_is_list", "output_name", "output_tooltips"] as const) {
    def[key] = def[key]?.slice(0, count);
  }
}
