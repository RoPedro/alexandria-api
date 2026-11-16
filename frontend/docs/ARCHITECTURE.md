# Frontend architecture

Patterns implemented in the frontend and the reasoning behind them. The options that
were considered live in [`/docs/THINKER.md`](../../docs/THINKER.md).

---

## Sessions and the admin guardrails

### The rule

- Everyone can read: the `GET` routes are public and need no session.
- Only administrators can write: `POST` / `PUT` / `DELETE` need an admin session.
- The **API** is the enforcement point. The frontend guardrails exist so the UI
  explains the rule instead of failing with a raw error.

### Three layers

1. **`AuthContext`** (`src/auth/AuthProvider.tsx`) holds the session: the
   account, its role, the expiry and whether the last session expired. It
   validates the stored session against `GET /auth/me` on boot, so the role
   always comes from the API and never from the token payload.

2. **The API client** (`src/api/client.ts`) attaches the bearer token to every
   request and **refuses a mutating call when the session is not an admin**,
   before it reaches the network:

   ```ts
   if (!SAFE_METHODS.has(method) && !options.skipAdminCheck) {
     const session = readSession()
     if (!session || session.user.role !== 'admin') {
       throw new ApiError(403, 'Administrator access is required for this action. …')
     }
   }
   ```

   `POST /auth/login` and `POST /auth/register` opt out with
   `{ skipAdminCheck: true }` — they are the only mutating endpoints a regular
   user may reach.

   A `401` answer clears the stored session and fires `SESSION_EXPIRED_EVENT`,
   which the provider listens to. That is what makes an expired administrator
   session end cleanly instead of surfacing as a permission error.

3. **The UI** renders the admin-only controls as **disabled with an explanation**
   instead of hiding them, following `DESIGN.md` ("use a disabled state with a
   clear permission explanation"). Every list view also shows a short note:

   > Read-only access. Sign in as an administrator to add, edit or delete records.

### Where a session is stored

`src/auth/storage.ts` decides the location from the role:

| Role | Storage | Why |
|---|---|---|
| Administrator | `sessionStorage` | The session dies with the tab and is never written to disk. The backend also caps it at midnight, so an admin signs in again every day. |
| Regular user | `localStorage` | A long-lived, convenient session (30 days). |

Signing in replaces the other session: an admin signing in clears any stored user
session, and vice versa. Storage access is wrapped in `try`/`catch` so private
browsing modes degrade to a session that only lives in memory.

### Session expiry in the UI

The provider schedules a timer for the session expiry and ends the session
locally when it fires. The header then shows *"Your session expired. Sign in again
to continue."* instead of leaving stale buttons enabled.

For an administrator the header also shows when the session ends
(*"Session ends 00:00"*), so the midnight cut-off is visible before it happens.

### Files

```
src/types/auth.ts             SessionUser, AuthSession, Role
src/auth/storage.ts           Role-aware session storage
src/auth/authContext.ts       The context and its value type
src/auth/AuthProvider.tsx     The provider: boot validation, expiry timer
src/auth/useAuth.ts           The hook
src/auth/permissions.ts       The shared explanation strings
src/api/auth.ts               register / login / me / listUsers / createUser
src/api/client.ts             Token injection, the admin guardrail, 401 handling
src/components/auth/LoginDialog.tsx  Sign in / create account drawer
src/components/shell/Header.tsx      Account controls (sign in, role, sign out)
```

### No router

The app still has no router (a single panel switcher in `App.tsx`), so the
guardrails live at the component level rather than as route guards. There is
nothing to protect per route: every write control sits inside the database
panel and is covered by the three layers above. If a router is introduced later,
the same `useAuth()` hook is what a route guard would use.

### The account management screen

`src/api/auth.ts` also exposes `listUsers` and `createUser` for the admin-only
account endpoints. They are not wired to a screen yet: the current requirement
is that admins register other admins, which the API supports and the API client
can already call. A "Users" panel would be the next step.
