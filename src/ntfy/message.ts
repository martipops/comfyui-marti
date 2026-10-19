export interface JobReport {
  ok: boolean;
  workflow?: string;
  durationMs?: number;
  nodeType?: string;
  error?: string;
}

export function formatDuration(ms: number): string {
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  return m < 60 ? `${m}m ${s % 60}s` : `${Math.floor(m / 60)}h ${m % 60}m`;
}

/** "workflow · 1m 23s" */
export function ntfyTitle(report: JobReport): string {
  const name = report.workflow || (report.ok ? "ComfyUI job finished" : "ComfyUI job failed");
  return report.durationMs != null ? `${name} · ${formatDuration(report.durationMs)}` : name;
}

/** ntfy needs a body, so keep it minimal. Failures still say what broke. */
export function ntfyBody(report: JobReport): string {
  if (report.ok) return "Done";
  const where = report.nodeType ? ` at ${report.nodeType}` : "";
  const error = report.error ? `: ${report.error.replace(/\s+/g, " ").slice(0, 300)}` : "";
  return `Failed${where}${error}`;
}

/**
 * Builds the ntfy publish URL. Everything goes in the query string so the body can be
 * either the message or an attachment.
 */
export function ntfyUrl(server: string, topic: string, params: Record<string, string>): string | null {
  topic = topic.trim();
  if (!topic) return null;
  const base = (server.trim() || "https://ntfy.sh").replace(/\/+$/, "");
  return `${base}/${encodeURIComponent(topic)}?${new URLSearchParams(params)}`;
}

export function ntfyParams(report: JobReport): Record<string, string> {
  return report.ok
    ? { title: ntfyTitle(report), tags: "white_check_mark" }
    : { title: ntfyTitle(report), tags: "x", priority: "high" };
}
