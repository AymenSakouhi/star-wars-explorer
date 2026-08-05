import { isRouteErrorResponse, useRouteError } from 'react-router-dom'
import { Button } from '@/components/ui/button'

/**
 * Last line of defence: a render-time crash or an unhandled router error. Data
 * errors never reach here — those are handled per-screen by QueryBoundary.
 */
export function ErrorFallback() {
  const error = useRouteError()

  const message = isRouteErrorResponse(error)
    ? `${String(error.status)} ${error.statusText}`
    : error instanceof Error
      ? error.message
      : 'Something went wrong.'

  return (
    <main className="mx-auto grid min-h-screen max-w-md place-items-center gap-4 p-6 text-center">
      <div>
        <h1 className="text-swapi text-2xl font-bold">A disturbance in the Force</h1>
        <p className="text-muted-foreground mt-2 text-sm">{message}</p>
        <Button
          className="mt-6"
          onClick={() => {
            window.location.assign('/')
          }}
        >
          Return to safety
        </Button>
      </div>
    </main>
  )
}
