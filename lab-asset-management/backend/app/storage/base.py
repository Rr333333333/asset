"""Abstract storage contract shared by every backend."""
from abc import ABC, abstractmethod


class StorageBackend(ABC):
    """A backend stores each module as a table of rows (list of dicts)."""

    @abstractmethod
    def list_rows(self, module_key: str) -> list[dict]:
        ...

    @abstractmethod
    def replace_all(self, module_key: str, rows: list[dict]) -> None:
        ...

    # ----- convenience CRUD built on top of list/replace -----
    def get_row(self, module_key: str, id_field: str, row_id: str) -> dict | None:
        for row in self.list_rows(module_key):
            if str(row.get(id_field)) == str(row_id):
                return row
        return None

    def add_row(self, module_key: str, row: dict) -> dict:
        rows = self.list_rows(module_key)
        rows.append(row)
        self.replace_all(module_key, rows)
        return row

    def update_row(self, module_key: str, id_field: str, row_id: str,
                   updates: dict) -> dict | None:
        rows = self.list_rows(module_key)
        updated = None
        for row in rows:
            if str(row.get(id_field)) == str(row_id):
                row.update(updates)
                updated = row
                break
        if updated is not None:
            self.replace_all(module_key, rows)
        return updated

    def delete_row(self, module_key: str, id_field: str, row_id: str) -> bool:
        rows = self.list_rows(module_key)
        new_rows = [r for r in rows if str(r.get(id_field)) != str(row_id)]
        if len(new_rows) == len(rows):
            return False
        self.replace_all(module_key, new_rows)
        return True
