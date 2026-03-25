from app.rag.retriever import Retriever
from app.llm.prompt_builder import build_prompt
from app.llm.model_loader import generate_stream


class ChatService:

    def __init__(self, vector_store):

        self.retriever = Retriever(vector_store)

    def stream_chat(self, query):

        docs = self.retriever.retrieve(query)

        prompt = build_prompt(query, docs)

        return generate_stream(prompt), docs

    def chat(self, query):

        docs = self.retriever.retrieve(query)

        prompt = build_prompt(query, docs)

        raw_answer = generate(prompt)

        answer = raw_answer.strip()

        seen = set()
        unique_sources = []

        for doc in docs:

            key = (doc["text"], doc["url"])

            if key not in seen:
                seen.add(key)

                unique_sources.append({
                    "text": doc["text"][:200],  # trim
                    "url": doc["url"]
                })

        return answer, unique_sources