"""Pure data model for the LoRA Deck widget value.

Kept free of ComfyUI imports so it can be unit tested on its own. The frontend
mirror of this schema lives in ``src/nodes/lora_deck/model.ts``; keep the two in sync.

Widget value shape (schema version 1)::

    {
      "version": 1,
      "rows": [
        {"id": "a1b2", "on": true, "lora": "style.safetensors",
         "strength": 1.0, "strengthClip": null}
      ]
    }

``strengthClip`` of ``null`` means "same as ``strength``".
"""

from __future__ import annotations

import json
import math
from dataclasses import dataclass
from typing import Any

SCHEMA_VERSION = 1
STRENGTH_MIN = -10.0
STRENGTH_MAX = 10.0


@dataclass(frozen=True, slots=True)
class LoraRow:
    lora: str
    strength: float = 1.0
    strength_clip: float | None = None
    on: bool = True

    def strengths(self, has_clip: bool) -> tuple[float, float]:
        """Return the (model, clip) strengths to apply."""
        clip = self.strength if self.strength_clip is None else self.strength_clip
        return self.strength, (clip if has_clip else 0.0)

    def is_active(self, has_clip: bool) -> bool:
        return self.on and bool(self.lora) and any(self.strengths(has_clip))


def clamp_strength(value: Any, default: float = 1.0) -> float:
    try:
        number = float(value)
    except (TypeError, ValueError):
        return default
    if not math.isfinite(number):
        return default
    return min(STRENGTH_MAX, max(STRENGTH_MIN, number))


def _parse_row(raw: Any) -> LoraRow | None:
    if not isinstance(raw, dict):
        return None
    lora = raw.get("lora")
    if not isinstance(lora, str):
        return None
    clip = raw.get("strengthClip")
    return LoraRow(
        lora=lora.strip(),
        strength=clamp_strength(raw.get("strength")),
        strength_clip=None if clip is None else clamp_strength(clip),
        on=bool(raw.get("on", True)),
    )


def parse_deck(value: Any) -> list[LoraRow]:
    """Turn a widget value (dict or JSON string) into rows, dropping anything malformed."""
    if isinstance(value, str):
        try:
            value = json.loads(value) if value.strip() else {}
        except json.JSONDecodeError:
            return []
    rows = value.get("rows") if isinstance(value, dict) else None
    if not isinstance(rows, list):
        return []
    return [row for row in map(_parse_row, rows) if row is not None]


def active_rows(value: Any, has_clip: bool) -> list[LoraRow]:
    return [row for row in parse_deck(value) if row.is_active(has_clip)]
