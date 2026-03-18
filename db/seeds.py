from datetime import date

from sqlalchemy.orm import Session

from models.v1 import Genre, Author, Book
from db.connection import engine

with Session(bind=engine) as session:
    genresList = [
        Genre(name="fantasy"),
        Genre(name="sci-fi"),
        Genre(name="non-fiction"),
        Genre(name="romance"),
    ]

    for genre in genresList:
        session.add(genre)
    session.commit()  # Commit outside the loop, so we commit all genres at once.

    authorsList = [
        Author(firstname="Thomas H.", lastname="Cormen"),
        Author(firstname="Ronald L.", lastname="Rivest"),
        Author(firstname="J.R.R.", lastname="Tolkien"),
        Author(firstname="Isaac", lastname="Asimov"),
        Author(firstname="Rick", lastname="Riordan"),
        Author(firstname="Jane", lastname="Austen"),
    ]

    for author in authorsList:
        session.add(author)
    session.commit()

    booksList = [
        Book(
            isbn="978-0262033848",
            title="Introduction to Algorithms",
            description="A comprehensive textbook on algorithms.",
            release_date=date(2022, 4, 5),
            genre_id=genresList[2].id,  # non-fiction (1-n: just set the FK)
            authors=[
                authorsList[0],
                authorsList[1],
            ],  # Cormen + Rivest (n-n: assign the list)
        ),
        Book(
            isbn="978-0618640157",
            title="The Lord of the Rings",
            description="An epic fantasy trilogy.",
            release_date=date(1954, 7, 29),
            genre_id=genresList[0].id,  # fantasy
            authors=[authorsList[2]],  # Tolkien
        ),
        Book(
            isbn="978-0553293357",
            title="Foundation",
            description="A science fiction classic.",
            release_date=date(1951, 5, 1),
            genre_id=genresList[1].id,  # sci-fi
            authors=[authorsList[3]],  # Asimov
        ),
        Book(
            isbn="978-0141439518",
            title="Pride and Prejudice",
            description="A romantic novel following Elizabeth Bennet and Mr. Darcy.",
            release_date=date(1813, 1, 28),
            genre_id=genresList[3].id,  # romance
            authors=[authorsList[5]],  # Jane Austen
        ),
    ]

    for book in booksList:
        session.add(book)
    session.commit()
