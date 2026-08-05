import { useQuery } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { FieldList } from '@/components/field-list'
import { QueryBoundary } from '@/components/query-boundary'
import { RelatedLinks } from '@/components/related-links'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { formatLabel } from '@/lib/format'
import { detailQuery } from '@/lib/swapi/queries'
import { RESOURCES } from '@/lib/swapi/resources'
import { isResourceKey, type ResourceKey } from '@/lib/swapi/urls'
import { NotFoundPage } from '@/pages/not-found'

/**
 * SWAPI expresses a relation either as a single URL string (`homeworld`) or as
 * an array of them (`films`). Normalising to an array lets both go through one
 * rendering path instead of two near-identical branches.
 */
function relationUrls(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === 'string')
  if (typeof value === 'string' && value !== '') return [value]
  return []
}

export function ResourceDetailPage() {
  const { resource, id } = useParams()

  if (resource === undefined || id === undefined || !isResourceKey(resource)) {
    return <NotFoundPage message="No such archive." />
  }

  return <ResourceDetail key={`${resource}/${id}`} resource={resource} id={id} />
}

function ResourceDetail({ resource, id }: { resource: ResourceKey; id: string }) {
  const config = RESOURCES[resource]
  const query = useQuery(detailQuery(resource, id))

  return (
    <div className="grid gap-6">
      <Link
        to={`/${resource}`}
        className="text-muted-foreground hover:text-foreground inline-flex w-fit items-center gap-1 text-sm"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to {config.label}
      </Link>

      <QueryBoundary
        query={query}
        skeleton={
          <div className="grid gap-4">
            <Skeleton className="h-10 w-1/2" />
            <Skeleton className="h-40 w-full" />
          </div>
        }
      >
        {(entity) => {
          const record = entity as unknown as Record<string, unknown>

          return (
            <article className="grid gap-6">
              <header>
                <p className="text-muted-foreground text-xs tracking-widest uppercase">
                  {config.singular}
                </p>
                <h1 className="text-swapi text-3xl font-bold tracking-tight">
                  {config.title(entity)}
                </h1>
              </header>

              <FieldList entity={record} fields={config.detailFields} />

              <Separator />

              <div className="grid gap-5">
                {config.relations.map((relation) => (
                  <RelatedLinks
                    key={relation}
                    urls={relationUrls(record[relation])}
                    label={formatLabel(relation)}
                  />
                ))}
              </div>
            </article>
          )
        }}
      </QueryBoundary>
    </div>
  )
}
