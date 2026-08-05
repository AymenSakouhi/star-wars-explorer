import { useQueries } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Skeleton } from '@/components/ui/skeleton'
import { EM_DASH } from '@/lib/format'
import { byUrlQuery } from '@/lib/swapi/queries'
import { RESOURCES } from '@/lib/swapi/resources'
import type { SwapiEntity } from '@/lib/swapi/schemas'
import { pathFromUrl, resourceFromUrl } from '@/lib/swapi/urls'

function titleOf(url: string, entity: SwapiEntity | undefined): string {
  const resource = resourceFromUrl(url)
  if (resource === null || entity === undefined) return url
  return RESOURCES[resource].title(entity)
}

type Props = {
  /** SWAPI relation URLs. A singular relation is passed as an array of one. */
  urls: readonly string[]
  label: string
}

/**
 * Turns a detail payload's relation URLs into links to their own detail routes,
 * which is what makes the six resources browsable as one connected graph.
 *
 * Each URL is its own query sharing a cache key with `detailQuery`, so a planet
 * already loaded elsewhere costs nothing here, and one unreachable relation
 * degrades to a single chip instead of failing the whole page.
 */
export function RelatedLinks({ urls, label }: Props) {
  const results = useQueries({ queries: urls.map((url) => byUrlQuery(url)) })

  return (
    <section className="grid gap-2 sm:grid-cols-[10rem_1fr] sm:gap-4">
      <h3 className="readout sm:pt-1.5">{label}</h3>

      {urls.length === 0 ? (
        <p className="text-muted-foreground text-sm">{EM_DASH}</p>
      ) : (
        <ul className="flex flex-wrap gap-1.5">
          {urls.map((url, index) => {
            const result = results[index]
            const path = pathFromUrl(url)

            if (result === undefined || result.isPending) {
              return (
                <li key={url}>
                  <Skeleton className="h-7 w-24 rounded-none" />
                </li>
              )
            }

            if (result.isError || path === null) {
              return (
                <li key={url}>
                  <span className="border-hairline text-muted-foreground inline-flex h-7 items-center border border-dashed px-2.5 text-xs">
                    Unavailable
                  </span>
                </li>
              )
            }

            return (
              <li key={url}>
                {/* Cyan is reserved for relations, so the colour itself tells
                    you this link goes deeper into the archive. */}
                <Link
                  to={path}
                  className="border-holo/30 text-holo hover:border-holo hover:bg-holo/10 inline-flex h-7 items-center border px-2.5 text-xs transition-colors"
                >
                  {titleOf(url, result.data)}
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
