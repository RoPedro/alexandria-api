import type { AuthSession, SessionUser } from '../types/auth'

/**
 * Where a session is kept depends on the role:
 *
 * - administrators live in `sessionStorage`: the session dies with the tab and
 *   is never written to disk, and the backend already caps it at midnight;
 * - regular users live in `localStorage`: a long-lived, convenient session.
 *
 * The two never coexist: signing in replaces the other session.
 */
const ADMIN_KEY = 'alexandria.session.admin'
const USER_KEY = 'alexandria.session.user'

export interface StoredSession {
  token: string
  expiresAt: string
  user: SessionUser
}

function safeGet(storage: Storage, key: string): string | null {
  try {
    return storage.getItem(key)
  } catch {
    return null
  }
}

function safeSet(storage: Storage, key: string, value: string): void {
  try {
    storage.setItem(key, value)
  } catch {
    // Storage can be unavailable (private mode, quota). The session then only
    // lives in memory for this tab.
  }
}

function safeRemove(storage: Storage, key: string): void {
  try {
    storage.removeItem(key)
  } catch {
    // Nothing to clean up.
  }
}

function readStored(storage: Storage, key: string): StoredSession | null {
  const raw = safeGet(storage, key)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as StoredSession
    if (!parsed?.token || !parsed?.user) return null
    return parsed
  } catch {
    return null
  }
}

export function isExpired(session: StoredSession): boolean {
  const expiresAt = Date.parse(session.expiresAt)
  if (Number.isNaN(expiresAt)) return true
  return expiresAt <= Date.now()
}

/** The current session, or `null` when there is none (or it already expired). */
export function readSession(): StoredSession | null {
  const admin = readStored(sessionStorage, ADMIN_KEY)
  if (admin && !isExpired(admin)) return admin

  const user = readStored(localStorage, USER_KEY)
  if (user && !isExpired(user)) return user

  return null
}

export function writeSession(session: AuthSession): void {
  const stored: StoredSession = {
    token: session.access_token,
    expiresAt: session.expires_at,
    user: session.user,
  }
  const payload = JSON.stringify(stored)

  if (session.user.role === 'admin') {
    safeSet(sessionStorage, ADMIN_KEY, payload)
    safeRemove(localStorage, USER_KEY)
    return
  }

  safeSet(localStorage, USER_KEY, payload)
  safeRemove(sessionStorage, ADMIN_KEY)
}

export function clearSession(): void {
  safeRemove(sessionStorage, ADMIN_KEY)
  safeRemove(localStorage, USER_KEY)
}
