import hashlib
import logging
import os
from typing import List

from langchain_core.documents import Document
from langchain_google_genai import GoogleGenerativeAIEmbeddings

from database.chroma_db import get_or_create_collection

logger = logging.getLogger(__name__)

# Supported by your API key
EMBEDDING_MODEL = "models/gemini-embedding-2"


def get_embeddings_model() -> GoogleGenerativeAIEmbeddings:
    """
    Initialize Gemini embeddings model.
    """
    api_key = os.getenv("GOOGLE_API_KEY")

    if not api_key:
        raise EnvironmentError(
            "GOOGLE_API_KEY environment variable is not set."
        )

    logger.info("Using embedding model: %s", EMBEDDING_MODEL)

    return GoogleGenerativeAIEmbeddings(
        model=EMBEDDING_MODEL,
        google_api_key=api_key,
    )


def embed_and_store(
    chunks: List[Document],
    document_id: str,
    filename: str,
    language: str,
    collection_name: str = "rag",
) -> int:
    if not chunks:
        logger.warning("No chunks found for document %s", document_id)
        return 0

    embedder = get_embeddings_model()

    texts = [chunk.page_content for chunk in chunks]

    metadatas = []
    ids = []

    for idx, chunk in enumerate(chunks):
        metadata = dict(chunk.metadata)

        metadata.update(
            {
                "document_id": document_id,
                "filename": filename,
                "language": language,
                "chunk_index": idx,
                "page": int(metadata.get("page", 1)),
            }
        )

        metadatas.append(metadata)

        # Deterministic ID for re-upload safety
        chunk_id = hashlib.md5(
            f"{document_id}_{idx}".encode()
        ).hexdigest()

        ids.append(chunk_id)

    try:
        logger.info(
            "Generating embeddings for %d chunks...",
            len(texts)
        )

        vectors = embedder.embed_documents(texts)

        collection = get_or_create_collection(collection_name)

        collection.upsert(
            ids=ids,
            embeddings=vectors,
            documents=texts,
            metadatas=metadatas,
        )

        logger.info(
            "Successfully stored %d embeddings for '%s'",
            len(ids),
            filename,
        )

        return len(ids)

    except Exception as e:
        logger.exception("Embedding generation failed")
        raise RuntimeError(
            f"Error embedding content: {str(e)}"
        ) from e


def embed_query(query: str) -> List[float]:
    """
    Generate embedding for a user query.
    """

    embedder = get_embeddings_model()

    try:
        return embedder.embed_query(query)

    except Exception as e:
        logger.exception("Query embedding failed")
        raise RuntimeError(
            f"Error embedding query: {str(e)}"
        ) from e
