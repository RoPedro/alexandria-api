import { useState } from 'react'
import { getBook, listBooks } from '../../../api/books'
import { useEntityList } from '../../../hooks/useEntityList'
import type { Book } from '../../../types/book'
import { ApiError } from '../../../types/errors'
import { Button } from '../../ui/Button'
import { Drawer } from '../../ui/Drawer'
import { StatusMessage } from '../../ui/StatusMessage'
import type { DetailState } from '../detailState'
import { EntityListView } from '../EntityListView'
import { idleDetail } from '../detailState'
import type { Column } from '../EntityTable'
import { BookDetail } from '../details/BookDetail'
import { BookForm } from '../forms/BookForm'

type Status = { variant: 'success' | 'error'; text: string } | null

const COLUMNS: Column<Book>[] = [
  { key: 'id', header: 'ID', cell: (book) => book.id },
  { key: 'title', header: 'Title', cell: (book) => book.title },
  { key: 'isbn', header: 'ISBN', cell: (book) => book.isbn },
  { key: 'genre', header: 'Genre', cell: (book) => book.genre.name },
]

export function BooksView() {
  const { rows, loading, error, reload } = useEntityList(listBooks)
  const [query, setQuery] = useState('')
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [detail, setDetail] = useState<DetailState<Book>>(idleDetail<Book>)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [status, setStatus] = useState<Status>(null)

  const normalizedQuery = query.trim().toLowerCase()
  const filtered = rows.filter((book) =>
    `${book.id} ${book.title} ${book.isbn} ${book.genre.name}`
      .toLowerCase()
      .includes(normalizedQuery),
  )

  const loadDetail = (id: number) => {
    setDetail({ status: 'loading', id, data: null, error: '' })
    getBook(id)
      .then((data) =>
        setDetail((prev) =>
          prev.id === id ? { status: 'ready', id, data, error: '' } : prev,
        ),
      )
      .catch((err: unknown) =>
        setDetail((prev) =>
          prev.id === id
            ? {
                status: 'error',
                id,
                data: null,
                error:
                  err instanceof ApiError ? err.message : 'Unexpected error',
              }
            : prev,
        ),
      )
  }

  const toggle = (book: Book) => {
    if (expandedId === book.id) {
      setExpandedId(null)
      setDetail(idleDetail<Book>())
    } else {
      setExpandedId(book.id)
      loadDetail(book.id)
    }
  }

  const onCreated = () => {
    setDrawerOpen(false)
    setStatus({ variant: 'success', text: 'Book created' })
    reload()
  }

  const countLabel = normalizedQuery
    ? `${filtered.length} of ${rows.length} books`
    : `${rows.length} ${rows.length === 1 ? 'book' : 'books'}`

  return (
    <>
      {status && (
        <StatusMessage variant={status.variant}>{status.text}</StatusMessage>
      )}
      <EntityListView
        caption="Books"
        rows={filtered}
        total={rows.length}
        columns={COLUMNS}
        getId={(book) => book.id}
        getLabel={(book) => book.title}
        expandedId={expandedId}
        onToggle={toggle}
        detail={detail}
        onRetryDetail={loadDetail}
        renderDetail={(book) => {
          const data = detail.status === 'ready' ? detail.data : null
          if (!data || data.id !== book.id) return null
          return <BookDetail book={data} />
        }}
        searchLabel="Search books"
        searchPlaceholder="Search books"
        query={query}
        onQueryChange={setQuery}
        countLabel={countLabel}
        primaryAction={
          <Button
            variant="primary"
            onClick={() => {
              setStatus(null)
              setDrawerOpen(true)
            }}
          >
            Add book
          </Button>
        }
        loading={loading}
        error={error}
        onRetry={reload}
        emptyTitle="No books yet"
        emptyDescription="Create the first book to get started."
        filteredEmptyTitle="No results match your search"
        filteredEmptyDescription="Try a different search term."
      />

      <Drawer
        open={drawerOpen}
        title="Add book"
        onClose={() => setDrawerOpen(false)}
      >
        <BookForm onSuccess={onCreated} />
      </Drawer>
    </>
  )
}
