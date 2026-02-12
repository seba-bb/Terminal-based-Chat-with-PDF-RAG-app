import os

import streamlit as st
from dotenv import load_dotenv

from rag_core import read_pdf, chunk_text, build_index, answer_question


load_dotenv()

st.title("Chat with PDF")
st.write("Step 3 complete: app imports shared RAG functions.")