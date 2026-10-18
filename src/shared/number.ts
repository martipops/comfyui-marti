export interface NumberSpec {
  min: number;
  max: number;
  step: number;
  default: number;
  precision: number;
}

export function clampNumber(spec: NumberSpec, value: unknown, fallback = spec.default): number {
  const n = typeof value === "number" ? value : Number.parseFloat(String(value));
  if (!Number.isFinite(n)) return fallback;
  const rounded = Number(n.toFixed(spec.precision + 1));
  return Math.min(spec.max, Math.max(spec.min, rounded));
}

export const formatNumber = (spec: NumberSpec, value: number): string => value.toFixed(spec.precision);
