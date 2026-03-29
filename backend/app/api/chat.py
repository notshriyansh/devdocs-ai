from fastapi import APIRouter
from pydantic import BaseModel
from fastapi.responses import StreamingResponse, JSONResponse
import json

from app.rag.vector_store import VectorStore
from app.services.chat_service import ChatService


router = APIRouter()

vector_store = VectorStore.load("data/index")
chat_service = ChatService(vector_store)


class ChatRequest(BaseModel):
    query: str 


@router.post("/chat")
def chat(request: ChatRequest):
    result = chat_service.chat(request.query)
    return JSONResponse(content=result)


@router.post("/chat/stream")
def chat_stream(request: ChatRequest):

    generator, sources = chat_service.stream_chat(request.query)

    return StreamingResponse(
        generator,
        media_type="text/plain",
        headers={
            "X-Sources": json.dumps(sources)
        }
    )