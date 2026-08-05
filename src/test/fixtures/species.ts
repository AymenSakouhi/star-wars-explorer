export const humanFixture = {
  name: 'Human',
  classification: 'mammal',
  designation: 'sentient',
  average_height: '180',
  skin_colors: 'caucasian, black, asian, hispanic',
  hair_colors: 'blonde, brown, black, red',
  eye_colors: 'brown, blue, green, hazel, grey, amber',
  average_lifespan: '120',
  homeworld: 'https://swapi.py4e.com/api/planets/9/',
  language: 'Galactic Basic',
  people: ['https://swapi.py4e.com/api/people/1/'],
  films: ['https://swapi.py4e.com/api/films/1/'],
  created: '2014-12-10T13:52:11.567000Z',
  edited: '2014-12-20T21:36:42.136000Z',
  url: 'https://swapi.py4e.com/api/species/1/',
}

/**
 * The one nullable field in the whole dataset: some species have no recorded
 * homeworld. Kept as a fixture so the schema cannot regress to a bare string.
 */
export const droidFixture = {
  ...humanFixture,
  name: 'Droid',
  classification: 'artificial',
  designation: 'sentient',
  average_height: 'n/a',
  skin_colors: 'n/a',
  hair_colors: 'n/a',
  eye_colors: 'n/a',
  average_lifespan: 'indefinite',
  homeworld: null,
  language: 'n/a',
  url: 'https://swapi.py4e.com/api/species/2/',
}
