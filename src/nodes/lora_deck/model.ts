// Pure data model for the widget value. Mirrors marti/lora_deck/deck.py; keep in sync.
import { clampNumber, type NumberSpec } from "../../shared/number";
import { isRecord, newId, rawRows } from "../../shared/value";

export const SCHEMA_VERSION = 1;

export const STRENGTH: NumberSpec = { min: -10, max: 10, step: 0.05, default: 1, precision: 2 };

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

export function createRow(lora: string, overrides: Partial<DeckRow> = {}): DeckRow {
  return { id: newId(), on: true, lora, strength: STRENGTH.default, strengthClip: null, ...overrides };
}

export const clampStrength = (value: unknown, fallback?: number): number => clampNumber(STRENGTH, value, fallback);

function normalizeRow(r: unknown): DeckRow | null {
  if (!isRecord(r) || typeof r.lora !== "string") return null;
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
  return {
    version: SCHEMA_VERSION,
    rows: rawRows(value).map(normalizeRow).filter((r): r is DeckRow => r !== null),
  };
}

export const isActive = (row: DeckRow): boolean =>
  row.on && row.lora !== "" && (row.strength !== 0 || (row.strengthClip ?? 0) !== 0);

