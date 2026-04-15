from sqlalchemy import Column, Integer, String, ForeignKey, Date
from sqlalchemy.orm import relationship

from models.v1.dec_base import Base
from models.v1.authorBook import authorBook


class Book(Base):
    __tablename__ = "books"
    id = Column(Integer, primary_key=True)
    isbn = Column(String(20), unique=True)
    title = Column(String(255))
    description = Column(String)
    release_date = Column(Date)
    genre_id = Column(Integer, ForeignKey("genres.id"))

    genre = relationship("Genre", back_populates="books")
    authors = relationship("Author", secondary=authorBook, back_populates="books")

    def __repr__(self):
        return f"Book(id={self.id!r}, isbn={self.isbn!r}, title={self.title!r}, description={self.description}, release_date={self.release_date})"
