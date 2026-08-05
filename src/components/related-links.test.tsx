import { screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { RelatedLinks } from '@/components/related-links'
import { server } from '@/test/msw/server'
import { renderWithProviders } from '@/test/render'

const BASE = 'https://swapi.py4e.com/api'

describe('RelatedLinks', () => {
  it('resolves each URL to a link carrying the entity name', async () => {
    renderWithProviders(<RelatedLinks urls={[`${BASE}/planets/1/`]} label="Homeworld" />)

    const link = await screen.findByRole('link', { name: 'Tatooine' })
    expect(link).toHaveAttribute('href', '/planets/1')
  })

  it('resolves several relations of different resource types', async () => {
    renderWithProviders(
      <RelatedLinks urls={[`${BASE}/films/1/`, `${BASE}/starships/12/`]} label="Appears in" />,
    )

    expect(await screen.findByRole('link', { name: 'A New Hope' })).toHaveAttribute(
      'href',
      '/films/1',
    )
    expect(await screen.findByRole('link', { name: 'X-wing' })).toHaveAttribute(
      'href',
      '/starships/12',
    )
  })

  it('shows an em dash when the relation is empty', () => {
    renderWithProviders(<RelatedLinks urls={[]} label="Vehicles" />)

    expect(screen.getByRole('heading', { name: 'Vehicles' })).toBeInTheDocument()
    expect(screen.getByText('—')).toBeInTheDocument()
  })

  it('degrades one broken relation to a chip instead of failing the whole list', async () => {
    server.use(http.get(`${BASE}/starships/12/`, () => new HttpResponse(null, { status: 500 })))

    renderWithProviders(
      <RelatedLinks urls={[`${BASE}/films/1/`, `${BASE}/starships/12/`]} label="Related" />,
    )

    expect(await screen.findByRole('link', { name: 'A New Hope' })).toBeInTheDocument()
    expect(await screen.findByText('Unavailable')).toBeInTheDocument()
  })
})
