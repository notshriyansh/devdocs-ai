import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from build_index import build_index
from app.rag.retriever import Retriever


documents = [
    "FastAPI is a modern Python web framework.",
    "React is used to build user interfaces.",
    "Git is a version control system."
]


vector_store = build_index(documents)

retriever = Retriever(vector_store)


query = "What is FastAPI?"

results = retriever.retrieve(query)

print("\nRetrieved documents:\n")

for r in results:
    print("-", r)