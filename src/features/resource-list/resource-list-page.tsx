import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { EntityCard } from '@/components/entity-card'
import { Pagination } from '@/components/pagination'
import { QueryBoundary } from '@/components/query-boundary'
import { SearchInput } from '@/components/search-input'
import { Skeleton } from '@/components/ui/skeleton'
import { useListParams } from '@/features/resource-list/use-list-params'
import { detailQuery, listQuery } from '@/lib/swapi/queries'
import { RESOURCES } from '@/lib/swapi/resources'
import { detailPath, idFromUrl, isResourceKey, type ResourceKey } from '@/lib/swapi/urls'
import { NotFoundPage } from '@/pages/not-found'

/** SWAPI's page size is fixed and not reported in the payload. */
const PAGE_SIZE = 10

export function ResourceListPage() {
  const { resource } = useParams()

  if (resource === undefined || !isResourceKey(resource)) {
    return <NotFoundPage message="No such archive." />
  }

  // Keyed so switching resources remounts rather than briefly rendering one
  // resource's data through another's field configuration.
  return <ResourceList key={resource} resource={resource} />
}

function ResourceList({ resource }: { resource: ResourceKey }) {
  const config = RESOURCES[resource]
  const { page, search, setPage, setSearch } = useListParams()
  const queryClient = useQueryClient()

  const query = useQuery({
    ...listQuery(resource, { page, search }),
    // Keeps the current page on screen while the next one loads, instead of
    // replacing good content with a skeleton on every page change.
    placeholderData: keepPreviousData,
  })

  const label = config.label.toLowerCase()

  return (
    <div className="grid gap-6">
      <header className="grid gap-2">
        <h1 className="text-swapi text-2xl font-bold tracking-tight">{config.label}</h1>
        <p className="text-muted-foreground text-sm">{config.blurb}</p>
      </header>

      <SearchInput value={search} placeholder={config.searchHint} onChange={setSearch} />

      <p className="text-muted-foreground text-sm" aria-live="polite">
        {query.data ? `${String(query.data.count)} results` : ' '}
      </p>

      <QueryBoundary
        query={query}
        isEmpty={query.data?.results.length === 0}
        emptyMessage={search ? `No ${label} match “${search}”.` : `No ${label} on record.`}
        skeleton={
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: PAGE_SIZE }, (_, index) => (
              <Skeleton key={index} className="h-28 w-full" />
            ))}
          </div>
        }
      >
        {(pageData) => (
          <>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {pageData.results.map((entity) => {
                const id = idFromUrl(entity.url)
                if (id === null) return null

                return (
                  <li key={entity.url}>
                    <EntityCard
                      to={detailPath(resource, id)}
                      title={config.title(entity)}
                      fields={config.listFields.map((key) => ({
                        key,
                        value: (entity as unknown as Record<string, string | number>)[key] ?? '',
                      }))}
                      onActivateIntent={() => {
                        void queryClient.prefetchQuery(detailQuery(resource, id))
                      }}
                    />
                  </li>
                )
              })}
            </ul>

            <Pagination
              page={page}
              count={pageData.count}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
            />
          </>
        )}
      </QueryBoundary>
    </div>
  )
}
