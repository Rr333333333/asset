"""Predictive maintenance: run the RandomForest model over asset data."""
from fastapi import APIRouter, Depends

from app.auth import get_current_user
from app.ml.model import get_model
from app.storage import get_storage

router = APIRouter(prefix="/predictive", tags=["predictive"])


def _num(v, d=0.0):
    try:
        return float(v)
    except (TypeError, ValueError):
        return d


@router.post("/run")
def run_predictions(user: dict = Depends(get_current_user)):
    """
    Score every row in the predictive sheet, enrich it with hardware telemetry
    (CPU/temp) when a matching Device ID exists, write results back, return them.
    """
    storage = get_storage()
    model = get_model()

    hardware = {h.get("Device ID"): h for h in storage.list_rows("hardware")}
    rows = storage.list_rows("predictive")
    results = []

    for i, row in enumerate(rows):
        # Try to align telemetry: DEV-000X shares the numeric suffix with AST-000X
        asset_id = str(row.get("Asset ID", ""))
        suffix = asset_id.split("-")[-1] if "-" in asset_id else ""
        hw = hardware.get(f"DEV-{suffix}", {})
        cpu = _num(hw.get("CPU Usage"), 40)
        temp = _num(hw.get("Temperature"), 45)

        pred = model.predict_one(
            age=_num(row.get("Age")),
            failure_count=_num(row.get("Failure Count")),
            downtime=_num(row.get("Downtime Hours")),
            cpu=cpu,
            temp=temp,
        )
        row["AI Prediction"] = pred["status"]
        row["Risk Percentage"] = pred["risk_percentage"]
        row["Recommended Action"] = pred["recommended_action"]
        results.append(row)

    storage.replace_all("predictive", results)
    return {"count": len(results), "rows": results}


@router.post("/predict")
def predict_single(payload: dict, user: dict = Depends(get_current_user)):
    """Ad-hoc what-if prediction from raw inputs."""
    model = get_model()
    return model.predict_one(
        age=_num(payload.get("age")),
        failure_count=_num(payload.get("failure_count")),
        downtime=_num(payload.get("downtime")),
        cpu=_num(payload.get("cpu")),
        temp=_num(payload.get("temp")),
    )
