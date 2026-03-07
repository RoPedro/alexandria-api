import logging
from fastapi import FastAPI as fapi
from controllers.v1 import ctrlsGenre
from seeds import createTables

logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    force=True
)

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
    