import logging
from fastapi import FastAPI as fapi, Depends
from controllers.v1 import ctrlsGenre
from seeds import createTables
from schemas import genre as genreSchema
from db.connection import get_db
from sqlalchemy.orm import Session

logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    force=True
)
logger = logging.getLogger(__name__)

createTables()

app = fapi()
apiVer1 = "/api/v1"

@app.get("/")
def root():
    return {"hello world"}

@app.get(apiVer1)
def version():
    return {"Version one!"}

@app.get(f"{apiVer1}/genres")
def genres():
    genres = ctrlsGenre.getAll()
    return genres

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