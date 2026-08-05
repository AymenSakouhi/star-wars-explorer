import { describe, expect, it } from 'vitest'
import {
  detailPath,
  idFromUrl,
  isResourceKey,
  pathFromUrl,
  resourceFromUrl,
} from '@/lib/swapi/urls'

describe('idFromUrl', () => {
  it('extracts the id from a trailing-slash URL', () => {
    expect(idFromUrl('https://swapi.py4e.com/api/people/1/')).toBe('1')
  })

  it('extracts the id when there is no trailing slash', () => {
    expect(idFromUrl('https://swapi.py4e.com/api/people/42')).toBe('42')
  })

  it('handles multi-digit ids', () => {
    expect(idFromUrl('https://swapi.py4e.com/api/starships/9001/')).toBe('9001')
  })

  it('tolerates surrounding whitespace', () => {
    expect(idFromUrl('  https://swapi.py4e.com/api/films/6/  ')).toBe('6')
  })

  it('returns null when there is no numeric segment', () => {
    expect(idFromUrl('https://swapi.py4e.com/api/people/')).toBeNull()
  })

  it('returns null for a non-URL string', () => {
    expect(idFromUrl('not a url')).toBeNull()
  })

  it('returns null for an empty string', () => {
    expect(idFromUrl('')).toBeNull()
  })
})

describe('resourceFromUrl', () => {
  it('extracts a known resource', () => {
    expect(resourceFromUrl('https://swapi.py4e.com/api/planets/3/')).toBe('planets')
  })

  it('works for every resource', () => {
    expect(resourceFromUrl('https://swapi.py4e.com/api/starships/12/')).toBe('starships')
    expect(resourceFromUrl('https://swapi.py4e.com/api/species/1/')).toBe('species')
  })

  it('returns null for a resource SWAPI does not have', () => {
    expect(resourceFromUrl('https://swapi.py4e.com/api/droids/3/')).toBeNull()
  })

  it('returns null for a non-URL string', () => {
    expect(resourceFromUrl('nope')).toBeNull()
  })

  it('returns null for a list URL with no id', () => {
    expect(resourceFromUrl('https://swapi.py4e.com/api/people/')).toBeNull()
  })
})

describe('isResourceKey', () => {
  it('accepts every real resource', () => {
    expect(isResourceKey('people')).toBe(true)
    expect(isResourceKey('planets')).toBe(true)
    expect(isResourceKey('films')).toBe(true)
    expect(isResourceKey('species')).toBe(true)
    expect(isResourceKey('vehicles')).toBe(true)
    expect(isResourceKey('starships')).toBe(true)
  })

  it('rejects anything else', () => {
    expect(isResourceKey('droids')).toBe(false)
    expect(isResourceKey('People')).toBe(false)
    expect(isResourceKey('')).toBe(false)
  })
})

describe('detailPath', () => {
  it('builds an app route', () => {
    expect(detailPath('films', '4')).toBe('/films/4')
  })
})

describe('pathFromUrl', () => {
  it('converts a SWAPI URL into an app route', () => {
    expect(pathFromUrl('https://swapi.py4e.com/api/people/1/')).toBe('/people/1')
  })

  it('returns null when the URL is not a resource detail URL', () => {
    expect(pathFromUrl('https://swapi.py4e.com/api/droids/1/')).toBeNull()
    expect(pathFromUrl('https://example.com/')).toBeNull()
  })
})
