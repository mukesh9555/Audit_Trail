import { useCallback, useEffect, useRef, useState } from 'react'

interface AsyncState<T> {
  data: T | null
  loading: boolean
  error: string | null
  reload: () => void
}

/** Runs a Promise-returning loader, tracks loading/error, and ignores stale responses. */
export function useAsync<T>(loader: () => Promise<T>, deps: ReadonlyArray<unknown>): AsyncState<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)
  const requestId = useRef(0)

  useEffect(() => {
    const id = ++requestId.current
    setLoading(true)
    setError(null)
    loader()
      .then((result) => {
        if (id === requestId.current) {
          setData(result)
          setLoading(false)
        }
      })
      .catch((e: unknown) => {
        if (id === requestId.current) {
          setError(e instanceof Error ? e.message : 'Something went wrong.')
          setLoading(false)
        }
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick])

  const reload = useCallback(() => setTick((t) => t + 1), [])
  return { data, loading, error, reload }
}
