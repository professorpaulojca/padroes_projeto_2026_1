import { createLogger } from '@/lib/logger';
import { api } from '@/lib/axios';
import type { LoginRequest, LoginResponse, LoginResponseBackend } from '../types';

const log = createLogger('AUTH_SERVICE');

/**
 * Serviço de autenticação — integra com /auth/* do backend
 */
export const authService = {
  /**
   * Realiza o login do usuário chamando POST /auth/login no backend
   * Payload: { email: string, senha: string }
   * Resposta: LoginResponseDTO { token, tipo, email, nomeExibicao, perfil }
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    log.info(`Tentativa de login: email=${credentials.email}`);

    const response = await api.post<LoginResponseBackend>(
      '/auth/login',
      {
        email: credentials.email,
        senha: credentials.password,
      },
    );

    const data = response.data;
    log.info(`Login bem-sucedido: email=${data.email} | perfil=${data.perfil}`);

    return {
      user: {
        id: 0,
        name: data.nomeExibicao,
        email: data.email,
        perfil: data.perfil,
      },
      accessToken: data.token,
    };
  },

  /**
   * Realiza o logout do usuário
   */
  async logout(): Promise<void> {
    log.info('Logout realizado');
    localStorage.removeItem('access_token');
    sessionStorage.removeItem('access_token');
    localStorage.removeItem('remembered_email');
    localStorage.removeItem('remember_me');
  },
};
