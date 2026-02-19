import axios from 'axios';
import type { LoginRequest, LoginResponse } from '../types';

// Instância dedicada ao backend (sem o prefixo /api)
const backendApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8080',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Serviço de autenticação
 */
export const authService = {
  /**
   * Realiza o login do usuário chamando POST /login no backend
   * Payload: { usuario: string, senha: string }
   * Resposta: { sucesso: boolean, mensagem: string }
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const payload = {
      usuario: credentials.email,
      senha: credentials.password,
    };

    const response = await backendApi.post<{ sucesso: boolean; mensagem: string }>(
      '/login',
      payload,
    );

    if (!response.data.sucesso) {
      throw new Error(response.data.mensagem);
    }

    return {
      user: {
        id: '1',
        name: 'Administrador',
        email: credentials.email,
        avatar: undefined,
      },
      accessToken: 'session-token',
    };
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
