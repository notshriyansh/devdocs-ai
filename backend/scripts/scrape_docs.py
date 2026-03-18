import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.ingestion.pipeline import ingest_urls


if __name__ == "__main__":

    urls = [
        "https://fastapi.tiangolo.com/",
        "https://fastapi.tiangolo.com/tutorial/",
    ]

    ingest_urls(urls)