from fastapi import APIRouter, Depends
from db.connection import get_db
from sqlalchemy.orm import Session

from controllers.v1 import ctrlsAuthor
from schemas.author import Author as AuthorSchema

router = APIRouter(prefix="/authors", tags=["authors"])

@router.get(
    "/"
)
def getAll(
    db: Session = Depends(get_db)
):
    authors = ctrlsAuthor.getAll(db)   
    return authors
    
@router.get(
    "/{author_id}"
)
def getAuthor(
    author_id: int, db: Session = Depends(get_db)
):
    author = ctrlsAuthor.get(db, author_id)
    return author

@router.post(
    "/add"
)
def authorAdd(
    data: AuthorSchema, db: Session = Depends(get_db)
):
    return ctrlsAuthor.add(db, data.firstname, data.lastname)

@router.put(
    "/update/{author_id}"
)
def authorUpdate(
    data: AuthorSchema, author_id: int, db: Session = Depends(get_db)
):
    return ctrlsAuthor.patch(db, author_id, data.firstname, data.lastname)

@router.delete(
    "/delete/{author_id}"
)
def authorDelete(
    author_id: int, db: Session = Depends(get_db)
):
    return ctrlsAuthor.remove(db, author_id)