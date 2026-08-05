import { Button } from '@/components/ui/button'

type Props = {
  page: number
  /** Total number of records, from SWAPI's `count`. */
  count: number
  pageSize: number
  onPageChange: (page: number) => void
}

export function Pagination({ page, count, pageSize, onPageChange }: Props) {
  const lastPage = Math.max(1, Math.ceil(count / pageSize))

  // Nothing to paginate through — render nothing rather than a dead control.
  if (lastPage <= 1) return null

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-4 pt-4">
      <Button
        variant="outline"
        size="sm"
        disabled={page <= 1}
        onClick={() => {
          onPageChange(page - 1)
        }}
      >
        Previous
      </Button>

      <span className="text-muted-foreground text-sm" aria-live="polite">
        Page {page} of {lastPage}
      </span>

      <Button
        variant="outline"
        size="sm"
        disabled={page >= lastPage}
        onClick={() => {
          onPageChange(page + 1)
        }}
      >
        Next
      </Button>
    </nav>
  )
}
