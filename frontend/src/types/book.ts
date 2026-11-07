import type { Author } from './author'

export interface GenreRef {
  name: string
}

export interface Book {
  id: number
  title: string
  description: string
  isbn: string
  release_date: string
  genre: GenreRef
  authors: Author[]
}

export interface BookAdd {
  isbn: string
  title: string
  description: string
  release_date: string
  genre_id: number
  authors: number[]
}
