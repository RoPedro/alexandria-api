import { ApiError } from '../types/errors'

const BASE = '/api/v1'

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
): Promise<T> {
  const headers = new Headers(init.headers)
  if (typeof init.body === 'string' && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
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

export function postForm<T>(path: string, body: FormData): Promise<T> {
  return request<T>(path, { method: 'POST', body })
}

export function putForm<T>(path: string, body: FormData): Promise<T> {
  return request<T>(path, { method: 'PUT', body })
}

export function del<T>(path: string): Promise<T> {
  return request<T>(path, { method: 'DELETE' })
}
