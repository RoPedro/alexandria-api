import { useState } from 'react'
import { deleteGenre, getGenre, listGenres } from '../../../api/genres'
import { useEntityList } from '../../../hooks/useEntityList'
import type { Genre, GenreWithBooks } from '../../../types/genre'
import { ApiError } from '../../../types/errors'
import { Button } from '../../ui/Button'
import { ConfirmDialog } from '../../ui/ConfirmDialog'
import { Drawer } from '../../ui/Drawer'
import { StatusMessage } from '../../ui/StatusMessage'
import type { DetailState } from '../detailState'
import { EntityListView } from '../EntityListView'
import { idleDetail } from '../detailState'
import type { Column } from '../EntityTable'
import { GenreDetail } from '../details/GenreDetail'
import { GenreForm } from '../forms/GenreForm'

type Status = { variant: 'success' | 'error'; text: string } | null

interface DrawerState {
  open: boolean
  edit?: Genre
}

const COLUMNS: Column<Genre>[] = [
  { key: 'id', header: 'ID', cell: (genre) => genre.id },
  { key: 'name', header: 'Name', cell: (genre) => genre.name },
]

export function GenresView() {
  const { rows, loading, error, reload } = useEntityList(listGenres)
  const [query, setQuery] = useState('')
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [detail, setDetail] = useState<DetailState<GenreWithBooks>>(
    idleDetail<GenreWithBooks>,
  )
  const [drawer, setDrawer] = useState<DrawerState>({ open: false })
  const [confirmTarget, setConfirmTarget] = useState<GenreWithBooks | null>(
    null,
  )
  const [status, setStatus] = useState<Status>(null)

  const normalizedQuery = query.trim().toLowerCase()
  const filtered = rows.filter((genre) =>
    `${genre.id} ${genre.name}`.toLowerCase().includes(normalizedQuery),
  )

  const loadDetail = (id: number) => {
    setDetail({ status: 'loading', id, data: null, error: '' })
    getGenre(id)
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

  const toggle = (genre: Genre) => {
    if (expandedId === genre.id) {
      setExpandedId(null)
      setDetail(idleDetail<GenreWithBooks>())
    } else {
      setExpandedId(genre.id)
      loadDetail(genre.id)
    }
  }

  const runMutation = async (
    action: () => Promise<unknown>,
    successText: string,
  ): Promise<boolean> => {
    try {
      await action()
      setStatus({ variant: 'success', text: successText })
      reload()
      return true
    } catch (err) {
      setStatus({
        variant: 'error',
        text: err instanceof ApiError ? err.message : 'Unexpected error',
      })
      reload()
      return false
    }
  }

  const closeDrawer = () => setDrawer({ open: false })

  const onSaved = () => {
    const wasEdit = Boolean(drawer.edit)
    closeDrawer()
    setStatus({
      variant: 'success',
      text: wasEdit ? 'Genre updated' : 'Genre created',
    })
    if (wasEdit && drawer.edit && expandedId === drawer.edit.id) {
      loadDetail(drawer.edit.id)
    }
    reload()
  }

  const countLabel = normalizedQuery
    ? `${filtered.length} of ${rows.length} genres`
    : `${rows.length} ${rows.length === 1 ? 'genre' : 'genres'}`

  return (
    <>
      {status && (
        <StatusMessage variant={status.variant}>{status.text}</StatusMessage>
      )}
      <EntityListView
        caption="Genres"
        rows={filtered}
        total={rows.length}
        columns={COLUMNS}
        getId={(genre) => genre.id}
        getLabel={(genre) => genre.name}
        expandedId={expandedId}
        onToggle={toggle}
        detail={detail}
        onRetryDetail={loadDetail}
        renderDetail={(genre) => {
          const data = detail.status === 'ready' ? detail.data : null
          if (!data || data.id !== genre.id) return null
          return (
            <GenreDetail
              genre={data}
              actions={
                <>
                  <Button onClick={() => setDrawer({ open: true, edit: data })}>
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => setConfirmTarget(data)}
                  >
                    Delete
                  </Button>
                </>
              }
            />
          )
        }}
        searchLabel="Search genres"
        searchPlaceholder="Search genres"
        query={query}
        onQueryChange={setQuery}
        countLabel={countLabel}
        primaryAction={
          <Button
            variant="primary"
            onClick={() => {
              setStatus(null)
              setDrawer({ open: true })
            }}
          >
            Add genre
          </Button>
        }
        loading={loading}
        error={error}
        onRetry={reload}
        emptyTitle="No genres yet"
        emptyDescription="Create the first genre to get started."
        filteredEmptyTitle="No results match your search"
        filteredEmptyDescription="Try a different search term."
      />

      <Drawer
        open={drawer.open}
        title={drawer.edit ? 'Edit genre' : 'Add genre'}
        onClose={closeDrawer}
      >
        <GenreForm initial={drawer.edit} onSuccess={onSaved} />
      </Drawer>

      <ConfirmDialog
        open={confirmTarget !== null}
        title="Delete genre"
        message={
          confirmTarget ? (
            <>
              <p>
                Delete {confirmTarget.name}? This removes the genre record from
                the database.
              </p>
              {confirmTarget.books.length > 0 && (
                <p className="confirm-dialog__warning">
                  This genre is used by {confirmTarget.books.length}{' '}
                  {confirmTarget.books.length === 1 ? 'book' : 'books'}. Deleting
                  it may leave those books without a genre.
                </p>
              )}
            </>
          ) : (
            ''
          )
        }
        confirmLabel="Delete genre"
        onCancel={() => setConfirmTarget(null)}
        onConfirm={async () => {
          const target = confirmTarget
          setConfirmTarget(null)
          if (!target) return
          const ok = await runMutation(
            () => deleteGenre(target.id),
            'Genre deleted',
          )
          if (ok && expandedId === target.id) {
            setExpandedId(null)
            setDetail(idleDetail<GenreWithBooks>())
          }
        }}
      />
    </>
  )
}
