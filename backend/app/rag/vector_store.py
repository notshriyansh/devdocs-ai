import faiss
import numpy as np
import pickle


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

    def save(self, path):

        faiss.write_index(self.index, f"{path}/faiss.index")

        with open(f"{path}/texts.pkl", "wb") as f:
            pickle.dump(self.texts, f)

    @classmethod
    def load(cls, path):

        index = faiss.read_index(f"{path}/faiss.index")

        with open(f"{path}/texts.pkl", "rb") as f:
            texts = pickle.load(f)

        dimension = index.d

        vector_store = cls(dimension)

        vector_store.index = index
        vector_store.texts = texts

        return vector_store