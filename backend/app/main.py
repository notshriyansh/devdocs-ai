from fastapi import FastAPI
from app.api.chat import router as chat_router
from app.api.upload import router as upload_router
from fastapi.middleware.cors import CORSMiddleware
from app.db.database import init_db
import os

app = FastAPI(title="DevDocs AI")

origins = [origin.strip() for origin in os.getenv("CORS_ORIGINS", "*").split(",")]
allow_credentials = "*" not in origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

init_db()

app.include_router(chat_router)
app.include_router(upload_router)

@app.get("/")
def root():
    return {"message": "DevDocs AI API running"}

@app.get("/health")
def health():
    return {"status": "ok"}
