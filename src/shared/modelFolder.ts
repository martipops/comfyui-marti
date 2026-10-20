// Cached file list for one models/ folder. One fetch serves every node that uses it.
import { api } from "./comfy";
import type { PickSource } from "./picker";

type Listener = (files: readonly string[]) => void;

export interface ModelFolder extends PickSource {
  /** Unknown until the first load finishes, so callers don't flag everything as missing. */
  isMissing(file: string): boolean;
  onChanged(fn: Listener): () => void;
}

const folders = new Map<string, ModelFolder>();

function createModelFolder(folder: string, noun: string): ModelFolder {
  let files: readonly string[] = [];
  let fileSet: ReadonlySet<string> = new Set();
  let pending: Promise<readonly string[]> | null = null;
  let loaded = false;
  const listeners = new Set<Listener>();

  async function fetchFiles(): Promise<readonly string[]> {
    const res = await api.fetchApi(`/models/${encodeURIComponent(folder)}`);
    if (!res.ok) throw new Error(`Failed to list models/${folder} (${res.status})`);
    const list: unknown = await res.json();
    return Array.isArray(list) ? list.filter((f): f is string => typeof f === "string") : [];
  }

  function load(force = false): Promise<readonly string[]> {
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
        console.error("[comfyui-marti]", err);
        return files;
      });
    return pending;
  }

  return {
    noun,
    emptyText: `No ${noun}s found in models/${folder}`,
    list: () => files,
    load,
    isMissing: (file) => loaded && file !== "" && !fileSet.has(file),
    onChanged(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
  };
}

/** Reloads a folder's list if any node uses it, e.g. after a download lands there. */
export function refreshModelFolder(folder: string) {
  folders.get(folder)?.load(true);
}

export function modelFolder(folder: string, noun: string): ModelFolder {
  let entry = folders.get(folder);
  if (!entry) folders.set(folder, (entry = createModelFolder(folder, noun)));
  return entry;
}
