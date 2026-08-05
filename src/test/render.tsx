import type { ReactElement } from 'react'
import { render, type RenderOptions } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'

/**
 * Retries off, so a test asserting an error state resolves immediately instead
 * of waiting through backoff and timing out. Caches are per-test, so nothing
 * leaks between them.
 */
export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: Infinity, gcTime: Infinity },
    },
  })
}

type Options = Omit<RenderOptions, 'wrapper'> & {
  /** The URL to start at, including search params. */
  route?: string
  /** The route pattern `ui` is mounted at, e.g. `/:resource/:id`. */
  path?: string
}

export function renderWithProviders(ui: ReactElement, options: Options = {}) {
  const { route = '/', path = '/', ...renderOptions } = options
  const client = createTestQueryClient()
  const router = createMemoryRouter([{ path, element: ui }], { initialEntries: [route] })

  return {
    user: userEvent.setup(),
    client,
    router,
    ...render(
      <QueryClientProvider client={client}>
        <RouterProvider router={router} />
      </QueryClientProvider>,
      renderOptions,
    ),
  }
}
