import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export function NotFoundPage({
  message = 'These are not the records you are looking for.',
}: {
  message?: string
}) {
  return (
    <div className="grid place-items-center gap-4 py-24 text-center">
      <div>
        <h1 className="text-swapi text-4xl font-bold">404</h1>
        <p className="text-muted-foreground mt-2">{message}</p>
        <Button asChild className="mt-6">
          <Link to="/">Back to the archives</Link>
        </Button>
      </div>
    </div>
  )
}
