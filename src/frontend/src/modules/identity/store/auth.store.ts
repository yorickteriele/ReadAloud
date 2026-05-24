import { create } from 'zustand';
import type { UserDto } from '../api/generated/api-client';
import { authService } from '../services/auth.service';

interface AuthState {
  user: UserDto | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: UserDto, token: string) => void;
  clearAuth: () => void;
  initAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  setAuth: (user, token) => {
    set({ user, token, isAuthenticated: true });
  },

  clearAuth: () => {
    authService.logout();
    set({ user: null, token: null, isAuthenticated: false });
  },

  initAuth: () => {
    const user = authService.getStoredUser();
    const token = authService.getStoredToken();
    if (user && token) {
      set({ user, token, isAuthenticated: true });
    }
  },
}));
