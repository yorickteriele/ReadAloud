import { identityApiClient } from '../api/client';
import type { LoginDto, RegisterDto, AuthResponseDto } from '../api/generated/api-client';

export const authService = {
  async login(data: LoginDto): Promise<AuthResponseDto> {
    const response = await identityApiClient.login(data);
    if (response.success && response.token) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    return response;
  },

  async register(data: RegisterDto): Promise<AuthResponseDto> {
    const response = await identityApiClient.register(data);
    if (response.success && response.token) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    return response;
  },

  async logout(): Promise<void> {
    await identityApiClient.logout();
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
