import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.rag.vector_store import VectorStore
from app.services.chat_service import ChatService


TEST_QUERIES = [
    {
        "query": "How do I install the library?",
        "expected_keywords": ["install", "pip", "setup", "download"]
    },
    {
        "query": "What is the main function for starting the server?",
        "expected_keywords": ["fastapi", "run", "start", "uvicorn", "server"]
    }
]

def evaluate():
    print("Loading AI System for Evaluation...\n")
    try:
        vector_store = VectorStore.load("data/index")
        chat_service = ChatService(vector_store)
    except Exception as e:
        print(f"Error loading system (did you build the index?): {e}")
        return

    total_relevance = 0

    for i, test in enumerate(TEST_QUERIES):
        query = test["query"]
        expected = test["expected_keywords"]
        
        print(f"--- Test {i+1} ---")
        print(f"Query: {query}")
        print("Generating answer...")
        
        generator, docs = chat_service.stream_chat(query)
        
        full_response = ""
        for chunk in generator:
            if chunk == "\n\n___SOURCES___\n\n":
                break
            full_response += chunk
            
        full_response_lower = full_response.lower()
        
        matches = sum(1 for kw in expected if kw in full_response_lower)
        relevance_score = (matches / len(expected)) * 100
        total_relevance += relevance_score
        
        response_length = len(full_response.split())
        
        print(f"Answer snippet: {full_response.strip()[:100]}...")
        print(f"Metrics:")
        print(f"  - Relevance Score: {relevance_score:.1f}% ({matches}/{len(expected)} keywords found)")
        print(f"  - Length: {response_length} words")
        print()
        
    avg_relevance = total_relevance / len(TEST_QUERIES)
    print("=========================")
    print(f"FINAL AVERAGE RELEVANCE: {avg_relevance:.1f}%")
    print("=========================")

if __name__ == "__main__":
    evaluate()
