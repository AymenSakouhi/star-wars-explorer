import { screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Pagination } from '@/components/pagination'
import { renderWithProviders } from '@/test/render'

describe('Pagination', () => {
  it('renders nothing when everything fits on one page', () => {
    const { container } = renderWithProviders(
      <Pagination page={1} count={7} pageSize={10} onPageChange={vi.fn()} />,
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('reports the current position out of the total', () => {
    renderWithProviders(<Pagination page={2} count={87} pageSize={10} onPageChange={vi.fn()} />)
    expect(screen.getByText(/page 2 of 9/i)).toBeInTheDocument()
  })

  it('disables Previous on the first page', () => {
    renderWithProviders(<Pagination page={1} count={87} pageSize={10} onPageChange={vi.fn()} />)
    expect(screen.getByRole('button', { name: /previous/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /next/i })).toBeEnabled()
  })

  it('disables Next on the last page', () => {
    renderWithProviders(<Pagination page={9} count={87} pageSize={10} onPageChange={vi.fn()} />)
    expect(screen.getByRole('button', { name: /next/i })).toBeDisabled()
  })

  it('steps forwards and backwards', async () => {
    const onPageChange = vi.fn()
    const { user } = renderWithProviders(
      <Pagination page={4} count={87} pageSize={10} onPageChange={onPageChange} />,
    )

    await user.click(screen.getByRole('button', { name: /next/i }))
    expect(onPageChange).toHaveBeenLastCalledWith(5)

    await user.click(screen.getByRole('button', { name: /previous/i }))
    expect(onPageChange).toHaveBeenLastCalledWith(3)
  })
})
