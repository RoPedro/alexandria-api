# Backend architecture

Patterns implemented in the backend and the reasoning behind them. The options that
were considered live in [`/docs/THINKER.md`](../../docs/THINKER.md).

---

## Authentication and route protection

### Model at a glance

| Concern | Decision |
|---|---|
| Token | Stateless JWT (HS256), sent as `Authorization: Bearer <token>` |
| Password hashing | Argon2id via `pwdlib[argon2]`, unique salt per password |
| Role source | Read from the database on every protected request |
| Read access | Every `GET` route is public |
| Write access | `POST` / `PUT` / `PATCH` / `DELETE` require the `admin` role |
| Registration | Public registration always creates a regular user |
| Admin creation | An admin creates other admins through `POST /auth/users` |
| First admin | Bootstrapped from the environment or the CLI, never from a public route |

### Endpoints

| Method | Path | Who | What |
|---|---|---|---|
| POST | `/api/v1/auth/register` | anyone | Creates a **regular** user and signs it in. The payload has no `role` field, so registration can never escalate privileges. |
| POST | `/api/v1/auth/login` | anyone | Exchanges a username and password for a token (FastAPI `OAuth2PasswordRequestForm`, so Swagger's *Authorize* button works). |
| GET | `/api/v1/auth/me` | any session | Returns the account behind the token. The frontend uses it as the authoritative role instead of trusting the token payload. |
| GET | `/api/v1/auth/users` | admin | Lists every account. |
| POST | `/api/v1/auth/users` | admin | Creates an account with an explicit role — this is how an admin registers another admin. |

### Session lifetimes

The lifetime depends on the role of the account that logged in:

- **Regular user** — `ACCESS_TOKEN_EXPIRE_MINUTES` (default 30 days).
- **Administrator** — the earlier of `ADMIN_SESSION_HOURS` (default 8 hours) and the
  next midnight in `ADMIN_TIMEZONE` (default UTC). An administrator therefore signs
  in again every day, and never carries an admin token into the next day.

An expired admin token does **not** demote the account: the `admin` role stays in
the database, the session simply ends and the administrator signs in again.

### Where the code lives

```
src/config.py                  Settings read from the environment (src/config.py:1)
src/models/v1/user.py          The users table and the Role constants
src/security/passwords.py      Argon2id hashing
src/security/tokens.py         Token issuing/verification and per-role expiry
src/dependencies/auth.py       get_current_user and require_admin
src/controllers/v1/ctrls_user.py  User persistence and credential checks
routes/auth.py                 The /auth endpoints
db/create_admin.py             First-admin bootstrap (env + CLI)
```

### How a protected route is guarded

The mutating routes declare the dependency directly:

```python
@router.post("/add")
def addBook(
    data: Annotated[BookAdd, Form()],
    db: Session = session_object,
    admin: User = Depends(require_admin),
):
```

`require_admin` (`src/dependencies/auth.py:78`) resolves the token to a user and
then checks the role:

- no token or an invalid/expired token → **401**;
- a valid token without the `admin` role → **403**;
- an administrator → the request proceeds.

The role is **not** part of the token payload (only `sub`, `username`, `iat` and
`exp` are). It is read from the `users` table on every protected request, so
demoting or deactivating an account takes effect on the very next call instead of
waiting for the token to expire.

### Bootstrapping the first administrator

There is no public endpoint that can grant the `admin` role. The first
administrator is created out of band, in one of two ways:

```bash
# From the environment (the compose stack runs `python -m db.seeds`, which calls
# this during seeding, so setting the variables is enough):
ADMIN_USERNAME=root ADMIN_PASSWORD=secret python -m db.seeds

# Or explicitly, for example to add another administrator later:
python -m db.create_admin --username root
```

Both paths are idempotent: they never create a duplicate account and never
overwrite an existing password. `ensure_bootstrap_admin()` only acts when the
database has **no** administrator at all, so a redeploy never resurrects or
overwrites an account.

### Security notes

- The password hash is never exposed by the API (`schemas/user.py` has a
  `UserPublic` schema that does not include it).
- Login answers with a generic `Invalid username or password` so the endpoint
  cannot be used to enumerate accounts. The same message is used for an unknown
  username and a wrong password.
- `ctrls_user.authenticate` verifies a dummy hash when the username does not
  exist, so both failure paths cost roughly the same time.
- The registration endpoint is open, so it is spam-able, and login is
  credential-stuffable. Neither is rate-limited yet; the options are listed in
  [`/docs/THINKER.md`](../../docs/THINKER.md).

## Migrations

`alembic/env.py` used to set `target_metadata = None`, which silently disabled
`--autogenerate`. It now points at `Base.metadata`, and `src/models/v1/__init__.py`
imports every model so the metadata is always complete.

The `users` table was added by hand in
`alembic/versions/c4a1d9f2b7e3_create_users_table.py`.

> Known mismatch: the `authors` unique constraint is named `fullname_unique` in
> the model but `uq_author_fullname` in the migration, so `--autogenerate` still
> proposes renaming it. Left alone to avoid touching an unrelated table.

## Tests

`tests/conftest.py` provides:

- `client` — a `TestClient` bound to an in-memory SQLite database (function
  scoped, so each test starts from a clean schema);
- `admin_headers` / `user_headers` — authorization headers for an admin and a
  regular account.

`tests/api_tests/test_auth.py` covers registration, login, the role rules and
the guarantee that the read routes stay public.
