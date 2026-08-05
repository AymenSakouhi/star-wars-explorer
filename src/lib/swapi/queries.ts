import { QueryClient, queryOptions } from '@tanstack/react-query'
import { SwapiError, swapiFetch } from '@/lib/swapi/client'
import { RESOURCES } from '@/lib/swapi/resources'
import { paginated, type SwapiEntity } from '@/lib/swapi/schemas'
import { idFromUrl, resourceFromUrl, type ResourceKey } from '@/lib/swapi/urls'

export type ListParams = { page: number; search: string }

export const queryKeys = {
  list: (resource: ResourceKey, { page, search }: ListParams) =>
    ['swapi', resource, 'list', { page, search: search.trim() }] as const,
  detail: (resource: ResourceKey, id: string) => ['swapi', resource, 'detail', id] as const,
}

function listPath(resource: ResourceKey, { page, search }: ListParams): string {
  const params = new URLSearchParams()
  if (page > 1) params.set('page', String(page))
  if (search.trim()) params.set('search', search.trim())

  const query = params.toString()
  return `/${resource}/${query ? `?${query}` : ''}`
}

export function listQuery(resource: ResourceKey, params: ListParams) {
  const schema = paginated(RESOURCES[resource].schema)

  return queryOptions({
    queryKey: queryKeys.list(resource, params),
    queryFn: ({ signal }) => swapiFetch(listPath(resource, params), schema, { signal }),
  })
}

export function detailQuery(resource: ResourceKey, id: string) {
  return queryOptions({
    queryKey: queryKeys.detail(resource, id),
    queryFn: ({ signal }) =>
      swapiFetch(`/${resource}/${id}/`, RESOURCES[resource].schema, { signal }),
  })
}

/**
 * Resolves a relation URL from a detail payload.
 *
 * It deliberately delegates to `detailQuery`, so it shares a cache key with it:
 * a planet already loaded by the planets list is not refetched when a character
 * links to it, and five characters sharing a homeworld fetch it once between
 * them. That is the deduplication a hand-rolled store would otherwise need.
 */
export function byUrlQuery(url: string) {
  const resource = resourceFromUrl(url)
  const id = idFromUrl(url)

  // One `queryOptions` call rather than an early return, so the function has a
  // single return type. Branching would yield a union of two option shapes with
  // incompatible query keys, which every `fetchQuery`/`useQueries` call site
  // would then fail to typecheck against.
  const queryKey: readonly unknown[] =
    resource !== null && id !== null
      ? queryKeys.detail(resource, id)
      : ['swapi', 'unresolvable', url]

  return queryOptions({
    queryKey,
    queryFn: ({ signal }): Promise<SwapiEntity> => {
      if (resource === null || id === null) {
        return Promise.reject(
          new SwapiError('parse', `Not a recognised SWAPI resource URL: ${url}`),
        )
      }
      return swapiFetch(`/${resource}/${id}/`, RESOURCES[resource].schema, { signal })
    },
  })
}

const MAX_RETRIES = 2

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // SWAPI's dataset is immutable — the films shipped decades ago — so
        // nothing it returns can go stale. Revisiting a page refetches nothing.
        staleTime: Infinity,
        gcTime: 1000 * 60 * 60,
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
          if (failureCount >= MAX_RETRIES) return false
          return error instanceof SwapiError ? error.isRetryable : true
        },
      },
    },
  })
}
