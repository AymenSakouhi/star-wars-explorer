import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { NotFoundPage } from '@/pages/not-found'
import { renderWithProviders } from '@/test/render'

describe('NotFoundPage', () => {
  it('shows a not-found heading and a way back', () => {
    renderWithProviders(<NotFoundPage />)

    expect(screen.getByRole('heading', { level: 1, name: /not found/i })).toBeInTheDocument()
    expect(screen.getByText(/error 404/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /back to the index/i })).toHaveAttribute('href', '/')
  })

  it('accepts a context-specific message', () => {
    renderWithProviders(<NotFoundPage message="That archive section does not exist." />)
    expect(screen.getByText('That archive section does not exist.')).toBeInTheDocument()
  })
})
