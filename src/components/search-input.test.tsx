import { screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { SearchInput } from '@/components/search-input'
import { renderWithProviders } from '@/test/render'

describe('SearchInput', () => {
  it('is reachable by its placeholder as an accessible label', () => {
    renderWithProviders(
      <SearchInput value="" placeholder="Search people by name" onChange={vi.fn()} />,
    )
    expect(screen.getByLabelText('Search people by name')).toBeInTheDocument()
  })

  it('shows keystrokes immediately but commits only once, after the debounce', async () => {
    const onChange = vi.fn()
    const { user } = renderWithProviders(
      <SearchInput value="" placeholder="Search" onChange={onChange} />,
    )

    await user.type(screen.getByLabelText('Search'), 'luke')

    expect(screen.getByLabelText('Search')).toHaveValue('luke')
    await waitFor(() => {
      expect(onChange).toHaveBeenCalledExactlyOnceWith('luke')
    })
  })

  it('does not commit while the user is still typing', async () => {
    const onChange = vi.fn()
    const { user } = renderWithProviders(
      <SearchInput value="" placeholder="Search" onChange={onChange} />,
    )

    await user.type(screen.getByLabelText('Search'), 'lu')
    expect(onChange).not.toHaveBeenCalled()
  })

  it('resyncs when the committed value changes from outside, e.g. a back navigation', () => {
    const { rerender } = renderWithProviders(
      <SearchInput value="luke" placeholder="Search" onChange={vi.fn()} />,
    )
    expect(screen.getByLabelText('Search')).toHaveValue('luke')

    rerender(<SearchInput value="" placeholder="Search" onChange={vi.fn()} />)
    expect(screen.getByLabelText('Search')).toHaveValue('')
  })
})
