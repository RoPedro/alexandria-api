from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import String
from models.v1.dec_base import Base

class Author(Base):
    __tablename__ = "authors"
    id = Column(Integer, primary_key=True)
    firstname = Column(String(100))
    lastname = Column(String(100))
    
    def __repr__(self):
        return f"Author(id={self.id!r}, firstname={self.firstname!r}, lastname={self.lastname!r})"