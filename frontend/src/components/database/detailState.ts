export type DetailStatus = 'idle' | 'loading' | 'ready' | 'error'

export interface DetailState<T> {
  status: DetailStatus
  id: number | null
  data: T | null
  error: string
}

export function idleDetail<T>(): DetailState<T> {
  return { status: 'idle', id: null, data: null, error: '' }
}
