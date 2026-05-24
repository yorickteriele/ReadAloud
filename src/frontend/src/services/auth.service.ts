import { readAloudApiClient } from '../api/client';
import type { AuthResponse, LoginRequest, RegisterRequest } from '../types';

export const authService = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await readAloudApiClient.login(data);
    if (response.token) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    return response as AuthResponse;
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await readAloudApiClient.register(data);
    if (response.token) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    return response as AuthResponse;
  },

  async logout(): Promise<void> {
    await readAloudApiClient.logout();
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
