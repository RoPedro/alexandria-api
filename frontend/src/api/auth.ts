import type { AuthSession, Role, SessionUser } from '../types/auth'
import { postForm, request } from './client'

// Sign in and register are the only mutating endpoints a regular user may
// reach, so they skip the client-side admin guard.
const PUBLIC = { skipAdminCheck: true }

export function register(
  username: string,
  password: string,
): Promise<AuthSession> {
  const form = new FormData()
  form.set('username', username)
  form.set('password', password)
  return postForm<AuthSession>('/auth/register', form, PUBLIC)
}

export function login(username: string, password: string): Promise<AuthSession> {
  const form = new FormData()
  form.set('username', username)
  form.set('password', password)
  return postForm<AuthSession>('/auth/login', form, PUBLIC)
}

/** The authoritative account behind the stored token. */
export function me(): Promise<SessionUser> {
  return request<SessionUser>('/auth/me')
}

/** Admin only: every account on the instance. */
export function listUsers(): Promise<SessionUser[]> {
  return request<SessionUser[]>('/auth/users')
}

/** Admin only: create an account with an explicit role. */
export function createUser(
  username: string,
  password: string,
  role: Role,
): Promise<SessionUser> {
  const form = new FormData()
  form.set('username', username)
  form.set('password', password)
  form.set('role', role)
  return postForm<SessionUser>('/auth/users', form)
}
