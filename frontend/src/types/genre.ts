import type { Book } from './book'

export interface Genre {
  id: number
  name: string
}

export interface GenreWithBooks {
  id: number
  name: string
  books: Pick<Book, 'id' | 'isbn' | 'title'>[]
}
