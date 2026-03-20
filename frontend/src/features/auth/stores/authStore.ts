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

interface LoginProtection {
  failedAttempts: number;
  lockedUntil: number | null;
}

type AuthStore = AuthState & AuthActions & LoginProtection;

export const useAuthStore = create<AuthStore>((set, get) => ({
  // State
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  failedAttempts: 0,
  lockedUntil: null,

  // Actions
  login: async (email: string, password: string) => {
    const state = get();

    // Verificar bloqueio temporário no frontend
    if (state.lockedUntil && Date.now() < state.lockedUntil) {
      const secondsLeft = Math.ceil((state.lockedUntil - Date.now()) / 1000);
      set({ error: `Aguarde ${secondsLeft} segundos antes de tentar novamente.` });
      throw new Error('Temporarily locked');
    }

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
        failedAttempts: 0,
        lockedUntil: null,
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
        if (axiosErr.response?.status === 429) {
          message = axiosErr.response?.data?.erro || 'Muitas tentativas. Aguarde antes de tentar novamente.';
        } else if (axiosErr.response?.data?.erro) {
          message = axiosErr.response.data.erro;
        } else if (axiosErr.response?.status === 401) {
          message = 'E-mail ou senha inválidos';
        }
      }

      const newFailedAttempts = state.failedAttempts + 1;
      // Delay progressivo: 2s, 4s, 8s, 16s, 30s (máximo)
      const delayMs = Math.min(Math.pow(2, newFailedAttempts) * 1000, 30000);
      const lockedUntil = Date.now() + delayMs;

      log.error(`Falha no login: email=${email} | erro=${message} | tentativa=${newFailedAttempts} | bloqueio=${delayMs}ms`);
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: message,
        failedAttempts: newFailedAttempts,
        lockedUntil,
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
