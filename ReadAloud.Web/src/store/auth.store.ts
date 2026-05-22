import { create } from 'zustand';
import type { User } from '../types';
import { authService } from '../services/auth.service';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
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
