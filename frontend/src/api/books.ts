import type { Book, BookAdd } from '../types/book'
import { del, postForm, request } from './client'

export function listBooks(): Promise<Book[]> {
  return request<Book[]>('/books/')
}

export function getBook(id: number): Promise<Book> {
  return request<Book>(`/books/${id}`)
}

export function createBook(body: BookAdd): Promise<unknown> {
  const form = new FormData()
  form.set('isbn', body.isbn)
  form.set('title', body.title)
  form.set('description', body.description)
  form.set('release_date', body.release_date)
  form.set('genre_id', String(body.genre_id))
  for (const authorId of body.authors) {
    form.append('authors', String(authorId))
  }
  return postForm('/books/add', form)
}

export function deleteBook(id: number): Promise<unknown> {
  return del(`/books/delete/${id}`)
}
