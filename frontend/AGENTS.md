## Project
- React + TypeScript SPA scaffolded with `create-vite` (react-ts template); Vite as build tool and dev server
- Package manager is **npm** (`package-lock.json` is committed); linting via **oxlint** (`.oxlintrc.json`)

## Commands
- `npm run dev` — dev server on `:5173`, proxies `/api` to `http://localhost:8000` (see `vite.config.ts`)
- `npm run build` — type-checks with `tsc -b`, then builds to `dist/`
- `npm run lint` — run this before finishing any change
- `npm run preview` — serves the production build locally

## Structure
- `src/components/shell/` — app shell: header (account controls), sidebar, workspace layout
- `src/components/ui/` — shared primitives (Button, Drawer, ConfirmDialog, states)
- `src/components/auth/` — authentication UI (sign in / create account drawer)
- `src/components/database/` — Database panel pieces: tabs, expandable table, entity details, forms, views
- `src/pages/` — panel screens (`DatabasePage` is the first); `App.tsx` switches panels with `useState` (no router)
- `src/api/` — typed client for the backend; mutations send `FormData` (backend routes take FastAPI `Form()`), never raw JSON; always call it through `/api`, never absolute URLs
- `src/auth/` — session state: `AuthProvider` (context), `useAuth()` hook, role-aware session storage in `storage.ts`; see `docs/ARCHITECTURE.md`
- `src/types/` — shared TypeScript types mirroring backend schemas
- `src/hooks/` — shared React hooks (`useEntityList`)
- `src/styles/` — `tokens.css` (semantic colors/spacing from `DESIGN.md`) plus shell/components/database CSS, imported by `index.css`
- Mutations must refetch lists (backend create/update responses are often empty)
- Admin-only controls are rendered **disabled with an explanation**, never hidden (`DESIGN.md`); the API client also refuses mutating calls for a non-admin session

## Docker
- Multi-stage: `node:24-alpine` builds `dist/`, `nginx:alpine` serves it
- Build context is `frontend/`; the root `compose.yaml` builds it as `frontend_service` (published on `:5173`)
- `nginx.conf`: SPA fallback (`try_files`) and `/api/` reverse-proxied to `http://api_service:8000` (compose service name); the upstream resolves at request time via Docker DNS (`resolver 127.0.0.11`), so nginx boots even when the `api_service` is down — standalone, `/api` returns 502 by design

## Rules for agents
- Do not modify `backend/` from this directory; cross-directory changes need an explicit request
- No router, UI library, or state manager until explicitly asked — structure first
- npm only: never introduce pnpm/yarn/bun lockfiles or configs
- Keep this file updated when structure or commands change; no other doc files
- Respect `DESIGN.md` when creating and modifying UI, if the user prompts and approves something different, that is not present in DESIGN.md, add in the file as a new rule or modify an existing rule.


