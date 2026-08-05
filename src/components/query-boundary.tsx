import type { UseQueryResult } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { SwapiError } from '@/lib/swapi/client'

type Props<T> = {
  query: UseQueryResult<T, Error>
  children: (data: T) => ReactNode
  /** The caller decides what "empty" means — usually `results.length === 0`. */
  isEmpty?: boolean
  emptyMessage?: string
  /** A skeleton shaped like the real content, rather than a generic spinner. */
  skeleton?: ReactNode
}

/**
 * The four async states, in one place.
 *
 * Every screen renders through this, so none of them can accidentally handle
 * three of the four and leave the user staring at a blank page on the fourth.
 */
export function QueryBoundary<T>({
  query,
  children,
  isEmpty = false,
  emptyMessage = 'Nothing here.',
  skeleton,
}: Props<T>) {
  if (query.isPending) {
    return (
      <div role="status" aria-busy="true" aria-live="polite">
        <span className="sr-only">Loading records</span>
        {skeleton ?? (
          <div className="grid gap-3">
            <Skeleton className="h-8 w-1/3 rounded-none" />
            <Skeleton className="h-24 w-full rounded-none" />
          </div>
        )}
      </div>
    )
  }

  if (query.isError) {
    const { error } = query
    const isSwapi = error instanceof SwapiError

    return (
      <div role="alert" className="border-destructive/40 grid gap-3 border border-dashed p-6">
        <p className="readout text-destructive">Retrieval failed</p>
        <p className="text-sm">
          {isSwapi ? error.message : 'Something went wrong reading the archive.'}
        </p>

        {/* Hidden when retrying provably cannot help: a parse failure returns
            the same bad shape, and a 404 stays a 404. Offering the button
            anyway would just teach the user it does nothing. */}
        {(!isSwapi || error.isRetryable) && (
          <button
            type="button"
            className="border-hairline hover:border-archive hover:text-archive readout mt-1 w-fit border px-3 py-2 transition-colors"
            onClick={() => void query.refetch()}
          >
            Try again
          </button>
        )}
      </div>
    )
  }

  if (isEmpty) {
    return (
      <p
        role="status"
        className="text-muted-foreground border-hairline border border-dashed p-10 text-center text-sm"
      >
        {emptyMessage}
      </p>
    )
  }

  return <>{children(query.data)}</>
}
