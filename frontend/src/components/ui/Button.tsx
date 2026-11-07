import type { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'destructive'
}

export function Button({
  variant = 'secondary',
  type = 'button',
  className,
  ...rest
}: ButtonProps) {
  const classes = ['btn', `btn--${variant}`, className]
    .filter(Boolean)
    .join(' ')
  return <button type={type} className={classes} {...rest} />
}
