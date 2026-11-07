import type { Author, AuthorPost } from '../types/author'
import { del, postJson, putJson, request } from './client'

export function listAuthors(): Promise<Author[]> {
  return request<Author[]>('/authors/')
}

export function getAuthor(id: number): Promise<Author> {
  return request<Author>(`/authors/${id}`)
}

export function createAuthor(body: AuthorPost): Promise<unknown> {
  return postJson('/authors/add', body)
}

export function updateAuthor(id: number, body: Author): Promise<unknown> {
  return putJson(`/authors/update/${id}`, body)
}

export function deleteAuthor(id: number): Promise<unknown> {
  return del(`/authors/delete/${id}`)
}
