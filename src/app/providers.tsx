import { QueryClientProvider } from '@tanstack/react-query'
import { useState, type ReactNode } from 'react'
import { ThemeProvider } from '@/app/theme-provider'
import { createQueryClient } from '@/lib/swapi/queries'

export function Providers({ children }: { children: ReactNode }) {
  // Created once per mount rather than at module scope, so the cache is not
  // shared across test renders or a future SSR pass.
  const [queryClient] = useState(createQueryClient)

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </ThemeProvider>
  )
}
