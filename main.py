import logging
from fastapi import FastAPI, Depends, APIRouter
from db.connection import get_db
from sqlalchemy.orm import Session

from controllers.v1 import ctrlsGenre
from models.v1.dec_base import createTables
from schemas import genre as genreSchema
from routes import authors as routerAuthors
from routes import books as routerBooks

logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    force=True
)
logger = logging.getLogger(__name__)

createTables()

app = FastAPI()
apiVer1 = "/api/v1"

apiRouter = APIRouter()

@app.get("/")
def root():
    return {"hello world"}

apiRouter.include_router(routerAuthors.router)
apiRouter.include_router(routerBooks.router)
'''
--------- START OF GENRES ROUTES -----------
'''
@app.get(apiVer1)
def version():
    return {"Version one!"}

@app.get(f"{apiVer1}/genres")
def genres():
    genres = ctrlsGenre.getAll()
    return genres

@app.get(f"{apiVer1}/genre/{{genre_id}}") 
def get(
    genre_id: int, db: Session = Depends(get_db)
):
    genre = ctrlsGenre.get(db, genre_id)
    return genre

@app.post(f"{apiVer1}/genre/add")
def genreAdd(
    data: genreSchema.GenreCreate, db: Session = Depends(get_db)
):
    return ctrlsGenre.add(db, data.name)

@app.put(f"{apiVer1}/genre/update/{{genre_id}}")
def genreUpdate(
   data: genreSchema.GenreCreate,
   genre_id: int,
   db: Session = Depends(get_db)
):
    return ctrlsGenre.patch(db, genre_id, data.name)

@app.delete(f"{apiVer1}/genre/delete/{{genre_id}}") # double brackets to escape from f-string
def genreDelete(
    genre_id: int,
    db: Session = Depends(get_db)
):
    return ctrlsGenre.remove(db, genre_id)

'''
------------- END OF GENRES ROUTES ------------
'''

app.include_router(apiRouter, prefix=apiVer1)