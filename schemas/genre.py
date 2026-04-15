from pydantic import BaseModel


class GenreCreate(BaseModel):
    name: str


from schemas.book import BookPartial # Avoids circular imports


class GenreWithBooks(BaseModel):
    id: int
    name: str
    books: list[BookPartial]