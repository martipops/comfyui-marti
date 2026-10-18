"""Size-bounded LRU cache for loaded LoRA files.

Re-running a workflow with the same LoRAs should not re-read them from disk.
Entries are invalidated when the file's mtime changes and the oldest entries
are evicted once the total tensor size passes ``max_bytes``.
"""

from __future__ import annotations

import os
from collections import OrderedDict
from typing import Any, Callable

Loaded = tuple[dict[str, Any], dict[str, str] | None]


def _nbytes(loaded: Loaded) -> int:
    tensors = loaded[0]
    return sum(getattr(t, "nbytes", 0) for t in tensors.values())


class LoraFileCache:
    def __init__(self, loader: Callable[[str], Loaded], max_bytes: int):
        self._loader = loader
        self._max_bytes = max_bytes
        self._entries: OrderedDict[str, tuple[float, int, Loaded]] = OrderedDict()
        self._total = 0

    def get(self, path: str) -> Loaded:
        mtime = os.path.getmtime(path)
        entry = self._entries.get(path)
        if entry is not None and entry[0] == mtime:
            self._entries.move_to_end(path)
            return entry[2]
        if entry is not None:
            self._drop(path)
        loaded = self._loader(path)
        size = _nbytes(loaded)
        self._entries[path] = (mtime, size, loaded)
        self._total += size
        self._evict(keep=path)
        return loaded

    def _drop(self, path: str) -> None:
        _, size, _ = self._entries.pop(path)
        self._total -= size

    def _evict(self, keep: str) -> None:
        while self._total > self._max_bytes and len(self._entries) > 1:
            oldest = next(iter(self._entries))
            if oldest == keep:
                break
            self._drop(oldest)
