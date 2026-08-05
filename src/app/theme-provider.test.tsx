import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ThemeProvider } from '@/app/theme-provider'
import { THEME_STORAGE_KEY, useTheme } from '@/hooks/use-theme'

function Probe() {
  const { theme, toggle } = useTheme()
  return (
    <button type="button" onClick={toggle}>
      theme: {theme}
    </button>
  )
}

function renderProvider() {
  return render(
    <ThemeProvider>
      <Probe />
    </ThemeProvider>,
  )
}

describe('ThemeProvider', () => {
  beforeEach(() => {
    localStorage.clear()
    // The class is set on the real document, which outlives an unmount.
    document.documentElement.classList.remove('dark')
  })

  it('defaults to dark', () => {
    renderProvider()

    expect(screen.getByRole('button')).toHaveTextContent('theme: dark')
    expect(document.documentElement).toHaveClass('dark')
  })

  it('ignores a light OS preference, so every visitor lands on the intended look', () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
    )

    renderProvider()

    expect(screen.getByRole('button')).toHaveTextContent('theme: dark')
    vi.unstubAllGlobals()
  })

  it('honours a stored light choice over the default', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'light')
    renderProvider()

    expect(screen.getByRole('button')).toHaveTextContent('theme: light')
    expect(document.documentElement).not.toHaveClass('dark')
  })

  it('falls back to dark if the stored value is not a theme', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'chartreuse')
    renderProvider()

    expect(screen.getByRole('button')).toHaveTextContent('theme: dark')
  })

  it('persists a toggle so the choice survives a reload', async () => {
    const user = userEvent.setup()
    renderProvider()

    await user.click(screen.getByRole('button'))

    expect(screen.getByRole('button')).toHaveTextContent('theme: light')
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light')
    expect(document.documentElement).not.toHaveClass('dark')
  })
})

describe('useTheme', () => {
  it('fails loudly when used outside a provider', () => {
    // React logs the thrown error; silence it so the run stays readable.
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => render(<Probe />)).toThrow(/must be used inside a ThemeProvider/)

    consoleError.mockRestore()
  })
})
