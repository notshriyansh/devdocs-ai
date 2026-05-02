from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from fastapi.responses import StreamingResponse, JSONResponse
from sqlalchemy.orm import Session
import json

from app.rag.vector_store import VectorStore
from app.services.chat_service import ChatService
from app.auth.clerk import get_user_id
from app.db.database import get_db
from app.services.database_service import (
    ChatService as DBChatService,
    DocumentService,
    UserService,
)

router = APIRouter()

vector_store = VectorStore.load("data/index")
rag_chat_service = ChatService(vector_store)


class ChatRequest(BaseModel):
    query: str 
    doc_id: str | None = None


@router.post("/chat")
async def chat(
    request: ChatRequest,
    http_request: Request,
    db: Session = Depends(get_db)
):
    user_id = await get_user_id(http_request)
    
    try:
        email = http_request.headers.get("X-User-Email", f"{user_id}@example.com")
        UserService.get_or_create_user(db, user_id, email)
        
        if request.doc_id and not DocumentService.get_document(db, request.doc_id, user_id):
            raise HTTPException(status_code=404, detail="Document not found")

        result = rag_chat_service.chat(
            request.query,
            doc_id=request.doc_id,
            user_id=user_id
        )
        
        DBChatService.create_chat(
            db,
            user_id=user_id,
            query=request.query,
            response=result["answer"],
            doc_id=request.doc_id,
            sources=result.get("sources", [])
        )

        return JSONResponse(content=result)
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/chat/stream")
async def chat_stream(
    request: ChatRequest,
    http_request: Request,
    db: Session = Depends(get_db)
):
    user_id = await get_user_id(http_request)
    
    try:
        email = http_request.headers.get("X-User-Email", f"{user_id}@example.com")
        UserService.get_or_create_user(db, user_id, email)
        
        if request.doc_id and not DocumentService.get_document(db, request.doc_id, user_id):
            raise HTTPException(status_code=404, detail="Document not found")

        generator, sources = rag_chat_service.stream_chat(
            request.query,
            doc_id=request.doc_id,
            user_id=user_id
        )
        
        async def streaming_with_storage():
            full_response = ""
            try:
                for chunk in generator:
                    if chunk:
                        full_response += chunk
                    yield chunk
            finally:
                if full_response:
                    DBChatService.create_chat(
                        db,
                        user_id=user_id,
                        query=request.query,
                        response=full_response,
                        doc_id=request.doc_id,
                        sources=sources
                    )
        
        return StreamingResponse(
            streaming_with_storage(),
            media_type="text/plain",
            headers={
                "X-Sources": json.dumps(sources)
            }
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/history")
async def history(
    http_request: Request,
    doc_id: str | None = None,
    db: Session = Depends(get_db)
):
    user_id = await get_user_id(http_request)
    
    try:
        chats = DBChatService.get_user_history(db, user_id, doc_id)
        
        history_items = [
            {
                "id": chat.id,
                "query": chat.query,
                "response": chat.response,
                "doc_id": chat.doc_id,
                "sources": json.loads(chat.sources) if chat.sources else [],
                "created_at": chat.created_at.isoformat()
            }
            for chat in chats
        ]
        
        return JSONResponse(content={"history": history_items})
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/documents")
async def documents(
    http_request: Request,
    db: Session = Depends(get_db)
):
    user_id = await get_user_id(http_request)

    try:
        docs = DocumentService.get_user_documents(db, user_id)

        return JSONResponse(content={
            "documents": [
                {
                    "id": doc.id,
                    "title": doc.title,
                    "source_url": doc.source_url,
                    "created_at": doc.created_at.isoformat()
                }
                for doc in docs
            ]
        })

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
