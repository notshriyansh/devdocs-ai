from fastapi import APIRouter
from pydantic import BaseModel
from fastapi.responses import StreamingResponse, JSONResponse
import json

from app.rag.vector_store import VectorStore
from app.services.chat_service import ChatService


router = APIRouter()

vector_store = VectorStore.load("data/index")
chat_service = ChatService(vector_store)


from app.services.history_service import append_history, get_history

class ChatRequest(BaseModel):
    query: str 
    doc_id: str | None = None


@router.post("/chat")
def chat(request: ChatRequest):
    result = chat_service.chat(request.query, doc_id=request.doc_id)
    
    append_history(
        query=request.query, 
        response=result["answer"], 
        doc_id=request.doc_id
    )

    return JSONResponse(content=result)


@router.post("/chat/stream")
def chat_stream(request: ChatRequest):

    generator, sources = chat_service.stream_chat(request.query, doc_id=request.doc_id)

    return StreamingResponse(
        generator,
        media_type="text/plain",
        headers={
            "X-Sources": json.dumps(sources)
        }
    )

@router.get("/history")
def history(doc_id: str | None = None):
    logs = get_history(doc_id)
    return JSONResponse(content={"history": logs})