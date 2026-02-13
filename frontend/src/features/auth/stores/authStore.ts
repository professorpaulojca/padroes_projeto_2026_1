import { create } from 'zustand';
import type { AuthState, AuthUser } from '../types';
import { authService } from '../services';

interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: AuthUser | null) => void;
  clearError: () => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>((set) => ({
  // State
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  // Actions
  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });

    try {
      const response = await authService.login({ email, password });

      localStorage.setItem('access_token', response.accessToken);

      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Ocorreu um erro ao fazer login';

      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: message,
      });

      throw error;
    }
  },

  logout: async () => {
    try {
      await authService.logout();
    } finally {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  },

  setUser: (user) => {
    set({
      user,
      isAuthenticated: !!user,
    });
  },

  clearError: () => {
    set({ error: null });
  },
}));
