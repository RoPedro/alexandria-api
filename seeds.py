from db.connection import engine
from os import getenv
import models.v1 as v1
from dotenv import load_dotenv

load_dotenv()
env = getenv('ENV')

def createTables():
    v1.Base.metadata.create_all(engine)
        
 