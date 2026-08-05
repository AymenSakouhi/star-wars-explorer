export const tatooineFixture = {
  name: 'Tatooine',
  rotation_period: '23',
  orbital_period: '304',
  diameter: '10465',
  climate: 'arid',
  gravity: '1 standard',
  terrain: 'desert',
  surface_water: '1',
  population: '200000',
  residents: ['https://swapi.py4e.com/api/people/1/'],
  films: ['https://swapi.py4e.com/api/films/1/'],
  created: '2014-12-09T13:50:49.641000Z',
  edited: '2014-12-20T20:58:18.411000Z',
  url: 'https://swapi.py4e.com/api/planets/1/',
}

export const planetsPage1Fixture = {
  count: 61,
  next: 'https://swapi.py4e.com/api/planets/?page=2',
  previous: null,
  results: [tatooineFixture],
}
