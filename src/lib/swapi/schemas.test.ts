import { describe, expect, it } from 'vitest'
import {
  filmSchema,
  paginated,
  personSchema,
  planetSchema,
  speciesSchema,
  starshipSchema,
  vehicleSchema,
} from '@/lib/swapi/schemas'
import { aNewHopeFixture } from '@/test/fixtures/films'
import { leiaFixture, lukeFixture, peoplePage1Fixture } from '@/test/fixtures/people'
import { tatooineFixture } from '@/test/fixtures/planets'
import { droidFixture, humanFixture } from '@/test/fixtures/species'
import { xWingFixture } from '@/test/fixtures/starships'
import { sandCrawlerFixture } from '@/test/fixtures/vehicles'

describe('personSchema', () => {
  it('parses a real person payload', () => {
    const person = personSchema.parse(lukeFixture)
    expect(person.name).toBe('Luke Skywalker')
    expect(person.films).toHaveLength(1)
    expect(person.url).toBe('https://swapi.py4e.com/api/people/1/')
  })

  it('keeps sentinel strings intact rather than coercing them away', () => {
    // Presentation decides how to show "unknown"; the schema must not lose it.
    expect(personSchema.parse(leiaFixture).mass).toBe('unknown')
  })

  it('keeps numeric-looking fields as strings, because SWAPI sends them that way', () => {
    expect(personSchema.parse(lukeFixture).height).toBe('172')
  })

  it('rejects a payload missing a required field', () => {
    const { name: _name, ...withoutName } = lukeFixture
    expect(() => personSchema.parse(withoutName)).toThrow()
  })

  it('rejects a payload missing url, since identity depends on it', () => {
    const { url: _url, ...withoutUrl } = lukeFixture
    expect(() => personSchema.parse(withoutUrl)).toThrow()
  })

  it('rejects a payload with the wrong type', () => {
    expect(() => personSchema.parse({ ...lukeFixture, films: 'not-an-array' })).toThrow()
  })
})

describe('planetSchema', () => {
  it('parses a real planet payload', () => {
    expect(planetSchema.parse(tatooineFixture).name).toBe('Tatooine')
  })
})

describe('filmSchema', () => {
  it('parses a real film payload and keeps episode_id numeric', () => {
    const film = filmSchema.parse(aNewHopeFixture)
    expect(film.title).toBe('A New Hope')
    expect(film.episode_id).toBe(4)
  })

  it('rejects a non-numeric episode_id', () => {
    expect(() => filmSchema.parse({ ...aNewHopeFixture, episode_id: '4' })).toThrow()
  })
})

describe('speciesSchema', () => {
  it('parses a species with a homeworld', () => {
    expect(speciesSchema.parse(humanFixture).homeworld).toContain('/planets/9/')
  })

  it('accepts a null homeworld, the one nullable field in the dataset', () => {
    expect(speciesSchema.parse(droidFixture).homeworld).toBeNull()
  })
})

describe('vehicleSchema', () => {
  it('parses a real vehicle payload', () => {
    expect(vehicleSchema.parse(sandCrawlerFixture).vehicle_class).toBe('wheeled')
  })
})

describe('starshipSchema', () => {
  it('parses a real starship payload including the MGLT field', () => {
    const starship = starshipSchema.parse(xWingFixture)
    expect(starship.starship_class).toBe('Starfighter')
    expect(starship.MGLT).toBe('100')
  })
})

describe('paginated', () => {
  it('parses the envelope around an item schema', () => {
    const page = paginated(personSchema).parse(peoplePage1Fixture)
    expect(page.count).toBe(87)
    expect(page.next).toContain('page=2')
    expect(page.previous).toBeNull()
    expect(page.results).toHaveLength(2)
    expect(page.results[0]?.name).toBe('Luke Skywalker')
  })

  it('rejects an envelope whose results do not match the item schema', () => {
    expect(() =>
      paginated(personSchema).parse({ ...peoplePage1Fixture, results: [{ nope: true }] }),
    ).toThrow()
  })

  it('rejects an envelope missing count', () => {
    const { count: _count, ...withoutCount } = peoplePage1Fixture
    expect(() => paginated(personSchema).parse(withoutCount)).toThrow()
  })
})
