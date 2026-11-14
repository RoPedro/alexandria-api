## Alexandria API: What it is?
A backend system built on top of [FastAPI](https://fastapi.tiangolo.com/) that serves as a virtual library for any frontend system to work with.

## Instructions
All backend code lives in `backend/`.
1. `cd backend`
2. `python -m venv venv` (Create a virtual environment)
3. `pip install -r requirements.txt` (Install dependencies)
4. `alembic upgrade head` (Migrate the database)

## Frontend
Lives in `frontend/` (React + TypeScript + Vite), see `frontend/AGENTS.md` for details.
1. `cd frontend`
2. `npm install`
3. `npm run dev` (serves on :5173, proxies `/api` to the backend on :8000)

## Stress testing
`gatling/` holds a [Gatling](https://gatling.io) load test (Maven project, Java 21 — both pinned in `mise.toml`).
1. `cd gatling`
2. `mvn gatling:test` (needs the backend running on :8000)

- Default load: 100 requests/second for 30 seconds, split between the list routes (`getAll`) and the by-id routes (`getEntity`);
- Tunable with `-Drps=200 -Dduration=60 -DbaseUrl=http://host:8000`;
- The by-id routes are fuzzed with float, int, char, string and special-character parameters (SQL injection, path traversal, XSS, encoded payloads); a run fails if any request answers 5xx or times out;
- HTML reports are written to `gatling/target/gatling/`.

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
- `backend/Dockerfile` provides good support for PAAS like Railway, Heroku and Render;
- `backend/build.sh` will build and run the image from the `Dockerfile`, useful for testing;
- `compose.yaml` (repo root) brings the whole stack up with `docker compose up --build`: `db_service` (PostgreSQL, on `:5432`), `api_service` (FastAPI, on `:8000`, migrations + seeds on boot) and `frontend_service` (nginx, on `:5173`). Database credentials come from `DB_USERNAME` / `DB_PASSWORD` / `DB_NAME` (defaults: `alexandria`), overridable in a root `.env` file; the backend reads its other variables from `backend/.envexample`. Each service is capped at 1 vCPU and 1.5 GB of RAM.
