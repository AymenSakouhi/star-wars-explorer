import { createContext, use } from 'react'

export type Theme = 'dark' | 'light'

export const THEME_STORAGE_KEY = 'swapi-theme'

export type ThemeContextValue = { theme: Theme; toggle: () => void }

export const ThemeContext = createContext<ThemeContextValue | null>(null)

export function useTheme(): ThemeContextValue {
  const context = use(ThemeContext)
  if (!context) throw new Error('useTheme must be used inside a ThemeProvider')
  return context
}
