import { useState } from 'react'
import { useAuth } from '../../auth/useAuth'
import { LoginDialog } from '../auth/LoginDialog'
import { Button } from '../ui/Button'

function formatExpiry(expiresAt: string | null): string | null {
  if (!expiresAt) return null
  const parsed = Date.parse(expiresAt)
  if (Number.isNaN(parsed)) return null
  return new Date(parsed).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function Header() {
  const { user, isAdmin, expiresAt, expired, logout } = useAuth()
  const [dialogOpen, setDialogOpen] = useState(false)

  const expiry = formatExpiry(expiresAt)

  return (
    <>
      <header className="app-header">
        <span className="app-header__mark">Alexandria</span>
        <div className="app-header__spacer" />
        {user ? (
          <div className="app-header__account">
            <span className="app-header__user">{user.username}</span>
            <span
              className={
                isAdmin ? 'role-badge role-badge--admin' : 'role-badge'
              }
            >
              {isAdmin ? 'Administrator' : 'Reader'}
            </span>
            {isAdmin && expiry && (
              <span className="app-header__expiry">
                Session ends {expiry}
              </span>
            )}
            <Button onClick={logout}>Sign out</Button>
          </div>
        ) : (
          <div className="app-header__account">
            {expired && (
              <span className="app-header__notice">
                Your session expired. Sign in again to continue.
              </span>
            )}
            <Button variant="primary" onClick={() => setDialogOpen(true)}>
              Sign in
            </Button>
          </div>
        )}
      </header>

      <LoginDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </>
  )
}
