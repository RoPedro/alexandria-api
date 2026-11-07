import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { listAuthors } from '../../../api/authors'
import { createBook } from '../../../api/books'
import { listGenres } from '../../../api/genres'
import type { Author } from '../../../types/author'
import type { Genre } from '../../../types/genre'
import { ApiError } from '../../../types/errors'
import { Button } from '../../ui/Button'

interface BookFormProps {
  onSuccess: () => void
}

interface OptionState<T> {
  items: T[]
  error: string | null
}

export function BookForm({ onSuccess }: BookFormProps) {
  const [isbn, setIsbn] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [releaseDate, setReleaseDate] = useState('')
  const [genreId, setGenreId] = useState('')
  const [authorIds, setAuthorIds] = useState<number[]>([])

  const [genres, setGenres] = useState<OptionState<Genre>>({
    items: [],
    error: null,
  })
  const [authors, setAuthors] = useState<OptionState<Author>>({
    items: [],
    error: null,
  })

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let cancelled = false
    listGenres()
      .then((items) => {
        if (!cancelled) setGenres({ items, error: null })
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setGenres({
            items: [],
            error: err instanceof ApiError ? err.message : 'Unexpected error',
          })
        }
      })
    listAuthors()
      .then((items) => {
        if (!cancelled) setAuthors({ items, error: null })
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setAuthors({
            items: [],
            error: err instanceof ApiError ? err.message : 'Unexpected error',
          })
        }
      })
    return () => {
      cancelled = true
    }
  }, [])

  const toggleAuthor = (id: number) => {
    setAuthorIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    )
  }

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setFormError(null)

    const errors: Record<string, string> = {}
    if (!isbn.trim()) errors.isbn = 'ISBN is required'
    if (!title.trim()) errors.title = 'Title is required'
    if (!releaseDate) errors.release_date = 'Release date is required'
    if (!genreId) errors.genre_id = 'Genre is required'
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return

    setSubmitting(true)
    try {
      await createBook({
        isbn: isbn.trim(),
        title: title.trim(),
        description,
        release_date: releaseDate,
        genre_id: Number(genreId),
        authors: authorIds,
      })
      onSuccess()
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Unexpected error')
      setSubmitting(false)
    }
  }

  return (
    <form className="entity-form" onSubmit={onSubmit} noValidate>
      {formError && (
        <p className="entity-form__error" role="alert">
          {formError}
        </p>
      )}
      <div className="form-field">
        <label htmlFor="book-title">Title</label>
        <input
          id="book-title"
          type="text"
          value={title}
          aria-invalid={fieldErrors.title ? true : undefined}
          aria-describedby={fieldErrors.title ? 'book-title-error' : undefined}
          onChange={(event) => setTitle(event.target.value)}
        />
        {fieldErrors.title && (
          <p id="book-title-error" className="form-field__error" role="alert">
            {fieldErrors.title}
          </p>
        )}
      </div>
      <div className="form-field">
        <label htmlFor="book-isbn">ISBN</label>
        <input
          id="book-isbn"
          type="text"
          value={isbn}
          aria-invalid={fieldErrors.isbn ? true : undefined}
          aria-describedby={fieldErrors.isbn ? 'book-isbn-error' : undefined}
          onChange={(event) => setIsbn(event.target.value)}
        />
        {fieldErrors.isbn && (
          <p id="book-isbn-error" className="form-field__error" role="alert">
            {fieldErrors.isbn}
          </p>
        )}
      </div>
      <div className="form-field">
        <label htmlFor="book-release-date">Release date</label>
        <input
          id="book-release-date"
          type="date"
          value={releaseDate}
          aria-invalid={fieldErrors.release_date ? true : undefined}
          aria-describedby={
            fieldErrors.release_date ? 'book-release-date-error' : undefined
          }
          onChange={(event) => setReleaseDate(event.target.value)}
        />
        {fieldErrors.release_date && (
          <p
            id="book-release-date-error"
            className="form-field__error"
            role="alert"
          >
            {fieldErrors.release_date}
          </p>
        )}
      </div>
      <div className="form-field">
        <label htmlFor="book-genre">Genre</label>
        <select
          id="book-genre"
          value={genreId}
          aria-invalid={fieldErrors.genre_id ? true : undefined}
          aria-describedby={
            fieldErrors.genre_id ? 'book-genre-error' : undefined
          }
          onChange={(event) => setGenreId(event.target.value)}
        >
          <option value="">Select a genre</option>
          {genres.items.map((genre) => (
            <option key={genre.id} value={genre.id}>
              {genre.name}
            </option>
          ))}
        </select>
        {genres.error && (
          <p className="form-field__error" role="alert">
            {genres.error}
          </p>
        )}
        {!genres.error && genres.items.length === 0 && (
          <p className="form-field__hint">
            No genres yet — create one in the Genres tab first.
          </p>
        )}
        {fieldErrors.genre_id && (
          <p id="book-genre-error" className="form-field__error" role="alert">
            {fieldErrors.genre_id}
          </p>
        )}
      </div>
      <fieldset className="form-field form-field--group">
        <legend>Authors</legend>
        {authors.error && (
          <p className="form-field__error" role="alert">
            {authors.error}
          </p>
        )}
        {!authors.error && authors.items.length === 0 && (
          <p className="form-field__hint">
            No authors yet — create one in the Authors tab first.
          </p>
        )}
        <div className="form-field__options">
          {authors.items.map((author) => (
            <label key={author.id} className="form-field__option">
              <input
                type="checkbox"
                checked={authorIds.includes(author.id)}
                onChange={() => toggleAuthor(author.id)}
              />
              {author.firstname} {author.lastname}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="form-field">
        <label htmlFor="book-description">Description</label>
        <textarea
          id="book-description"
          rows={4}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </div>
      <div className="entity-form__actions">
        <Button type="submit" variant="primary" disabled={submitting}>
          Create book
        </Button>
      </div>
    </form>
  )
}
