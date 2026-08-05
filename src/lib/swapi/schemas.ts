import { z } from 'zod'

/**
 * Runtime shapes for the six SWAPI resources.
 *
 * Two decisions worth stating, because both look like mistakes otherwise:
 *
 * 1. Numeric-looking fields (`height`, `population`, `cost_in_credits`) are
 *    typed as strings. SWAPI sends them as strings and substitutes the
 *    sentinels "unknown" and "n/a" when a value is missing, so coercing to
 *    number here would either throw on real data or silently produce NaN.
 *    Formatting is presentation's job — see `@/lib/format`.
 *
 * 2. `url` is required on every entity. It is the only place identity appears
 *    in a SWAPI payload, so an entity without it cannot be routed to.
 */

const entityBase = {
  created: z.string(),
  edited: z.string(),
  url: z.string(),
}

export const personSchema = z.object({
  ...entityBase,
  name: z.string(),
  height: z.string(),
  mass: z.string(),
  hair_color: z.string(),
  skin_color: z.string(),
  eye_color: z.string(),
  birth_year: z.string(),
  gender: z.string(),
  homeworld: z.string(),
  films: z.array(z.string()),
  species: z.array(z.string()),
  vehicles: z.array(z.string()),
  starships: z.array(z.string()),
})

export const planetSchema = z.object({
  ...entityBase,
  name: z.string(),
  rotation_period: z.string(),
  orbital_period: z.string(),
  diameter: z.string(),
  climate: z.string(),
  gravity: z.string(),
  terrain: z.string(),
  surface_water: z.string(),
  population: z.string(),
  residents: z.array(z.string()),
  films: z.array(z.string()),
})

export const filmSchema = z.object({
  ...entityBase,
  title: z.string(),
  episode_id: z.number(),
  opening_crawl: z.string(),
  director: z.string(),
  producer: z.string(),
  release_date: z.string(),
  characters: z.array(z.string()),
  planets: z.array(z.string()),
  starships: z.array(z.string()),
  vehicles: z.array(z.string()),
  species: z.array(z.string()),
})

export const speciesSchema = z.object({
  ...entityBase,
  name: z.string(),
  classification: z.string(),
  designation: z.string(),
  average_height: z.string(),
  skin_colors: z.string(),
  hair_colors: z.string(),
  eye_colors: z.string(),
  average_lifespan: z.string(),
  // The only nullable field across all six resources: droids have no homeworld.
  homeworld: z.string().nullable(),
  language: z.string(),
  people: z.array(z.string()),
  films: z.array(z.string()),
})

export const vehicleSchema = z.object({
  ...entityBase,
  name: z.string(),
  model: z.string(),
  manufacturer: z.string(),
  cost_in_credits: z.string(),
  length: z.string(),
  max_atmosphering_speed: z.string(),
  crew: z.string(),
  passengers: z.string(),
  cargo_capacity: z.string(),
  consumables: z.string(),
  vehicle_class: z.string(),
  pilots: z.array(z.string()),
  films: z.array(z.string()),
})

export const starshipSchema = z.object({
  ...entityBase,
  name: z.string(),
  model: z.string(),
  manufacturer: z.string(),
  cost_in_credits: z.string(),
  length: z.string(),
  max_atmosphering_speed: z.string(),
  crew: z.string(),
  passengers: z.string(),
  cargo_capacity: z.string(),
  consumables: z.string(),
  hyperdrive_rating: z.string(),
  MGLT: z.string(),
  starship_class: z.string(),
  pilots: z.array(z.string()),
  films: z.array(z.string()),
})

/** Wraps an item schema in SWAPI's list envelope. */
export function paginated<T extends z.ZodType>(item: T) {
  return z.object({
    count: z.number(),
    next: z.string().nullable(),
    previous: z.string().nullable(),
    results: z.array(item),
  })
}

export type Person = z.infer<typeof personSchema>
export type Planet = z.infer<typeof planetSchema>
export type Film = z.infer<typeof filmSchema>
export type Species = z.infer<typeof speciesSchema>
export type Vehicle = z.infer<typeof vehicleSchema>
export type Starship = z.infer<typeof starshipSchema>

export type SwapiEntity = Person | Planet | Film | Species | Vehicle | Starship

export type Paginated<T> = {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}
