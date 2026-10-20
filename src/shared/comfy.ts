// Single access point for ComfyUI frontend globals, with the minimal typing we rely on.
// esbuild leaves these imports external; they resolve against the running frontend.
// @ts-expect-error - provided by the ComfyUI frontend at runtime
import { app as rawApp } from "../../scripts/app.js";
// @ts-expect-error - provided by the ComfyUI frontend at runtime
import { api as rawApi } from "../../scripts/api.js";
import type { NodeDef } from "./node";

export interface ComfyWidget {
  name: string;
  type: string;
  value: unknown;
  serialize?: boolean;
}

export interface DomWidgetOptions<V> {
  getValue: () => V;
  setValue: (value: unknown) => void;
  getMinHeight?: () => number;
  hideOnZoom?: boolean;
  margin?: number;
}

export interface NodeSlot {
  name: string;
  type: string;
  label?: string;
  /** Set on inputs that mirror a widget. */
  widget?: { name: string };
}

export interface ComfyLink {
  origin_id: number | string;
  origin_slot: number;
  type: string;
}

export interface ComfyNode {
  size: [number, number];
  widgets?: ComfyWidget[];
  inputs: NodeSlot[];
  outputs: NodeSlot[];
  graph: { getNodeById(id: number | string): ComfyNode | null } | null;
  computeSize(): [number, number];
  setSize(size: [number, number]): void;
  setDirtyCanvas(fg: boolean, bg?: boolean): void;
  addInput(name: string, type: string): NodeSlot;
  removeInput(slot: number): void;
  addOutput(name: string, type: string): NodeSlot;
  removeOutput(slot: number): void;
  getInputLink(slot: number): ComfyLink | null;
  isInputConnected(slot: number): boolean;
  connect(slot: number, target: ComfyNode, targetSlot: number): unknown;
  onRemoved?: () => void;
  onConnectionsChange?: (...args: unknown[]) => void;
  addDOMWidget<V>(name: string, type: string, element: HTMLElement, options: DomWidgetOptions<V>): ComfyWidget;
}

export type CustomWidgetFactory = (
  node: ComfyNode,
  inputName: string,
) => { widget: ComfyWidget; minWidth?: number; minHeight?: number };

export interface ComfyExtension {
  name: string;
  getCustomWidgets?: () => Record<string, CustomWidgetFactory>;
  setup?: () => void | Promise<void>;
  addCustomNodeDefs?: (defs: Record<string, NodeDef>) => void;
  beforeRegisterNodeDef?: (nodeType: { prototype: object } & Record<string, unknown>, nodeData: { name: string }) => void;
  settings?: ComfySetting[];
}

export interface ComfySetting {
  id: string;
  category?: string[];
  name: string;
  tooltip?: string;
  type: "text" | "boolean" | "number";
  defaultValue: unknown;
}

export interface ComfyWorkflow {
  filename?: string;
  activeState?: { id?: string } | null;
  initialState?: { id?: string } | null;
}

export interface SidebarTab {
  id: string;
  icon: string;
  title: string;
  tooltip?: string;
  type: "custom";
  render(container: HTMLElement): void;
  destroy?(): void;
}

export interface Toast {
  severity: "success" | "info" | "warn" | "error";
  summary: string;
  detail?: string;
  life?: number;
}

export const app = rawApp as {
  registerExtension(ext: ComfyExtension): void;
  graph?: { setDirtyCanvas(fg: boolean, bg?: boolean): void };
  /** Re-reads model lists into every combo widget. */
  refreshComboInNodes?(): Promise<void>;
  extensionManager?: {
    setting?: { get(id: string): unknown };
    workflow?: { activeWorkflow?: ComfyWorkflow | null; openWorkflows?: ComfyWorkflow[] };
    registerSidebarTab?(tab: SidebarTab): void;
    toast?: { add(toast: Toast): void };
  };
  ui?: { settings?: { getSettingValue(id: string): unknown } };
};

/** Reads a frontend setting, covering both the current and the legacy settings API. */
export function getSetting(id: string): unknown {
  return app.extensionManager?.setting?.get(id) ?? app.ui?.settings?.getSettingValue(id);
}

export const api = rawApi as {
  fetchApi(route: string, init?: RequestInit): Promise<Response>;
  addEventListener(type: string, fn: (e: CustomEvent) => void): void;
};
