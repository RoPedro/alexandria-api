from os import getenv
from dotenv import load_dotenv
from sqlalchemy.orm import DeclarativeBase

from db.connection import engine
import models.v1 as v1


class Base(DeclarativeBase):
    pass


load_dotenv()
env = getenv("ENV")

def createTables():
    if env != "production":
        v1.Base.metadata.create_all(engine)
