import { api } from '../lib/axios';
import type { AuthResponse, LoginRequest, RegisterRequest } from '../types';

export const authService = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('auth/login', data);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('auth/register', data);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  async logout(): Promise<void> {
    await api.post('auth/logout');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getStoredUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  getStoredToken() {
    return localStorage.getItem('token');
  },

  isAuthenticated() {
    return !!this.getStoredToken();
  },
};
