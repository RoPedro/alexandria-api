from fastapi import APIRouter, Depends
from db.connection import get_db
from sqlalchemy.orm import Session

from controllers.v1 import ctrlsGenre
from schemas.genre import *


router = APIRouter(prefix="/genres", tags=["genres"])


@router.get("/")
def genres():
    genres = ctrlsGenre.getAll()
    return genres


@router.get("/{genre_id}")
def get(genre_id: int, db: Session = Depends(get_db)):
    genre = ctrlsGenre.get(db, genre_id)
    return genre


@router.post("/add")
def genreAdd(data: GenreCreate, db: Session = Depends(get_db)):
    return ctrlsGenre.add(db, data.name)


@router.put("/update/{genre_id}")
def genreUpdate(data: GenreCreate, genre_id: int, db: Session = Depends(get_db)):
    return ctrlsGenre.patch(db, genre_id, data.name)


@router.delete("/delete/{genre_id}")
def genreDelete(genre_id: int, db: Session = Depends(get_db)):
    return ctrlsGenre.remove(db, genre_id)