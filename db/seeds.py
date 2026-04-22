from datetime import date

from sqlalchemy.orm import Session

from models.v1 import Genre, Author, Book
from db.connection import engine

# WARNING: If you want to move the seeds arrays like genresList to
# another file, understand that a simple import should not work.
# the reason is that the id variable has value == None, it only has
# a value after, for example, "session.add_all(genresList)", do not
# waste time trying to move those variables out unless there's a
# clear plan to how to refactor it.
with Session(bind=engine) as session:
    genresList = [
        Genre(name="fantasy"),
        Genre(name="sci-fi"),
        Genre(name="non-fiction"),
        Genre(name="romance"),
    ]

    session.add_all(genresList)
    session.commit()

    authorsList = [
        Author(firstname="Thomas H.", lastname="Cormen"),
        Author(firstname="Ronald L.", lastname="Rivest"),
        Author(firstname="J.R.R.", lastname="Tolkien"),
        Author(firstname="Isaac", lastname="Asimov"),
        Author(firstname="Rick", lastname="Riordan"),
        Author(firstname="Jane", lastname="Austen"),
    ]

    booksList = [
        Book(
            isbn="978-0262033848",
            title="Introduction to Algorithms",
            description="A comprehensive textbook on algorithms.",
            release_date=date(2022, 4, 5),
            genre_id=genresList[2].id,  # non-fiction
            authors=[
                authorsList[0],
                authorsList[1],
            ],  # Cormen + Rivest
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
        Book(
            isbn="978-0262046305",
            title="Algorithms Unlocked",
            description="A gentle introduction to algorithms and computer programming.",
            release_date=date(2013, 3, 1),
            genre_id=genresList[2].id,  # non-fiction
            authors=[authorsList[0]],  # Cormen
        ),
        Book(
            isbn="978-0618346257",
            title="The Hobbit",
            description="A fantasy adventure following Bilbo Baggins on an unexpected journey.",
            release_date=date(1937, 9, 21),
            genre_id=genresList[0].id,  # fantasy
            authors=[authorsList[2]],  # Tolkien
        ),
        Book(
            isbn="978-0618574940",
            title="The Silmarillion",
            description="The mythopoeic history of the Elves and the world of Middle-earth.",
            release_date=date(1977, 9, 15),
            genre_id=genresList[0].id,  # fantasy
            authors=[authorsList[2]],  # Tolkien
        ),
        Book(
            isbn="978-0553293372",
            title="I, Robot",
            description="A collection of stories exploring the relationship between humans and robots.",
            release_date=date(1950, 12, 2),
            genre_id=genresList[1].id,  # sci-fi
            authors=[authorsList[3]],  # Asimov
        ),
        Book(
            isbn="978-0553294385",
            title="The Caves of Steel",
            description="A detective mystery set in a future Earth of massive enclosed cities.",
            release_date=date(1954, 10, 1),
            genre_id=genresList[1].id,  # sci-fi
            authors=[authorsList[3]],  # Asimov
        ),
        Book(
            isbn="978-0141439761",
            title="Sense and Sensibility",
            description="Two sisters navigate love and heartbreak in Regency-era England.",
            release_date=date(1811, 10, 30),
            genre_id=genresList[3].id,  # romance
            authors=[authorsList[5]],  # Austen
        ),
        Book(
            isbn="978-0141439587",
            title="Emma",
            description="A well-meaning but misguided young woman meddles in the romantic affairs of her friends.",
            release_date=date(1815, 12, 23),
            genre_id=genresList[3].id,  # romance
            authors=[authorsList[5]],  # Austen
        ),
    ]

    session.add_all(booksList)
    session.commit()  # Commit outside the loop, so we commit all genres at once.
