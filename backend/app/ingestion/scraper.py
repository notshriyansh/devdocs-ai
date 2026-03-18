import requests
from bs4 import BeautifulSoup


def scrape_page(url: str):

    response = requests.get(url)
    soup = BeautifulSoup(response.text, "html.parser")

    for tag in soup(["script", "style", "nav", "footer", "header"]):
        tag.decompose()

    main = soup.find("main")

    if main:
        text = main.get_text(separator="\n")
    else:
        text = soup.get_text(separator="\n")

    return text