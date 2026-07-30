"""
Rule-based notifications/automation:
  - Stock at/below minimum          -> low-stock alert
  - Warranty / AMC expired or soon  -> warranty alert
  - Preventive maintenance due       -> reminder
  - Predicted risk > 80%            -> warning
"""
from datetime import date

from fastapi import APIRouter, Depends

from app.auth import get_current_user
from app.storage import get_storage

router = APIRouter(prefix="/notifications", tags=["notifications"])


def _num(v, d=0.0):
    try:
        return float(v)
    except (TypeError, ValueError):
        return d


def _parse(d):
    try:
        return date.fromisoformat(str(d)[:10])
    except ValueError:
        return None


@router.get("")
def get_notifications(user: dict = Depends(get_current_user)):
    storage = get_storage()
    today = date.today()
    alerts = []

    for s in storage.list_rows("stock"):
        if _num(s.get("Current Stock")) <= _num(s.get("Minimum Stock")):
            alerts.append({
                "type": "Low Stock", "severity": "warning",
                "message": f"{s.get('Item Name')} is at or below minimum stock "
                           f"({int(_num(s.get('Current Stock')))} left).",
            })

    for a in storage.list_rows("assets"):
        wd = _parse(a.get("Warranty Expiry"))
        if wd:
            days = (wd - today).days
            if days < 0:
                alerts.append({
                    "type": "Warranty Expiry", "severity": "error",
                    "message": f"Warranty expired for {a.get('Asset Name')} ({a.get('Asset ID')})."})
            elif days <= 30:
                alerts.append({
                    "type": "Warranty Expiry", "severity": "warning",
                    "message": f"Warranty for {a.get('Asset Name')} expires in {days} days."})

    for p in storage.list_rows("preventive"):
        if p.get("Status") == "Overdue":
            alerts.append({
                "type": "Maintenance Due", "severity": "warning",
                "message": f"Preventive maintenance overdue for {p.get('Asset ID')}."})
        else:
            sd = _parse(p.get("Scheduled Date"))
            if sd and 0 <= (sd - today).days <= 7:
                alerts.append({
                    "type": "Maintenance Due", "severity": "info",
                    "message": f"{p.get('Maintenance Type')} due for {p.get('Asset ID')} "
                               f"on {p.get('Scheduled Date')}."})

    for h in storage.list_rows("hardware"):
        if h.get("Health Status") == "Critical":
            alerts.append({
                "type": "Hardware Failure", "severity": "error",
                "message": f"{h.get('Device ID')} health is CRITICAL "
                           f"(CPU {h.get('CPU Usage')}%, {h.get('Temperature')}C)."})

    for p in storage.list_rows("predictive"):
        if _num(p.get("Risk Percentage")) >= 80:
            alerts.append({
                "type": "Hardware Failure", "severity": "error",
                "message": f"AI predicts {p.get('Risk Percentage')}% failure risk "
                           f"for {p.get('Asset ID')}."})

    return {"count": len(alerts), "alerts": alerts}
