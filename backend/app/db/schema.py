from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Integer
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True) 
    email = Column(String, unique=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class Document(Base):
    __tablename__ = "documents"

    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    source_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Chat(Base):
    __tablename__ = "chats"

    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    doc_id = Column(String, ForeignKey("documents.id"), nullable=True)
    query = Column(Text, nullable=False)
    response = Column(Text, nullable=False)
    sources = Column(Text, nullable=True) 
    created_at = Column(DateTime, default=datetime.utcnow)
