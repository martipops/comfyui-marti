// Helpers for widget values saved in workflows: shaped as { version, rows: [...] }.

export const newId = (): string => Math.random().toString(36).slice(2, 10);

/** Returns the raw `rows` array from a saved value (object or JSON string), or [] if unusable. */
export function rawRows(value: unknown): unknown[] {
  if (typeof value === "string") {
    try {
      value = JSON.parse(value);
    } catch {
      return [];
    }
  }
  const rows = (value as { rows?: unknown } | null)?.rows;
  return Array.isArray(rows) ? rows : [];
}

export const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === "object" && !Array.isArray(value);
