import logging
from sqlalchemy.orm import Session
from models.v1.book import Book

logger = logging.getLogger(__name__)


def getAll(db: Session):
    books = db.query(Book).all()
    return books


def get(book_id: int, db: Session):
    book = db.get(Book, book_id)
    print(book)
    return book
