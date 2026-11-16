# THINKER — Implementation options

Options considered before implementation, with pros/cons, ordered by impact per unit of effort.
Once a pattern is implemented it is promoted to `backend/docs/ARCHITECTURE.md` and/or
`frontend/docs/ARCHITECTURE.md`.

---

## 1. API authentication model

**Requirement:** all users can read (GET routes are public); only admins can POST/PUT/PATCH/DELETE.

### Option A — Stateless JWT (HS256) bearer token — **chosen**
The token is signed server-side and carries the user id. Every protected request is verified by
signature + expiry, with **no session storage** on the server.

- Pros: zero extra infrastructure; no DB write per request; scales horizontally with no shared
  state; the frontend can decode `exp` locally to show "session expires at"; native support in
  FastAPI via `OAuth2PasswordBearer` (Swagger's *Authorize* button works out of the box).
- Cons: a token cannot be revoked before its expiry (mitigated here by short admin TTLs and by
  re-reading the role from the DB); the secret must be kept out of the repo.
- Effort: low. Libraries: `pyjwt`.

### Option B — Server-side opaque session tokens
A random token is stored in a `sessions` table; each protected request looks the token up.

- Pros: true revocation (logout revokes, an admin can kill a session); no client-readable claims.
- Cons: one extra DB round trip per protected request; a new table to migrate; more state to
  clean up (expired rows); the token is a bearer secret with no expiry of its own.
- Effort: medium. Not needed for a prototype whose admin sessions already expire on a schedule.

### Option C — JWT in an HttpOnly cookie
Same token as A, but delivered as a `Set-Cookie` instead of a JS-readable string.

- Pros: an XSS payload cannot read the token; the browser sends it automatically.
- Cons: needs `credentials: 'include'` on every request plus a CORS `allow_credentials` policy;
  makes the API CSRF-sensitive (needs a SameSite strategy or a CSRF token); "logout" still does
  not revoke the JWT without a server-side deny-list, so the complexity of B is not avoided.
- Effort: medium-high. Rejected: the frontend already talks to the API same-origin through the
  Vite/nginx proxy, so the only gain is XSS-hardening, which a prototype does not need yet.

### Option D — HTTP Basic auth
- Pros: trivial to implement, no token lifecycle at all.
- Cons: the password is re-sent on every request; no expiry; browsers cache it; no "logout";
  unusable as a real session model. Rejected.

---

## 2. Where the token lives in the browser

**Requirement:** admin sessions should not be persisted, and should expire much faster than
regular user sessions.

### Option A — Role-aware storage — **chosen**
Admin tokens live in `sessionStorage` (dropped when the tab closes) and expire at the earlier of
`ADMIN_SESSION_HOURS` or midnight; regular user tokens live in `localStorage` and expire after
`ACCESS_TOKEN_EXPIRE_MINUTES` (default 30 days).

- Pros: matches the requirement directly; a stolen `localStorage` blob yields no admin access;
  the admin re-authenticates every day; zero infra.
- Cons: two storage locations to reason about; an admin who closes the tab loses the session
  (intended).

### Option B — Everything in `localStorage`
- Pros: simplest; one code path.
- Cons: admin sessions survive browser restarts and can be replayed from disk for the whole
  admin TTL. Rejected for admins.

### Option C — Everything in `sessionStorage`
- Pros: nothing persists after the tab closes.
- Cons: regular users would have to log in on every visit — hostile to the "lenient user session"
  requirement. Rejected.

---

## 3. First admin bootstrap (no admin exists yet)

**Requirement:** admins create other admins, but the first admin cannot come from an admin.

### Option A — Out-of-band creation (env vars + CLI) — **chosen**
`ADMIN_USERNAME` / `ADMIN_PASSWORD` create the first admin on boot when no admin exists;
`python -m db.create_admin` does the same manually.

- Pros: no public code path can ever grant admin; works in Docker and CI; idempotent; the
  bootstrap is auditable in the deploy logs.
- Cons: one manual step on the very first deploy.
- Effort: low.

### Option B — First registered user becomes admin
- Pros: zero-config, zero manual steps.
- Cons: whoever reaches the app first owns it; a boot race decides ownership; there is no way to
  safely re-run it. Rejected: privilege granted by a public endpoint is a smell even in a
  prototype.

### Option C — Invite codes issued by an admin
- Pros: an admin can hand out single-use codes; no shared secret in env; good for a multi-admin
  team.
- Cons: needs a code table, an expiry, and single-use enforcement; and it still does not solve
  the *first* admin without combining it with A or B. Deferred: worth adding when a second admin
  is needed without shell access.

### Option D — One-time setup token in env gating `POST /auth/setup`
- Pros: single-use, explicit, no public write path.
- Cons: needs "token already consumed" state and a second endpoint whose only job is bootstrapping.
  Rejected in favour of A, which reaches the same end state with less machinery.

---

## 4. Password hashing

### Option A — Argon2id via `pwdlib[argon2]` — **chosen**
- Pros: memory-hard, the current OWASP recommendation; no 72-byte input truncation (bcrypt's
  limit); `pwdlib` is the maintained successor to `passlib` and the library FastAPI's own docs
  now use.
- Cons: one more dependency; slower than a plain SHA (intentionally).
- Effort: low.

### Option B — `bcrypt`
- Pros: battle-tested, widely deployed.
- Cons: truncates input at 72 bytes (silently); the `bcrypt` package's 4.x release caused
  ecosystem churn. Acceptable fallback.

### Option C — stdlib `hashlib.pbkdf2_hmac`
- Pros: no new dependency.
- Cons: CPU-hard only, so weaker against GPU/ASIC attacks than a memory-hard KDF; a hand-rolled
  KDF wrapper is code we would rather not own. Acceptable fallback.

### Option D — `passlib`
- Pros: familiar API.
- Cons: unmaintained, and its bcrypt backend breaks on modern `bcrypt` releases. Rejected.

---

## 5. Where the role comes from on each protected request

### Option A — Re-read the user from the DB — **chosen**
The JWT carries only the user id (`sub`) and timestamps; the dependency loads the user row and
reads `role` from it.

- Pros: a demotion or deactivation takes effect on the very next request; no stale admin claim
  can linger; the DB is the single source of truth.
- Cons: one `SELECT` per protected request (a few hundred microseconds). Negligible: GET routes
  stay public, so the hot read path pays nothing.
- Effort: low.

### Option B — Role claim inside the JWT
- Pros: no DB read on the protected path.
- Cons: the role is frozen until the token expires — up to 30 days for a regular session. A
  demoted admin would keep write access. Rejected for that reason.

---

## 6. Registration surface

### Option A — Public register (always `user`) + admin-only create (any role) — **chosen**
`POST /auth/register` is public and always creates a non-admin. `POST /auth/users` requires an
admin token and accepts an explicit role — that is how admins create other admins.

- Pros: the public payload has no `role` field, so there is no privilege-escalation parameter to
  abuse; admin creation stays in one obvious place.
- Cons: two endpoints instead of one.
- Effort: low.

### Option B — Public register + separate promotion endpoint
- Pros: role changes are their own auditable action.
- Cons: making an admin takes two round trips; a `PATCH /auth/users/{id}/role` also needs
  self-demotion protection. Deferred until role editing is actually needed.

### Option C — Admin-only user creation
- Pros: tightest control.
- Cons: contradicts the stated requirement that guests can self-register.

---

## 7. Frontend guardrails

### Option A — Layered: context + client interceptor + disabled UI — **chosen**
1. `AuthContext` holds the session (`user`, `role`, `expiry`).
2. The API client attaches the bearer token and **refuses non-read methods client-side** when the
   session is not an admin, so a non-admin never even issues a mutation.
3. Admin-only controls render **disabled with an explanation** (not hidden), per
   `frontend/DESIGN.md`.

- Pros: the backend stays the enforcement point, the client is a UX layer, and users learn why
  an action is unavailable instead of finding it missing.
- Cons: three places to keep in sync; the client-side refusal is a convenience, not a security
  boundary (the server still rejects with 403).
- Effort: medium.

### Option B — Disabled UI only
- Pros: smallest change.
- Cons: a stale or hand-crafted client can still call the mutation and get a raw 403; the user
  sees an error instead of a clear explanation. Insufficient on its own.

### Option C — Router-level route guards
- Pros: the idiomatic pattern once the app has a router.
- Cons: the app has **no router** (single-panel switcher in `App.tsx`) and `frontend/AGENTS.md`
  forbids adding one without an explicit request. All admin surfaces live inside one panel, so
  component-level guards cover it. Revisit if a router is introduced.

---

## 8. Rate limiting on login / register

**Not implemented in the first pass.** Open registration is spam-able and login is
credential-stuffable.

- Option A — in-process fixed-window limiter keyed by IP: low effort, but per-process, so it does
  not survive a restart or scale past one instance.
- Option B — Redis-backed limiter: correct across instances, but adds a dependency the stack does
  not have yet.
- Deferred until the prototype is exposed to the internet.

---

## Summary of the chosen stack

| Concern | Choice |
|---|---|
| Token | Stateless JWT HS256 (`pyjwt`) |
| Token storage (browser) | Admin → `sessionStorage` + short TTL; user → `localStorage` + long TTL |
| Password hashing | Argon2id (`pwdlib[argon2]`) |
| Role source | Re-read from the DB per protected request |
| First admin | Env vars + `python -m db.create_admin` |
| Registration | Public register (always `user`) + admin-only create (any role) |
| Read access | GET routes stay public |
| Frontend guardrails | AuthContext + client-side refusal of non-read methods + disabled UI with explanation |
