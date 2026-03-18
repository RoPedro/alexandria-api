import logging
from fastapi import FastAPI, APIRouter

from models.v1.dec_base import createTables
from routes import (
    authors as routerAuthors,
    books as routerBooks,
    genres as routerGenres,
)

logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    force=True,
)
logger = logging.getLogger(__name__)

createTables()

app = FastAPI()
apiVer1 = "/api/v1"

apiRouter = APIRouter()

apiRouter.include_router(routerBooks.router)
apiRouter.include_router(routerAuthors.router)
apiRouter.include_router(routerGenres.router)

app.include_router(apiRouter, prefix=apiVer1)
