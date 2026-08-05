import { useQuery } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { FieldList } from '@/components/field-list'
import { QueryBoundary } from '@/components/query-boundary'
import { RelatedLinks } from '@/components/related-links'
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
    return <NotFoundPage message="That archive section does not exist." />
  }

  return <ResourceDetail key={`${resource}/${id}`} resource={resource} id={id} />
}

function ResourceDetail({ resource, id }: { resource: ResourceKey; id: string }) {
  const config = RESOURCES[resource]
  const query = useQuery(detailQuery(resource, id))

  return (
    <div className="grid gap-8">
      <Link
        to={`/${resource}`}
        className="readout hover:text-foreground inline-flex w-fit items-center gap-1.5 transition-colors"
      >
        <ArrowLeft className="size-3.5" aria-hidden />
        Back to {config.label}
      </Link>

      <QueryBoundary
        query={query}
        skeleton={
          <div className="grid gap-6">
            <Skeleton className="h-12 w-2/3 rounded-none" />
            <Skeleton className="h-48 w-full rounded-none" />
          </div>
        }
      >
        {(entity) => {
          const record = entity as unknown as Record<string, unknown>

          return (
            <article className="grid gap-10">
              <header className="border-hairline grid gap-3 border-b pb-6">
                {/* The catalog reference: class and record number. */}
                <p className="readout">{`Record · ${config.singular} · ${id.padStart(3, '0')}`}</p>
                <h1 className="record-title text-4xl leading-none sm:text-5xl">
                  {config.title(entity)}
                </h1>
              </header>

              <FieldList entity={record} fields={config.detailFields} />

              <section className="grid gap-6">
                <h2 className="readout text-foreground">Linked records</h2>
                <div className="grid gap-5">
                  {config.relations.map((relation) => (
                    <RelatedLinks
                      key={relation}
                      urls={relationUrls(record[relation])}
                      label={formatLabel(relation)}
                    />
                  ))}
                </div>
              </section>
            </article>
          )
        }}
      </QueryBoundary>
    </div>
  )
}
