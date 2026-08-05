import { useQuery } from '@tanstack/react-query'
import { screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { QueryBoundary } from '@/components/query-boundary'
import { detailQuery } from '@/lib/swapi/queries'
import { server } from '@/test/msw/server'
import { renderWithProviders } from '@/test/render'

const BASE = 'https://swapi.py4e.com/api'

function Probe({ id, isEmpty = false }: { id: string; isEmpty?: boolean }) {
  const query = useQuery(detailQuery('people', id))

  return (
    <QueryBoundary query={query} isEmpty={isEmpty} emptyMessage="No matches">
      {(entity) => <p>{'name' in entity ? entity.name : 'no name'}</p>}
    </QueryBoundary>
  )
}

describe('QueryBoundary', () => {
  it('announces a busy status while loading, then renders the content', async () => {
    renderWithProviders(<Probe id="1" />)

    const status = screen.getByRole('status')
    expect(status).toHaveAttribute('aria-busy', 'true')

    expect(await screen.findByText('Luke Skywalker')).toBeInTheDocument()
  })

  it('shows the error message and a retry button when retrying could help', async () => {
    server.use(http.get(`${BASE}/people/1/`, () => new HttpResponse(null, { status: 500 })))
    renderWithProviders(<Probe id="1" />)

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent(/responded with 500/i)
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()
  })

  it('omits the retry button when retrying provably cannot help', async () => {
    renderWithProviders(<Probe id="999" />)

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent(/does not exist in the archives/i)
    expect(screen.queryByRole('button', { name: /try again/i })).not.toBeInTheDocument()
  })

  it('omits the retry button for a parse failure, since the shape will not change', async () => {
    server.use(http.get(`${BASE}/people/1/`, () => HttpResponse.json({ wrong: 'shape' })))
    renderWithProviders(<Probe id="1" />)

    await screen.findByRole('alert')
    expect(screen.queryByRole('button', { name: /try again/i })).not.toBeInTheDocument()
  })

  it('recovers when a retry succeeds', async () => {
    let failed = false
    server.use(
      http.get(`${BASE}/people/1/`, () => {
        if (failed) return HttpResponse.json({ ...lukeShape })
        failed = true
        return new HttpResponse(null, { status: 500 })
      }),
    )

    const { user } = renderWithProviders(<Probe id="1" />)
    await screen.findByRole('alert')

    await user.click(screen.getByRole('button', { name: /try again/i }))
    expect(await screen.findByText('Luke Skywalker')).toBeInTheDocument()
  })

  it('shows the empty message instead of the children when the caller reports no results', async () => {
    renderWithProviders(<Probe id="1" isEmpty />)

    expect(await screen.findByText('No matches')).toBeInTheDocument()
    expect(screen.queryByText('Luke Skywalker')).not.toBeInTheDocument()
  })
})

const lukeShape = {
  name: 'Luke Skywalker',
  height: '172',
  mass: '77',
  hair_color: 'blond',
  skin_color: 'fair',
  eye_color: 'blue',
  birth_year: '19BBY',
  gender: 'male',
  homeworld: `${BASE}/planets/1/`,
  films: [],
  species: [],
  vehicles: [],
  starships: [],
  created: '2014-12-09T13:50:51.644000Z',
  edited: '2014-12-20T21:17:56.891000Z',
  url: `${BASE}/people/1/`,
}
