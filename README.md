# AI Smart Laboratory Asset Management System

A production-ready, full-stack laboratory asset management platform.

- **Frontend:** React (Vite) + Material UI + Tailwind CSS + Recharts + React Router
- **Backend:** Python FastAPI (JWT auth, generic CRUD, ML, reports)
- **Database:** Google Sheets (via a service account) — with a zero-setup local JSON fallback
- **AI:** OpenAI-powered assistant (falls back to a built-in rule engine if no key)
- **ML:** RandomForest predictive-maintenance model

> **Runs out of the box.** With `STORAGE_BACKEND=local` (the default) the app seeds
> sample data into JSON files so you can log in and click through every feature
> immediately. Flip one env var to switch to real Google Sheets.

---

## Features

- **7 modules**, all with searchable / sortable / paginated tables, add/edit/view/delete,
  and CSV / Excel / PDF / print export:
  Asset Inventory · Stock Maintenance · Hardware Monitoring · Maintenance Requests ·
  Preventive Maintenance · Predictive Maintenance · Vendor Details
- **Dashboard:** 8 summary cards, 6 charts, and 6 cross-cutting filters
  (year, month, department, laboratory, category, status)
- **Predictive maintenance:** RandomForest risk scoring with a what-if predictor and RAG status
- **AI Assistant:** natural-language questions answered from your live data
- **Notifications:** automatic alerts for low stock, warranty/AMC expiry, due maintenance,
  critical hardware, and high predicted failure risk
- **Reports:** one-click PDF / Excel / CSV for every module
- **Auth & roles:** Admin, Lab Assistant, Technician (JWT)
- **Dark / light mode**, responsive layout

---

## Architecture (why it's small but complete)

The whole system is **schema-driven**. Every module is described once in
`backend/app/modules.py` (columns, types, ID prefix). A single generic CRUD router
serves all modules, and a single generic table + form on the frontend renders them.
Add a new module by adding one entry to that file — no new routes or components needed.

```
lab-asset-management/
├── backend/
│   ├── app/
│   │   ├── main.py            # FastAPI app + router wiring
│   │   ├── config.py          # env-based settings
│   │   ├── modules.py         # <-- single source of truth for all 7 modules
│   │   ├── auth.py            # JWT auth + roles
│   │   ├── seed.py            # sample data (local backend)
│   │   ├── ml/model.py        # RandomForest predictive model
│   │   ├── storage/           # local JSON + Google Sheets backends
│   │   └── routers/           # auth, crud, dashboard, predictive, ai, notifications, reports
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── pages/             # Dashboard, ModulePage, Predictive, AIAssistant, Reports, Settings, Login
│   │   ├── components/        # Layout, Sidebar, Topbar, DataTable, EntityForm, StatCard, ...
│   │   ├── context/           # Auth + color-mode
│   │   └── api/client.js      # axios instance + report download helper
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

---

## 1. Run locally (5 minutes, no Google account needed)

### Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env               # defaults are fine for local mode
uvicorn app.main:app --reload      # http://localhost:8000  (docs at /docs)
```

### Frontend (in a second terminal)
```bash
cd frontend
npm install
npm run dev                        # http://localhost:5173
```

Open http://localhost:5173 and log in with a demo account:

| Role          | Username     | Password       |
|---------------|--------------|----------------|
| Admin         | `admin`      | `admin123`     |
| Lab Assistant | `assistant`  | `assistant123` |
| Technician    | `technician` | `tech123`      |

The Vite dev server proxies `/api` to the backend, so there is nothing else to configure.

---

## 2. Switch to Google Sheets

1. Go to the [Google Cloud Console](https://console.cloud.google.com/) → create a project.
2. **APIs & Services → Library** → enable **Google Sheets API** and **Google Drive API**.
3. **APIs & Services → Credentials → Create Credentials → Service account.**
   Create it, then under the service account → **Keys → Add key → JSON**. Download the file.
4. Save that file as `backend/service_account.json`.
5. Create a new Google Sheet (any name). Copy its **Spreadsheet ID** from the URL:
   `https://docs.google.com/spreadsheets/d/`**`THIS_IS_THE_ID`**`/edit`
6. Open the JSON key, copy the `client_email` value, and **Share** your Google Sheet
   with that email address, giving it **Editor** access.
7. In `backend/.env` set:
   ```env
   STORAGE_BACKEND=sheets
   GOOGLE_SPREADSHEET_ID=THE_ID_FROM_STEP_5
   GOOGLE_CREDENTIALS_FILE=service_account.json
   ```
8. Restart the backend. On startup it auto-creates one worksheet per module (with headers).
   All CRUD, dashboard, reports, and AI now read/write your live Google Sheet.

> Each module maps to its own worksheet/tab inside the one spreadsheet. To keep them in
> separate spreadsheet files instead, extend `storage/sheets_backend.py` to open a
> different key per module — the rest of the app is unchanged.

---

## 3. Enable the OpenAI assistant (optional)

Set in `backend/.env`:
```env
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
```
Without a key, the AI Assistant still works using the built-in rule engine.

---

## 4. Deployment

### Option A — Docker Compose (whole stack)
```bash
# from the project root
STORAGE_BACKEND=local docker compose up --build
# frontend -> http://localhost:8080   backend -> http://localhost:8000
```
For Google Sheets, uncomment the `service_account.json` volume in `docker-compose.yml`
and pass `STORAGE_BACKEND=sheets`, `GOOGLE_SPREADSHEET_ID`, and `OPENAI_API_KEY`.

### Option B — Backend on Render / Railway / any container host
- Deploy the `backend/` folder (it has a `Dockerfile`).
- Set env vars: `STORAGE_BACKEND`, `JWT_SECRET`, `CORS_ORIGINS` (your frontend URL),
  and the Google/OpenAI vars if used. Upload `service_account.json` as a secret file.
- Start command (if not using Docker): `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### Option C — Frontend on Vercel / Netlify
- Root directory: `frontend`, build command `npm run build`, output `dist`.
- Set `VITE_API_BASE` to your deployed backend URL, e.g. `https://your-api.onrender.com/api`.
- Add that frontend domain to the backend's `CORS_ORIGINS`.

---

## Security notes for production
- Change `JWT_SECRET` to a long random value.
- Move users out of `auth.py` into a database/Sheet and hash passwords (e.g. `passlib[bcrypt]`).
- Never commit `.env` or `service_account.json` (already in `.gitignore`).
- Restrict `CORS_ORIGINS` to your real frontend domain.

---

## API quick reference (all under `/api`)
- `POST /auth/login`, `GET /auth/me`
- `GET|POST /{module}`, `GET|PUT|DELETE /{module}/{id}`, `GET /{module}/meta`
  (module ∈ assets, stock, hardware, maintenance, preventive, predictive, vendors)
- `GET /dashboard/stats|charts|filters`
- `POST /predictive/run`, `POST /predictive/predict`
- `POST /ai/chat`
- `GET /notifications`
- `GET /reports/{module}?format=csv|xlsx|pdf`

Interactive docs: `http://localhost:8000/docs`
