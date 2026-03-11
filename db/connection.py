import logging
from sqlalchemy import create_engine
from os import getenv
from pathlib import Path
from dotenv import load_dotenv
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)
logger.info("db/connection.py")

load_dotenv()

db_url = getenv('DB_URL', default='')
if db_url == "":
    db_url = f"sqlite:///{Path.cwd()}/db/bookapi-fast.db"

print(db_url)

engine = create_engine(db_url, echo=True)

def get_db():
    db = Session(engine)
    try:
        yield db
    finally:
        db.close()