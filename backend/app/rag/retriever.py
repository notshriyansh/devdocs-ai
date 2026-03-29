from .embeddings import EmbeddingModel


class Retriever:
    def __init__(self, vector_store):
        self.embedder = EmbeddingModel()
        self.vector_store = vector_store

    def retrieve(self, query, k=5):
        query_embedding = self.embedder.embed([query])[0]

        try:
            semantic_docs = self.vector_store.search(query_embedding, k=k)
        except Exception:
            semantic_docs = []

        query_lower = query.lower()

        all_docs = getattr(self.vector_store, "documents", [])

        keyword_docs = [
            doc for doc in all_docs
            if query_lower in doc.get("text", "").lower()
        ][:k]

        combined = semantic_docs + keyword_docs

        seen = set()
        results = []

        for doc in combined:
            text = doc.get("text", "")

            if text and text not in seen:
                seen.add(text)
                results.append(doc)

        return results[:k]