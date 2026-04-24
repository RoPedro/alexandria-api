from pydantic import BaseModel
from datetime import date

from schemas.author import Author


class BookPartial(BaseModel):
    id: int
    isbn: str
    title: str


class BookAdd(BaseModel):
    isbn: str
    title: str
    description: str
    release_date: date
    genre_id: int
    authors: list[int] = []


from schemas.genre import GenreCreate  # Avoids circular imports


class BookBase(BaseModel):
    id: int
    title: str
    description: str
    isbn: str
    release_date: date
    genre: GenreCreate
    authors: list[Author]
