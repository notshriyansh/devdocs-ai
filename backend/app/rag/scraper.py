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

        main_content = soup.find("main") or soup.find("article") or soup.find("body") or soup

        for tag in main_content(["script", "style", "nav", "footer", "header", "aside"]):
            tag.decompose()

        text = main_content.get_text(separator="\n")

        lines = [line.strip() for line in text.splitlines()]
        clean_text = "\n".join(line for line in lines if line)

        if len(clean_text) < 300:
            raise ValueError(f"Extracted content is too short ({len(clean_text)} chars). Likely noise or protected page.")

        return clean_text

    except Exception as e:
        raise Exception(f"Failed to scrape URL: {str(e)}")