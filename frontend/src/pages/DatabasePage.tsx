import { useState } from 'react'
import { EntityTabs } from '../components/database/EntityTabs'
import type { EntityKey } from '../components/database/EntityTabs'
import { BooksView } from '../components/database/views/BooksView'
import { AuthorsView } from '../components/database/views/AuthorsView'
import { GenresView } from '../components/database/views/GenresView'

export function DatabasePage() {
  const [entity, setEntity] = useState<EntityKey>('books')

  return (
    <div className="page">
      <div className="page__header">
        <h1>Database</h1>
        <p className="page__description">
          Entity management for books, authors, and genres.
        </p>
      </div>

      <EntityTabs active={entity} onChange={setEntity} />

      <div
        id={`panel-${entity}`}
        role="tabpanel"
        aria-labelledby={`tab-${entity}`}
        tabIndex={0}
        className="page__panel"
      >
        {entity === 'books' && <BooksView />}
        {entity === 'authors' && <AuthorsView />}
        {entity === 'genres' && <GenresView />}
      </div>
    </div>
  )
}
