from app.rag.retriever import Retriever
from app.llm.prompt_builder import build_prompt
from app.llm.model_loader import generate


class ChatService:

    def __init__(self, vector_store):

        self.retriever = Retriever(vector_store)

    def chat(self, query):

        docs = self.retriever.retrieve(query)

        prompt = build_prompt(query, docs)

        answer = generate(prompt)

        return answer, docs