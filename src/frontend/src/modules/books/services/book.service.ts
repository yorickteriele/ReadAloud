import { booksApiClient } from '../api/client';
import { API_BASE_URL } from '../../../lib/apiBaseUrl';
import type { Book, FileParameter } from '../api/generated/api-client';

export const bookService = {
  async getAllBooks(): Promise<Book[]> {
    return await booksApiClient.getAllBooks();
  },

  async getBook(id: number): Promise<Book> {
    return await booksApiClient.getBook(id);
  },

  async uploadBook(file: File, title: string, author: string, launguageId: string): Promise<Book> {
    const fileParam: FileParameter = {
        data: file,
        fileName: file.name
    };
    const response = await booksApiClient.uploadBook(
        fileParam,
        title,
        author,
        launguageId
    );

    if (!response.success || !response.book) {
        throw new Error(response.message || 'Failed to upload book');
    }

    return response.book;
  },

  async deleteBook(id: number): Promise<void> {
    await booksApiClient.deleteBook(id);
  },

  getCoverImageUrl(coverPath?: string): string {
    if (!coverPath) return '/placeholder-book.png';
    return `${API_BASE_URL}${coverPath}`;
  },
};
