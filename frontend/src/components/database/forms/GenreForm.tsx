import { useState } from 'react'
import type { FormEvent } from 'react'
import { createGenre, updateGenre } from '../../../api/genres'
import type { Genre } from '../../../types/genre'
import { ApiError } from '../../../types/errors'
import { Button } from '../../ui/Button'

interface GenreFormProps {
  initial?: Genre
  onSuccess: () => void
}

export function GenreForm({ initial, onSuccess }: GenreFormProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [fieldError, setFieldError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setFormError(null)

    if (!name.trim()) {
      setFieldError('Name is required')
      return
    }
    setFieldError(null)

    setSubmitting(true)
    try {
      if (initial) {
        await updateGenre(initial.id, { name: name.trim() })
      } else {
        await createGenre({ name: name.trim() })
      }
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
        <label htmlFor="genre-name">Name</label>
        <input
          id="genre-name"
          type="text"
          value={name}
          aria-invalid={fieldError ? true : undefined}
          aria-describedby={fieldError ? 'genre-name-error' : undefined}
          onChange={(event) => setName(event.target.value)}
        />
        {fieldError && (
          <p id="genre-name-error" className="form-field__error" role="alert">
            {fieldError}
          </p>
        )}
      </div>
      <div className="entity-form__actions">
        <Button type="submit" variant="primary" disabled={submitting}>
          {initial ? 'Save changes' : 'Create genre'}
        </Button>
      </div>
    </form>
  )
}
