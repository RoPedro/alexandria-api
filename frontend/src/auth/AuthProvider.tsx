import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import * as authApi from '../api/auth'
import { SESSION_EXPIRED_EVENT } from '../api/client'
import { clearSession, readSession, writeSession } from './storage'
import { AuthContext } from './authContext'
import type { AuthContextValue } from './authContext'
import type { AuthSession, SessionUser } from '../types/auth'

interface AuthState {
  user: SessionUser | null
  expiresAt: string | null
  loading: boolean
  expired: boolean
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(() => {
    // Show the stored session right away, then let the API confirm it.
    const stored = readSession()
    return {
      user: stored?.user ?? null,
      expiresAt: stored?.expiresAt ?? null,
      loading: stored !== null,
      expired: false,
    }
  })

  const patch = useCallback((next: Partial<AuthState>) => {
    setState((prev) => ({ ...prev, ...next }))
  }, [])

  const endSession = useCallback(() => {
    clearSession()
    patch({ user: null, expiresAt: null })
  }, [patch])

  const applySession = useCallback(
    (session: AuthSession) => {
      writeSession(session)
      patch({
        user: session.user,
        expiresAt: session.expires_at,
        expired: false,
      })
    },
    [patch],
  )

  const refresh = useCallback(async () => {
    const stored = readSession()
    if (!stored) {
      patch({ user: null, expiresAt: null, loading: false })
      return
    }
    try {
      const account = await authApi.me()
      patch({ user: account, expiresAt: stored.expiresAt, expired: false })
    } catch {
      endSession()
    } finally {
      patch({ loading: false })
    }
  }, [endSession, patch])

  // Confirm the stored session against the API on boot.
  useEffect(() => {
    if (!readSession()) return
    let cancelled = false
    authApi
      .me()
      .then((account) => {
        if (cancelled) return
        const stored = readSession()
        patch({
          user: account,
          expiresAt: stored?.expiresAt ?? null,
          expired: false,
          loading: false,
        })
      })
      .catch(() => {
        if (cancelled) return
        endSession()
        patch({ loading: false })
      })
    return () => {
      cancelled = true
    }
  }, [endSession, patch])

  // The API rejected the stored session: drop it.
  useEffect(() => {
    const onExpired = () => {
      endSession()
      patch({ expired: true })
    }
    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired)
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired)
  }, [endSession, patch])

  // Admin sessions expire at midnight: end the session locally at that moment
  // so the UI asks for the password again instead of failing on the next call.
  useEffect(() => {
    if (!state.expiresAt) return
    const remaining = Date.parse(state.expiresAt) - Date.now()
    if (Number.isNaN(remaining)) return

    const timer = window.setTimeout(
      () => {
        endSession()
        patch({ expired: true })
      },
      Math.max(remaining, 0) + 50,
    )
    return () => window.clearTimeout(timer)
  }, [state.expiresAt, endSession, patch])

  const login = useCallback(
    async (username: string, password: string) => {
      const session = await authApi.login(username, password)
      applySession(session)
    },
    [applySession],
  )

  const register = useCallback(
    async (username: string, password: string) => {
      const session = await authApi.register(username, password)
      applySession(session)
    },
    [applySession],
  )

  const logout = useCallback(() => {
    endSession()
    patch({ expired: false })
  }, [endSession, patch])

  const value = useMemo<AuthContextValue>(
    () => ({
      user: state.user,
      isAdmin: state.user?.role === 'admin',
      loading: state.loading,
      expiresAt: state.expiresAt,
      expired: state.expired,
      login,
      register,
      logout,
      refresh,
    }),
    [state, login, register, logout, refresh],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
