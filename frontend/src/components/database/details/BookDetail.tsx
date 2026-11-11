import type { ReactNode } from 'react'
import type { Book } from '../../../types/book'

interface BookDetailProps {
  book: Book
  actions?: ReactNode
}

export function BookDetail({ book, actions }: BookDetailProps) {
  const authorNames = book.authors.map(
    (author) => `${author.firstname} ${author.lastname}`,
  )

  return (
    <div className="detail">
      <dl className="detail__list">
        <div className="detail__item">
          <dt>ID</dt>
          <dd>{book.id}</dd>
        </div>
        <div className="detail__item">
          <dt>Title</dt>
          <dd>{book.title}</dd>
        </div>
        <div className="detail__item">
          <dt>ISBN</dt>
          <dd className="detail__mono">{book.isbn}</dd>
        </div>
        <div className="detail__item">
          <dt>Release date</dt>
          <dd>{book.release_date}</dd>
        </div>
        <div className="detail__item">
          <dt>Genre</dt>
          <dd>{book.genre.name}</dd>
        </div>
        <div className="detail__item">
          <dt>Authors</dt>
          <dd>
            {authorNames.length > 0 ? authorNames.join(', ') : 'None'}
          </dd>
        </div>
      </dl>
      <div className="detail__related">
        <h3>Description</h3>
        <p className="detail__description">{book.description}</p>
      </div>
      {actions && <div className="detail__actions">{actions}</div>}
    </div>
  )
}
