import { useState } from 'react'
import type { FormEvent } from 'react'
import { useAuth } from '../../auth/useAuth'
import { ApiError } from '../../types/errors'
import { Button } from '../ui/Button'
import { Drawer } from '../ui/Drawer'
import { StatusMessage } from '../ui/StatusMessage'

type Mode = 'signin' | 'register'

interface LoginDialogProps {
  open: boolean
  onClose: () => void
}

export function LoginDialog({ open, onClose }: LoginDialogProps) {
  const { login, register } = useAuth()
  const [mode, setMode] = useState<Mode>('signin')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setBusy(true)
    try {
      if (mode === 'signin') {
        await login(username, password)
      } else {
        await register(username, password)
      }
      setPassword('')
      onClose()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unexpected error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Drawer
      open={open}
      title={mode === 'signin' ? 'Sign in' : 'Create an account'}
      onClose={onClose}
    >
      <form className="entity-form" onSubmit={submit}>
        <div className="auth-tabs" role="tablist" aria-label="Authentication">
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'signin'}
            className={
              mode === 'signin'
                ? 'auth-tabs__tab auth-tabs__tab--active'
                : 'auth-tabs__tab'
            }
            onClick={() => {
              setMode('signin')
              setError(null)
            }}
          >
            Sign in
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'register'}
            className={
              mode === 'register'
                ? 'auth-tabs__tab auth-tabs__tab--active'
                : 'auth-tabs__tab'
            }
            onClick={() => {
              setMode('register')
              setError(null)
            }}
          >
            Create account
          </button>
        </div>

        {error && <StatusMessage variant="error">{error}</StatusMessage>}

        <div className="form-field">
          <label htmlFor="auth-username">Username</label>
          <input
            id="auth-username"
            type="text"
            autoComplete="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="auth-password">Password</label>
          <input
            id="auth-password"
            type="password"
            autoComplete={
              mode === 'signin' ? 'current-password' : 'new-password'
            }
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
          {mode === 'register' && (
            <p className="form-field__hint">
              At least 8 characters. A new account is read-only; an
              administrator grants write access.
            </p>
          )}
        </div>

        <div className="entity-form__actions">
          <Button type="submit" variant="primary" disabled={busy}>
            {busy
              ? 'Working…'
              : mode === 'signin'
                ? 'Sign in'
                : 'Create account'}
          </Button>
          <Button onClick={onClose} disabled={busy}>
            Cancel
          </Button>
        </div>
      </form>
    </Drawer>
  )
}
