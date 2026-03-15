from app.rag.retriever import Retriever
from app.llm.model_loader import LLMModel
from app.llm.prompt_builder import build_prompt


class ChatService:

    def __init__(self, vector_store):

        self.retriever = Retriever(vector_store)

        self.llm = LLMModel()

    def chat(self, query):

        docs = self.retriever.retrieve(query)

        prompt = build_prompt(query, docs)

        answer = self.llm.generate(prompt)

        return answer, docs