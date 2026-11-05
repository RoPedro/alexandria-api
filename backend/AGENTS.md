## Routes
- All enndpoints and it's prefixes can be found at `/routes`
- The master prefix can be found at `/main.py`

## Database
- Alembic for the migration system, lives in `/alembic`
- SQLAlchemy for the ORM 
- Development database runs in a persistent sqlite `.db` file, check `/db/connection.py` if needed

## Tests
- Run in a dedicated in-memory database, similar to what Ruby on Rails does by Default

## Misc 
`TODO.md` is protected by default, only execute tasks inside if is asked
