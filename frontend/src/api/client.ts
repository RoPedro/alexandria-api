import { ApiError } from '../types/errors'
import { clearSession, readSession } from '../auth/storage'

const BASE = '/api/v1'

/** Fired when the API rejects a stored session, so the UI can drop it. */
export const SESSION_EXPIRED_EVENT = 'alexandria:session-expired'

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS'])

export interface RequestOptions {
  /**
   * Endpoints that must stay reachable without an admin session (sign in,
   * register). Every other mutating call is refused client-side.
   */
  skipAdminCheck?: boolean
}

interface DetailHolder {
  detail?: unknown
}

function messageFromDetail(
  detail: unknown,
  status: number,
  rawBody: string,
): string {
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) {
    const first = detail[0]
    if (first && typeof first === 'object' && 'msg' in first) {
      return String((first as { msg: unknown }).msg)
    }
    return 'Validation failed'
  }
  if (detail && typeof detail === 'object' && 'msg' in detail) {
    return String((detail as { msg: unknown }).msg)
  }
  const label =
    status >= 500 ? `Server error (${status})` : `Request failed (${status})`
  const text = rawBody.trim()
  if (text && text.length <= 200 && !text.startsWith('<')) {
    return `${label}: ${text}`
  }
  return label
}

export async function request<T>(
  path: string,
  init: RequestInit = {},
  options: RequestOptions = {},
): Promise<T> {
  const method = (init.method ?? 'GET').toUpperCase()

  // Guardrail: a session that is not an admin never issues a mutating call.
  // The API rejects it with 403 anyway; refusing here keeps the UI honest.
  if (!SAFE_METHODS.has(method) && !options.skipAdminCheck) {
    const session = readSession()
    if (!session || session.user.role !== 'admin') {
      throw new ApiError(
        403,
        'Administrator access is required for this action. Sign in as an administrator.',
      )
    }
  }

  const headers = new Headers(init.headers)
  if (typeof init.body === 'string' && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const session = readSession()
  if (session && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${session.token}`)
  }

  let response: Response
  try {
    response = await fetch(`${BASE}${path}`, { ...init, headers })
  } catch {
    throw new ApiError(0, 'Could not reach the API. Is the backend running?')
  }

  if (!response.ok) {
    let detail: unknown
    let raw = ''
    try {
      raw = await response.text()
      if (raw) detail = (JSON.parse(raw) as DetailHolder).detail
    } catch {
      detail = undefined
    }

    if (response.status === 401 && session) {
      // The stored session is no longer valid: drop it and let the app know.
      clearSession()
      window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT))
    }

    throw new ApiError(
      response.status,
      messageFromDetail(detail, response.status, raw),
    )
  }

  if (response.status === 204) {
    return undefined as T
  }

  const text = await response.text()
  if (!text) {
    return undefined as T
  }
  return JSON.parse(text) as T
}

export function postForm<T>(
  path: string,
  body: FormData,
  options: RequestOptions = {},
): Promise<T> {
  return request<T>(path, { method: 'POST', body }, options)
}

export function putForm<T>(
  path: string,
  body: FormData,
  options: RequestOptions = {},
): Promise<T> {
  return request<T>(path, { method: 'PUT', body }, options)
}

export function del<T>(path: string, options: RequestOptions = {}): Promise<T> {
  return request<T>(path, { method: 'DELETE' }, options)
}
