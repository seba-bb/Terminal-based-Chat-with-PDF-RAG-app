# Chat with PDF (RAG)

Phased "Chat with PDF" project moving from CLI prototype to deployable full-stack app.

## Current Status

### Overall
- Local development status: `Phase 3 (core)` is working locally.
- Verified locally: PDF upload and chat flow through split frontend + backend.
- Not completed yet: production deployment (`Railway` backend + `Vercel` frontend).

### Phase-by-Phase Progress

| Phase | Status | Notes |
|---|---|---|
| Phase 1: CLI PoC | Completed | `main.py` reads PDF, chunks, embeds, answers questions |
| Phase 2: Streamlit MVP | Completed (local) | `app.py` upload + chat interface |
| Phase 3: Split Frontend/Backend | In Progress | FastAPI + Next.js implemented locally; deployment pending |
| Phase 4+ | Not Started | Auth, persistence, production polish, SaaS features |

## Implemented in This Repo

### Backend (FastAPI)
- File: `backend_api.py`
- Endpoints:
  - `GET /health`
  - `POST /upload`
  - `POST /chat`
- Vector store: ChromaDB persisted in `data/chroma_db`
- PDF pipeline: read -> chunk -> embed -> store with `doc_id`
- CORS support via `CORS_ORIGINS` env var

### Frontend (Next.js + Tailwind)
- Directory: `frontend/`
- Pages:
  - `/upload` for PDF upload
  - `/chat` for querying uploaded document
- API integration through `NEXT_PUBLIC_API_BASE_URL`
- Client stores last uploaded `doc_id` in local storage for chat continuity

### Legacy/Previous Phases
- CLI mode: `main.py`
- Streamlit mode: `app.py`
- Shared RAG utilities: `rag_core.py`

## What Works Right Now (Local)

1. Start backend and frontend locally.
2. Upload a PDF from frontend (`/upload`).
3. Backend returns:

```json
{
  "doc_id": "<uuid>",
  "filename": "<file>.pdf",
  "chunks_indexed": 42
}
```

4. Frontend redirects to `/chat` and uses returned `doc_id`.
5. Asking questions returns `answer` + `sources`.

## What Still Must Be Completed

### Phase 3 Completion Checklist
- [ ] Deploy backend to Railway
- [ ] Deploy frontend to Vercel
- [ ] Set production env vars (`OPENAI_API_KEY`, `CORS_ORIGINS`, `NEXT_PUBLIC_API_BASE_URL`)
- [ ] Validate end-to-end upload + chat in production
- [ ] Mark Phase 3 milestone complete (two deployed services communicating)

### Recommended Immediate Follow-ups
- [ ] Upgrade Next.js to a patched secure version before production deploy
- [ ] Add basic backend tests for `/health`, `/upload`, `/chat`
- [ ] Add frontend error-state smoke checks

## Local Setup

### 1) Backend setup

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Create root `.env`:

```bash
OPENAI_API_KEY=your_openai_api_key_here
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

### 2) Frontend setup

```bash
cd frontend
cp .env.example .env.local
npm install
```

Set `frontend/.env.local`:

```bash
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
```

## Run Locally

### Terminal 1: backend

```bash
cd ~/Projekty/projekt_z_marcinem
source venv/bin/activate
python3 -m uvicorn backend_api:app --host 127.0.0.1 --port 8000 --reload
```

### Terminal 2: frontend

```bash
cd ~/Projekty/projekt_z_marcinem/frontend
npm run dev
```

Open `http://localhost:3000`.

## API Quick Check

Health:

```bash
curl http://127.0.0.1:8000/health
```

Upload:

```bash
curl -X POST "http://127.0.0.1:8000/upload" \
  -F "file=@data/Attractions.pdf"
```

Chat:

```bash
curl -X POST "http://127.0.0.1:8000/chat" \
  -H "Content-Type: application/json" \
  -d '{"doc_id":"DOC_ID_FROM_UPLOAD","question":"What are the top attractions?"}'
```

## Project Structure

```text
app.py                  # Streamlit UI (Phase 2)
backend_api.py          # FastAPI backend (Phase 3)
main.py                 # CLI entrypoint (Phase 1)
rag_core.py             # Shared PDF/chunk/index helpers
frontend/               # Next.js frontend (Phase 3)
PROJECT_PLAN.md         # Full roadmap
```
