"""
Google Sheets storage backend using gspread + a service account.

Layout: one spreadsheet (GOOGLE_SPREADSHEET_ID) with one worksheet per module,
named after each module's `sheet` value in modules.py. The first row of every
worksheet is the header row (the module column names).
"""
import gspread
from google.oauth2.service_account import Credentials

from app.config import get_settings
from app.modules import MODULES, module_headers
from app.storage.base import StorageBackend

SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive",
]


class SheetsStorage(StorageBackend):
    def __init__(self) -> None:
        settings = get_settings()
        creds = Credentials.from_service_account_file(
            settings.GOOGLE_CREDENTIALS_FILE, scopes=SCOPES
        )
        self.client = gspread.authorize(creds)
        self.spreadsheet = self.client.open_by_key(settings.GOOGLE_SPREADSHEET_ID)
        self._ensure_worksheets()

    def _ensure_worksheets(self) -> None:
        """Create any missing worksheet and write its header row."""
        existing = {ws.title for ws in self.spreadsheet.worksheets()}
        for key, meta in MODULES.items():
            title = meta["sheet"]
            headers = module_headers(key)
            if title not in existing:
                ws = self.spreadsheet.add_worksheet(
                    title=title, rows=1000, cols=max(10, len(headers))
                )
                ws.append_row(headers)
            else:
                ws = self.spreadsheet.worksheet(title)
                if not ws.row_values(1):
                    ws.update("A1", [headers])

    def _ws(self, module_key: str):
        return self.spreadsheet.worksheet(MODULES[module_key]["sheet"])

    def list_rows(self, module_key: str) -> list[dict]:
        return self._ws(module_key).get_all_records()

    def replace_all(self, module_key: str, rows: list[dict]) -> None:
        ws = self._ws(module_key)
        headers = module_headers(module_key)
        values = [headers]
        for row in rows:
            values.append([row.get(h, "") for h in headers])
        ws.clear()
        ws.update("A1", values)
