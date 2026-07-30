"""
Local JSON storage. Each module is a file under DATA_DIR, e.g. data/assets.json.
This lets the whole system run with zero external setup for demos and testing.
"""
import json
import os
import threading

from app.config import get_settings
from app.storage.base import StorageBackend

_lock = threading.Lock()


class LocalStorage(StorageBackend):
    def __init__(self) -> None:
        self.dir = get_settings().DATA_DIR
        os.makedirs(self.dir, exist_ok=True)

    def _path(self, module_key: str) -> str:
        return os.path.join(self.dir, f"{module_key}.json")

    def list_rows(self, module_key: str) -> list[dict]:
        path = self._path(module_key)
        if not os.path.exists(path):
            return []
        with open(path, "r", encoding="utf-8") as f:
            try:
                return json.load(f)
            except json.JSONDecodeError:
                return []

    def replace_all(self, module_key: str, rows: list[dict]) -> None:
        with _lock:
            with open(self._path(module_key), "w", encoding="utf-8") as f:
                json.dump(rows, f, indent=2, ensure_ascii=False)
