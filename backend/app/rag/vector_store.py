import faiss
import numpy as np
import pickle


class VectorStore:

    def __init__(self, dimension):

        self.index = faiss.IndexFlatL2(dimension)
        self.documents = []   # now stores dicts

    def add(self, embeddings, docs):

        self.index.add(np.array(embeddings))
        self.documents.extend(docs)

    def search(self, query_embedding, k=5):

        distances, indices = self.index.search(
            np.array([query_embedding]), k
        )

        results = [self.documents[i] for i in indices[0]]

        return results

    def save(self, path):

        faiss.write_index(self.index, f"{path}/faiss.index")

        with open(f"{path}/docs.pkl", "wb") as f:
            pickle.dump(self.documents, f)

    @classmethod
    def load(cls, path):

        index = faiss.read_index(f"{path}/faiss.index")

        with open(f"{path}/docs.pkl", "rb") as f:
            docs = pickle.load(f)

        dimension = index.d

        vs = cls(dimension)
        vs.index = index
        vs.documents = docs

        return vs