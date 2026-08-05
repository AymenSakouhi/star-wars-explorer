import { http, HttpResponse } from 'msw'
import { filmsPage1Fixture, aNewHopeFixture } from '@/test/fixtures/films'
import {
  hanFixture,
  leiaFixture,
  lukeFixture,
  peopleEmptyFixture,
  peoplePage1Fixture,
  peoplePage2Fixture,
} from '@/test/fixtures/people'
import { planetsPage1Fixture, tatooineFixture } from '@/test/fixtures/planets'
import { droidFixture, humanFixture } from '@/test/fixtures/species'
import { xWingFixture } from '@/test/fixtures/starships'
import { sandCrawlerFixture } from '@/test/fixtures/vehicles'

const BASE = 'https://swapi.py4e.com/api'

export const handlers = [
  http.get(`${BASE}/people/`, ({ request }) => {
    const params = new URL(request.url).searchParams
    const search = params.get('search')

    if (search === 'zzz') return HttpResponse.json(peopleEmptyFixture)
    if (search === 'luke') {
      return HttpResponse.json({ count: 1, next: null, previous: null, results: [lukeFixture] })
    }
    if (params.get('page') === '2') return HttpResponse.json(peoplePage2Fixture)
    return HttpResponse.json(peoplePage1Fixture)
  }),
  http.get(`${BASE}/planets/`, () => HttpResponse.json(planetsPage1Fixture)),
  http.get(`${BASE}/films/`, () => HttpResponse.json(filmsPage1Fixture)),

  http.get(`${BASE}/people/1/`, () => HttpResponse.json(lukeFixture)),
  http.get(`${BASE}/people/5/`, () => HttpResponse.json(leiaFixture)),
  http.get(`${BASE}/people/14/`, () => HttpResponse.json(hanFixture)),
  http.get(`${BASE}/people/999/`, () =>
    HttpResponse.json({ detail: 'Not found' }, { status: 404 }),
  ),

  http.get(`${BASE}/planets/1/`, () => HttpResponse.json(tatooineFixture)),
  http.get(`${BASE}/planets/9/`, () =>
    HttpResponse.json({ ...tatooineFixture, name: 'Coruscant', url: `${BASE}/planets/9/` }),
  ),
  http.get(`${BASE}/films/1/`, () => HttpResponse.json(aNewHopeFixture)),
  http.get(`${BASE}/species/1/`, () => HttpResponse.json(humanFixture)),
  http.get(`${BASE}/species/2/`, () => HttpResponse.json(droidFixture)),
  http.get(`${BASE}/starships/10/`, () =>
    HttpResponse.json({ ...xWingFixture, name: 'Millennium Falcon', url: `${BASE}/starships/10/` }),
  ),
  http.get(`${BASE}/starships/12/`, () => HttpResponse.json(xWingFixture)),
  http.get(`${BASE}/vehicles/4/`, () => HttpResponse.json(sandCrawlerFixture)),
]
