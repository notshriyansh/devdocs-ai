import json
import os
from datetime import datetime

LOG_FILE = "data/chat_logs.json"

def init_history():
    if not os.path.exists("data"):
        os.makedirs("data", exist_ok=True)
    if not os.path.exists(LOG_FILE):
        with open(LOG_FILE, "w", encoding="utf-8") as f:
            json.dump([], f)

def append_history(query: str, response: str, doc_id: str = None):
    init_history()
    entry = {
        "query": query,
        "response": response,
        "doc_id": doc_id,
        "timestamp": datetime.utcnow().isoformat()
    }
    
    try:
        with open(LOG_FILE, "r", encoding="utf-8") as f:
            logs = json.load(f)
    except Exception:
        logs = []
        
    logs.append(entry)
    
    with open(LOG_FILE, "w", encoding="utf-8") as f:
        json.dump(logs, f, indent=2)

def get_history(doc_id: str = None):
    init_history()
    try:
        with open(LOG_FILE, "r", encoding="utf-8") as f:
            logs = json.load(f)
    except Exception:
        logs = []
        
    if doc_id:
        logs = [log for log in logs if log.get("doc_id") == doc_id]
        
    return logs
