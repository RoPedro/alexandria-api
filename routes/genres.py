from fastapi import APIRouter, Depends, HTTPException
from db.connection import get_db
from sqlalchemy.orm import Session

from controllers.v1 import ctrlsGenre
from schemas.genre import *
from .utils import validate_request_details

router = APIRouter(prefix="/genres", tags=["genres"])


@router.get("/")
def genres():
    genres = ctrlsGenre.getAll()
    return genres


@router.get("/{genre_id}", response_model=GenreWithBooks)
def get(genre_id: int, db: Session = Depends(get_db)):
    genre = ctrlsGenre.get(db, genre_id)
    validate_request_details(genre_id, genre)
    return genre


@router.post("/add")
def genreAdd(data: GenreCreate, db: Session = Depends(get_db)):
    genre = ctrlsGenre.add(db, data.name)
    if genre is None:
        raise HTTPException(status_code=409, detail="Genre already exists")
    return genre


@router.put("/update/{genre_id}")
def genreUpdate(data: GenreCreate, genre_id: int, db: Session = Depends(get_db)):
    genre = ctrlsGenre.get(db, genre_id)
    validate_request_details(genre_id, genre)
    return ctrlsGenre.patch(db, genre_id, data.name)


@router.delete("/delete/{genre_id}")
def genreDelete(genre_id: int, db: Session = Depends(get_db)):
    genre = ctrlsGenre.get(db, genre_id)
    validate_request_details(genre_id, genre)
    return ctrlsGenre.remove(db, genre_id)
