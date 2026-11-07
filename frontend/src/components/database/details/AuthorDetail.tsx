import type { ReactNode } from 'react'
import type { Author } from '../../../types/author'

interface AuthorDetailProps {
  author: Author
  actions?: ReactNode
}

export function AuthorDetail({ author, actions }: AuthorDetailProps) {
  return (
    <div className="detail">
      <dl className="detail__list">
        <div className="detail__item">
          <dt>ID</dt>
          <dd>{author.id}</dd>
        </div>
        <div className="detail__item">
          <dt>First name</dt>
          <dd>{author.firstname}</dd>
        </div>
        <div className="detail__item">
          <dt>Last name</dt>
          <dd>{author.lastname}</dd>
        </div>
      </dl>
      {actions && <div className="detail__actions">{actions}</div>}
    </div>
  )
}
