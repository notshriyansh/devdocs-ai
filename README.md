# DevDocs AI

DevDocs AI is a full-stack AI app that lets you upload documentation (web pages, PDFs, text, or YouTube videos) and chat with it.

Instead of manually searching through docs, you can just ask questions and get answers with relevant context and sources.

---

## What it does

- Upload content from:
  - URLs (docs, blogs, etc.)
  - PDFs or text files
  - YouTube videos (via transcripts)
  - Raw text

- Ask questions about your data

- Get answers generated using the uploaded content

- See sources used for each response

- Chat in real time with streaming responses

- Each user has their own documents and chat history

---

## Tech stack

**Frontend**

- React + TypeScript
- Tailwind CSS

**Backend**

- FastAPI
- SQLAlchemy + SQLite/Postgres

**AI / RAG**

- Embeddings + vector search (FAISS)
- Groq (LLM)

**Auth**

- Clerk

---

## Why this project

Most AI demos are static or fake.
This is a real working RAG system where:

- data is actually stored
- retrieval is actually happening
- responses are grounded in your content
- users are isolated

---

## Status

Working end-to-end locally.
Deploying to production next.
