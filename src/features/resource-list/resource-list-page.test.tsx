import { screen, waitFor, within } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { ResourceListPage } from '@/features/resource-list/resource-list-page'
import { server } from '@/test/msw/server'
import { renderWithProviders } from '@/test/render'

const BASE = 'https://swapi.py4e.com/api'

function renderList(route = '/people') {
  return renderWithProviders(<ResourceListPage />, { path: '/:resource', route })
}

describe('ResourceListPage', () => {
  it('shows a loading status, then the results', async () => {
    renderList()
    expect(screen.getByRole('status')).toBeInTheDocument()

    expect(await screen.findByRole('heading', { name: 'Luke Skywalker' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Leia Organa' })).toBeInTheDocument()
  })

  it('announces the record count in a live region', async () => {
    renderList()
    const count = await screen.findByText(/87 records/i)
    expect(count).toHaveAttribute('aria-live', 'polite')
  })

  it('links each result to its detail route', async () => {
    renderList()
    expect(await screen.findByRole('link', { name: /Luke Skywalker/ })).toHaveAttribute(
      'href',
      '/people/1',
    )
  })

  it('uses the resource-specific search hint, since SWAPI matches different fields', async () => {
    renderList()
    expect(screen.getByLabelText('Search people by name')).toBeInTheDocument()

    renderList('/planets')
    expect(await screen.findByLabelText('Search planets by name')).toBeInTheDocument()
  })

  it('shows the registry-configured summary fields on each card', async () => {
    renderList()
    await screen.findByRole('heading', { name: 'Luke Skywalker' })

    const card = screen.getByRole('link', { name: /Luke Skywalker/ })
    expect(card).toHaveTextContent(/Birth year/i)
    expect(card).toHaveTextContent('19BBY')
  })

  it('shows each record’s catalog number', async () => {
    renderList()
    await screen.findByRole('heading', { name: 'Luke Skywalker' })

    expect(screen.getByRole('link', { name: /Luke Skywalker/ })).toHaveTextContent('001')
  })

  it('debounces typing into the query and filters the results', async () => {
    const { user } = renderList()
    await screen.findByRole('heading', { name: 'Luke Skywalker' })

    await user.type(screen.getByLabelText('Search people by name'), 'luke')

    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: 'Leia Organa' })).not.toBeInTheDocument()
    })
    expect(screen.getByRole('heading', { name: 'Luke Skywalker' })).toBeInTheDocument()
  })

  it('writes the search term to the URL so the view is shareable', async () => {
    const { user, router } = renderList()
    await screen.findByRole('heading', { name: 'Luke Skywalker' })

    await user.type(screen.getByLabelText('Search people by name'), 'luke')

    await waitFor(() => {
      expect(router.state.location.search).toBe('?q=luke')
    })
  })

  it('reads the initial search term from the URL', async () => {
    renderList('/people?q=luke')

    expect(await screen.findByRole('heading', { name: 'Luke Skywalker' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Leia Organa' })).not.toBeInTheDocument()
  })

  it('shows a search-specific empty message when nothing matches', async () => {
    renderList('/people?q=zzz')
    expect(await screen.findByText(/no people match “zzz”/i)).toBeInTheDocument()
  })

  it('paginates, and reflects the page in the URL', async () => {
    const { user, router } = renderList()
    await screen.findByRole('heading', { name: 'Luke Skywalker' })

    const pagination = screen.getByRole('navigation', { name: /pagination/i })
    expect(within(pagination).getByText(/page 1 of 9/i)).toBeInTheDocument()

    await user.click(within(pagination).getByRole('button', { name: /next/i }))

    expect(await screen.findByRole('heading', { name: 'Han Solo' })).toBeInTheDocument()
    expect(router.state.location.search).toBe('?page=2')
  })

  it('starts a new search from page one', async () => {
    const { user, router } = renderList('/people?page=2')
    await screen.findByRole('heading', { name: 'Han Solo' })

    await user.type(screen.getByLabelText('Search people by name'), 'luke')

    await waitFor(() => {
      expect(router.state.location.search).toBe('?q=luke')
    })
  })

  it('renders an error with a retry button when the request fails', async () => {
    server.use(http.get(`${BASE}/people/`, () => new HttpResponse(null, { status: 500 })))
    renderList()

    expect(await screen.findByRole('alert')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()
  })

  it('renders the not-found page for a resource SWAPI does not have', () => {
    renderList('/droids')
    expect(screen.getByRole('heading', { level: 1, name: /not found/i })).toBeInTheDocument()
  })

  it('works for every resource, not just people', async () => {
    renderList('/films')
    expect(await screen.findByRole('heading', { name: 'A New Hope' })).toBeInTheDocument()
  })
})
