import { create } from 'zustand';
import { createLogger } from '@/lib/logger';
import type { AuthState, AuthUser } from '../types';
import { authService } from '../services';

const log = createLogger('AUTH_STORE');

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
    log.info(`Iniciando login: email=${email}`);
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
      log.info(`Login concluído com sucesso: email=${email}`);
    } catch (error) {
      let message = 'Ocorreu um erro ao fazer login';

      if (error instanceof Error) {
        message = error.message;
      }
      // Axios error com resposta do backend (formato: { erro: "..." })
      if (typeof error === 'object' && error !== null && 'response' in error) {
        const axiosErr = error as { response?: { data?: { erro?: string }; status?: number } };
        if (axiosErr.response?.data?.erro) {
          message = axiosErr.response.data.erro;
        } else if (axiosErr.response?.status === 401) {
          message = 'E-mail ou senha inválidos';
        }
      }

      log.error(`Falha no login: email=${email} | erro=${message}`);
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
    log.info('Realizando logout');
    try {
      await authService.logout();
    } finally {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
      log.info('Logout concluído');
    }
  },

  setUser: (user) => {
    log.debug(`setUser: ${user ? user.email : 'null'}`);
    set({
      user,
      isAuthenticated: !!user,
    });
  },

  clearError: () => {
    set({ error: null });
  },
}));
