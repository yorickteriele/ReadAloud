import { readAloudApiClient } from '../api/client';
import { API_BASE_URL } from '../lib/apiBaseUrl';
import type { Book } from '../types';

export const bookService = {
  async getAllBooks(): Promise<Book[]> {
    return await readAloudApiClient.getAllBooks() as Book[];
  },

  async getBookById(id: number): Promise<Book> {
    return await readAloudApiClient.getBook(id) as Book;
  },

  async uploadBook(file: File, title: string, author: string, languageId: string): Promise<Book> {
    const response = await readAloudApiClient.uploadBook(
      { data: file, fileName: file.name },
      title,
      author,
      languageId,
    );

    if (!response.book) {
      throw new Error(response.message || 'Book upload did not return a book.');
    }

    return response.book as Book;
  },

  async deleteBook(id: number): Promise<void> {
    await readAloudApiClient.deleteBook(id);
  },

  getCoverImageUrl(coverPath?: string): string {
    if (!coverPath) return '/placeholder-book.png';
    return `${API_BASE_URL}${coverPath}`;
  },
};
