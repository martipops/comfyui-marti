"""Pure data model for the Source Switch widget value.

Mirrors ``src/nodes/source_switch/model.ts``; keep the two in sync.

Sources and channels refer to fixed input slots, so removing one never
renames the sockets of the others::

    {
      "version": 1,
      "sources": [{"slot": 0, "name": "Krea 2"}, {"slot": 2, "name": "SDXL"}],
      "channels": [{"slot": 0, "name": "MODEL"}, {"slot": 1, "name": "VAE"}],
      "active": 2,
      "mode": "fixed"
    }

The socket for source slot ``s`` and channel slot ``c`` is ``input_name(s, c)``
and channel ``c`` always comes out of output index ``c``.
"""

from __future__ import annotations

import json
from dataclasses import dataclass
from typing import Any

SCHEMA_VERSION = 1
MAX_SOURCES = 12
MAX_CHANNELS = 8


def input_name(source_slot: int, channel_slot: int) -> str:
    return f"s{source_slot}_c{channel_slot}"


@dataclass(frozen=True, slots=True)
class Slot:
    slot: int
    name: str


@dataclass(frozen=True, slots=True)
class SwitchConfig:
    sources: tuple[Slot, ...]
    channels: tuple[Slot, ...]
    active: int | None

    @property
    def active_source(self) -> Slot | None:
        return next((s for s in self.sources if s.slot == self.active), None)

    def active_inputs(self) -> list[tuple[int, str]]:
        """(output index, input name) for every channel of the active source."""
        if self.active_source is None:
            return []
        return [(c.slot, input_name(self.active, c.slot)) for c in self.channels]


def _parse_slots(raw: Any, limit: int) -> tuple[Slot, ...]:
    if not isinstance(raw, list):
        return ()
    seen: set[int] = set()
    slots = []
    for item in raw:
        if not isinstance(item, dict):
            continue
        slot = item.get("slot")
        if not isinstance(slot, int) or isinstance(slot, bool) or not 0 <= slot < limit or slot in seen:
            continue
        seen.add(slot)
        name = item.get("name")
        slots.append(Slot(slot, name.strip() if isinstance(name, str) and name.strip() else f"#{slot + 1}"))
    return tuple(slots)


def parse_config(value: Any) -> SwitchConfig:
    if isinstance(value, str):
        try:
            value = json.loads(value) if value.strip() else {}
        except json.JSONDecodeError:
            value = {}
    if not isinstance(value, dict):
        value = {}
    active = value.get("active")
    return SwitchConfig(
        sources=_parse_slots(value.get("sources"), MAX_SOURCES),
        channels=_parse_slots(value.get("channels"), MAX_CHANNELS),
        active=active if isinstance(active, int) and not isinstance(active, bool) else None,
    )
