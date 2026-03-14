from sqlalchemy import Column
from sqlalchemy import ForeignKey
from sqlalchemy import Table
from models.v1.dec_base import Base

authorBook = Table(
    "authorBooks",
    Base.metadata,
    Column("author_id", ForeignKey("authors.id"), primary_key=True),
    Column("book_id", ForeignKey("books.id"), primary_key=True),
)
