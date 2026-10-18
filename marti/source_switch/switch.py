"""Pure data model for the Source Switch widget value.

Mirrors ``src/nodes/source_switch/model.ts``; keep the two in sync.

Channels (C0, C1, ...) are the switchable sources and outputs are what each
channel provides. Both are numbered by position and only ever grow or shrink
at the end, so sockets never need renaming::

    {"version": 2, "channels": 3, "outputs": 2, "active": 1, "mode": "fixed"}

Channel ``c`` / output ``o`` arrives on socket ``input_name(c, o)`` and leaves
on output index ``o``.
"""

from __future__ import annotations

import json
from dataclasses import dataclass
from typing import Any

SCHEMA_VERSION = 2
MAX_CHANNELS = 12
MAX_OUTPUTS = 8


def input_name(channel: int, output: int) -> str:
    return f"c{channel}_o{output}"


@dataclass(frozen=True, slots=True)
class SwitchConfig:
    channels: int
    outputs: int
    active: int

    @property
    def has_active(self) -> bool:
        return 0 <= self.active < self.channels

    def active_inputs(self) -> list[tuple[int, str]]:
        """(output index, input name) for every output of the active channel."""
        if not self.has_active:
            return []
        return [(o, input_name(self.active, o)) for o in range(self.outputs)]


def _int(value: Any, low: int, high: int, default: int) -> int:
    if not isinstance(value, int) or isinstance(value, bool):
        return default
    return min(high, max(low, value))


def parse_config(value: Any) -> SwitchConfig:
    if isinstance(value, str):
        try:
            value = json.loads(value) if value.strip() else {}
        except json.JSONDecodeError:
            value = {}
    if not isinstance(value, dict):
        value = {}
    return SwitchConfig(
        channels=_int(value.get("channels"), 0, MAX_CHANNELS, 0),
        outputs=_int(value.get("outputs"), 0, MAX_OUTPUTS, 0),
        active=_int(value.get("active"), -1, MAX_CHANNELS, -1),
    )
