from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import String
from models.v1.dec_base import Base

class Genre(Base):
    __tablename__ = "genres"
    id = Column(Integer, primary_key=True)
    name = Column(String(100), unique=True)
    
    def __repr__(self):
        return f"Genre(id={self.id!r}, name={self.name!r})"