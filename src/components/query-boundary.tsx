import type { UseQueryResult } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
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
        <span className="sr-only">Loading</span>
        {skeleton ?? (
          <div className="grid gap-3">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-24 w-full" />
          </div>
        )}
      </div>
    )
  }

  if (query.isError) {
    const { error } = query
    const isSwapi = error instanceof SwapiError

    return (
      <Alert variant="destructive" role="alert">
        <AlertTitle>Could not load that</AlertTitle>
        <AlertDescription className="grid gap-3">
          <span>{isSwapi ? error.message : 'An unexpected error occurred.'}</span>

          {/* Hidden when retrying provably cannot help: a parse failure returns
              the same bad shape, and a 404 stays a 404. Offering the button
              anyway would just teach the user it does nothing. */}
          {(!isSwapi || error.isRetryable) && (
            <Button
              variant="outline"
              size="sm"
              className="w-fit"
              onClick={() => void query.refetch()}
            >
              Try again
            </Button>
          )}
        </AlertDescription>
      </Alert>
    )
  }

  if (isEmpty) {
    return (
      <p className="text-muted-foreground py-12 text-center" role="status">
        {emptyMessage}
      </p>
    )
  }

  return <>{children(query.data)}</>
}
