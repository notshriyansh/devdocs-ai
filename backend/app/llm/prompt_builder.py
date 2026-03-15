def build_prompt(query, context_docs):

    context = "\n\n".join(context_docs)

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