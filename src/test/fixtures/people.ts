/**
 * Trimmed from real swapi.py4e.com responses. Field values are verbatim so the
 * schemas are tested against the shape the API actually returns — including its
 * "unknown" sentinels and its habit of sending numbers as strings.
 */

export const lukeFixture = {
  name: 'Luke Skywalker',
  height: '172',
  mass: '77',
  hair_color: 'blond',
  skin_color: 'fair',
  eye_color: 'blue',
  birth_year: '19BBY',
  gender: 'male',
  homeworld: 'https://swapi.py4e.com/api/planets/1/',
  films: ['https://swapi.py4e.com/api/films/1/'],
  species: [],
  vehicles: [],
  starships: ['https://swapi.py4e.com/api/starships/12/'],
  created: '2014-12-09T13:50:51.644000Z',
  edited: '2014-12-20T21:17:56.891000Z',
  url: 'https://swapi.py4e.com/api/people/1/',
}

export const leiaFixture = {
  ...lukeFixture,
  name: 'Leia Organa',
  height: '150',
  mass: 'unknown',
  hair_color: 'brown',
  skin_color: 'light',
  eye_color: 'brown',
  gender: 'female',
  vehicles: [],
  starships: [],
  url: 'https://swapi.py4e.com/api/people/5/',
}

export const hanFixture = {
  ...lukeFixture,
  name: 'Han Solo',
  height: '180',
  mass: '80',
  hair_color: 'brown',
  skin_color: 'fair',
  eye_color: 'brown',
  birth_year: '29BBY',
  gender: 'male',
  starships: ['https://swapi.py4e.com/api/starships/10/'],
  url: 'https://swapi.py4e.com/api/people/14/',
}

export const peoplePage1Fixture = {
  count: 87,
  next: 'https://swapi.py4e.com/api/people/?page=2',
  previous: null,
  results: [lukeFixture, leiaFixture],
}

export const peoplePage2Fixture = {
  count: 87,
  next: 'https://swapi.py4e.com/api/people/?page=3',
  previous: 'https://swapi.py4e.com/api/people/',
  results: [hanFixture],
}

export const peopleEmptyFixture = {
  count: 0,
  next: null,
  previous: null,
  results: [],
}
