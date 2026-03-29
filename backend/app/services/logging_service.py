import json
import os
from datetime import datetime

LOG_FILE = "data/chat_logs.json"

def log_interaction(query: str, response: str, response_time_ms: int):
    """
    Appends a single chat interaction to a JSON file.
    We read the existing logs, append the new one, and write it back.
    (This is simple and beginner-friendly, though for huge scale,
    a database or line-delimited JSON like JSONL is better).
    """
    os.makedirs(os.path.dirname(LOG_FILE), exist_ok=True)
    
    if os.path.exists(LOG_FILE):
        try:
            with open(LOG_FILE, "r", encoding="utf-8") as f:
                logs = json.load(f)
        except json.JSONDecodeError:
            logs = [] 
    else:
        logs = []
        
    entry = {
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "query": query,
        "response": response,
        "response_time_ms": int(response_time_ms)
    }
    
    logs.append(entry)
    
    with open(LOG_FILE, "w", encoding="utf-8") as f:
        json.dump(logs, f, indent=4)
