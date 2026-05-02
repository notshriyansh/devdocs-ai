from sqlalchemy.orm import Session
from app.db.schema import User, Chat, Document
from datetime import datetime
import uuid
import json


class UserService:
    @staticmethod
    def get_or_create_user(db: Session, user_id: str, email: str) -> User:
        """Get existing user or create new one"""
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            user = User(id=user_id, email=email)
            db.add(user)
            db.commit()
            db.refresh(user)
        return user


class DocumentService:
    @staticmethod
    def create_document(
        db: Session,
        user_id: str,
        title: str,
        source_url: str = None,
        doc_id: str = None
    ) -> Document:
        """Create a new document for user"""
        doc_id = doc_id or str(uuid.uuid4())
        doc = Document(id=doc_id, user_id=user_id, title=title, source_url=source_url)
        db.add(doc)
        db.commit()
        db.refresh(doc)
        return doc

    @staticmethod
    def get_user_documents(db: Session, user_id: str) -> list[Document]:
        """Get all documents for a user"""
        return db.query(Document).filter(Document.user_id == user_id).all()

    @staticmethod
    def get_document(db: Session, doc_id: str, user_id: str) -> Document:
        """Get a specific document (check user ownership)"""
        return db.query(Document).filter(
            Document.id == doc_id,
            Document.user_id == user_id
        ).first()


class ChatService:
    @staticmethod
    def create_chat(
        db: Session,
        user_id: str,
        query: str,
        response: str,
        doc_id: str = None,
        sources: list = None
    ) -> Chat:
        """Create a new chat record"""
        chat_id = str(uuid.uuid4())
        sources_json = json.dumps(sources) if sources else None
        
        chat = Chat(
            id=chat_id,
            user_id=user_id,
            doc_id=doc_id,
            query=query,
            response=response,
            sources=sources_json
        )
        db.add(chat)
        db.commit()
        db.refresh(chat)
        return chat

    @staticmethod
    def get_user_history(db: Session, user_id: str, doc_id: str = None) -> list[Chat]:
        """Get chat history for user (optionally filtered by doc)"""
        query = db.query(Chat).filter(Chat.user_id == user_id)
        
        if doc_id:
            query = query.filter(Chat.doc_id == doc_id)
        
        return query.order_by(Chat.created_at.desc()).all()

    @staticmethod
    def get_recent_history(db: Session, user_id: str, limit: int = 50) -> list[Chat]:
        """Get recent chats for user"""
        return db.query(Chat).filter(Chat.user_id == user_id).order_by(Chat.created_at.desc()).limit(limit).all()
