# Chat with PDF (RAG)

Simple RAG app that lets you ask questions about a PDF using OpenAI, LangChain, FAISS, and ChromaDB.

## Features
- CLI mode for Phase 1 (`main.py`)
- Streamlit UI for Phase 2 (`app.py`)
- FastAPI backend for Phase 3 (`backend_api.py`)
- Shared RAG core functions in `rag_core.py`

## Tech Stack
- Python
- PyPDF2
- LangChain
- OpenAI API
- FAISS
- ChromaDB
- Streamlit
- FastAPI

## Local Setup
1. Create and activate a virtual environment:
```bash
python3 -m venv venv
source venv/bin/activate
```
2. Install dependencies:
```bash
pip install -r requirements.txt
```
3. Add environment variable in `.env`:
```bash
OPENAI_API_KEY=your_openai_api_key_here
```

## Run Locally
### CLI (Phase 1)
Ask one question:
```bash
python3 main.py data/Attractions.pdf -q "Your question here"
```

Interactive mode:
```bash
python3 main.py data/Attractions.pdf
```

### Streamlit UI (Phase 2)
```bash
streamlit run app.py
```

If `streamlit` is not found:
```bash
python3 -m streamlit run app.py
```

Open the URL shown in terminal (usually `http://localhost:8501`).

### FastAPI Backend (Phase 3 Backend)
Run API server:
```bash
uvicorn backend_api:app --reload
```

If `uvicorn` is not found:
```bash
python3 -m uvicorn backend_api:app --reload
```

API docs:
```text
http://localhost:8000/docs
```

Health check:
```bash
curl http://localhost:8000/health
```

Upload PDF:
```bash
curl -X POST "http://localhost:8000/upload" \
  -F "file=@data/Attractions.pdf"
```

Chat with uploaded PDF (replace `DOC_ID_FROM_UPLOAD`):
```bash
curl -X POST "http://localhost:8000/chat" \
  -H "Content-Type: application/json" \
  -d '{"doc_id":"DOC_ID_FROM_UPLOAD","question":"What are the top attractions?"}'
```

## Deploy to Streamlit Community Cloud
1. Push repository to GitHub.
2. Go to Streamlit Community Cloud and create a new app.
3. Select your repository, branch (`master`), and main file path (`app.py`).
4. In app settings, add secrets:
```toml
OPENAI_API_KEY = "your_openai_api_key_here"
```
5. Deploy and wait for build to finish.
6. Open the generated public URL and test PDF upload + chat.

## Project Structure
```text
app.py          # Streamlit UI
backend_api.py  # FastAPI backend (health/upload/chat)
main.py         # CLI entrypoint
rag_core.py     # PDF read/chunk/index/answer functions
PROJECT_PLAN.md # phased roadmap
```

## Notes
- `app.py` builds the index once per uploaded file and stores it in `st.session_state`.
- Uploading a different PDF rebuilds the index for that file.
- `backend_api.py` stores chunk embeddings in `data/chroma_db`.
