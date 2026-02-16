import os
import tempfile
from pathlib import Path
from uuid import uuid4

from dotenv import load_dotenv
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from langchain_community.vectorstores import Chroma
from langchain_openai import ChatOpenAI, OpenAIEmbeddings

from rag_core import chunk_text, read_pdf


load_dotenv()

app = FastAPI(title="Chat with PDF API", version="0.2.0")

CHROMA_DIR = Path("data/chroma_db")
CHROMA_DIR.mkdir(parents=True, exist_ok=True)
COLLECTION_NAME = "pdf_chunks"


def parse_cors_origins() -> list[str]:
    raw_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000")
    return [origin.strip() for origin in raw_origins.split(",") if origin.strip()]


app.add_middleware(
    CORSMiddleware,
    allow_origins=parse_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    doc_id: str = Field(..., description="Document ID returned by /upload")
    question: str = Field(..., min_length=1, description="User question")
    k: int = Field(3, ge=1, le=10, description="How many chunks to retrieve")
    chat_model: str = Field("gpt-4o-mini", description="OpenAI chat model name")


class HealthResponse(BaseModel):
    status: str


class UploadResponse(BaseModel):
    doc_id: str
    filename: str
    chunks_indexed: int


class ChatResponse(BaseModel):
    answer: str
    sources: list[str]


def ensure_api_key() -> None:
    if not os.getenv("OPENAI_API_KEY"):
        raise HTTPException(
            status_code=500,
            detail="OPENAI_API_KEY is missing. Set it in environment variables.",
        )


def get_vectorstore() -> Chroma:
    embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
    return Chroma(
        collection_name=COLLECTION_NAME,
        embedding_function=embeddings,
        persist_directory=str(CHROMA_DIR),
    )


def build_prompt(question: str, context: str) -> str:
    return f"""
You are answering questions about a PDF.
Use only the context below. If the answer is not in context, say: "I don't know based on this PDF."

Question:
{question}

Context:
{context}
""".strip()


@app.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(status="ok")


@app.post("/upload", response_model=UploadResponse)
async def upload_pdf(file: UploadFile = File(...)) -> UploadResponse:
    ensure_api_key()

    filename = file.filename or "uploaded.pdf"
    if not filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    raw_bytes = await file.read()
    if not raw_bytes:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    tmp_path = None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp_file:
            tmp_file.write(raw_bytes)
            tmp_path = tmp_file.name

        text = read_pdf(tmp_path)
        chunks = chunk_text(text, chunk_size=1000, overlap=150)

        doc_id = str(uuid4())
        ids = [f"{doc_id}-{i}" for i in range(len(chunks))]
        metadatas = [
            {"doc_id": doc_id, "chunk_index": i, "filename": filename}
            for i in range(len(chunks))
        ]

        vectorstore = get_vectorstore()
        vectorstore.add_texts(texts=chunks, metadatas=metadatas, ids=ids)

        return UploadResponse(
            doc_id=doc_id,
            filename=filename,
            chunks_indexed=len(chunks),
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Upload failed: {exc}") from exc
    finally:
        if tmp_path and os.path.exists(tmp_path):
            os.unlink(tmp_path)


@app.post("/chat", response_model=ChatResponse)
def chat_with_pdf(payload: ChatRequest) -> ChatResponse:
    ensure_api_key()

    vectorstore = get_vectorstore()
    docs = vectorstore.similarity_search(
        payload.question,
        k=payload.k,
        filter={"doc_id": payload.doc_id},
    )

    if not docs:
        raise HTTPException(
            status_code=404,
            detail="No indexed chunks found for this doc_id. Upload the PDF first.",
        )

    context = "\n\n---\n\n".join(doc.page_content for doc in docs)
    prompt = build_prompt(payload.question, context)

    llm = ChatOpenAI(model=payload.chat_model, temperature=0)
    response = llm.invoke(prompt)
    answer = response.content if hasattr(response, "content") else str(response)

    sources = [doc.page_content[:220].replace("\n", " ") for doc in docs]
    return ChatResponse(answer=answer, sources=sources)
