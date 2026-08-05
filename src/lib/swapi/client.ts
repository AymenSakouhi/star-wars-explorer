import type { ZodType } from 'zod'

/**
 * swapi.dev was unreachable when this was built (connection failure, not an
 * error status), so the app defaults to the py4e mirror the assignment also
 * names. Override with VITE_SWAPI_BASE_URL — see .env.example.
 */
export const SWAPI_BASE_URL = import.meta.env.VITE_SWAPI_BASE_URL ?? 'https://swapi.py4e.com/api'

export type SwapiErrorKind = 'network' | 'http' | 'parse'

/**
 * One error type for the whole data layer, discriminated by cause so the UI can
 * decide both what to say and whether retrying could possibly help.
 */
export class SwapiError extends Error {
  readonly kind: SwapiErrorKind
  readonly status: number | undefined

  constructor(
    kind: SwapiErrorKind,
    message: string,
    options: { status?: number; cause?: unknown } = {},
  ) {
    super(message, { cause: options.cause })
    this.name = 'SwapiError'
    this.kind = kind
    this.status = options.status
  }

  /**
   * A parse failure means the API's shape changed — the same request returns
   * the same bad payload, so a retry only wastes the user's time. A 404 is
   * equally settled. Everything else is worth another attempt.
   */
  get isRetryable(): boolean {
    if (this.kind === 'parse') return false
    if (this.kind === 'http') return this.status !== 404
    return true
  }
}

function isAbortError(value: unknown): boolean {
  return (
    typeof value === 'object' && value !== null && 'name' in value && value.name === 'AbortError'
  )
}

/**
 * Fetches a SWAPI path and validates it against `schema` before returning.
 *
 * Validating here — at the one boundary where untrusted data enters — means an
 * unannounced API change surfaces as a named, visible error state instead of
 * `undefined` propagating three layers down into a render crash.
 */
export async function swapiFetch<T>(
  path: string,
  schema: ZodType<T>,
  init: { signal?: AbortSignal } = {},
): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${SWAPI_BASE_URL}${path}`, {
      signal: init.signal,
      headers: { Accept: 'application/json' },
    })
  } catch (cause) {
    // An abort is the caller's own doing — TanStack Query cancels in-flight
    // requests on unmount — so it must stay an AbortError, not become a
    // SwapiError that the UI would render as a failure.
    //
    // Matched by name rather than `instanceof DOMException`: under jsdom the
    // thrown exception comes from Node's realm and the global comes from
    // jsdom's, so the instance check silently fails there.
    if (isAbortError(cause)) throw cause
    throw new SwapiError('network', 'Could not reach the Star Wars API.', { cause })
  }

  if (!response.ok) {
    throw new SwapiError(
      'http',
      response.status === 404
        ? 'That record does not exist in the archives.'
        : `The Star Wars API responded with ${response.status}.`,
      { status: response.status },
    )
  }

  let json: unknown
  try {
    json = await response.json()
  } catch (cause) {
    throw new SwapiError('parse', 'The Star Wars API returned a malformed response.', { cause })
  }

  const result = schema.safeParse(json)
  if (!result.success) {
    throw new SwapiError('parse', 'The Star Wars API returned an unexpected shape.', {
      cause: result.error,
    })
  }

  return result.data
}
