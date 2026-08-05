import { Link, NavLink, Outlet } from 'react-router-dom'
import { ThemeToggle } from '@/components/theme-toggle'
import { RESOURCES } from '@/lib/swapi/resources'
import { RESOURCE_KEYS } from '@/lib/swapi/urls'
import { cn } from '@/lib/utils'

export function RootLayout() {
  return (
    <div className="bg-background text-foreground min-h-screen">
      <a
        href="#main"
        className="bg-swapi text-swapi-foreground sr-only rounded px-3 py-2 font-medium focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50"
      >
        Skip to content
      </a>

      <header className="border-border/60 bg-background/80 sticky top-0 z-40 border-b backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-4 py-3">
          <Link to="/" className="text-swapi font-bold tracking-widest uppercase">
            SWAPI
          </Link>

          <nav aria-label="Resources" className="flex-1 overflow-x-auto">
            <ul className="flex gap-1">
              {RESOURCE_KEYS.map((key) => (
                <li key={key}>
                  <NavLink
                    to={`/${key}`}
                    className={({ isActive }) =>
                      cn(
                        'hover:text-foreground rounded px-2 py-1 text-sm whitespace-nowrap transition-colors',
                        isActive ? 'text-swapi font-medium' : 'text-muted-foreground',
                      )
                    }
                  >
                    {RESOURCES[key].label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <ThemeToggle />
        </div>
      </header>

      <main id="main" className="mx-auto max-w-5xl px-4 py-8">
        <Outlet />
      </main>

      <footer className="text-muted-foreground mx-auto max-w-5xl px-4 py-8 text-xs">
        Data from{' '}
        <a
          className="hover:text-foreground underline"
          href="https://swapi.py4e.com/"
          rel="noreferrer"
          target="_blank"
        >
          swapi.py4e.com
        </a>
        .
      </footer>
    </div>
  )
}
