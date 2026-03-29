def build_prompt(query: str, docs: list):
    context = "\n\n".join([doc["text"] for doc in docs])

    return f"""
You are an AI assistant helping with developer documentation.

Use ONLY the provided context to answer the question.

If the answer is not in the context, say:
"I couldn't find that information in the provided documentation."

Always be clear and concise.

---------------------
Context:
{context}
---------------------

Question:
{query}

Answer:
"""