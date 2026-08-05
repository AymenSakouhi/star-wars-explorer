import { QueryClient } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { SwapiError } from '@/lib/swapi/client'
import {
  byUrlQuery,
  createQueryClient,
  detailQuery,
  listQuery,
  queryKeys,
} from '@/lib/swapi/queries'
import { server } from '@/test/msw/server'

const BASE = 'https://swapi.py4e.com/api'

function client() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } })
}

/** Resolves to the rejection reason, so it can be asserted on with a narrow type. */
function capture(promise: Promise<unknown>): Promise<SwapiError> {
  return promise.then(
    () => {
      throw new Error('expected the query to reject, but it resolved')
    },
    (error: unknown) => error as SwapiError,
  )
}

describe('queryKeys', () => {
  it('separates pages', () => {
    expect(queryKeys.list('people', { page: 1, search: '' })).not.toEqual(
      queryKeys.list('people', { page: 2, search: '' }),
    )
  })

  it('separates search terms', () => {
    expect(queryKeys.list('people', { page: 1, search: 'luke' })).not.toEqual(
      queryKeys.list('people', { page: 1, search: '' }),
    )
  })

  it('treats a padded search term as the same key, so whitespace does not split the cache', () => {
    expect(queryKeys.list('people', { page: 1, search: '  luke  ' })).toEqual(
      queryKeys.list('people', { page: 1, search: 'luke' }),
    )
  })

  it('scopes detail keys by resource, so planet 1 is not person 1', () => {
    expect(queryKeys.detail('people', '1')).not.toEqual(queryKeys.detail('planets', '1'))
  })
})

describe('listQuery', () => {
  it('fetches and validates a page', async () => {
    const page = await client().fetchQuery(listQuery('people', { page: 1, search: '' }))
    expect(page.count).toBe(87)
    expect(page.results[0]).toMatchObject({ name: 'Luke Skywalker' })
  })

  it('passes the search term to the API', async () => {
    const page = await client().fetchQuery(listQuery('people', { page: 1, search: 'luke' }))
    expect(page.results).toHaveLength(1)
  })

  it('trims the search term before sending it', async () => {
    const page = await client().fetchQuery(listQuery('people', { page: 1, search: '  luke  ' }))
    expect(page.results).toHaveLength(1)
  })

  it('requests the right page', async () => {
    const page = await client().fetchQuery(listQuery('people', { page: 2, search: '' }))
    expect(page.results[0]).toMatchObject({ name: 'Han Solo' })
  })

  it('returns an empty page when nothing matches', async () => {
    const page = await client().fetchQuery(listQuery('people', { page: 1, search: 'zzz' }))
    expect(page.count).toBe(0)
    expect(page.results).toEqual([])
  })

  it('works for every resource, not just people', async () => {
    const planets = await client().fetchQuery(listQuery('planets', { page: 1, search: '' }))
    expect(planets.results[0]).toMatchObject({ name: 'Tatooine' })

    const films = await client().fetchQuery(listQuery('films', { page: 1, search: '' }))
    expect(films.results[0]).toMatchObject({ title: 'A New Hope' })
  })
})

describe('detailQuery', () => {
  it('fetches and validates one entity', async () => {
    const person = await client().fetchQuery(detailQuery('people', '1'))
    expect(person).toMatchObject({ name: 'Luke Skywalker' })
  })

  it('rejects with a SwapiError carrying the status for a missing id', async () => {
    const error = await capture(client().fetchQuery(detailQuery('people', '999')))
    expect(error).toBeInstanceOf(SwapiError)
    expect(error.kind).toBe('http')
    expect(error.status).toBe(404)
  })
})

describe('byUrlQuery', () => {
  it('resolves a SWAPI relation URL to its entity', async () => {
    const planet = await client().fetchQuery(byUrlQuery(`${BASE}/planets/1/`))
    expect(planet).toMatchObject({ name: 'Tatooine' })
  })

  it('shares a cache key with the equivalent detail query', () => {
    // The point of the whole design: a planet loaded from the planets list is
    // not refetched when a character links to it.
    expect(byUrlQuery(`${BASE}/planets/1/`).queryKey).toEqual(detailQuery('planets', '1').queryKey)
  })

  it('serves a relation from cache when a detail query already loaded it', async () => {
    const queryClient = client()
    await queryClient.fetchQuery(detailQuery('planets', '1'))

    let hits = 0
    server.use(
      http.get(`${BASE}/planets/1/`, () => {
        hits += 1
        return HttpResponse.json({ detail: 'should not be reached' }, { status: 500 })
      }),
    )

    expect(queryClient.getQueryData(byUrlQuery(`${BASE}/planets/1/`).queryKey)).toBeDefined()
    expect(hits).toBe(0)
  })

  it('rejects a URL that is not a SWAPI resource, without hitting the network', async () => {
    const error = await capture(client().fetchQuery(byUrlQuery('https://example.com/nope/1/')))
    expect(error).toBeInstanceOf(SwapiError)
    expect(error.kind).toBe('parse')
  })
})

describe('createQueryClient', () => {
  const retryOf = (queryClient: QueryClient) => {
    const retry = queryClient.getDefaultOptions().queries?.retry
    if (typeof retry !== 'function') throw new Error('expected a retry predicate')
    return retry as (failureCount: number, error: Error) => boolean
  }

  it('never goes stale, because SWAPI data is immutable', () => {
    expect(createQueryClient().getDefaultOptions().queries?.staleTime).toBe(Infinity)
  })

  it('does not retry an error the client marked non-retryable', () => {
    const retry = retryOf(createQueryClient())
    expect(retry(0, new SwapiError('parse', 'bad shape'))).toBe(false)
    expect(retry(0, new SwapiError('http', 'gone', { status: 404 }))).toBe(false)
  })

  it('retries an error that might succeed next time', () => {
    const retry = retryOf(createQueryClient())
    expect(retry(0, new SwapiError('http', 'boom', { status: 500 }))).toBe(true)
    expect(retry(0, new SwapiError('network', 'offline'))).toBe(true)
  })

  it('gives up after a bounded number of attempts', () => {
    const retry = retryOf(createQueryClient())
    expect(retry(5, new SwapiError('http', 'boom', { status: 500 }))).toBe(false)
  })
})
