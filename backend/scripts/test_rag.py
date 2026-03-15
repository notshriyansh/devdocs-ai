import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from scripts.build_index import build_index
from app.services.chat_service import ChatService


documents = [
    "FastAPI is a modern Python web framework.",
    "React is used to build user interfaces.",
    "Git is a version control system."
]


vector_store = build_index(documents)

chat = ChatService(vector_store)


query = "What is FastAPI?"

answer, docs = chat.chat(query)

print("\nRetrieved docs:\n")

for d in docs:
    print("-", d)

print("\nAI Answer:\n")

print(answer)