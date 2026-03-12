import faiss
import numpy as np


class VectorStore:

    def __init__(self, dimension):

        self.index = faiss.IndexFlatL2(dimension)

        self.texts = []

    def add(self, embeddings, texts):

        self.index.add(np.array(embeddings))

        self.texts.extend(texts)

    def search(self, query_embedding, k=5):

        distances, indices = self.index.search(
            np.array([query_embedding]), k
        )

        results = [self.texts[i] for i in indices[0]]

        return results