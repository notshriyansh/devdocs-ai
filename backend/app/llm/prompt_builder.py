def build_prompt(query: str, docs: list):
    context = "\n\n".join([doc["text"] for doc in docs])

    return f"""
You are an expert AI assistant helping developers understand documentation and code.

Use the provided context FIRST to answer the question. If the answer is not in the context, you may use your general knowledge, but clearly state that you are doing so.

FORMATTING REQUIREMENTS:
- Structure your answer cleanly.
- Use bullet points for steps or lists.
- Provide a short explanation and include a simple, illustrative code or text example where applicable.
- Always be clear and concise.

---------------------
Context:
{context}
---------------------

Question:
{query}

Structured Answer:
"""