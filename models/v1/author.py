from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy.orm import relationship

from models.v1.dec_base import Base
from models.v1.authorBook import authorBook

class Author(Base):
    __tablename__ = "authors"
    id = Column(Integer, primary_key=True)
    firstname = Column(String(100))
    lastname = Column(String(100))
    
    books = relationship("Book", secondary=authorBook, back_populates="authors")
    
    def __repr__(self):
        return f"Author(id={self.id!r}, firstname={self.firstname!r}, lastname={self.lastname!r})"