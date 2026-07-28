import logging
import os
from typing import List, Optional

import google.generativeai as genai

logger = logging.getLogger(__name__)

MODEL_NAME = "gemini-2.5-flash"


def _get_model():
    api_key = os.environ.get("GOOGLE_API_KEY")

    if not api_key:
        raise EnvironmentError(
            "GOOGLE_API_KEY environment variable is not set."
        )

    genai.configure(api_key=api_key)
    return genai.GenerativeModel(MODEL_NAME)


def _build_context(chunks: List[dict]) -> str:
    parts = []

    for i, chunk in enumerate(chunks, start=1):
        meta = chunk["metadata"]

        page = meta.get("page", "?")
        filename = meta.get("filename", "document")
        score = chunk.get("score", 0)

        parts.append(
            f"[Source {i} | File: {filename} | Page: {page} | Relevance: {score:.0%}]\n"
            f"{chunk['text']}"
        )

    return "\n\n---\n\n".join(parts)


def _format_history(chat_history: List[dict]) -> str:
    if not chat_history:
        return ""

    lines = []

    for turn in chat_history[-6:]:
        role = "User" if turn["role"] == "user" else "Assistant"
        lines.append(f"{role}: {turn['content']}")

    return "\n".join(lines)


def generate_answer(
    query: str,
    chunks: List[dict],
    chat_history: Optional[List[dict]] = None,
) -> dict:
    """
    Generate answer from retrieved chunks.
    """

    context_text = _build_context(chunks)
    history_text = _format_history(chat_history or [])

    history_section = (
        f"\n\nConversation History:\n{history_text}"
        if history_text
        else ""
    )

    prompt = f"""
You are a helpful document question-answering assistant.

Rules:
1. Answer ONLY using the document context provided.
2. If the answer is not present in the context, say:
   "I couldn't find that information in the uploaded document."
3. Always answer in English.
4. Be concise and accurate.
5. Cite sources when possible using [Source X].
6. Use conversation history for follow-up questions.

{history_section}

=== DOCUMENT CONTEXT ===

{context_text}

=== END DOCUMENT CONTEXT ===

User Question:
{query}

Answer:
"""

    model = _get_model()

    response = model.generate_content(prompt)

    answer = response.text.strip()

    sources = [
        {
            "source_number": i + 1,
            "filename": c["metadata"].get("filename", "unknown"),
            "page": c["metadata"].get("page", "?"),
            "score": c["score"],
            "excerpt": (
                c["text"][:300] + "..."
                if len(c["text"]) > 300
                else c["text"]
            ),
        }
        for i, c in enumerate(chunks)
    ]

    return {
        "answer": answer,
        "sources": sources,
        "model": MODEL_NAME,
    }


def generate_summary(
    chunks: List[dict],
    summary_type: str = "short",
) -> str:
    """
    Generate document summary.
    """

    context = _build_context(chunks[:20])

    if summary_type == "short":
        instruction = "Write a concise summary in 3-5 sentences."

    elif summary_type == "detailed":
        instruction = (
            "Write a detailed structured summary covering all major topics."
        )

    else:
        instruction = "List the key points as bullet points."

    prompt = f"""
You are a document summarization assistant.

{instruction}

=== DOCUMENT CONTENT ===

{context}

=== END DOCUMENT CONTENT ===

Summary:
"""

    model = _get_model()

    response = model.generate_content(prompt)

    return response.text.strip()
