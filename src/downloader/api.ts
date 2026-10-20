// Client for the /marti/models/* routes in marti/downloader/routes.py.
import { api, getSetting } from "../shared/comfy";

export const CIVITAI_TOKEN = "Marti.Models.CivitaiToken";
export const HF_TOKEN = "Marti.Models.HfToken";

export interface Job {
  id: string;
  source: string;
  name: string;
  folder: string;
  filename: string;
  size: number | null;
  done: number;
  speed: number;
  status: "queued" | "downloading" | "verifying" | "done" | "error" | "cancelled";
  error: string | null;
}

export interface Status {
  folders: string[];
  /** Whether the server has the token in its environment. */
  env: { civitai: boolean; hf: boolean };
  jobs: Job[];
}

export interface Resolved {
  source: "civitai" | "hf" | "url";
  filename: string;
  name: string;
  folder: string | null;
  size: number | null;
  sha256: string | null;
  page: string | null;
  /** Folders that already have a file with this name. */
  exists: string[];
}

export interface SearchVersion {
  id: number;
  name: string;
  baseModel: string;
  file: string;
  size: number;
}

export interface SearchItem {
  id: number;
  name: string;
  type: string;
  creator: string;
  downloads: number;
  likes: number;
  thumb: { url: string; nsfwLevel: number } | null;
  versions: SearchVersion[];
}

export interface SearchPage {
  items: SearchItem[];
  nextCursor: string | null;
}

/** Settings tokens, sent only to our own server, which prefers its env vars. */
function tokenHeaders(): Record<string, string> {
  const headers: Record<string, string> = {};
  const civitai = String(getSetting(CIVITAI_TOKEN) ?? "").trim();
  const hf = String(getSetting(HF_TOKEN) ?? "").trim();
  if (civitai) headers["X-Marti-Civitai-Token"] = civitai;
  if (hf) headers["X-Marti-HF-Token"] = hf;
  return headers;
}

async function call<T>(route: string, body?: unknown): Promise<T> {
  const init: RequestInit = { headers: tokenHeaders() };
  if (body !== undefined) {
    init.method = "POST";
    init.body = JSON.stringify(body);
    (init.headers as Record<string, string>)["Content-Type"] = "application/json";
  }
  const res = await api.fetchApi(route, init);
  const data = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export const getStatus = () => call<Status>("/marti/models/status");
export const resolveLink = (url: string) => call<Resolved>("/marti/models/resolve", { url });
export const startDownload = (url: string, folder: string, filename: string) =>
  call<Job>("/marti/models/download", { url, folder, filename });
export const cancelDownload = (id: string) => call<{ cancelled: boolean }>("/marti/models/cancel", { id });
export const clearDownloads = () => call<{ jobs: Job[] }>("/marti/models/clear", {});

export function searchCivitai(query: string, type: string, sort: string, cursor = "") {
  const params = new URLSearchParams({ query, type, sort, cursor });
  return call<SearchPage>(`/marti/civitai/search?${params}`);
}
