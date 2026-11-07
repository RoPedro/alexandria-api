import { useState } from 'react'
import { deleteAuthor, getAuthor, listAuthors } from '../../../api/authors'
import { useEntityList } from '../../../hooks/useEntityList'
import type { Author } from '../../../types/author'
import { ApiError } from '../../../types/errors'
import { Button } from '../../ui/Button'
import { ConfirmDialog } from '../../ui/ConfirmDialog'
import { Drawer } from '../../ui/Drawer'
import { StatusMessage } from '../../ui/StatusMessage'
import type { DetailState } from '../detailState'
import { EntityListView } from '../EntityListView'
import { idleDetail } from '../detailState'
import type { Column } from '../EntityTable'
import { AuthorDetail } from '../details/AuthorDetail'
import { AuthorForm } from '../forms/AuthorForm'

type Status = { variant: 'success' | 'error'; text: string } | null

interface DrawerState {
  open: boolean
  edit?: Author
}

const COLUMNS: Column<Author>[] = [
  { key: 'id', header: 'ID', cell: (author) => author.id },
  { key: 'firstname', header: 'First name', cell: (author) => author.firstname },
  { key: 'lastname', header: 'Last name', cell: (author) => author.lastname },
]

export function AuthorsView() {
  const { rows, loading, error, reload } = useEntityList(listAuthors)
  const [query, setQuery] = useState('')
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [detail, setDetail] = useState<DetailState<Author>>(idleDetail<Author>)
  const [drawer, setDrawer] = useState<DrawerState>({ open: false })
  const [confirmTarget, setConfirmTarget] = useState<Author | null>(null)
  const [status, setStatus] = useState<Status>(null)

  const normalizedQuery = query.trim().toLowerCase()
  const filtered = rows.filter((author) =>
    `${author.id} ${author.firstname} ${author.lastname}`
      .toLowerCase()
      .includes(normalizedQuery),
  )

  const loadDetail = (id: number) => {
    setDetail({ status: 'loading', id, data: null, error: '' })
    getAuthor(id)
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

  const toggle = (author: Author) => {
    if (expandedId === author.id) {
      setExpandedId(null)
      setDetail(idleDetail<Author>())
    } else {
      setExpandedId(author.id)
      loadDetail(author.id)
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
      return false
    }
  }

  const closeDrawer = () => setDrawer({ open: false })

  const onSaved = () => {
    const wasEdit = Boolean(drawer.edit)
    closeDrawer()
    setStatus({
      variant: 'success',
      text: wasEdit ? 'Author updated' : 'Author created',
    })
    if (wasEdit && drawer.edit && expandedId === drawer.edit.id) {
      loadDetail(drawer.edit.id)
    }
    reload()
  }

  const countLabel = normalizedQuery
    ? `${filtered.length} of ${rows.length} authors`
    : `${rows.length} ${rows.length === 1 ? 'author' : 'authors'}`

  return (
    <>
      {status && (
        <StatusMessage variant={status.variant}>{status.text}</StatusMessage>
      )}
      <EntityListView
        caption="Authors"
        rows={filtered}
        total={rows.length}
        columns={COLUMNS}
        getId={(author) => author.id}
        getLabel={(author) => `${author.firstname} ${author.lastname}`}
        expandedId={expandedId}
        onToggle={toggle}
        detail={detail}
        onRetryDetail={loadDetail}
        renderDetail={(author) => {
          const data = detail.status === 'ready' ? detail.data : null
          if (!data || data.id !== author.id) return null
          return (
            <AuthorDetail
              author={data}
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
        searchLabel="Search authors"
        searchPlaceholder="Search authors"
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
            Add author
          </Button>
        }
        loading={loading}
        error={error}
        onRetry={reload}
        emptyTitle="No authors yet"
        emptyDescription="Create the first author to get started."
        filteredEmptyTitle="No results match your search"
        filteredEmptyDescription="Try a different search term."
      />

      <Drawer
        open={drawer.open}
        title={drawer.edit ? 'Edit author' : 'Add author'}
        onClose={closeDrawer}
      >
        <AuthorForm initial={drawer.edit} onSuccess={onSaved} />
      </Drawer>

      <ConfirmDialog
        open={confirmTarget !== null}
        title="Delete author"
        message={
          confirmTarget
            ? `Delete ${confirmTarget.firstname} ${confirmTarget.lastname}? This removes the author record from the database.`
            : ''
        }
        confirmLabel="Delete author"
        onCancel={() => setConfirmTarget(null)}
        onConfirm={async () => {
          const target = confirmTarget
          setConfirmTarget(null)
          if (!target) return
          const ok = await runMutation(
            () => deleteAuthor(target.id),
            'Author deleted',
          )
          if (ok && expandedId === target.id) {
            setExpandedId(null)
            setDetail(idleDetail<Author>())
          }
        }}
      />
    </>
  )
}
