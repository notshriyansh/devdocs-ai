import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama3-8b-8192")

client = Groq(api_key=GROQ_API_KEY)


def generate(prompt: str) -> str:
    """
    Non-streaming response (for /chat endpoint)
    """
    response = client.chat.completions.create(
        model=GROQ_MODEL,
        messages=[
            {"role": "user", "content": prompt}
        ],
        temperature=0.7,
    )

    return response.choices[0].message.content


def generate_stream(prompt: str):
    try:
        stream = client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            stream=True
        )

        for chunk in stream:
            try:
                content = chunk.choices[0].delta.content
                if content:
                    yield content
            except Exception:
                continue 

    except Exception as e:
        yield f"[ERROR]: {str(e)}"