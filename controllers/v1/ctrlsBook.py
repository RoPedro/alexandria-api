import logging
from datetime import date
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from models.v1.book import Book
from models.v1.authorBook import authorBook

logger = logging.getLogger(__name__)


def getAll(db: Session):
    books = db.query(Book).all()
    return books


def get(book_id: int, db: Session):
    book = db.get(Book, book_id)
    print(book)
    return book


def add(
    db: Session,
    isbn: str,
    title: str,
    description: str,
    release_date: date,
    genre_id: int,
    authors: list[int] = [],
):
    book = Book(
        isbn=isbn,
        title=title,
        description=description,
        release_date=release_date,
        genre_id=genre_id,
    )
    db.add(book)
    try:
        db.commit()
        db.refresh(book)
        for author_id in authors: # db.execute accpets insert, add_all does not.
            db.execute(authorBook.insert().values(author_id=author_id, book_id=book.id))
        db.commit()
    except IntegrityError:
        return None
    return book


def delete(db: Session, book_id: int):
    book = db.get(Book, book_id)
    if book is None:
        return None

    db.delete(book)
    db.commit()
    return book
