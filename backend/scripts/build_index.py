from app.rag.chunking import chunk_text
from app.rag.embeddings import EmbeddingModel
from app.rag.vector_store import VectorStore


def build_index(documents):

    embedder = EmbeddingModel()

    all_chunks = []

    for doc in documents:

        chunks = chunk_text(doc)

        all_chunks.extend(chunks)

    embeddings = embedder.embed(all_chunks)

    dimension = len(embeddings[0])

    vector_store = VectorStore(dimension)

    vector_store.add(embeddings, all_chunks)

    return vector_store