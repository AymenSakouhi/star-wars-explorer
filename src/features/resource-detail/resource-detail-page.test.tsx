import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ResourceDetailPage } from '@/features/resource-detail/resource-detail-page'
import { renderWithProviders } from '@/test/render'

function renderDetail(route: string) {
  return renderWithProviders(<ResourceDetailPage />, { path: '/:resource/:id', route })
}

describe('ResourceDetailPage', () => {
  it('renders the entity title as the page heading', async () => {
    renderDetail('/people/1')
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Luke Skywalker' }),
    ).toBeInTheDocument()
  })

  it('labels the entity with its resource, in the singular', async () => {
    renderDetail('/people/1')
    await screen.findByRole('heading', { level: 1, name: 'Luke Skywalker' })
    expect(screen.getByText('Person')).toBeInTheDocument()
  })

  it('renders the registry-configured detail fields with readable labels', async () => {
    renderDetail('/people/1')

    expect(await screen.findByText('Hair color')).toBeInTheDocument()
    expect(screen.getByText('blond')).toBeInTheDocument()
    expect(screen.getByText('Birth year')).toBeInTheDocument()
  })

  it('renders SWAPI sentinels as an em dash rather than the literal word', async () => {
    renderDetail('/people/5')
    await screen.findByRole('heading', { level: 1, name: 'Leia Organa' })

    // Leia's mass is the string "unknown" in the real dataset.
    expect(screen.queryByText('unknown')).not.toBeInTheDocument()
    expect(screen.getAllByText('—').length).toBeGreaterThan(0)
  })

  it('resolves relations into links to their own detail routes', async () => {
    renderDetail('/people/1')

    expect(await screen.findByRole('link', { name: 'Tatooine' })).toHaveAttribute(
      'href',
      '/planets/1',
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

  it('handles singular and plural relations through the same path', async () => {
    renderDetail('/people/1')
    await screen.findByRole('heading', { level: 1, name: 'Luke Skywalker' })

    // homeworld is one URL, films is an array — both get a labelled section.
    expect(screen.getByRole('heading', { name: 'Homeworld' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Films' })).toBeInTheDocument()
  })

  it('shows an empty relation without breaking the page', async () => {
    renderDetail('/people/1')
    await screen.findByRole('heading', { level: 1, name: 'Luke Skywalker' })

    // Luke's species array is empty in the fixture.
    expect(screen.getByRole('heading', { name: 'Species' })).toBeInTheDocument()
  })

  it('offers a way back to the list', async () => {
    renderDetail('/people/1')
    expect(await screen.findByRole('link', { name: /back to people/i })).toHaveAttribute(
      'href',
      '/people',
    )
  })

  it('shows a not-found error for an id that does not exist', async () => {
    renderDetail('/people/999')

    expect(await screen.findByRole('alert')).toBeInTheDocument()
    expect(screen.getByText(/does not exist in the archives/i)).toBeInTheDocument()
  })

  it('renders the 404 page for a resource SWAPI does not have', () => {
    renderDetail('/droids/1')
    expect(screen.getByRole('heading', { level: 1, name: '404' })).toBeInTheDocument()
  })

  it('works for a resource whose title field is not "name"', async () => {
    renderDetail('/films/1')
    expect(await screen.findByRole('heading', { level: 1, name: 'A New Hope' })).toBeInTheDocument()
  })

  it('handles a species with a null homeworld', async () => {
    renderDetail('/species/2')

    expect(await screen.findByRole('heading', { level: 1, name: 'Droid' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Homeworld' })).toBeInTheDocument()
  })
})
