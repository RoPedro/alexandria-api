import type { Book, BookAdd } from '../types/book'
import { postJson, request } from './client'

export function listBooks(): Promise<Book[]> {
  return request<Book[]>('/books/')
}

export function getBook(id: number): Promise<Book> {
  return request<Book>(`/books/${id}`)
}

export function createBook(body: BookAdd): Promise<unknown> {
  return postJson('/books/add', body)
}
