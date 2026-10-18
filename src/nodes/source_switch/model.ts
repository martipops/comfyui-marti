// Pure data model for the Source Switch widget value. Mirrors marti/source_switch/switch.py; keep in sync.
// Channels (C0, C1, ...) and outputs are numbered by position and only grow or shrink at the end,
// so channel c / output o is always socket `c{c}_o{o}` and output index o.
import { isRecord } from "../../shared/value";

export const SCHEMA_VERSION = 2;
export const MAX_CHANNELS = 12;
export const MAX_OUTPUTS = 8;

export type Mode = "fixed" | "cycle";

export interface SwitchConfig {
  version: typeof SCHEMA_VERSION;
  channels: number;
  outputs: number;
  active: number;
  mode: Mode;
}

export const inputName = (channel: number, output: number): string => `c${channel}_o${output}`;
export const INPUT_NAME = /^c(\d+)_o(\d+)$/;
export const channelLabel = (channel: number): string => `C${channel}`;

export const defaultConfig = (): SwitchConfig => ({
  version: SCHEMA_VERSION,
  channels: 2,
  outputs: 1,
  active: 0,
  mode: "fixed",
});

const clampInt = (value: unknown, low: number, high: number, fallback: number): number =>
  Number.isInteger(value) ? Math.min(high, Math.max(low, value as number)) : fallback;

export function normalizeConfig(value: unknown): SwitchConfig {
  if (typeof value === "string") {
    try {
      value = JSON.parse(value);
    } catch {
      return defaultConfig();
    }
  }
  if (!isRecord(value)) return defaultConfig();
  const fallback = defaultConfig();
  const channels = clampInt(value.channels, 1, MAX_CHANNELS, fallback.channels);
  return {
    version: SCHEMA_VERSION,
    channels,
    outputs: clampInt(value.outputs, 1, MAX_OUTPUTS, fallback.outputs),
    active: clampInt(value.active, 0, channels - 1, 0),
    mode: value.mode === "cycle" ? "cycle" : "fixed",
  };
}

export const nextChannel = (cfg: SwitchConfig): number => (cfg.active + 1) % cfg.channels;

/** Socket names in display order: grouped by channel, then output. */
export function desiredInputs(cfg: SwitchConfig): string[] {
  const names: string[] = [];
  for (let c = 0; c < cfg.channels; c++) for (let o = 0; o < cfg.outputs; o++) names.push(inputName(c, o));
  return names;
}
