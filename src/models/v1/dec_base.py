from os import getenv

from dotenv import load_dotenv
from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass


load_dotenv()
env = getenv("ENV")
