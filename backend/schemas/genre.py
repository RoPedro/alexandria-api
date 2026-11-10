from pydantic import BaseModel


class GenreID(BaseModel):  # Used for DELETE ops
    genre_id: int


class GenreCreate(BaseModel):
    name: str


class GenrePatchForm(BaseModel):
    genre_id: int
    name: str


from schemas.book import BookPartial  # Avoids circular imports


class GenreWithBooks(BaseModel):
    id: int
    name: str
    books: list[BookPartial]
