from fastapi import APIRouter, Depends
from db.connection import get_db
from sqlalchemy.orm import Session

from controllers.v1 import ctrlsBook
from schemas.book import BookBase

router = APIRouter(prefix="/books", tags=["books"])


@router.get("/", response_model=list[BookBase])
def getAll(db: Session = Depends(get_db)):
    books = ctrlsBook.getAll(db)
    return books


@router.get("/{book_id}", response_model=BookBase)
def getBook(book_id: int, db: Session = Depends(get_db)):
    book = ctrlsBook.get(book_id, db)
    return book
