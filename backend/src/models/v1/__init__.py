"""Model registry.

Importing every model here guarantees `Base.metadata` knows about every table,
which is what `alembic/env.py` (autogenerate) and the test suite
(`Base.metadata.create_all`) rely on.
"""

from src.models.v1.author import Author
from src.models.v1.author_book import authorBook
from src.models.v1.book import Book
from src.models.v1.dec_base import Base
from src.models.v1.genre import Genre
from src.models.v1.user import Role, User

__all__ = [
    "Author",
    "Base",
    "Book",
    "Genre",
    "Role",
    "User",
    "authorBook",
]
