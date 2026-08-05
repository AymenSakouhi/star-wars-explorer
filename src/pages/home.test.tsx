import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { HomePage } from '@/pages/home'
import { RESOURCES } from '@/lib/swapi/resources'
import { RESOURCE_KEYS } from '@/lib/swapi/urls'
import { renderWithProviders } from '@/test/render'

describe('HomePage', () => {
  it('links to every resource', () => {
    renderWithProviders(<HomePage />)

    for (const key of RESOURCE_KEYS) {
      const link = screen.getByRole('link', { name: new RegExp(RESOURCES[key].label, 'i') })
      expect(link, key).toHaveAttribute('href', `/${key}`)
    }
  })

  it('describes each resource, so the hub is more than a list of nouns', () => {
    renderWithProviders(<HomePage />)

    for (const key of RESOURCE_KEYS) {
      expect(screen.getByText(RESOURCES[key].blurb), key).toBeInTheDocument()
    }
  })

  it('has exactly one level-one heading', () => {
    renderWithProviders(<HomePage />)
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
  })
})
