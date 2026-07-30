"""
Predictive-maintenance model using a RandomForestClassifier.

Because a fresh install has no historical failure labels, the model is trained on
synthetically generated data whose labels follow realistic risk rules (older gear
with more repairs, more downtime, hotter temps and higher CPU load fails more).
Once you accumulate real labelled outcomes, point `train()` at that data instead.

Inputs : Age, Repair Count, Downtime, CPU Usage, Temperature
Outputs: failure probability, risk %, recommended action, RAG status
"""
import numpy as np
from sklearn.ensemble import RandomForestClassifier

FEATURES = ["Age", "Failure Count", "Downtime Hours", "CPU Usage", "Temperature"]


class FailureModel:
    def __init__(self) -> None:
        self.model = RandomForestClassifier(n_estimators=120, random_state=42)
        self._train_synthetic()

    def _train_synthetic(self, n: int = 4000) -> None:
        rng = np.random.default_rng(42)
        age = rng.uniform(0, 12, n)             # years
        repairs = rng.poisson(2, n)             # historical repairs
        downtime = rng.uniform(0, 400, n)       # hours
        cpu = rng.uniform(5, 100, n)            # %
        temp = rng.uniform(25, 90, n)           # celsius

        # Risk score -> probability -> label
        score = (
            0.18 * age
            + 0.35 * repairs
            + 0.010 * downtime
            + 0.020 * cpu
            + 0.045 * temp
        )
        prob = 1 / (1 + np.exp(-(score - 4.2)))
        labels = (rng.uniform(0, 1, n) < prob).astype(int)

        X = np.column_stack([age, repairs, downtime, cpu, temp])
        self.model.fit(X, labels)

    def predict_one(self, age=0, failure_count=0, downtime=0, cpu=0, temp=0) -> dict:
        X = np.array([[age, failure_count, downtime, cpu, temp]], dtype=float)
        prob = float(self.model.predict_proba(X)[0][1])
        risk = round(prob * 100, 1)
        if risk >= 80:
            status, action = "Red", "Immediate inspection required"
        elif risk >= 50:
            status, action = "Yellow", "Schedule maintenance soon"
        else:
            status, action = "Green", "No action needed"
        return {
            "risk_percentage": risk,
            "failure_probability": round(prob, 3),
            "status": status,
            "recommended_action": action,
        }


# Singleton so the model trains only once per process.
_model: FailureModel | None = None


def get_model() -> FailureModel:
    global _model
    if _model is None:
        _model = FailureModel()
    return _model
