import argparse
import os
import sys
from pathlib import Path

from dotenv import load_dotenv
from backend_api import app as app
from rag_core import answer_question, build_index, chunk_text, read_pdf

DEFAULT_PDF_PATH = "data/Attractions.pdf"


def main() -> None:
    parser = argparse.ArgumentParser(description="Chat with PDF (Phase 1 PoC)")
    parser.add_argument(
        "pdf_path",
        nargs="?",
        default=DEFAULT_PDF_PATH,
        help=f"Path to PDF file (default: {DEFAULT_PDF_PATH})",
    )
    parser.add_argument("-q", "--question", help="Single question mode")
    args = parser.parse_args()

    load_dotenv()
    if not os.getenv("OPENAI_API_KEY"):
        print("ERROR: OPENAI_API_KEY missing. Add it to .env")
        sys.exit(1)

    pdf_path = Path(args.pdf_path)
    if not pdf_path.exists():
        print(f"ERROR: File not found: {pdf_path}")
        sys.exit(1)

    text = read_pdf(str(pdf_path))
    print(f"[OK] Extracted characters: {len(text)}")

    chunks = chunk_text(text, chunk_size=1000, overlap=150)
    print(f"[OK] Created chunks: {len(chunks)}")

    index = build_index(chunks)
    print("[OK] FAISS index built")

    if args.question:
        answer, sources = answer_question(index, args.question)
        print("\nAnswer:\n", answer)
        print("\nTop retrieved chunks (preview):")
        for i, s in enumerate(sources, 1):
            print(f"{i}. {s}")
        return

    print("\nInteractive mode. Type 'exit' to quit.")
    while True:
        q = input("\nQuestion: ").strip()
        if q.lower() in {"exit", "quit"}:
            break
        if not q:
            continue
        answer, sources = answer_question(index, q)
        print("\nAnswer:\n", answer)
        print("\nTop retrieved chunks (preview):")
        for i, s in enumerate(sources, 1):
            print(f"{i}. {s}")


if __name__ == "__main__":
    main()
