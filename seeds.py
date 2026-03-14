from sqlalchemy.orm import Session

from db.connection import engine
import models.v1 as v1

with Session(bind=engine) as session:
    genresList = [
        v1.Genre(name="fiction"),
        v1.Genre(name="fantasy"),
        v1.Genre(name="sci-fi"),
        v1.Genre(name="non-fiction"),
        v1.Genre(name="romance"),
    ]

    for genre in genresList:
        session.add(genre)
        session.commit()
        session.refresh(genre)