"""
GET    /api/documents        — list all indexed documents
DELETE /api/documents/{id}   — remove a document and its vectors
"""
import logging
import os
from typing import List
from pathlib import Path

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from database.chroma_db import list_documents, delete_document_chunks

logger = logging.getLogger(__name__)
router = APIRouter()

UPLOAD_DIR = Path(os.environ.get("UPLOAD_DIR", "./uploads"))


class DocumentInfo(BaseModel):
    document_id:  str
    filename:     str
    language:     str
    total_chunks: int


class DeleteResponse(BaseModel):
    document_id: str
    message:     str


@router.get("/documents", response_model=List[DocumentInfo])
async def get_documents():
    """Return metadata for all indexed documents."""
    try:
        docs = list_documents()
        return [DocumentInfo(**d) for d in docs]
    except Exception as exc:
        logger.exception("Failed to list documents: %s", exc)
        raise HTTPException(status_code=500, detail=str(exc))


@router.delete("/documents/{document_id}", response_model=DeleteResponse)
async def delete_document(document_id: str):
    """Delete a document's vectors from ChromaDB and its uploaded file."""
    try:
        delete_document_chunks(document_id)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to delete vectors: {exc}")

    # Remove the uploaded file (any extension)
    for f in UPLOAD_DIR.glob(f"{document_id}.*"):
        try:
            f.unlink()
        except OSError:
            pass

    return DeleteResponse(
        document_id=document_id,
        message=f"Document {document_id} deleted successfully.",
    )
