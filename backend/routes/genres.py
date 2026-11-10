from typing import Annotated

from fastapi import APIRouter, Form, HTTPException
from sqlalchemy.orm import Session

from schemas.genre import *
from src.controllers.v1 import ctrls_genre

from .utils import session_object, validate_request_details

router = APIRouter(prefix="/genres", tags=["genres"])


@router.get("/")
def genres():
    genres = ctrls_genre.getAll()
    return genres


@router.get("/{genre_id}", response_model=GenreWithBooks)
def get(genre_id: int, db: Session = session_object):
    genre = ctrls_genre.get(db, genre_id)
    validate_request_details(genre_id, genre)
    return genre


@router.post("/add")
def genreAdd(data: Annotated[GenreCreate, Form()], db: Session = session_object):
    genre = ctrls_genre.add(db, data.name)
    if genre is None:
        raise HTTPException(status_code=409, detail="Genre already exists")
    return genre


@router.put("/update")
def genreUpdate(data: Annotated[GenrePatchForm, Form()], db: Session = session_object):
    genre_id = data.genre_id
    genre = ctrls_genre.get(db, genre_id)

    validate_request_details(genre_id, genre)
    return ctrls_genre.patch(db, genre_id, data.name)


@router.delete("/delete/{genre_id}", response_model=GenreID)
def genreDelete(genre_id: int, db: Session = session_object):
    genre = ctrls_genre.get(db, genre_id)
    validate_request_details(genre_id, genre)
    return ctrls_genre.remove(db, genre_id)
