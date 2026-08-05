import type { ZodType } from 'zod'
import {
  filmSchema,
  personSchema,
  planetSchema,
  speciesSchema,
  starshipSchema,
  vehicleSchema,
  type Film,
  type Person,
  type Planet,
  type Species,
  type Starship,
  type SwapiEntity,
  type Vehicle,
} from '@/lib/swapi/schemas'
import type { ResourceKey } from '@/lib/swapi/urls'

/**
 * Everything the generic list and detail routes need to know about a resource.
 *
 * The six SWAPI resources share one envelope, one query interface, and one
 * identity scheme — they differ only in field names. Rather than six pairs of
 * near-identical pages, each resource contributes one config object here and
 * two generic components read from it. Adding a seventh resource is one entry
 * and zero new components.
 */
export type ResourceConfig<T extends SwapiEntity> = {
  /** Plural, for navigation and page headings. */
  label: string
  /** Singular, for the detail page's eyebrow. */
  singular: string
  schema: ZodType<T>
  title: (entity: T) => string
  /** Summary fields shown on a list card. Capped at three for readability. */
  listFields: readonly (keyof T & string)[]
  /** Fields shown in the detail table. Must not overlap `relations`. */
  detailFields: readonly (keyof T & string)[]
  /** Fields holding SWAPI URL strings, resolved and rendered as links. */
  relations: readonly (keyof T & string)[]
  /** Placeholder copy — SWAPI matches different fields per resource. */
  searchHint: string
  /** One line for the home page card. */
  blurb: string
}

/**
 * Identity, but it pins `T` per call site so each config's field names are
 * checked against that resource's inferred entity type. A typo in `listFields`
 * is a compile error here, not a blank cell in the UI.
 */
function defineResource<T extends SwapiEntity>(config: ResourceConfig<T>): ResourceConfig<T> {
  return config
}

const definitions = {
  people: defineResource<Person>({
    label: 'People',
    singular: 'Person',
    schema: personSchema,
    title: (person) => person.name,
    listFields: ['birth_year', 'gender', 'height'],
    detailFields: [
      'height',
      'mass',
      'hair_color',
      'skin_color',
      'eye_color',
      'birth_year',
      'gender',
    ],
    relations: ['homeworld', 'films', 'species', 'vehicles', 'starships'],
    searchHint: 'Search people by name',
    blurb: 'Characters from across the saga.',
  }),

  planets: defineResource<Planet>({
    label: 'Planets',
    singular: 'Planet',
    schema: planetSchema,
    title: (planet) => planet.name,
    listFields: ['climate', 'terrain', 'population'],
    detailFields: [
      'rotation_period',
      'orbital_period',
      'diameter',
      'climate',
      'gravity',
      'terrain',
      'surface_water',
      'population',
    ],
    relations: ['residents', 'films'],
    searchHint: 'Search planets by name',
    blurb: 'Worlds, moons, and the places in between.',
  }),

  films: defineResource<Film>({
    label: 'Films',
    singular: 'Film',
    schema: filmSchema,
    title: (film) => film.title,
    listFields: ['episode_id', 'director', 'release_date'],
    detailFields: ['episode_id', 'director', 'producer', 'release_date', 'opening_crawl'],
    relations: ['characters', 'planets', 'starships', 'vehicles', 'species'],
    searchHint: 'Search films by title',
    blurb: 'The seven films the archives know about.',
  }),

  species: defineResource<Species>({
    label: 'Species',
    singular: 'Species',
    schema: speciesSchema,
    title: (species) => species.name,
    listFields: ['classification', 'designation', 'language'],
    detailFields: [
      'classification',
      'designation',
      'average_height',
      'average_lifespan',
      'skin_colors',
      'hair_colors',
      'eye_colors',
      'language',
    ],
    relations: ['homeworld', 'people', 'films'],
    searchHint: 'Search species by name',
    blurb: 'Every sentient classification on record.',
  }),

  vehicles: defineResource<Vehicle>({
    label: 'Vehicles',
    singular: 'Vehicle',
    schema: vehicleSchema,
    title: (vehicle) => vehicle.name,
    listFields: ['model', 'manufacturer', 'vehicle_class'],
    detailFields: [
      'model',
      'manufacturer',
      'vehicle_class',
      'cost_in_credits',
      'length',
      'max_atmosphering_speed',
      'crew',
      'passengers',
      'cargo_capacity',
      'consumables',
    ],
    relations: ['pilots', 'films'],
    searchHint: 'Search vehicles by name or model',
    blurb: 'Ground and atmospheric craft.',
  }),

  starships: defineResource<Starship>({
    label: 'Starships',
    singular: 'Starship',
    schema: starshipSchema,
    title: (starship) => starship.name,
    listFields: ['model', 'manufacturer', 'starship_class'],
    detailFields: [
      'model',
      'manufacturer',
      'starship_class',
      'cost_in_credits',
      'length',
      'max_atmosphering_speed',
      'crew',
      'passengers',
      'cargo_capacity',
      'consumables',
      'hyperdrive_rating',
      'MGLT',
    ],
    relations: ['pilots', 'films'],
    searchHint: 'Search starships by name or model',
    blurb: 'Anything with a hyperdrive.',
  }),
} satisfies Record<ResourceKey, unknown>

/** A config with its entity type erased, for code that indexes by a runtime key. */
export type AnyResourceConfig = ResourceConfig<SwapiEntity>

/**
 * Each entry above is already checked against its own entity type by
 * `defineResource<T>`. This single widening lets the generic routes index the
 * registry with a `:resource` param that is only known at runtime.
 *
 * The cast is unavoidable rather than lazy: `title: (p: Person) => string` is
 * not assignable to `title: (e: SwapiEntity) => string` under contravariance,
 * even though at runtime `RESOURCES[key].title` is only ever called with an
 * entity that `RESOURCES[key].schema` just produced.
 */
export const RESOURCES = definitions as unknown as Record<ResourceKey, AnyResourceConfig>

export function getResource(key: ResourceKey): AnyResourceConfig {
  return RESOURCES[key]
}
