from .embeddings import EmbeddingModel
from .vector_store import VectorStore


class Retriever:

    def __init__(self, vector_store):

        self.embedder = EmbeddingModel()

        self.vector_store = vector_store

    def retrieve(self, query, k=5):

        query_embedding = self.embedder.embed([query])[0]

        docs = self.vector_store.search(query_embedding, k)

        return docs