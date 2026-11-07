import type { ReactNode } from 'react'
import type { Column } from './EntityTable'
import { EntityTable } from './EntityTable'
import type { DetailState } from './detailState'
import { Button } from '../ui/Button'
import { EmptyState } from '../ui/EmptyState'
import { ErrorState } from '../ui/ErrorState'
import { Skeleton } from '../ui/Skeleton'

interface EntityListViewProps<T> {
  caption: string
  rows: T[]
  total: number
  columns: Column<T>[]
  getId: (row: T) => number
  getLabel: (row: T) => string
  expandedId: number | null
  onToggle: (row: T) => void
  renderDetail: (row: T) => ReactNode
  detail: DetailState<T>
  onRetryDetail: (id: number) => void

  searchLabel: string
  searchPlaceholder: string
  query: string
  onQueryChange: (value: string) => void
  countLabel: string
  primaryAction: ReactNode

  loading: boolean
  error: string | null
  onRetry: () => void
  emptyTitle: string
  emptyDescription: string
  filteredEmptyTitle: string
  filteredEmptyDescription: string
}

export function EntityListView<T>({
  caption,
  rows,
  total,
  columns,
  getId,
  getLabel,
  expandedId,
  onToggle,
  renderDetail,
  detail,
  onRetryDetail,
  searchLabel,
  searchPlaceholder,
  query,
  onQueryChange,
  countLabel,
  primaryAction,
  loading,
  error,
  onRetry,
  emptyTitle,
  emptyDescription,
  filteredEmptyTitle,
  filteredEmptyDescription,
}: EntityListViewProps<T>) {
  const showSkeleton = loading && total === 0 && !error
  const showEmpty = !error && !loading && total === 0
  const showFilteredEmpty = !error && !loading && total > 0 && rows.length === 0
  const showTable = !error && rows.length > 0

  return (
    <div className="entity-view">
      <div className="entity-toolbar">
        <div className="entity-toolbar__search">
          <label className="visually-hidden" htmlFor="entity-search">
            {searchLabel}
          </label>
          <input
            id="entity-search"
            type="search"
            placeholder={searchPlaceholder}
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
          />
        </div>
        <span className="entity-toolbar__count">{countLabel}</span>
        {primaryAction}
      </div>

      {showSkeleton && (
        <div className="skeleton-list" aria-hidden="true">
          {[0, 1, 2, 3].map((index) => (
            <div key={index} className="skeleton-row">
              <Skeleton width="1.5rem" />
              <Skeleton width="35%" />
              <Skeleton width="25%" />
              <Skeleton width="20%" />
            </div>
          ))}
          <p className="visually-hidden" role="status">
            Loading records…
          </p>
        </div>
      )}

      {error && <ErrorState message={error} onRetry={onRetry} />}

      {showEmpty && (
        <EmptyState title={emptyTitle} description={emptyDescription} />
      )}

      {showFilteredEmpty && (
        <EmptyState
          title={filteredEmptyTitle}
          description={filteredEmptyDescription}
        />
      )}

      {showTable && (
        <EntityTable
          caption={caption}
          rows={rows}
          columns={columns}
          getId={getId}
          getLabel={getLabel}
          expandedId={expandedId}
          onToggle={onToggle}
          renderDetail={(row) => {
            if (detail.id !== getId(row)) return null
            if (detail.status === 'loading') {
              return (
                <p className="detail__loading" role="status">
                  Loading details…
                </p>
              )
            }
            if (detail.status === 'error') {
              return (
                <div className="detail__error" role="alert">
                  <p>{detail.error}</p>
                  <Button
                    variant="secondary"
                    onClick={() => onRetryDetail(getId(row))}
                  >
                    Try again
                  </Button>
                </div>
              )
            }
            return renderDetail(row)
          }}
        />
      )}
    </div>
  )
}
