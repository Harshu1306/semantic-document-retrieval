"""
POST /api/ask       — answer a question against uploaded documents
POST /api/summarize — generate document summary
"""

import logging
from typing import List, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from rag.retriever import retrieve_chunks
from rag.chain import generate_answer, generate_summary

logger = logging.getLogger(__name__)
router = APIRouter()


# ──────────────────────────────────────────────────────────────
# Request / Response Models
# ──────────────────────────────────────────────────────────────

class ChatMessage(BaseModel):
    role: str  # "user" | "assistant"
    content: str


class AskRequest(BaseModel):
    question: str = Field(..., min_length=1)
    document_ids: Optional[List[str]] = None
    chat_history: Optional[List[ChatMessage]] = None
    top_k: int = Field(5, ge=1, le=20)


class SourceItem(BaseModel):
    source_number: int
    filename: str
    page: int | str
    score: float
    excerpt: str


class AskResponse(BaseModel):
    answer: str
    sources: List[SourceItem]
    model: str
    chunks_found: int


class SummarizeRequest(BaseModel):
    document_id: str
    summary_type: str = "short"  # short | detailed | keypoints


class SummarizeResponse(BaseModel):
    summary: str
    summary_type: str
    document_id: str


# ──────────────────────────────────────────────────────────────
# Ask Question
# ──────────────────────────────────────────────────────────────

@router.post("/ask", response_model=AskResponse)
async def ask_question(body: AskRequest):
    """
    Answer a question using retrieved document chunks.
    """

    if not body.question.strip():
        raise HTTPException(
            status_code=400,
            detail="Question cannot be empty."
        )

    try:
        chunks = retrieve_chunks(
            query=body.question,
            top_k=body.top_k,
            document_ids=body.document_ids,
        )

    except Exception as exc:
        logger.exception("Retrieval error: %s", exc)

        raise HTTPException(
            status_code=500,
            detail=f"Retrieval failed: {str(exc)}"
        )

    if not chunks:
        raise HTTPException(
            status_code=404,
            detail="No relevant content found. Please upload documents first.",
        )

    history = [
        m.model_dump()
        for m in (body.chat_history or [])
    ]

    try:
        result = generate_answer(
            query=body.question,
            chunks=chunks,
            chat_history=history,
        )

    except Exception as exc:
        logger.exception("Generation error: %s", exc)

        raise HTTPException(
            status_code=500,
            detail=f"Answer generation failed: {str(exc)}"
        )

    return AskResponse(
        answer=result["answer"],
        sources=[SourceItem(**s) for s in result["sources"]],
        model=result["model"],
        chunks_found=len(chunks),
    )


# ──────────────────────────────────────────────────────────────
# Summarize Document
# ──────────────────────────────────────────────────────────────

@router.post("/summarize", response_model=SummarizeResponse)
async def summarize_document(body: SummarizeRequest):

    if body.summary_type not in (
        "short",
        "detailed",
        "keypoints",
    ):
        raise HTTPException(
            status_code=400,
            detail="summary_type must be 'short', 'detailed', or 'keypoints'.",
        )

    try:
        chunks = retrieve_chunks(
            query="Summarize this document",
            top_k=20,
            document_ids=[body.document_id],
        )

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=str(exc),
        )

    if not chunks:
        raise HTTPException(
            status_code=404,
            detail="Document not found or has no content.",
        )

    try:
        summary = generate_summary(
            chunks=chunks,
            summary_type=body.summary_type,
        )

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=str(exc),
        )

    return SummarizeResponse(
        summary=summary,
        summary_type=body.summary_type,
        document_id=body.document_id,
    )
