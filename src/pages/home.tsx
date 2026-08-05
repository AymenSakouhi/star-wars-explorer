import { useQueries } from '@tanstack/react-query'
import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { listQuery } from '@/lib/swapi/queries'
import { RESOURCES } from '@/lib/swapi/resources'
import { RESOURCE_KEYS } from '@/lib/swapi/urls'

export function HomePage() {
  // Doubles as a prefetch: these are the exact queries each list page runs on
  // arrival, so showing the counts here makes clicking through instant.
  const sections = useQueries({
    queries: RESOURCE_KEYS.map((key) => listQuery(key, { page: 1, search: '' })),
  })

  return (
    <div className="grid gap-12">
      <header className="grid max-w-2xl gap-4">
        <p className="readout">Archive index</p>
        <h1 className="record-title text-5xl leading-[0.95] sm:text-6xl">
          Star Wars
          <br />
          Explorer
        </h1>
        <p className="text-muted-foreground text-base leading-relaxed">
          Every record is linked to the others, so you can follow a character to their homeworld,
          then on to the films it appears in.
        </p>
      </header>

      <ul className="border-hairline grid border-t border-l sm:grid-cols-2 lg:grid-cols-3">
        {RESOURCE_KEYS.map((key, index) => {
          const config = RESOURCES[key]
          const count = sections[index]?.data?.count

          return (
            <li key={key} className="border-hairline border-r border-b">
              <Link
                to={`/${key}`}
                className="hover:bg-muted/60 group flex h-full flex-col gap-2 p-5 transition-colors sm:min-h-40"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <h2 className="record-title text-foreground group-hover:text-archive text-2xl transition-colors">
                    {config.label}
                  </h2>
                  <ArrowUpRight
                    className="text-muted-foreground group-hover:text-archive size-4 shrink-0 transition-colors"
                    aria-hidden
                  />
                </div>

                <p className="text-muted-foreground flex-1 text-sm">{config.blurb}</p>

                <p className="readout text-archive">
                  {count === undefined ? ' ' : `${String(count)} records`}
                </p>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
