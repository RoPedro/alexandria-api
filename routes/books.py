from fastapi import APIRouter, HTTPException
from sqlalchemy.orm import Session

from src.controllers.v1 import ctrls_book
from schemas.book import BookAdd, BookBase

from .utils import session_object, validate_request_details

router = APIRouter(prefix="/books", tags=["books"])


@router.get("/", response_model=list[BookBase])
def getAll(db: Session = session_object):
    books = ctrls_book.getAll(db)
    return books


@router.get("/{book_id}", response_model=BookBase)
def getBook(book_id: int, db: Session = session_object):
    book = ctrls_book.get(book_id, db)
    validate_request_details(book_id, book)
    return book


@router.post("/add")
def addBook(data: BookAdd, db: Session = session_object):
    book = ctrls_book.add(
        db,
        data.isbn,
        data.title,
        data.description,
        data.release_date,
        data.genre_id,
        data.authors,
    )
    if book is None:
        raise HTTPException(status_code=409, detail="Book already exists")
    return book
