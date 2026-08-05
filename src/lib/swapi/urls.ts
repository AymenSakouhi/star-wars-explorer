/**
 * SWAPI payloads carry no `id` field — an entity's identity exists only inside
 * its `url` string, and relations are expressed as absolute URLs to other
 * entities. Every route in this app therefore depends on parsing those strings,
 * which is why it lives in one tested module rather than as inline regexes.
 */

export const RESOURCE_KEYS = [
  'people',
  'planets',
  'films',
  'species',
  'vehicles',
  'starships',
] as const

export type ResourceKey = (typeof RESOURCE_KEYS)[number]

export function isResourceKey(value: string): value is ResourceKey {
  return (RESOURCE_KEYS as readonly string[]).includes(value)
}

/** `…/api/people/1/` -> `'1'`. Null when the URL has no numeric final segment. */
export function idFromUrl(url: string): string | null {
  return /\/(\d+)\/?$/.exec(url.trim())?.[1] ?? null
}

/** `…/api/planets/3/` -> `'planets'`. Null for list URLs and unknown resources. */
export function resourceFromUrl(url: string): ResourceKey | null {
  const match = /\/([a-z]+)\/\d+\/?$/.exec(url.trim())?.[1]
  return match !== undefined && isResourceKey(match) ? match : null
}

/** Builds an in-app route. */
export function detailPath(resource: ResourceKey, id: string): string {
  return `/${resource}/${id}`
}

/** `…/api/people/1/` -> `/people/1`. Null if the URL is not a SWAPI detail URL. */
export function pathFromUrl(url: string): string | null {
  const resource = resourceFromUrl(url)
  const id = idFromUrl(url)
  return resource !== null && id !== null ? detailPath(resource, id) : null
}
