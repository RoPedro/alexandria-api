from sqlalchemy import select, update
from sqlalchemy.orm import Session
from db.connection import engine
from models.v1.genre import Genre
import logging

logger = logging.getLogger(__name__)

def getAll():
    session = Session(engine)
    stmt = select(Genre)
    genres = session.execute(stmt).scalars().all()
    
    logger.debug(f"DEBUG: ALL GENRES{genres}")
    return genres
    
def get(db: Session, genre_id: int):
    genre = db.get(Genre, genre_id)
    return genre

def add(db: Session, genre_name: str):
    genre = Genre(name=genre_name)
    
    db.add(genre)
    db.commit()
    db.refresh(genre)
    
    return genre

def patch(db: Session, genre_id: int, new_name: str):
    genre = db.get(Genre, genre_id)
     
    if genre is None:
        return None
    
    db.execute(update(Genre).where(
        Genre.id == genre_id
    ).values(
        name = new_name
    ))
    db.commit()
    
    genre = db.get(Genre, genre_id)
    return genre
    
def remove(db: Session, genre_id: int):
    genre = db.get(Genre, genre_id)
    
    if genre is None:
        return None
    
    db.delete(genre)
    db.commit()
    
    return genre