def build_prompt(query, docs):

    context = "\n\n".join([doc["text"] for doc in docs])

    prompt = f"""
You are DevDocs AI, a helpful assistant for programming documentation.

Use the following documentation to answer the user's question.

Documentation:
{context}

Question:
{query}

Answer clearly and concisely.
"""

    return prompt