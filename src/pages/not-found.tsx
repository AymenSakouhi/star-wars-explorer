import { Link } from 'react-router-dom'

export function NotFoundPage({
  message = 'That record is not in the archive.',
}: {
  message?: string
}) {
  return (
    <div className="grid gap-4 py-20">
      <p className="readout">Error 404</p>
      <h1 className="record-title text-5xl leading-none">Not found</h1>
      <p className="text-muted-foreground max-w-prose">{message}</p>
      <Link
        to="/"
        className="border-hairline hover:border-archive hover:text-archive readout mt-2 inline-flex w-fit items-center border px-4 py-2.5 transition-colors"
      >
        Back to the index
      </Link>
    </div>
  )
}
