from sqlalchemy import select, update
from sqlalchemy.orm import Session
from models.v1.author import Author
import logging

logger = logging.getLogger(__name__)


def getAll(db: Session):
    stmt = select(Author)
    authors = db.execute(stmt).scalars().all()

    return authors


def get(db: Session, author_id: int):
    author = db.get(Author, author_id)
    return author


def add(db: Session, first_name: str, last_name: str):
    author = Author(firstname=first_name, lastname=last_name)
    db.add(author)
    db.commit()
    db.refresh(author)

    return author


def patch(db: Session, author_id: int, first_name: str, last_name: str):
    author = db.get(Author, author_id)
    if author is None:
        return None

    if first_name == "":
        first_name = str(author.firstname)
    if last_name == "":
        last_name = str(author.lastname)

    db.execute(
        update(Author)
        .where(Author.id == author_id)
        .values(firstname=first_name, lastname=last_name)
    )
    db.commit()

    return author


def remove(db: Session, author_id: int):
    author = db.get(Author, author_id)
    if author is None:
        return None

    db.delete(author)
    db.commit()

    return author
