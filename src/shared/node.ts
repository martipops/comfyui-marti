import type { CustomWidgetFactory } from "./comfy";

/** What each node folder in src/nodes contributes to the single pack extension. */
export interface MartiNode {
  styles?: string;
  widgets?: Record<string, CustomWidgetFactory>;
}
