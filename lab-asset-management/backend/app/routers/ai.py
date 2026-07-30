"""
AI Assistant. If OPENAI_API_KEY is set it answers with the LLM, giving it a
compact JSON snapshot of the sheets as context. Otherwise it falls back to a
built-in rule engine so the feature works with zero external dependencies.
"""
from fastapi import APIRouter, Depends

from app.auth import get_current_user
from app.config import get_settings
from app.storage import get_storage

router = APIRouter(prefix="/ai", tags=["ai"])
settings = get_settings()


def _num(v, d=0.0):
    try:
        return float(v)
    except (TypeError, ValueError):
        return d


def _rule_based_answer(q: str) -> str:
    storage = get_storage()
    ql = q.lower()

    if "maintenance" in ql and ("due" in ql or "schedule" in ql):
        due = [p for p in storage.list_rows("preventive")
               if p.get("Status") in ("Scheduled", "Overdue")]
        if not due:
            return "No assets are currently due for maintenance."
        lines = [f"- {p.get('Asset ID')}: {p.get('Maintenance Type')} "
                 f"({p.get('Status')}, due {p.get('Scheduled Date')})" for p in due[:15]]
        return f"{len(due)} asset(s) due for maintenance:\n" + "\n".join(lines)

    if "faulty" in ql or ("faulty" in ql and "computer" in ql):
        faulty = [a for a in storage.list_rows("assets")
                  if a.get("Current Status") == "Faulty"]
        if "computer" in ql:
            faulty = [a for a in faulty if a.get("Category") == "Computer"]
        if not faulty:
            return "No faulty assets found."
        lines = [f"- {a.get('Asset ID')} {a.get('Asset Name')} ({a.get('Department')})"
                 for a in faulty[:15]]
        return f"{len(faulty)} faulty asset(s):\n" + "\n".join(lines)

    if "ssd" in ql or ("purchase" in ql and "stock" in ql) or "reorder" in ql:
        need = []
        for s in storage.list_rows("stock"):
            cur, mn, mx = (_num(s.get("Current Stock")),
                           _num(s.get("Minimum Stock")),
                           _num(s.get("Maximum Stock")))
            if cur <= mn:
                need.append((s.get("Item Name"), int(max(mx - cur, mn))))
        if "ssd" in ql:
            need = [n for n in need if "ssd" in n[0].lower()]
        if not need:
            return "No items currently need reordering."
        lines = [f"- {name}: purchase ~{qty} units" for name, qty in need[:15]]
        return "Recommended purchases:\n" + "\n".join(lines)

    if "cpu" in ql and ("high" in ql or "usage" in ql):
        hot = [h for h in storage.list_rows("hardware") if _num(h.get("CPU Usage")) > 80]
        if not hot:
            return "No systems currently report high CPU usage."
        lines = [f"- {h.get('Device ID')}: CPU {h.get('CPU Usage')}%, "
                 f"{h.get('Temperature')}C ({h.get('Health Status')})" for h in hot[:15]]
        return f"{len(hot)} system(s) with high CPU usage:\n" + "\n".join(lines)

    if "predict" in ql or "fail" in ql:
        risky = [p for p in storage.list_rows("predictive")
                 if _num(p.get("Risk Percentage")) >= 50]
        risky.sort(key=lambda p: _num(p.get("Risk Percentage")), reverse=True)
        if not risky:
            return "No high-risk assets predicted. Run predictions from the Predictive page first."
        lines = [f"- {p.get('Asset ID')}: {p.get('Risk Percentage')}% risk "
                 f"({p.get('Recommended Action')})" for p in risky[:15]]
        return "Assets most likely to fail:\n" + "\n".join(lines)

    if "inventory" in ql and "summary" in ql:
        assets = storage.list_rows("assets")
        from collections import Counter
        by_cat = Counter(a.get("Category") for a in assets)
        by_status = Counter(a.get("Current Status") for a in assets)
        return (f"Inventory summary: {len(assets)} total assets.\n"
                f"By category: {dict(by_cat)}\n"
                f"By status: {dict(by_status)}")

    if "report" in ql:
        return ("You can generate PDF/Excel/CSV reports from the Reports page. "
                "Ask me things like 'show faulty computers' or 'which assets are due "
                "for maintenance' for quick answers.")

    return ("I can answer questions about assets, stock, maintenance, hardware and "
            "predictions. Try: 'Which assets are due for maintenance?', "
            "'Show all faulty computers', 'How many SSDs should we purchase?', "
            "'Which systems have high CPU usage?', or 'Predict which systems will fail'.")


def _context_snapshot() -> str:
    import json
    storage = get_storage()
    snap = {k: storage.list_rows(k)[:60] for k in
            ("assets", "stock", "hardware", "maintenance", "preventive", "predictive")}
    return json.dumps(snap)[:14000]


@router.post("/chat")
def chat(payload: dict, user: dict = Depends(get_current_user)):
    question = (payload.get("message") or "").strip()
    if not question:
        return {"answer": "Please ask a question."}

    if settings.OPENAI_API_KEY:
        try:
            from openai import OpenAI
            client = OpenAI(api_key=settings.OPENAI_API_KEY)
            resp = client.chat.completions.create(
                model=settings.OPENAI_MODEL,
                messages=[
                    {"role": "system", "content":
                        "You are a laboratory asset-management assistant. Answer using "
                        "ONLY the JSON data provided. Be concise and specific."},
                    {"role": "user", "content":
                        f"DATA:\n{_context_snapshot()}\n\nQUESTION: {question}"},
                ],
                temperature=0.2,
            )
            return {"answer": resp.choices[0].message.content, "engine": "openai"}
        except Exception as e:  # noqa: BLE001 - fall back gracefully
            return {"answer": _rule_based_answer(question),
                    "engine": "rules", "note": f"OpenAI unavailable: {e}"}

    return {"answer": _rule_based_answer(question), "engine": "rules"}
