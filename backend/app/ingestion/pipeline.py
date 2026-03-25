from app.ingestion.scraper import scrape_page
from app.ingestion.cleaner import clean_text
from app.rag.chunking import chunk_text
from app.rag.embeddings import EmbeddingModel
from app.rag.vector_store import VectorStore


def ingest_urls(urls):

    embedder = EmbeddingModel()

    all_chunks = []
    all_docs = []

    for url in urls:

        print(f"Scraping: {url}")

        raw_text = scrape_page(url)
        cleaned_text = clean_text(raw_text)

        chunks = chunk_text(cleaned_text)

        for chunk in chunks:
            all_docs.append({
                "text": chunk,
                "url": url
            })

        all_chunks.extend(chunks)

    embeddings = embedder.embed(all_chunks)

    dimension = len(embeddings[0])

    vector_store = VectorStore(dimension)

    vector_store.add(embeddings, all_docs)

    vector_store.save("data/index")

    print("Index updated!")

    return vector_store