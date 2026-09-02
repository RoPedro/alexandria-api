## Alexandria API: What it is?
A backend system built on top of [FastAPI](https://fastapi.tiangolo.com/) that serves as a virtual library for any frontend system to work with.

## Instructions
1. `python -m venv venv` (Create a virtual environment)
2. `pip install -r requirements.txt` (Install dependencies)
3. `alembic upgrade head` (Migrate the database)

## Why it exists?
This repository is how I centralize most of my learnings in backend architecture. Everytime I want to learn a new backend concept, I try to implement it here first.

## What it uses?
The main dependencies being used are:

- FastAPI: Main backend framework;
- SQLAlchemy: ORM for database connection and manipulation;
- Alembic: Migration database system for reproducible deploys;
- PyTest + SQLite: For automated tests and development database, respectively;
- PostgreSQL: Production database.

## What it currently does?
CRUD for author, genre, book and user entities with simple validation checks

## What will still be implemented?
- Authentication and Route protection: The next big update, routes like DELETE will be protected by JWT Auth.
- Better testing framework.

## Container/Docker support
- `Dockerfile` provides good support for PAAS like Railway, Heroku and Render;
- `build.sh` will build and run the image from the `Dockerfile`, useful for testing;
- `compose.yaml` also builds the image, but additionally, links a PostgreSQL database and a Adminer container for database editing.
