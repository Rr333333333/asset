"""FastAPI application entrypoint."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.modules import MODULES
from app.routers import ai, auth, crud, dashboard, notifications, predictive, reports

settings = get_settings()

app = FastAPI(title=settings.APP_NAME, version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def _startup() -> None:
    # Seed sample data on the local backend so the UI is populated on first run.
    if settings.STORAGE_BACKEND == "local":
        from app.seed import seed_if_empty
        seed_if_empty()


@app.get("/")
def root():
    return {"app": settings.APP_NAME, "status": "ok",
            "storage": settings.STORAGE_BACKEND}


@app.get(f"{settings.API_PREFIX}/health")
def health():
    return {"status": "healthy"}


@app.get(f"{settings.API_PREFIX}/modules")
def modules():
    """List module metadata for the frontend nav/tables."""
    return [{"key": k, "label": m["label"], "id_field": m["id_field"],
             "icon": m["icon"]} for k, m in MODULES.items()]


# Register routers under /api
P = settings.API_PREFIX
app.include_router(auth.router, prefix=P)
app.include_router(dashboard.router, prefix=P)
app.include_router(predictive.router, prefix=P)
app.include_router(notifications.router, prefix=P)
app.include_router(ai.router, prefix=P)
app.include_router(reports.router, prefix=P)
# Generic CRUD must be registered LAST so its /{module} catch-all does not
# shadow the specific routers above.
app.include_router(crud.router, prefix=P)
