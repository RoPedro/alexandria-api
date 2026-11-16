export type Role = 'admin' | 'user'

export interface SessionUser {
  id: number
  username: string
  role: Role
  is_active: boolean
}

export interface AuthSession {
  access_token: string
  token_type: string
  expires_at: string
  user: SessionUser
}
