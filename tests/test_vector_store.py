from unittest.mock import ANY, Mock

import pytest

from s3.models import ContentChunk
from s3.vector_store import VectorStore


def _store_with_chunks(count: int) -> VectorStore:
    store = VectorStore()
    store.chunks = [
        ContentChunk(
            id=f"chunk-{index}",
            source_path="source.txt",
            text=f"text {index}",
            tags={},
        )
        for index in range(count)
    ]
    store.embedder.transform = Mock(return_value=object())
    store.nn.kneighbors = Mock(return_value=([[0.25]], [[0]]))
    return store


def test_search_limits_neighbors_to_available_chunks() -> None:
    store = _store_with_chunks(1)

    results = store.search("query", top_k=5)

    assert results == [store.chunks[0]]
    store.nn.kneighbors.assert_called_once_with(ANY, n_neighbors=1)


def test_search_returns_empty_list_for_empty_store() -> None:
    store = _store_with_chunks(0)
    store.embedder.transform = Mock()

    assert store.search("query") == []
    store.embedder.transform.assert_not_called()


def test_search_rejects_non_positive_top_k() -> None:
    store = _store_with_chunks(1)

    with pytest.raises(ValueError, match="top_k must be a positive integer"):
        store.search("query", top_k=0)
