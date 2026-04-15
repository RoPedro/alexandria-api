from pydantic import BaseModel
from datetime import date

from schemas.author import Author


class BookPartial(BaseModel):
    id: int
    title: str
    isbn: str


from schemas.genre import GenreCreate # Avoids circular imports


class BookBase(BaseModel):
    id: int
    title: str
    description: str
    isbn: str
    release_date: date
    genre: GenreCreate
    authors: list[Author]
