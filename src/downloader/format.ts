// Pure helpers for the Models tab.

export const CIVITAI_TYPES: [value: string, label: string][] = [
  ["", "All types"],
  ["Checkpoint", "Checkpoint"],
  ["LORA", "LoRA"],
  ["LoCon", "LoCon"],
  ["DoRA", "DoRA"],
  ["TextualInversion", "Embedding"],
  ["VAE", "VAE"],
  ["Controlnet", "ControlNet"],
  ["Upscaler", "Upscaler"],
];

export const CIVITAI_SORTS: [value: string, label: string][] = [
  ["", "Relevance"],
  ["Most Downloaded", "Most downloaded"],
  ["Highest Rated", "Highest rated"],
  ["Newest", "Newest"],
];

/** Civitai's nsfwLevel is a bit flag: 1 PG, 2 PG-13, 4 R, 8 X, 16 XXX. */
export const isNsfwLevel = (level: number) => level >= 4;

export function formatBytes(bytes: number | null | undefined): string {
  if (!bytes || bytes < 0) return "";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit++;
  }
  return `${value >= 100 || unit === 0 ? Math.round(value) : value.toFixed(1).replace(/\.0$/, "")} ${units[unit]}`;
}

/** 1234 -> "1.2k", 1500000 -> "1.5M" */
export function formatCount(n: number): string {
  if (n < 1000) return String(n);
  if (n < 1_000_000) return `${(n / 1000).toFixed(n < 10_000 ? 1 : 0).replace(/\.0$/, "")}k`;
  return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
}

/** Ask Civitai's image CDN for a small rendition instead of the original. */
export function civitaiThumb(url: string, width = 160): string {
  return /\/(?:width=\d+|original=true)[^/]*\//.test(url)
    ? url.replace(/\/(?:width=\d+|original=true)[^/]*\//, `/width=${width}/`)
    : url;
}

export const civitaiLink = (modelId: number, versionId: number) =>
  `https://civitai.com/models/${modelId}?modelVersionId=${versionId}`;

export interface Progress {
  status: string;
  size: number | null;
  done: number;
  speed: number;
  error: string | null;
}

/** 0..1, or null when the size is unknown. */
export function progressFraction(job: Progress): number | null {
  if (job.status === "done") return 1;
  return job.size ? Math.min(1, job.done / job.size) : null;
}

export function progressText(job: Progress): string {
  switch (job.status) {
    case "queued":
      return "Waiting…";
    case "verifying":
      return "Checking file…";
    case "done":
      return `Done · ${formatBytes(job.size ?? job.done)}`;
    case "cancelled":
      return "Cancelled";
    case "error":
      return job.error || "Failed";
  }
  const fraction = progressFraction(job);
  const parts = [
    fraction != null ? `${Math.floor(fraction * 100)}%` : "",
    job.size ? `${formatBytes(job.done)} of ${formatBytes(job.size)}` : formatBytes(job.done),
    job.speed ? `${formatBytes(job.speed)}/s` : "",
  ];
  return parts.filter(Boolean).join(" · ");
}

export const isActive = (status: string) => status === "queued" || status === "downloading" || status === "verifying";
