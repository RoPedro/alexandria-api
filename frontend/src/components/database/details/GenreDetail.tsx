import type { ReactNode } from 'react'
import type { GenreWithBooks } from '../../../types/genre'

interface GenreDetailProps {
  genre: GenreWithBooks
  actions?: ReactNode
}

export function GenreDetail({ genre, actions }: GenreDetailProps) {
  return (
    <div className="detail">
      <dl className="detail__list">
        <div className="detail__item">
          <dt>ID</dt>
          <dd>{genre.id}</dd>
        </div>
        <div className="detail__item">
          <dt>Name</dt>
          <dd>{genre.name}</dd>
        </div>
      </dl>
      <div className="detail__related">
        <h3>Books in this genre</h3>
        {genre.books.length === 0 ? (
          <p className="detail__muted">No books use this genre yet.</p>
        ) : (
          <ul className="detail__book-list">
            {genre.books.map((book) => (
              <li key={book.id}>
                <span className="detail__book-title">{book.title}</span>
                <span className="detail__book-meta">{book.isbn}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      {actions && <div className="detail__actions">{actions}</div>}
    </div>
  )
}
