from PyPDF2 import PdfReader
from langchain_community.vectorstores import FAISS
from langchain_openai import ChatOpenAI, OpenAIEmbeddings


def read_pdf(path: str) -> str:
    """Read all text from a PDF file."""
    reader = PdfReader(path)
    pages = []
    for page in reader.pages:
        pages.append(page.extract_text() or "")
    text = "\n".join(pages).strip()
    if not text:
        raise ValueError("No text extracted from PDF. It may be scanned/image-based.")
    return text


def chunk_text(text: str, chunk_size: int = 1000, overlap: int = 150) -> list[str]:
    """Split text into overlapping chunks for better retrieval."""
    if overlap >= chunk_size:
        raise ValueError("overlap must be smaller than chunk_size")

    chunks = []
    start = 0
    n = len(text)

    while start < n:
        end = min(start + chunk_size, n)
        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)
        if end == n:
            break
        start = end - overlap

    if not chunks:
        raise ValueError("No chunks created from text.")
    return chunks


def build_index(chunks: list[str], embedding_model: str = "text-embedding-3-small") -> FAISS:
    """Create FAISS vector index from text chunks."""
    embeddings = OpenAIEmbeddings(model=embedding_model)
    index = FAISS.from_texts(chunks, embedding=embeddings)
    return index


def answer_question(
    index: FAISS,
    question: str,
    k: int = 3,
    chat_model: str = "gpt-4o-mini",
) -> tuple[str, list[str]]:
    """Retrieve top-k chunks and answer the question from that context."""
    docs = index.similarity_search(question, k=k)
    context = "\n\n---\n\n".join(d.page_content for d in docs)

    prompt = f"""
You are answering questions about a PDF.
Use only the context below. If the answer is not in context, say: "I don't know based on this PDF."

Question:
{question}

Context:
{context}
""".strip()

    llm = ChatOpenAI(model=chat_model, temperature=0)
    response = llm.invoke(prompt)
    answer = response.content if hasattr(response, "content") else str(response)

    top_chunks = [d.page_content[:220].replace("\n", " ") for d in docs]
    return answer, top_chunks
