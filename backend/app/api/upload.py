import uuid
from fastapi import APIRouter, File, UploadFile, Form, HTTPException
from pypdf import PdfReader

from app.api.chat import vector_store
from app.rag.chunking import chunk_text
from app.rag.embeddings import EmbeddingModel
from app.rag.scraper import scrape_docs
from app.rag.youtube import get_youtube_transcript

router = APIRouter()
embedder = EmbeddingModel()


def extract_pdf_text(file: UploadFile) -> str:
    try:
        reader = PdfReader(file.file)
        text = ""

        for page in reader.pages:
            text += page.extract_text() or ""

        return text

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"PDF parsing failed: {str(e)}")


@router.post("/upload-documents")
def upload_documents(
    text: str = Form(None),
    file: UploadFile = File(None)
):
    if not text and not file:
        raise HTTPException(status_code=400, detail="Provide text or file")

    try:
        if file:
            filename = file.filename.lower()

            if filename.endswith(".txt"):
                content = file.file.read().decode("utf-8")

            elif filename.endswith(".pdf"):
                content = extract_pdf_text(file)

            else:
                raise HTTPException(
                    status_code=400,
                    detail="Only .txt and .pdf files supported"
                )

            source = file.filename

        else:
            content = text
            source = "manual_input"

        chunks = chunk_text(content)

        if not chunks:
            raise HTTPException(status_code=400, detail="No content extracted")

        doc_id = uuid.uuid4().hex

        docs = [
            {"text": chunk, "url": source, "doc_id": doc_id}
            for chunk in chunks
        ]

        embeddings = embedder.embed(chunks)

        vector_store.add(embeddings, docs)
        vector_store.save("data/index")

        return {
            "message": f"Processed {len(chunks)} chunks from {source}",
            "doc_id": doc_id
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/upload-url")
def upload_url(url: str = Form(...)):
    try:
        if "youtube.com" in url or "youtu.be" in url:
            content = get_youtube_transcript(url)
        else:
            content = scrape_docs(url)

        chunks = chunk_text(content)

        if not chunks:
            raise HTTPException(status_code=400, detail="No content extracted")

        doc_id = uuid.uuid4().hex

        docs = [
            {"text": chunk, "url": url, "doc_id": doc_id}
            for chunk in chunks
        ]

        embeddings = embedder.embed(chunks)

        vector_store.add(embeddings, docs)
        vector_store.save("data/index")

        return {
            "message": f"Ingested {len(chunks)} chunks from {url}",
            "doc_id": doc_id
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))