import type { Genre, GenreID, GenreWithBooks } from '../types/genre'
import { del, postForm, putForm, request } from './client'

export function listGenres(): Promise<Genre[]> {
  return request<Genre[]>('/genres/')
}

export function getGenre(id: number): Promise<GenreWithBooks> {
  return request<GenreWithBooks>(`/genres/${id}`)
}

export function createGenre(body: { name: string }): Promise<unknown> {
  const form = new FormData()
  form.set('name', body.name)
  return postForm('/genres/add', form)
}

export function updateGenre(id: number, body: { name: string }): Promise<unknown> {
  const form = new FormData()
  form.set('genre_id', String(id))
  form.set('name', body.name)
  return putForm('/genres/update', form)
}

export function deleteGenre(id: number): Promise<GenreID> {
  return del<GenreID>(`/genres/delete/${id}`)
}
