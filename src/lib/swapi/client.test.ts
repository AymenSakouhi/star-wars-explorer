import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { SWAPI_BASE_URL, SwapiError, swapiFetch } from '@/lib/swapi/client'
import { paginated, personSchema } from '@/lib/swapi/schemas'
import { server } from '@/test/msw/server'

const BASE = 'https://swapi.py4e.com/api'

/** Resolves to the SwapiError instead of rejecting, so it can be asserted on. */
function capture(promise: Promise<unknown>): Promise<SwapiError> {
  return promise.then(
    () => {
      throw new Error('expected swapiFetch to reject, but it resolved')
    },
    (error: unknown) => error as SwapiError,
  )
}

describe('SWAPI_BASE_URL', () => {
  it('falls back to the py4e mirror, since swapi.dev is unreachable', () => {
    expect(SWAPI_BASE_URL).toBe(BASE)
  })
})

describe('swapiFetch', () => {
  it('returns parsed data on success', async () => {
    const person = await swapiFetch('/people/1/', personSchema)
    expect(person.name).toBe('Luke Skywalker')
  })

  it('parses a paginated envelope', async () => {
    const page = await swapiFetch('/people/', paginated(personSchema))
    expect(page.count).toBe(87)
  })

  it('throws an http SwapiError carrying the status on 404', async () => {
    const error = await capture(swapiFetch('/people/999/', personSchema))
    expect(error).toBeInstanceOf(SwapiError)
    expect(error.kind).toBe('http')
    expect(error.status).toBe(404)
  })

  it('marks a 404 as not retryable, because the record will not appear', async () => {
    const error = await capture(swapiFetch('/people/999/', personSchema))
    expect(error.isRetryable).toBe(false)
  })

  it('marks a 500 as retryable', async () => {
    server.use(http.get(`${BASE}/people/1/`, () => new HttpResponse(null, { status: 500 })))
    const error = await capture(swapiFetch('/people/1/', personSchema))
    expect(error.kind).toBe('http')
    expect(error.status).toBe(500)
    expect(error.isRetryable).toBe(true)
  })

  it('throws a parse SwapiError when the payload does not match the schema', async () => {
    server.use(http.get(`${BASE}/people/1/`, () => HttpResponse.json({ wrong: 'shape' })))
    const error = await capture(swapiFetch('/people/1/', personSchema))
    expect(error.kind).toBe('parse')
  })

  it('never retries a parse error, because the same request returns the same bad shape', async () => {
    server.use(http.get(`${BASE}/people/1/`, () => HttpResponse.json({ wrong: 'shape' })))
    const error = await capture(swapiFetch('/people/1/', personSchema))
    expect(error.isRetryable).toBe(false)
  })

  it('throws a parse SwapiError when the body is not JSON at all', async () => {
    server.use(http.get(`${BASE}/people/1/`, () => HttpResponse.text('<html>nope</html>')))
    const error = await capture(swapiFetch('/people/1/', personSchema))
    expect(error.kind).toBe('parse')
  })

  it('throws a retryable network SwapiError when the request fails outright', async () => {
    server.use(http.get(`${BASE}/people/1/`, () => HttpResponse.error()))
    const error = await capture(swapiFetch('/people/1/', personSchema))
    expect(error.kind).toBe('network')
    expect(error.isRetryable).toBe(true)
  })

  it('surfaces a human-readable message for every error kind', async () => {
    const notFound = await capture(swapiFetch('/people/999/', personSchema))
    expect(notFound.message).toMatch(/archives/i)

    server.use(http.get(`${BASE}/people/1/`, () => HttpResponse.error()))
    const offline = await capture(swapiFetch('/people/1/', personSchema))
    expect(offline.message).toMatch(/could not reach/i)
  })

  it('propagates an abort signal rather than dressing it as a SwapiError', async () => {
    const controller = new AbortController()
    controller.abort()
    const error = await capture(
      swapiFetch('/people/1/', personSchema, { signal: controller.signal }),
    )
    expect(error).not.toBeInstanceOf(SwapiError)
  })
})
