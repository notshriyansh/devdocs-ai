from fastapi import APIRouter
from pydantic import BaseModel

from app.rag.vector_store import VectorStore
from app.services.chat_service import ChatService


router = APIRouter()

vector_store = VectorStore.load("data/index")

chat_service = ChatService(vector_store)


class ChatRequest(BaseModel):

    question: str


@router.post("/chat")
def chat(request: ChatRequest):

    answer, sources = chat_service.chat(request.question)

    return {
        "answer": answer,
        "sources": sources
    }