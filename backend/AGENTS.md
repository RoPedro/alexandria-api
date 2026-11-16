## Routes
- All enndpoints and it's prefixes can be found at `/routes`
- The master prefix can be found at `/main.py`
- Read routes (`GET`) are public. Write routes (`POST`/`PUT`/`DELETE`) are protected by `require_admin` (`/src/dependencies/auth.py`); add it as a dependency when creating a mutating route.

## Authentication
- Sessions are JWT bearer tokens; passwords are hashed with Argon2id (`/src/security`)
- Settings come from the environment (`/src/config.py`), documented in `.envexample`
- The first administrator is created out of band: `python -m db.create_admin` or the `ADMIN_USERNAME`/`ADMIN_PASSWORD` variables
- The full model is documented in `/docs/ARCHITECTURE.md`

## Database
- Alembic for the migration system, lives in `/alembic`
- SQLAlchemy for the ORM 
- Development database runs in a persistent sqlite `.db` file, check `/db/connection.py` if needed

## Tests
- Run in a dedicated in-memory database, similar to what Ruby on Rails does by Default

## Misc 
`TODO.md` is protected by default, only execute tasks inside if is asked
