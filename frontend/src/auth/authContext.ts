import { createContext } from 'react'
import type { SessionUser } from '../types/auth'

export interface AuthContextValue {
  /** The signed-in account, or `null` when there is no session. */
  user: SessionUser | null
  /** True when the signed-in account is an administrator. */
  isAdmin: boolean
  /** True while the stored session is being validated against the API. */
  loading: boolean
  /** ISO timestamp of the session expiry. */
  expiresAt: string | null
  /** True when the last session ended because it expired. */
  expired: boolean
  login(username: string, password: string): Promise<void>
  register(username: string, password: string): Promise<void>
  logout(): void
  /** Re-read the account behind the stored session. */
  refresh(): Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
