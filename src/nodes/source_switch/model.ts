// Pure data model for the Source Switch widget value. Mirrors marti/source_switch/switch.py; keep in sync.
// Channels are kept compact (slot === position) so channel c always maps to output index c.
// Source slots are stable ids so removing a source never renames other sources' sockets.
import { isRecord } from "../../shared/value";

export const SCHEMA_VERSION = 1;
export const MAX_SOURCES = 12;
export const MAX_CHANNELS = 8;

export type Mode = "fixed" | "cycle";

export interface Slot {
  slot: number;
  name: string;
}

export interface SwitchConfig {
  version: typeof SCHEMA_VERSION;
  sources: Slot[];
  channels: Slot[];
  active: number | null;
  mode: Mode;
}

export const inputName = (sourceSlot: number, channelSlot: number): string => `s${sourceSlot}_c${channelSlot}`;
export const INPUT_NAME = /^s(\d+)_c(\d+)$/;

export function defaultConfig(): SwitchConfig {
  return {
    version: SCHEMA_VERSION,
    sources: [{ slot: 0, name: "A" }, { slot: 1, name: "B" }],
    channels: [{ slot: 0, name: "" }],
    active: 0,
    mode: "fixed",
  };
}

function parseSlots(raw: unknown, limit: number): Slot[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<number>();
  const slots: Slot[] = [];
  for (const item of raw) {
    if (!isRecord(item) || !Number.isInteger(item.slot)) continue;
    const slot = item.slot as number;
    if (slot < 0 || slot >= limit || seen.has(slot)) continue;
    seen.add(slot);
    slots.push({ slot, name: typeof item.name === "string" ? item.name.trim() : "" });
  }
  return slots;
}

export function normalizeConfig(value: unknown): SwitchConfig {
  if (typeof value === "string") {
    try {
      value = JSON.parse(value);
    } catch {
      return defaultConfig();
    }
  }
  if (!isRecord(value)) return defaultConfig();
  const sources = parseSlots(value.sources, MAX_SOURCES);
  // Re-compact channels in case a saved value has gaps; output index must equal position.
  const channels = parseSlots(value.channels, MAX_CHANNELS).map((c, i) => ({ ...c, slot: i }));
  const active = sources.some((s) => s.slot === value.active) ? (value.active as number) : (sources[0]?.slot ?? null);
  return {
    version: SCHEMA_VERSION,
    sources,
    channels: channels.length ? channels : [{ slot: 0, name: "" }],
    active,
    mode: value.mode === "cycle" ? "cycle" : "fixed",
  };
}

export function freeSourceSlot(cfg: SwitchConfig): number | null {
  const used = new Set(cfg.sources.map((s) => s.slot));
  for (let i = 0; i < MAX_SOURCES; i++) if (!used.has(i)) return i;
  return null;
}

/** The source after the active one, wrapping around. */
export function nextSource(cfg: SwitchConfig): number | null {
  if (!cfg.sources.length) return null;
  const i = cfg.sources.findIndex((s) => s.slot === cfg.active);
  return cfg.sources[(i + 1) % cfg.sources.length].slot;
}

/** Socket names in display order: grouped by source, then channel. */
export const desiredInputs = (cfg: SwitchConfig): string[] =>
  cfg.sources.flatMap((s) => cfg.channels.map((c) => inputName(s.slot, c.slot)));

export const sourceLabel = (s: Slot): string => s.name || `#${s.slot + 1}`;
