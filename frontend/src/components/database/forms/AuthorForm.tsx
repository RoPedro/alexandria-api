import { useState } from 'react'
import type { FormEvent } from 'react'
import { createAuthor, updateAuthor } from '../../../api/authors'
import type { Author } from '../../../types/author'
import { ApiError } from '../../../types/errors'
import { Button } from '../../ui/Button'

interface AuthorFormProps {
  initial?: Author
  onSuccess: () => void
}

export function AuthorForm({ initial, onSuccess }: AuthorFormProps) {
  const [firstname, setFirstname] = useState(initial?.firstname ?? '')
  const [lastname, setLastname] = useState(initial?.lastname ?? '')
  const [fieldErrors, setFieldErrors] = useState<{
    firstname?: string
    lastname?: string
  }>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setFormError(null)

    const errors: { firstname?: string; lastname?: string } = {}
    if (!firstname.trim()) errors.firstname = 'First name is required'
    if (!lastname.trim()) errors.lastname = 'Last name is required'
    setFieldErrors(errors)
    if (errors.firstname || errors.lastname) return

    setSubmitting(true)
    try {
      if (initial) {
        await updateAuthor({
          id: initial.id,
          firstname: firstname.trim(),
          lastname: lastname.trim(),
        })
      } else {
        await createAuthor({
          firstname: firstname.trim(),
          lastname: lastname.trim(),
        })
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
        <label htmlFor="author-firstname">First name</label>
        <input
          id="author-firstname"
          type="text"
          value={firstname}
          aria-invalid={fieldErrors.firstname ? true : undefined}
          aria-describedby={
            fieldErrors.firstname ? 'author-firstname-error' : undefined
          }
          onChange={(event) => setFirstname(event.target.value)}
        />
        {fieldErrors.firstname && (
          <p
            id="author-firstname-error"
            className="form-field__error"
            role="alert"
          >
            {fieldErrors.firstname}
          </p>
        )}
      </div>
      <div className="form-field">
        <label htmlFor="author-lastname">Last name</label>
        <input
          id="author-lastname"
          type="text"
          value={lastname}
          aria-invalid={fieldErrors.lastname ? true : undefined}
          aria-describedby={
            fieldErrors.lastname ? 'author-lastname-error' : undefined
          }
          onChange={(event) => setLastname(event.target.value)}
        />
        {fieldErrors.lastname && (
          <p
            id="author-lastname-error"
            className="form-field__error"
            role="alert"
          >
            {fieldErrors.lastname}
          </p>
        )}
      </div>
      <div className="entity-form__actions">
        <Button type="submit" variant="primary" disabled={submitting}>
          {initial ? 'Save changes' : 'Create author'}
        </Button>
      </div>
    </form>
  )
}
