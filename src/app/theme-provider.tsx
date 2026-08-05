import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { ThemeContext, THEME_STORAGE_KEY, type Theme } from '@/hooks/use-theme'

/**
 * Dark is the default, deliberately: the archive readout is designed dark
 * first, and `prefers-color-scheme` is ignored so a visitor on a light desktop
 * still lands on the intended look. A stored choice always wins, so anyone who
 * picks light keeps it.
 *
 * Mirrors the inline script in index.html, which applies the same rule before
 * first paint so the page never flashes the wrong theme. Keep the two in step.
 */
function readInitialTheme(): Theme {
  const stored = localStorage.getItem(THEME_STORAGE_KEY)
  return stored === 'light' ? 'light' : 'dark'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(readInitialTheme)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  }, [theme])

  const toggle = useCallback(() => {
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'))
  }, [])

  return <ThemeContext value={{ theme, toggle }}>{children}</ThemeContext>
}
