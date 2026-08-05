import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { NotFoundPage } from '@/pages/not-found'
import { renderWithProviders } from '@/test/render'

describe('NotFoundPage', () => {
  it('shows a 404 heading and a way back', () => {
    renderWithProviders(<NotFoundPage />)

    expect(screen.getByRole('heading', { level: 1, name: '404' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /back to the archives/i })).toHaveAttribute('href', '/')
  })

  it('accepts a context-specific message', () => {
    renderWithProviders(<NotFoundPage message="No such archive." />)
    expect(screen.getByText('No such archive.')).toBeInTheDocument()
  })
})
