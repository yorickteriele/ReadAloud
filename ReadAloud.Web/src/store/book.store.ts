import { create } from 'zustand';
import type { Book } from '../types';

interface BookState {
  books: Book[];
  currentBook: Book | null;
  setBooks: (books: Book[]) => void;
  setCurrentBook: (book: Book | null) => void;
  addBook: (book: Book) => void;
  removeBook: (id: number) => void;
}

export const useBookStore = create<BookState>((set) => ({
  books: [],
  currentBook: null,

  setBooks: (books) => set({ books }),

  setCurrentBook: (book) => set({ currentBook: book }),

  addBook: (book) => set((state) => ({ books: [...state.books, book] })),

  removeBook: (id) =>
    set((state) => ({
      books: state.books.filter((book) => book.id !== id),
      currentBook: state.currentBook?.id === id ? null : state.currentBook,
    })),
}));
