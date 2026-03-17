from pydantic import BaseModel

class Author(BaseModel):
    id: int
    firstname: str
    lastname: str