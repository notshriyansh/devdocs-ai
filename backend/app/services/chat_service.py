from app.rag.retriever import Retriever
from app.llm.prompt_builder import build_prompt
from app.llm.model_loader import generate, generate_stream


class ChatService:
    def __init__(self, vector_store):
        self.retriever = Retriever(vector_store)

    def _format_sources(self, docs):
        seen = set()
        unique_sources = []

        for doc in docs:
            key = (doc["text"], doc.get("url", ""))

            if key not in seen:
                seen.add(key)
                unique_sources.append({
                    "text": doc["text"][:200],
                    "url": doc.get("url", "")
                })

        return unique_sources

    def chat(self, query, doc_id=None):
        docs = self.retriever.retrieve(query, doc_id=doc_id)
        prompt = build_prompt(query, docs)

        raw_answer = generate(prompt)
        answer = raw_answer.strip()

        sources = self._format_sources(docs)

        return {
            "answer": answer,
            "sources": sources
        }

    def stream_chat(self, query, doc_id=None):
        docs = self.retriever.retrieve(query, doc_id=doc_id)
        prompt = build_prompt(query, docs)
        sources = self._format_sources(docs)

        def generator():
            try:
                for chunk in generate_stream(prompt):
                    if chunk:
                        yield chunk
            except Exception as e:
                yield f"\n[ERROR]: {str(e)}\n"

        return generator(), sources