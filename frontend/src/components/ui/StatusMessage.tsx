import type { ReactNode } from 'react'

interface StatusMessageProps {
  variant: 'success' | 'error'
  children: ReactNode
}

export function StatusMessage({ variant, children }: StatusMessageProps) {
  return (
    <p
      className={`status-message status-message--${variant}`}
      role={variant === 'error' ? 'alert' : 'status'}
    >
      {children}
    </p>
  )
}
