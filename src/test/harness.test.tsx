import { useQuery } from '@tanstack/react-query'
import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderWithProviders } from '@/test/render'

/**
 * Proves the harness itself works end to end — provider wiring, MSW
 * interception, and jest-dom matchers — before any application code depends
 * on it.
 */
function Probe() {
  const query = useQuery({
    queryKey: ['probe'],
    queryFn: async () => {
      const response = await fetch('https://swapi.py4e.com/api/people/1/')
      return (await response.json()) as { name: string }
    },
  })
  return <p>{query.isPending ? 'Loading' : query.data?.name}</p>
}

describe('test harness', () => {
  it('renders through the providers and intercepts SWAPI with MSW', async () => {
    renderWithProviders(<Probe />)
    expect(screen.getByText('Loading')).toBeInTheDocument()
    expect(await screen.findByText('Luke Skywalker')).toBeInTheDocument()
  })
})
