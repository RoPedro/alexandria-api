from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy import Date
from models.v1.dec_base import Base

class Book(Base):
    __tablename__ = "books"
    id = Column(Integer, primary_key=True)
    isbn = String(20)
    title = Column(String(255))
    description = Column(String)
    release_date = Column(Date)
    
    def __repr__(self):
        return f"Book(id={self.id!r}, isbn={self.isbn!r}, title={self.title!r}, description={self.description}, release_date={self.release_date})"