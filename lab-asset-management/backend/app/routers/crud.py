"""
Generic CRUD router that serves every module defined in modules.py:
  GET    /api/{module}            list (supports ?field=value filters + ?q=search)
  GET    /api/{module}/meta       column schema for building forms/tables
  GET    /api/{module}/{id}       single row
  POST   /api/{module}            create (auto-generates the ID)
  PUT    /api/{module}/{id}       update
  DELETE /api/{module}/{id}       delete
"""
from fastapi import APIRouter, Depends, HTTPException, Request

from app.auth import get_current_user, require_role
from app.modules import MODULES
from app.storage import get_storage

router = APIRouter(tags=["modules"])


def _module_or_404(module: str) -> dict:
    if module not in MODULES:
        raise HTTPException(status_code=404, detail=f"Unknown module '{module}'")
    return MODULES[module]


def _next_id(module: str) -> str:
    meta = MODULES[module]
    prefix = meta["id_prefix"]
    rows = get_storage().list_rows(module)
    max_n = 0
    for r in rows:
        val = str(r.get(meta["id_field"], ""))
        if "-" in val and val.split("-")[-1].isdigit():
            max_n = max(max_n, int(val.split("-")[-1]))
    return f"{prefix}-{max_n + 1:04d}"


@router.get("/{module}/meta")
def get_meta(module: str, user: dict = Depends(get_current_user)):
    meta = _module_or_404(module)
    return {
        "key": module,
        "label": meta["label"],
        "id_field": meta["id_field"],
        "columns": meta["columns"],
    }


@router.get("/{module}")
def list_rows(module: str, request: Request, user: dict = Depends(get_current_user)):
    _module_or_404(module)
    rows = get_storage().list_rows(module)
    params = dict(request.query_params)
    q = params.pop("q", "").strip().lower()

    def matches(row: dict) -> bool:
        for key, val in params.items():
            if val in ("", "All"):
                continue
            if str(row.get(key, "")).lower() != str(val).lower():
                return False
        if q and q not in " ".join(str(v) for v in row.values()).lower():
            return False
        return True

    return [r for r in rows if matches(r)]


@router.get("/{module}/{row_id}")
def get_row(module: str, row_id: str, user: dict = Depends(get_current_user)):
    meta = _module_or_404(module)
    row = get_storage().get_row(module, meta["id_field"], row_id)
    if row is None:
        raise HTTPException(status_code=404, detail="Row not found")
    return row


@router.post("/{module}")
def create_row(module: str, payload: dict, user: dict = Depends(get_current_user)):
    meta = _module_or_404(module)
    id_field = meta["id_field"]
    # Auto-generate the ID unless the caller supplied one.
    if not payload.get(id_field):
        payload[id_field] = _next_id(module)
    # Ensure all headers exist on the row.
    for col in meta["columns"]:
        payload.setdefault(col["name"], "")
    get_storage().add_row(module, payload)
    return payload


@router.put("/{module}/{row_id}")
def update_row(module: str, row_id: str, payload: dict,
               user: dict = Depends(get_current_user)):
    meta = _module_or_404(module)
    updated = get_storage().update_row(module, meta["id_field"], row_id, payload)
    if updated is None:
        raise HTTPException(status_code=404, detail="Row not found")
    return updated


@router.delete("/{module}/{row_id}")
def delete_row(module: str, row_id: str,
               user: dict = Depends(require_role("admin", "lab_assistant"))):
    meta = _module_or_404(module)
    ok = get_storage().delete_row(module, meta["id_field"], row_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Row not found")
    return {"deleted": row_id}
