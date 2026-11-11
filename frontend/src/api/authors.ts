import type { Author, AuthorPost } from '../types/author'
import { del, postForm, putForm, request } from './client'

export function listAuthors(): Promise<Author[]> {
  return request<Author[]>('/authors/')
}

export function getAuthor(id: number): Promise<Author> {
  return request<Author>(`/authors/${id}`)
}

export function createAuthor(body: AuthorPost): Promise<unknown> {
  const form = new FormData()
  form.set('firstname', body.firstname)
  form.set('lastname', body.lastname)
  return postForm('/authors/add', form)
}

export function updateAuthor(body: Author): Promise<unknown> {
  const form = new FormData()
  form.set('id', String(body.id))
  form.set('firstname', body.firstname)
  form.set('lastname', body.lastname)
  return putForm('/authors/update', form)
}

export function deleteAuthor(id: number): Promise<unknown> {
  return del(`/authors/delete/${id}`)
}
