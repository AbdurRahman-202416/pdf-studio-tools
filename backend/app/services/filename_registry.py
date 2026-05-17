from __future__ import annotations

import threading

_lock = threading.Lock()
_names: dict[str, str] = {}


def remember(file_id: str, original_name: str) -> None:
    with _lock:
        _names[file_id] = original_name


def lookup(file_id: str, default: str) -> str:
    with _lock:
        return _names.get(file_id, default)


def forget(file_id: str) -> None:
    with _lock:
        _names.pop(file_id, None)
