from .embeddings import EmbeddingModel


class Retriever:
    def __init__(self, vector_store):
        self.embedder = EmbeddingModel()
        self.vector_store = vector_store

    def retrieve(self, query, k=5, doc_id=None, user_id=None):
        query_embedding = self.embedder.embed([query])[0]

        try:
            docs = self.vector_store.search(query_embedding, k=10)
        except:
            docs = []

        if user_id:
            docs = [doc for doc in docs if doc.get("user_id") == user_id]

        if doc_id:
            docs = [doc for doc in docs if doc.get("doc_id") == doc_id]

        query_lower = query.lower()
        keyword_docs = [
            doc for doc in self.vector_store.documents
            if query_lower in doc.get("text", "").lower()
        ]

        if user_id:
            keyword_docs = [doc for doc in keyword_docs if doc.get("user_id") == user_id]

        if doc_id:
            keyword_docs = [doc for doc in keyword_docs if doc.get("doc_id") == doc_id]

        combined = docs + keyword_docs

        seen = set()
        results = []

        for doc in combined:
            text = doc.get("text", "")
            if text and text not in seen:
                seen.add(text)
                results.append(doc)

        return results[:k]
