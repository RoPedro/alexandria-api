import { useCallback, useEffect, useState } from 'react'
import { ApiError } from '../types/errors'

interface ListState<T> {
  rows: T[]
  loading: boolean
  error: string | null
}

export function useEntityList<T>(fetcher: () => Promise<T[]>) {
  const [state, setState] = useState<ListState<T>>({
    rows: [],
    loading: true,
    error: null,
  })
  const [version, setVersion] = useState(0)

  const reload = useCallback(() => {
    setState((prev) => ({ ...prev, loading: true, error: null }))
    setVersion((v) => v + 1)
  }, [])

  useEffect(() => {
    let cancelled = false
    fetcher()
      .then((rows) => {
        if (!cancelled) setState({ rows, loading: false, error: null })
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setState({
            rows: [],
            loading: false,
            error: err instanceof ApiError ? err.message : 'Unexpected error',
          })
        }
      })
    return () => {
      cancelled = true
    }
  }, [fetcher, version])

  return { ...state, reload }
}
