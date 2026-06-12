"""
POST /api/upload — accepts document files, indexes them in ChromaDB.
"""
import logging
import os
import uuid
from pathlib import Path

from fastapi import APIRouter, File, HTTPException, UploadFile
from pydantic import BaseModel

from rag.loader import load_document, LOADER_MAP
from rag.chunker import chunk_documents
from rag.embeddings import embed_and_store

logger = logging.getLogger(__name__)

router = APIRouter()

UPLOAD_DIR = Path(os.environ.get("UPLOAD_DIR", "./uploads"))
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_EXTENSIONS = set(LOADER_MAP.keys())
MAX_FILE_SIZE_MB = int(os.environ.get("MAX_FILE_SIZE_MB", "50"))


class UploadResponse(BaseModel):
    document_id: str
    filename: str
    chunks_stored: int
    language: dict
    file_size_kb: float
    message: str


@router.post("/upload", response_model=UploadResponse)
async def upload_document(file: UploadFile = File(...)):
    """
    Upload a document (PDF / DOCX / TXT / PPTX).
    Extract text, chunk it, generate embeddings, and store in ChromaDB.
    """

    ext = Path(file.filename).suffix.lower()

    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported file type '{ext}'. Allowed: {sorted(ALLOWED_EXTENSIONS)}",
        )

    document_id = str(uuid.uuid4())
    save_path = UPLOAD_DIR / f"{document_id}{ext}"

    try:
        # Save uploaded file
        with open(save_path, "wb") as f:
            content = await file.read()

            if len(content) > MAX_FILE_SIZE_MB * 1024 * 1024:
                raise HTTPException(
                    status_code=413,
                    detail=f"File too large. Maximum size is {MAX_FILE_SIZE_MB} MB.",
                )

            f.write(content)

        file_size_kb = round(len(content) / 1024, 2)

        logger.info(
            "Saved '%s' → %s (%.1f KB)",
            file.filename,
            save_path,
            file_size_kb,
        )

        # Load document
        docs = load_document(str(save_path))

        print("NUMBER OF DOCS:", len(docs))
        print("DOC LENGTH:", len(docs[0].page_content))
        print("\nFIRST 1000 CHARS:\n")
        print(docs[0].page_content[:1000])

        chunks = chunk_documents(docs)

        print("\nCHUNKS CREATED:", len(chunks))
        if not chunks:
            raise HTTPException(
                status_code=422,
                detail="No text could be extracted from the file."
            )

        # English-only project
        language_info = {
            "code": "en",
            "name": "English",
            "is_supported": True,
        }

        # Generate embeddings and store
        n_stored = embed_and_store(
            chunks=chunks,
            document_id=document_id,
            filename=file.filename,
            language="en",
        )

        return UploadResponse(
            document_id=document_id,
            filename=file.filename,
            chunks_stored=n_stored,
            language=language_info,
            file_size_kb=file_size_kb,
            message=f"Successfully indexed {n_stored} chunks from '{file.filename}'.",
        )

    except HTTPException:
        raise

    except Exception as exc:
        logger.exception(
            "Upload failed for '%s': %s",
            file.filename,
            exc,
        )

        if save_path.exists():
            save_path.unlink()

        raise HTTPException(
            status_code=500,
            detail=f"Processing failed: {str(exc)}",
        )
