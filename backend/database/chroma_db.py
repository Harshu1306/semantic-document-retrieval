"""
ChromaDB — persistent vector store helper.
"""
import os
import logging
from typing import Optional
import chromadb
from chromadb.config import Settings

logger = logging.getLogger(__name__)

CHROMA_PATH = os.environ.get("CHROMA_PATH", "./chroma_store")
COLLECTION_NAME = "multilingual_rag"

_client: Optional[chromadb.PersistentClient] = None


def initialize_chroma() -> chromadb.PersistentClient:
    global _client
    if _client is None:
        _client = chromadb.PersistentClient(
            path=CHROMA_PATH,
            settings=Settings(anonymized_telemetry=False),
        )
        logger.info("ChromaDB initialised at %s", CHROMA_PATH)
    return _client


def get_client() -> chromadb.PersistentClient:
    if _client is None:
        return initialize_chroma()
    return _client


def get_or_create_collection(collection_name: str = COLLECTION_NAME):
    client = get_client()
    return client.get_or_create_collection(
        name=collection_name,
        metadata={"hnsw:space": "cosine"},
    )


def delete_document_chunks(document_id: str, collection_name: str = COLLECTION_NAME):
    """Remove all chunks belonging to a given document_id."""
    collection = get_or_create_collection(collection_name)
    results = collection.get(where={"document_id": document_id})
    if results["ids"]:
        collection.delete(ids=results["ids"])
        logger.info("Deleted %d chunks for document %s", len(results["ids"]), document_id)


def list_documents(collection_name: str = COLLECTION_NAME) -> list[dict]:
    """Return unique documents stored in the collection."""
    collection = get_or_create_collection(collection_name)
    results = collection.get(include=["metadatas"])
    seen: dict[str, dict] = {}
    for meta in results.get("metadatas", []):
        doc_id = meta.get("document_id")
        if doc_id and doc_id not in seen:
            seen[doc_id] = {
                "document_id": doc_id,
                "filename": meta.get("filename", "unknown"),
                "language": meta.get("language", "unknown"),
                "total_chunks": 0,
            }
        if doc_id:
            seen[doc_id]["total_chunks"] += 1
    return list(seen.values())
