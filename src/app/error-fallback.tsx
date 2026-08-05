import { isRouteErrorResponse, useRouteError } from 'react-router-dom'

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
      : 'The archive terminal stopped responding.'

  return (
    <main className="bg-background text-foreground min-h-screen">
      <div className="mx-auto grid max-w-2xl gap-4 px-5 py-24">
        <p className="readout text-destructive">Terminal fault</p>
        <h1 className="record-title text-4xl leading-none">Something broke</h1>
        <p className="text-muted-foreground text-sm">{message}</p>
        <button
          type="button"
          className="border-hairline hover:border-archive hover:text-archive readout mt-2 w-fit border px-4 py-2.5 transition-colors"
          onClick={() => {
            window.location.assign('/')
          }}
        >
          Reload the index
        </button>
      </div>
    </main>
  )
}
