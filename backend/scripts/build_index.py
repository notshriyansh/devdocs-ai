import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

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

    vector_store.save("data/index")

    print("Index saved to data/index")

    return vector_store


if __name__ == "__main__":

    documents = [
        "FastAPI is a modern Python web framework.",
        "React is used to build user interfaces.",
        "Git is a version control system."
    ]

    build_index(documents)