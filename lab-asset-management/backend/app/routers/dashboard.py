"""Dashboard aggregation: cards + charts, with cross-cutting filters."""
from collections import Counter, defaultdict
from datetime import date

from fastapi import APIRouter, Depends, Request

from app.auth import get_current_user
from app.storage import get_storage

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


def _num(v, default=0.0):
    try:
        return float(v)
    except (TypeError, ValueError):
        return default


def _apply_filters(rows: list[dict], params: dict) -> list[dict]:
    """Filter asset-like rows by year/month/department/lab/category/status."""
    out = []
    for r in rows:
        ok = True
        if params.get("department") and params["department"] != "All":
            ok = ok and r.get("Department") == params["department"]
        if params.get("laboratory") and params["laboratory"] != "All":
            ok = ok and r.get("Laboratory") == params["laboratory"]
        if params.get("category") and params["category"] != "All":
            ok = ok and r.get("Category") == params["category"]
        if params.get("status") and params["status"] != "All":
            ok = ok and r.get("Current Status") == params["status"]
        pdate = str(r.get("Purchase Date", ""))
        if params.get("year") and params["year"] != "All":
            ok = ok and pdate.startswith(params["year"])
        if params.get("month") and params["month"] != "All":
            ok = ok and (len(pdate) >= 7 and pdate[5:7] == params["month"])
        if ok:
            out.append(r)
    return out


@router.get("/stats")
def stats(request: Request, user: dict = Depends(get_current_user)):
    storage = get_storage()
    params = dict(request.query_params)

    assets = _apply_filters(storage.list_rows("assets"), params)
    stock = storage.list_rows("stock")
    hardware = storage.list_rows("hardware")
    maintenance = storage.list_rows("maintenance")
    preventive = storage.list_rows("preventive")

    total = len(assets)
    active = sum(1 for a in assets if a.get("Current Status") == "Active")
    faulty = sum(1 for a in assets if a.get("Current Status") == "Faulty")
    under_maint = sum(1 for a in assets if a.get("Current Status") == "Under Maintenance")
    maint_due = sum(1 for p in preventive if p.get("Status") in ("Scheduled", "Overdue"))
    available_stock = sum(_num(s.get("Available Quantity")) for s in stock)
    low_stock = sum(1 for s in stock
                    if _num(s.get("Current Stock")) <= _num(s.get("Minimum Stock")))
    critical_alerts = (
        sum(1 for h in hardware if h.get("Health Status") == "Critical")
        + sum(1 for m in maintenance if m.get("Priority") == "Critical"
              and m.get("Current Status") in ("Open", "In Progress"))
    )

    return {
        "total_assets": total,
        "active_assets": active,
        "faulty_assets": faulty,
        "under_maintenance": under_maint,
        "maintenance_due": maint_due,
        "available_stock": int(available_stock),
        "low_stock": low_stock,
        "critical_alerts": critical_alerts,
    }


@router.get("/charts")
def charts(request: Request, user: dict = Depends(get_current_user)):
    storage = get_storage()
    params = dict(request.query_params)

    assets = _apply_filters(storage.list_rows("assets"), params)
    stock = storage.list_rows("stock")
    maintenance = storage.list_rows("maintenance")
    predictive = storage.list_rows("predictive")

    # Asset distribution by category
    cat = Counter(a.get("Category", "Unknown") for a in assets)
    asset_distribution = [{"name": k, "value": v} for k, v in cat.items()]

    # Asset status breakdown
    st = Counter(a.get("Current Status", "Unknown") for a in assets)
    asset_status = [{"name": k, "value": v} for k, v in st.items()]

    # Maintenance trend by month (request date)
    trend = defaultdict(int)
    for m in maintenance:
        d = str(m.get("Request Date", ""))
        if len(d) >= 7:
            trend[d[:7]] += 1
    maintenance_trends = [{"month": k, "requests": trend[k]} for k in sorted(trend)]

    # Monthly stock consumption (issued qty by purchase month as a proxy)
    consumption = defaultdict(float)
    for s in stock:
        d = str(s.get("Purchase Date", ""))
        if len(d) >= 7:
            consumption[d[:7]] += _num(s.get("Issued Quantity"))
    monthly_stock = [{"month": k, "consumed": consumption[k]} for k in sorted(consumption)]

    # Prediction chart (risk buckets) + top risky assets
    buckets = {"Green": 0, "Yellow": 0, "Red": 0}
    top = []
    for p in predictive:
        risk = _num(p.get("Risk Percentage"))
        if risk >= 80:
            buckets["Red"] += 1
        elif risk >= 50:
            buckets["Yellow"] += 1
        else:
            buckets["Green"] += 1
        top.append({"asset": p.get("Asset ID"), "risk": risk})
    prediction_chart = [{"name": k, "value": v} for k, v in buckets.items()]
    top.sort(key=lambda x: x["risk"], reverse=True)

    # Failure trend by month (completed maintenance = failures resolved proxy)
    ftrend = defaultdict(int)
    for m in maintenance:
        d = str(m.get("Completion Date", ""))
        if len(d) >= 7:
            ftrend[d[:7]] += 1
    failure_trend = [{"month": k, "failures": ftrend[k]} for k in sorted(ftrend)]

    return {
        "asset_distribution": asset_distribution,
        "asset_status": asset_status,
        "maintenance_trends": maintenance_trends,
        "monthly_stock": monthly_stock,
        "prediction_chart": prediction_chart,
        "failure_trend": failure_trend,
        "top_risky_assets": top[:8],
    }


@router.get("/filters")
def filter_options(user: dict = Depends(get_current_user)):
    """Distinct values to populate the dashboard filter dropdowns."""
    assets = get_storage().list_rows("assets")
    years, months = set(), set()
    for a in assets:
        d = str(a.get("Purchase Date", ""))
        if len(d) >= 4:
            years.add(d[:4])
        if len(d) >= 7:
            months.add(d[5:7])
    return {
        "years": sorted(years, reverse=True),
        "months": sorted(months),
        "departments": sorted({a.get("Department") for a in assets if a.get("Department")}),
        "laboratories": sorted({a.get("Laboratory") for a in assets if a.get("Laboratory")}),
        "categories": sorted({a.get("Category") for a in assets if a.get("Category")}),
        "statuses": sorted({a.get("Current Status") for a in assets if a.get("Current Status")}),
    }
