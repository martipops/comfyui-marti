// Shared, cached list of LoRA files. One fetch serves every LoRA Deck node.
import { api } from "./comfy";

type Listener = (files: readonly string[]) => void;

let files: readonly string[] = [];
let fileSet: ReadonlySet<string> = new Set();
let pending: Promise<readonly string[]> | null = null;
let loaded = false;
const listeners = new Set<Listener>();

async function fetchFiles(): Promise<readonly string[]> {
  const res = await api.fetchApi("/models/loras");
  if (!res.ok) throw new Error(`Failed to list LoRAs (${res.status})`);
  const list: unknown = await res.json();
  return Array.isArray(list) ? list.filter((f): f is string => typeof f === "string") : [];
}

export function loadLoras(force = false): Promise<readonly string[]> {
  if (pending && !force) return pending;
  pending = fetchFiles()
    .then((list) => {
      files = list;
      fileSet = new Set(list);
      loaded = true;
      listeners.forEach((fn) => fn(files));
      return files;
    })
    .catch((err) => {
      pending = null;
      console.error("[LoRA Deck]", err);
      return files;
    });
  return pending;
}

export const getLoras = (): readonly string[] => files;

/** Unknown until the first load finishes, so callers don't flag everything as missing. */
export const isMissing = (lora: string): boolean => loaded && lora !== "" && !fileSet.has(lora);

export function onLorasChanged(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
