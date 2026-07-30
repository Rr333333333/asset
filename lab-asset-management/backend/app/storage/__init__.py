"""Storage factory: pick the backend based on settings.STORAGE_BACKEND."""
from app.config import get_settings
from app.storage.base import StorageBackend
from app.storage.local_backend import LocalStorage

_backend: StorageBackend | None = None


def get_storage() -> StorageBackend:
    global _backend
    if _backend is not None:
        return _backend

    settings = get_settings()
    if settings.STORAGE_BACKEND == "sheets":
        # Imported lazily so the app still starts without google libs installed.
        from app.storage.sheets_backend import SheetsStorage
        _backend = SheetsStorage()
    else:
        _backend = LocalStorage()
    return _backend
