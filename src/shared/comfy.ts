// Single access point for ComfyUI frontend globals, with the minimal typing we rely on.
// esbuild leaves these imports external; they resolve against the running frontend.
// @ts-expect-error - provided by the ComfyUI frontend at runtime
import { app as rawApp } from "../../scripts/app.js";
// @ts-expect-error - provided by the ComfyUI frontend at runtime
import { api as rawApi } from "../../scripts/api.js";

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
}

export const app = rawApp as {
  registerExtension(ext: ComfyExtension): void;
  graph?: { setDirtyCanvas(fg: boolean, bg?: boolean): void };
};

export const api = rawApi as {
  fetchApi(route: string, init?: RequestInit): Promise<Response>;
  addEventListener(type: string, fn: () => void): void;
};
