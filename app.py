import os
import hashlib
import tempfile

import streamlit as st
from dotenv import load_dotenv

from rag_core import read_pdf, chunk_text, build_index, answer_question


load_dotenv()

st.title("Chat with PDF")
api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    st.error("OPENAI_API_KEY is missing. Add it to your .env file and restart Streamlit.")
    st.stop()

if "index" not in st.session_state:
    st.session_state["index"] = None
if "file_id" not in st.session_state:
    st.session_state["file_id"] = None
if "messages" not in st.session_state:
    st.session_state["messages"] = []

uploaded_file = st.file_uploader("Upload PDF", type=["pdf"])
if uploaded_file is None:
    st.info("Please upload a PDF file to continue.")
    st.stop()

file_bytes = uploaded_file.getvalue()
file_id = hashlib.sha256(file_bytes).hexdigest()

if st.session_state["file_id"] != file_id:
    tmp_path = None
    try:
        with st.spinner("Processing PDF..."):
            with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp_file:
                tmp_file.write(file_bytes)
                tmp_path = tmp_file.name

            text = read_pdf(tmp_path)
            chunks = chunk_text(text, chunk_size=1000, overlap=150)
            st.session_state["index"] = build_index(chunks)
            st.session_state["file_id"] = file_id
            st.session_state["messages"] = []
        st.success(f"Indexed {len(chunks)} chunks from {uploaded_file.name}.")
    except Exception as exc:
        st.error(f"Failed to process PDF: {exc}")
        st.stop()
    finally:
        if tmp_path and os.path.exists(tmp_path):
            os.unlink(tmp_path)

for message in st.session_state["messages"]:
    with st.chat_message(message["role"]):
        st.markdown(message["content"])

question = st.chat_input("Ask a question about your PDF")
if question:
    st.session_state["messages"].append({"role": "user", "content": question})
    with st.chat_message("user"):
        st.markdown(question)

    with st.chat_message("assistant"):
        with st.spinner("Thinking..."):
            answer, sources = answer_question(st.session_state["index"], question)
        st.markdown(answer)
        if sources:
            st.caption("Top retrieved chunks:")
            for i, source in enumerate(sources, 1):
                st.write(f"{i}. {source}")

    st.session_state["messages"].append({"role": "assistant", "content": answer})
