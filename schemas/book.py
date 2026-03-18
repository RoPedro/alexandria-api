from pydantic import BaseModel
from datetime import date

from schemas.genre import GenreCreate
from schemas.author import Author


class BookBase(BaseModel):
    id: int
    title: str
    description: str
    isbn: str
    release_date: date
    genre: GenreCreate
    authors: list[Author]
