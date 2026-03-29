from fastapi import APIRouter, File, UploadFile, Form, HTTPException
from app.api.chat import vector_store
from app.rag.chunking import chunk_text
from app.rag.embeddings import EmbeddingModel
from app.rag.scraper import scrape_docs

router = APIRouter()
embedder = EmbeddingModel()


@router.post("/upload-documents")
def upload_documents(
    text: str = Form(None),
    file: UploadFile = File(None)
):
    if not text and not file:
        raise HTTPException(status_code=400, detail="Provide text or file")

    try:
        if file:
            if not file.filename.endswith(".txt"):
                raise HTTPException(status_code=400, detail="Only .txt files allowed")

            content = file.file.read().decode("utf-8")
            source = file.filename

        else:
            content = text
            source = "manual_input"

        chunks = chunk_text(content)

        if not chunks:
            raise HTTPException(status_code=400, detail="No content to process")

        docs = [{"text": chunk, "url": source} for chunk in chunks]

        embeddings = embedder.embed(chunks)

        vector_store.add(embeddings, docs)
        vector_store.save("data/index")

        return {
            "message": f"Processed {len(chunks)} chunks from {source}"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/upload-url")
def upload_url(url: str = Form(...)):
    try:
        content = scrape_docs(url)

        chunks = chunk_text(content)

        docs = [{"text": chunk, "url": url} for chunk in chunks]

        embeddings = embedder.embed(chunks)

        vector_store.add(embeddings, docs)
        vector_store.save("data/index")

        return {
            "message": f"Ingested {len(chunks)} chunks from {url}"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))