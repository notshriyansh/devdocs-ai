from fastapi import FastAPI
from app.api.chat import router as chat_router
from app.api.upload import router as upload_router
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI(title="DevDocs AI")

origins = os.getenv("CORS_ORIGINS", "*").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat_router)
app.include_router(upload_router)

@app.get("/")
def root():
    return {"message": "DevDocs AI API running"}