import { describe, expect, it } from 'vitest'
import { RESOURCES, getResource } from '@/lib/swapi/resources'
import { RESOURCE_KEYS } from '@/lib/swapi/urls'
import { aNewHopeFixture } from '@/test/fixtures/films'
import { lukeFixture } from '@/test/fixtures/people'
import { tatooineFixture } from '@/test/fixtures/planets'
import { humanFixture } from '@/test/fixtures/species'
import { xWingFixture } from '@/test/fixtures/starships'
import { sandCrawlerFixture } from '@/test/fixtures/vehicles'

const FIXTURES = {
  people: lukeFixture,
  planets: tatooineFixture,
  films: aNewHopeFixture,
  species: humanFixture,
  vehicles: sandCrawlerFixture,
  starships: xWingFixture,
} as const

describe('RESOURCES', () => {
  it('covers every resource key exactly, with no extras and none missing', () => {
    expect(Object.keys(RESOURCES).sort()).toEqual([...RESOURCE_KEYS].sort())
  })

  it('gives every resource the copy the UI needs', () => {
    for (const [key, config] of Object.entries(RESOURCES)) {
      expect(config.label, key).toBeTruthy()
      expect(config.singular, key).toBeTruthy()
      expect(config.searchHint, key).toBeTruthy()
      expect(config.blurb, key).toBeTruthy()
    }
  })

  it('derives a display title from an entity', () => {
    expect(RESOURCES.people.title(lukeFixture)).toBe('Luke Skywalker')
    expect(RESOURCES.films.title(aNewHopeFixture)).toBe('A New Hope')
    expect(RESOURCES.starships.title(xWingFixture)).toBe('X-wing')
  })

  it('only declares list and detail fields that exist on the parsed entity', () => {
    for (const key of RESOURCE_KEYS) {
      const config = RESOURCES[key]
      const entity = config.schema.parse(FIXTURES[key]) as Record<string, unknown>

      for (const field of [...config.listFields, ...config.detailFields]) {
        expect(entity, `${key}.${field}`).toHaveProperty(field)
      }
    }
  })

  it('only declares relations that exist and hold SWAPI URLs', () => {
    for (const key of RESOURCE_KEYS) {
      const config = RESOURCES[key]
      const entity = config.schema.parse(FIXTURES[key]) as Record<string, unknown>

      for (const relation of config.relations) {
        expect(entity, `${key}.${relation}`).toHaveProperty(relation)

        const value = entity[relation]
        const urls = Array.isArray(value) ? value : value === null ? [] : [value]
        for (const url of urls) {
          expect(String(url), `${key}.${relation}`).toContain('/api/')
        }
      }
    }
  })

  it('never lists a field as both a detail field and a relation', () => {
    for (const [key, config] of Object.entries(RESOURCES)) {
      const relations: readonly string[] = config.relations
      expect(
        config.detailFields.filter((field) => relations.includes(field)),
        key,
      ).toEqual([])
    }
  })

  it('keeps list cards readable by showing at most three fields', () => {
    for (const [key, config] of Object.entries(RESOURCES)) {
      expect(config.listFields.length, key).toBeLessThanOrEqual(3)
    }
  })
})

describe('getResource', () => {
  it('returns the config for a key', () => {
    expect(getResource('planets').label).toBe('Planets')
  })
})
