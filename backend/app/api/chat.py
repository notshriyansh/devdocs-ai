from fastapi import APIRouter
from pydantic import BaseModel
from fastapi.responses import StreamingResponse

from app.rag.vector_store import VectorStore
from app.services.chat_service import ChatService


router = APIRouter()

vector_store = VectorStore.load("data/index")

chat_service = ChatService(vector_store)


class ChatRequest(BaseModel):

    question: str


@router.post("/chat/stream")
def chat_stream(request: ChatRequest):

    generator, docs = chat_service.stream_chat(request.question)

    return StreamingResponse(generator, media_type="text/plain")