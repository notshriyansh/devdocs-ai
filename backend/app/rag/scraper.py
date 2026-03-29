import requests
from bs4 import BeautifulSoup


def scrape_docs(url: str) -> str:
    """
    Fetches webpage content and extracts readable text.
    """

    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()

        soup = BeautifulSoup(response.text, "html.parser")

        for tag in soup(["script", "style"]):
            tag.decompose()

        text = soup.get_text(separator="\n")

        lines = [line.strip() for line in text.splitlines()]
        clean_text = "\n".join(line for line in lines if line)

        return clean_text

    except Exception as e:
        raise Exception(f"Failed to scrape URL: {str(e)}")