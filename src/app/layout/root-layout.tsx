import { Link, NavLink, Outlet } from 'react-router-dom'
import { ThemeToggle } from '@/components/theme-toggle'
import { RESOURCES } from '@/lib/swapi/resources'
import { RESOURCE_KEYS } from '@/lib/swapi/urls'
import { cn } from '@/lib/utils'

export function RootLayout() {
  return (
    <div className="bg-background text-foreground flex min-h-screen flex-col">
      <a
        href="#main"
        className="bg-archive text-archive-foreground sr-only rounded px-3 py-2 text-sm font-medium focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50"
      >
        Skip to content
      </a>

      <header className="border-hairline bg-background/85 sticky top-0 z-40 border-b backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-6 px-5 py-3.5">
          <Link to="/" className="group flex shrink-0 items-baseline gap-2">
            <span className="record-title text-base leading-none">Star Wars</span>
            <span className="readout text-foreground/70 group-hover:text-foreground leading-none transition-colors">
              Explorer
            </span>
          </Link>

          {/* overflow-x-auto implies overflow-y: auto, so the links must not be
              taller than the list or a stray vertical scrollbar appears. They
              are inline-flex for exactly that reason. */}
          <nav aria-label="Archive sections" className="min-w-0 flex-1 overflow-x-auto">
            <ul className="flex gap-0.5">
              {RESOURCE_KEYS.map((key) => (
                <li key={key}>
                  <NavLink
                    to={`/${key}`}
                    className={({ isActive }) =>
                      cn(
                        'readout inline-flex items-center rounded px-2.5 py-1.5 whitespace-nowrap transition-colors',
                        isActive
                          ? 'text-archive bg-archive/10'
                          : 'hover:text-foreground hover:bg-muted',
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

      <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-5 py-10">
        <Outlet />
      </main>

      <footer className="border-hairline mt-8 border-t">
        <div className="text-muted-foreground mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-2 px-5 py-6 text-xs">
          <span className="readout">Star Wars Explorer</span>
          <span>
            Records from{' '}
            <a
              className="hover:text-foreground underline underline-offset-2"
              href="https://swapi.py4e.com/"
              rel="noreferrer"
              target="_blank"
            >
              swapi.py4e.com
            </a>
          </span>
        </div>
      </footer>
    </div>
  )
}
