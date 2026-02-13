import { delay } from '@/utils';
import type { LoginRequest, LoginResponse } from '../types';

/**
 * Serviço de autenticação
 * 
 * Atualmente usando mock data. Quando a API estiver pronta,
 * basta descomentar as chamadas com axios e remover os mocks.
 */
export const authService = {
  /**
   * Realiza o login do usuário
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    // TODO: Substituir pelo endpoint real
    // const response = await api.post<LoginResponse>('/auth/login', credentials);
    // return response.data;

    // Mock — simula chamada à API
    await delay(1500);

    if (
      credentials.email === 'admin@email.com' &&
      credentials.password === '123456'
    ) {
      return {
        user: {
          id: '1',
          name: 'Administrador',
          email: credentials.email,
          avatar: undefined,
        },
        accessToken: 'mock-jwt-token-123456',
      };
    }

    throw new Error('Email ou senha inválidos');
  },

  /**
   * Realiza o logout do usuário
   */
  async logout(): Promise<void> {
    // TODO: Substituir pelo endpoint real
    // await api.post('/auth/logout');
    localStorage.removeItem('access_token');
  },
};
