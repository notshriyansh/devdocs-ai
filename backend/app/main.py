from fastapi import FastAPI
from app.api.chat import router as chat_router

app = FastAPI(title="DevDocs AI")

app.include_router(chat_router)


@app.get("/")
def root():

    return {"message": "DevDocs AI API running"}