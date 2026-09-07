from fastapi import APIRouter, HTTPException
from sqlalchemy.orm import Session

import schemas.author as AuthorSchema
from src.controllers.v1 import ctrls_author

from .utils import session_object, validate_request_details

router = APIRouter(prefix="/authors", tags=["authors"])


@router.get("/")
def getAll(db: Session = session_object):
    authors = ctrls_author.getAll(db)
    return authors


@router.get("/{author_id}")
def getAuthor(author_id: int, db: Session = session_object):
    author = ctrls_author.get(db, author_id)
    validate_request_details(author_id, author)
    return author


@router.post("/add")
def authorAdd(data: AuthorSchema.AuthorPost, db: Session = session_object):
    author = ctrls_author.add(db, data.firstname, data.lastname)
    if author is None:
        raise HTTPException(status_code=409, detail="Author already exists")
    return author


@router.put("/update/{author_id}")
def authorUpdate(
    data: AuthorSchema.Author, author_id: int, db: Session = session_object
):
    author = ctrls_author.get(db, author_id)
    validate_request_details(author_id, author)
    return ctrls_author.patch(db, author_id, data.firstname, data.lastname)


@router.delete("/delete/{author_id}")
def authorDelete(author_id: int, db: Session = session_object):
    author = ctrls_author.get(db, author_id)
    validate_request_details(author_id, author)
    return ctrls_author.remove(db, author_id)
