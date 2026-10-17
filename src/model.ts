// Pure data model for the widget value. Mirrors lora_deck/deck.py; keep in sync.

export const SCHEMA_VERSION = 1;

export const STRENGTH = {
  min: -10,
  max: 10,
  step: 0.05,
  default: 1,
  precision: 2,
} as const;

export interface DeckRow {
  id: string;
  on: boolean;
  lora: string;
  strength: number;
  /** null = same as `strength`. */
  strengthClip: number | null;
}

export interface DeckValue {
  version: typeof SCHEMA_VERSION;
  rows: DeckRow[];
}

export const emptyDeck = (): DeckValue => ({ version: SCHEMA_VERSION, rows: [] });

const newId = (): string => Math.random().toString(36).slice(2, 10);

export function createRow(lora: string, overrides: Partial<DeckRow> = {}): DeckRow {
  return { id: newId(), on: true, lora, strength: STRENGTH.default, strengthClip: null, ...overrides };
}

export function clampStrength(value: unknown, fallback: number = STRENGTH.default): number {
  const n = typeof value === "number" ? value : Number.parseFloat(String(value));
  if (!Number.isFinite(n)) return fallback;
  const rounded = Number(n.toFixed(STRENGTH.precision + 1));
  return Math.min(STRENGTH.max, Math.max(STRENGTH.min, rounded));
}

export const formatStrength = (value: number): string => value.toFixed(STRENGTH.precision);

function normalizeRow(raw: unknown): DeckRow | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.lora !== "string") return null;
  return {
    id: typeof r.id === "string" && r.id ? r.id : newId(),
    on: r.on !== false,
    lora: r.lora.trim(),
    strength: clampStrength(r.strength),
    strengthClip: r.strengthClip == null ? null : clampStrength(r.strengthClip),
  };
}

/** Accepts anything (saved workflow data, JSON strings) and returns a valid deck. */
export function normalizeDeck(value: unknown): DeckValue {
  if (typeof value === "string") {
    try {
      value = JSON.parse(value);
    } catch {
      return emptyDeck();
    }
  }
  const rows = (value as { rows?: unknown } | null)?.rows;
  if (!Array.isArray(rows)) return emptyDeck();
  return {
    version: SCHEMA_VERSION,
    rows: rows.map(normalizeRow).filter((r): r is DeckRow => r !== null),
  };
}

export const isActive = (row: DeckRow): boolean =>
  row.on && row.lora !== "" && (row.strength !== 0 || (row.strengthClip ?? 0) !== 0);

/** Splits "folder/sub/name.safetensors" into a display name and folder. */
export function describeLora(path: string): { name: string; folder: string } {
  const normalized = path.replace(/\\/g, "/");
  const slash = normalized.lastIndexOf("/");
  const file = normalized.slice(slash + 1);
  return {
    name: file.replace(/\.(safetensors|ckpt|pt|pth|bin)$/i, ""),
    folder: slash >= 0 ? normalized.slice(0, slash) : "",
  };
}

/**
 * Case-insensitive fuzzy match. Returns a score (higher is better) or -1 for no match.
 * Contiguous substring matches beat scattered subsequence matches, and
 * matches on the file name beat matches in the folder path.
 */
export function fuzzyScore(query: string, target: string): number {
  if (!query) return 0;
  const q = query.toLowerCase();
  const t = target.toLowerCase();
  const nameStart = t.lastIndexOf("/") + 1;
  const sub = t.indexOf(q, nameStart);
  if (sub >= 0) return 1000 - (sub - nameStart) - t.length * 0.01;
  const anySub = t.indexOf(q);
  if (anySub >= 0) return 500 - anySub - t.length * 0.01;

  let score = 0;
  let ti = 0;
  let streak = 0;
  for (const ch of q) {
    const found = t.indexOf(ch, ti);
    if (found < 0) return -1;
    streak = found === ti ? streak + 1 : 0;
    score += 1 + streak * 2 + (found >= nameStart ? 1 : 0);
    ti = found + 1;
  }
  return score;
}
