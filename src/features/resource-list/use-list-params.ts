import { useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'

export type ListParamsState = {
  page: number
  search: string
  setPage: (page: number) => void
  setSearch: (search: string) => void
}

/**
 * Search term and page live in the URL rather than in component state.
 *
 * That makes every view shareable and restorable: pasting `/people?q=sky&page=2`
 * into a fresh tab lands exactly where the link points, refreshing preserves
 * the view, and the back button steps between searches.
 */
export function useListParams(): ListParamsState {
  const [params, setParams] = useSearchParams()

  const search = params.get('q') ?? ''

  const parsedPage = Number.parseInt(params.get('page') ?? '1', 10)
  const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1

  const setSearch = useCallback(
    (value: string) => {
      setParams(
        (previous) => {
          const next = new URLSearchParams(previous)
          const trimmed = value.trim()

          if (trimmed) next.set('q', trimmed)
          else next.delete('q')

          // A new search always starts at the beginning; page 4 of the previous
          // search is meaningless against a different result set.
          next.delete('page')
          return next
        },
        // Replace rather than push: the debounce already collapses keystrokes,
        // and a search should be one history entry, not one per commit.
        { replace: true },
      )
    },
    [setParams],
  )

  const setPage = useCallback(
    (value: number) => {
      setParams((previous) => {
        const next = new URLSearchParams(previous)
        if (value > 1) next.set('page', String(value))
        else next.delete('page')
        return next
      })
    },
    [setParams],
  )

  return { page, search, setPage, setSearch }
}
