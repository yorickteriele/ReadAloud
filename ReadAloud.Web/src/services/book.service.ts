import { api } from '../lib/axios';
import type { Book } from '../types';

export const bookService = {
  async getAllBooks(): Promise<Book[]> {
    const response = await api.get<Book[]>('book');
    return response.data;
  },

  async getBookById(id: number): Promise<Book> {
    const response = await api.get<Book>(`book/${id}`);
    return response.data;
  },

  async uploadBook(file: File, title: string, author: string, languageId: string): Promise<Book> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('author', author);
    formData.append('launguageId', languageId);

    console.log('Uploading book:', { title, author, languageId, fileName: file.name });
    console.log('FormData entries:', Array.from(formData.entries()));

    const response = await api.post<{ success: boolean; message: string; book: Book }>(
      'book/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.book;
  },

  async deleteBook(id: number): Promise<void> {
    await api.delete(`book/${id}`);
  },

  getCoverImageUrl(coverPath?: string): string {
    if (!coverPath) return '/placeholder-book.png';
    const baseUrl = import.meta.env.VITE_API_URL || 'https://localhost:7299';
    return `${baseUrl}${coverPath}`;
  },
};
