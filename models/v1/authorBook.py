from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import ForeignKey
from sqlalchemy.orm import relationship
from models.v1.dec_base import Base

class AuthorBook(Base):
    __tablename__ = "authorBooks"
    author_id = Column(Integer, ForeignKey("authors.id"), primary_key=True)
    book_id = Column(Integer, ForeignKey("books.id"), primary_key=True)
    
    author = relationship("Author", backref="author_books")
    book = relationship("Book", backref="book_authors")
    