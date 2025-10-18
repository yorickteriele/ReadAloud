export interface User {
  id: string;
  username: string;
  email: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  message?: string;
  user?: User;
}

export interface LoginRequest {
  emailOrUsername: string;
  password: string;
  rememberMe: boolean;
}

export interface RegisterRequest {
  username: string;
  email: string;
  phoneNumber?: string;
  password: string;
}

export interface Book {
  id: number;
  title: string;
  author: string;
  laungaugeId: string;
  coverImagePath?: string;
  chapters: Chapter[];
}

export interface Chapter {
  id: number;
  bookId: number;
  chapterNumber: number;
  title: string;
  paragraphs: Paragraph[];
}

export interface Paragraph {
  id: number;
  chapterId: number;
  paragraphNumber: number;
  text: string;
}

export interface UploadBookRequest {
  file: File;
  title: string;
  author: string;
  languageId: string;
}
