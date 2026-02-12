import os

import streamlit as st
from dotenv import load_dotenv

from rag_core import read_pdf, chunk_text, build_index, answer_question


load_dotenv()

st.title("Chat with PDF")
api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    st.error("OPENAI_API_KEY is missing. Add it to your .env file and restart Streamlit.")
    st.stop()

st.success("OPENAI_API_KEY loaded.")
st.write("Step 3 complete: app imports shared RAG functions and validates API key.")
uploaded_file = st.file_uploader("Upload PDF", type=["pdf"])
if uploaded_file is None:
    st.info("Please upload a PDF file to continue.")
    st.stop()
st.write(f"Uploaded file: {uploaded_file.name}  ({uploaded_file.size} bytes)")
st.write("Step 4 complete: file uploader added and file details displayed.")

