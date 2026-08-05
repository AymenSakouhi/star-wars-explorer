import { useQueries } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
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
 * degrades to a single "Unavailable" chip instead of failing the whole page.
 */
export function RelatedLinks({ urls, label }: Props) {
  const results = useQueries({ queries: urls.map((url) => byUrlQuery(url)) })

  return (
    <section>
      <h3 className="text-muted-foreground text-xs tracking-wide uppercase">{label}</h3>

      {urls.length === 0 ? (
        <p className="mt-2 text-sm">{EM_DASH}</p>
      ) : (
        <ul className="mt-2 flex flex-wrap gap-2">
          {urls.map((url, index) => {
            const result = results[index]
            const path = pathFromUrl(url)

            if (result === undefined || result.isPending) {
              return (
                <li key={url}>
                  <Skeleton className="h-6 w-24 rounded-full" />
                </li>
              )
            }

            if (result.isError || path === null) {
              return (
                <li key={url}>
                  <Badge variant="outline" className="text-muted-foreground">
                    Unavailable
                  </Badge>
                </li>
              )
            }

            return (
              <li key={url}>
                <Badge asChild variant="secondary" className="hover:border-swapi">
                  <Link to={path}>{titleOf(url, result.data)}</Link>
                </Badge>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
