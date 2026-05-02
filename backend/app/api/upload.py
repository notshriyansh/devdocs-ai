import uuid
from fastapi import APIRouter, File, UploadFile, Form, HTTPException, Depends, Request
from pypdf import PdfReader
from sqlalchemy.orm import Session

from app.api.chat import vector_store
from app.rag.chunking import chunk_text
from app.rag.embeddings import EmbeddingModel
from app.rag.scraper import scrape_docs
from app.rag.youtube import get_youtube_transcript
from app.auth.clerk import get_user_id
from app.db.database import get_db
from app.services.database_service import DocumentService, UserService

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
async def upload_documents(
    http_request: Request,
    text: str = Form(None),
    file: UploadFile = File(None),
    db: Session = Depends(get_db)
):
    user_id = await get_user_id(http_request)
    
    if not text and not file:
        raise HTTPException(status_code=400, detail="Provide text or file")

    try:
        email = http_request.headers.get("X-User-Email", f"{user_id}@example.com")
        UserService.get_or_create_user(db, user_id, email)
        
        if file:
            filename = (file.filename or "").lower()

            if filename.endswith(".txt"):
                content = file.file.read().decode("utf-8")

            elif filename.endswith(".pdf"):
                content = extract_pdf_text(file)

            else:
                raise HTTPException(
                    status_code=400,
                    detail="Only .txt and .pdf files supported"
                )

            title = file.filename
            source = file.filename

        else:
            content = text
            title = "Manual Input"
            source = "manual_input"

        chunks = chunk_text(content)

        if not chunks:
            raise HTTPException(status_code=400, detail="No content extracted")

        doc_id = uuid.uuid4().hex
        
        DocumentService.create_document(db, user_id, title, source, doc_id=doc_id)

        docs = [
            {"text": chunk, "url": source, "doc_id": doc_id, "user_id": user_id}
            for chunk in chunks
        ]

        embeddings = embedder.embed(chunks)

        vector_store.add(embeddings, docs)
        vector_store.save("data/index")

        return {
            "message": f"Processed {len(chunks)} chunks from {source}",
            "doc_id": doc_id,
            "title": title
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/upload-url")
async def upload_url(
    http_request: Request,
    url: str = Form(...),
    db: Session = Depends(get_db)
):
    user_id = await get_user_id(http_request)
    
    try:
        email = http_request.headers.get("X-User-Email", f"{user_id}@example.com")
        UserService.get_or_create_user(db, user_id, email)
        
        if "youtube.com" in url or "youtu.be" in url:
            try:
                content = get_youtube_transcript(url)
                title = f"YouTube: {url}"
            except ValueError as ve:
                raise HTTPException(
                    status_code=400,
                    detail=f"Could not extract YouTube transcript: {str(ve)}"
                )
        else:
            content = scrape_docs(url)
            title = f"Web: {url[:50]}"

        chunks = chunk_text(content)

        if not chunks:
            raise HTTPException(status_code=400, detail="No content extracted from URL")

        doc_id = uuid.uuid4().hex
        
        DocumentService.create_document(db, user_id, title, url, doc_id=doc_id)

        docs = [
            {"text": chunk, "url": url, "doc_id": doc_id, "user_id": user_id}
            for chunk in chunks
        ]

        embeddings = embedder.embed(chunks)

        vector_store.add(embeddings, docs)
        vector_store.save("data/index")

        return {
            "message": f"Ingested {len(chunks)} chunks from {url}",
            "doc_id": doc_id,
            "title": title
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to ingest URL: {str(e)}")
