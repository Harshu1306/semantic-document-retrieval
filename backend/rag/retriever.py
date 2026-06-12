"""
Semantic retriever — fetches the top-k most relevant chunks
from ChromaDB for a given query, with optional document filter.
"""
import logging
from typing import List, Optional

from rag.embeddings import embed_query
from database.chroma_db import get_or_create_collection

logger = logging.getLogger(__name__)


def retrieve_chunks(
    query: str,
    top_k: int = 5,
    document_ids: Optional[List[str]] = None,
    collection_name: str = "multilingual_rag",
) -> List[dict]:
    """
    Retrieve the top-k relevant chunks for a query.

    Args:
        query:        The user's question.
        top_k:        Number of chunks to return.
        document_ids: Optional list of document IDs to restrict the search.
        collection_name: ChromaDB collection.

    Returns:
        List of dicts with keys: text, metadata, distance, score.
    """
    query_vector = embed_query(query)
    collection   = get_or_create_collection(collection_name)

    where_filter = None
    if document_ids:
        if len(document_ids) == 1:
            where_filter = {"document_id": document_ids[0]}
        else:
            where_filter = {"document_id": {"$in": document_ids}}

    kwargs = dict(
        query_embeddings=[query_vector],
        n_results=min(top_k, max(collection.count(), 1)),
        include=["documents", "metadatas", "distances"],
    )
    if where_filter:
        kwargs["where"] = where_filter

    results = collection.query(**kwargs)

    chunks = []
    for doc, meta, dist in zip(
        results["documents"][0],
        results["metadatas"][0],
        results["distances"][0],
    ):
        # Convert cosine distance (0–2) → similarity score (0–1)
        score = round(1 - dist / 2, 4)
        chunks.append({
            "text":     doc,
            "metadata": meta,
            "distance": round(dist, 4),
            "score":    score,
        })

    logger.info("Retrieved %d chunks for query (top_k=%d)", len(chunks), top_k)
    return chunks
