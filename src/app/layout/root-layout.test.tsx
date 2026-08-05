import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { RootLayout } from '@/app/layout/root-layout'
import { RESOURCES } from '@/lib/swapi/resources'
import { RESOURCE_KEYS } from '@/lib/swapi/urls'
import { THEME_STORAGE_KEY } from '@/hooks/use-theme'
import { renderWithProviders } from '@/test/render'

describe('RootLayout', () => {
  it('offers a skip link that targets the main landmark', () => {
    renderWithProviders(<RootLayout />)

    expect(screen.getByRole('link', { name: /skip to content/i })).toHaveAttribute('href', '#main')
    expect(document.querySelector('main')).toHaveAttribute('id', 'main')
  })

  it('exposes the resource navigation as a labelled landmark', () => {
    renderWithProviders(<RootLayout />)

    const nav = screen.getByRole('navigation', { name: /archive sections/i })
    for (const key of RESOURCE_KEYS) {
      expect(nav).toHaveTextContent(RESOURCES[key].label)
    }
  })

  it('toggles the theme and persists the choice', async () => {
    const { user } = renderWithProviders(<RootLayout />)

    const initiallyDark = document.documentElement.classList.contains('dark')
    await user.click(screen.getByRole('button', { name: /switch to .* theme/i }))

    expect(document.documentElement.classList.contains('dark')).toBe(!initiallyDark)
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe(initiallyDark ? 'light' : 'dark')
  })

  it('credits the data source', () => {
    renderWithProviders(<RootLayout />)
    expect(screen.getByRole('link', { name: /swapi\.py4e\.com/i })).toHaveAttribute(
      'href',
      'https://swapi.py4e.com/',
    )
  })
})
