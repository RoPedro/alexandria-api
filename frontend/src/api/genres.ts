import type { Genre, GenreWithBooks } from '../types/genre'
import { del, postJson, putJson, request } from './client'

export function listGenres(): Promise<Genre[]> {
  return request<Genre[]>('/genres/')
}

export function getGenre(id: number): Promise<GenreWithBooks> {
  return request<GenreWithBooks>(`/genres/${id}`)
}

export function createGenre(body: { name: string }): Promise<unknown> {
  return postJson('/genres/add', body)
}

export function updateGenre(id: number, body: { name: string }): Promise<unknown> {
  return putJson(`/genres/update/${id}`, body)
}

export function deleteGenre(id: number): Promise<unknown> {
  return del(`/genres/delete/${id}`)
}
