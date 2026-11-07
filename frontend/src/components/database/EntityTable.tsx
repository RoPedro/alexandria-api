import { Fragment } from 'react'
import type { ReactNode } from 'react'

export interface Column<T> {
  key: string
  header: string
  cell: (row: T) => ReactNode
}

interface EntityTableProps<T> {
  caption: string
  rows: T[]
  columns: Column<T>[]
  getId: (row: T) => number
  getLabel: (row: T) => string
  expandedId: number | null
  onToggle: (row: T) => void
  renderDetail: (row: T) => ReactNode
}

export function EntityTable<T>({
  caption,
  rows,
  columns,
  getId,
  getLabel,
  expandedId,
  onToggle,
  renderDetail,
}: EntityTableProps<T>) {
  const totalColumns = columns.length + 1

  return (
    <div className="entity-table-wrap">
      <table className="entity-table">
        <caption className="visually-hidden">
          {caption}, {rows.length} results
        </caption>
        <thead>
          <tr>
            <th scope="col" className="entity-table__toggle-col">
              <span className="visually-hidden">Details</span>
            </th>
            {columns.map((column) => (
              <th key={column.key} scope="col">
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const id = getId(row)
            const expanded = expandedId === id
            return (
              <Fragment key={id}>
                <tr
                  className={
                    expanded
                      ? 'entity-table__row entity-table__row--expanded'
                      : 'entity-table__row'
                  }
                  onClick={() => onToggle(row)}
                >
                  <td className="entity-table__toggle-col">
                    <button
                      type="button"
                      className="entity-table__toggle"
                      aria-expanded={expanded}
                      aria-label={`${expanded ? 'Hide' : 'Show'} details for ${getLabel(row)}`}
                    >
                      <span aria-hidden="true">{expanded ? '▾' : '▸'}</span>
                    </button>
                  </td>
                  {columns.map((column) => (
                    <td key={column.key}>{column.cell(row)}</td>
                  ))}
                </tr>
                {expanded && (
                  <tr className="entity-table__detail-row">
                    <td colSpan={totalColumns}>{renderDetail(row)}</td>
                  </tr>
                )}
              </Fragment>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
