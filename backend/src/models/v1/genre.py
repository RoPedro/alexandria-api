from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

from src.models.v1.dec_base import Base


class Genre(Base):
    __tablename__ = "genres"
    id = Column(Integer, primary_key=True)
    name = Column(String(100), unique=True)

    books = relationship("Book", back_populates="genre")

    def __repr__(self):
        return f"Genre(id={self.id!r}, name={self.name!r})"
