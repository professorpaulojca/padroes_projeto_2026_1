import axios from 'axios';
import { createLogger } from './logger';

const log = createLogger('HTTP');

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — adiciona token de autenticação e loga a requisição
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    log.debug(`→ ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`, {
      params: config.params,
    });
    return config;
  },
  (error) => {
    log.error('Erro ao preparar requisição', error);
    return Promise.reject(error);
  },
);

// Response interceptor — loga respostas e trata erros globais
api.interceptors.response.use(
  (response) => {
    log.debug(`← ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`, {
      duration: response.headers['x-response-time'],
    });
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url;
    const message = error.response?.data?.erro || error.message;

    log.error(`← ${status || 'NETWORK'} ${error.config?.method?.toUpperCase()} ${url} — ${message}`);

    if (status === 401) {
      log.warn('Sessão expirada — redirecionando para login');
      localStorage.removeItem('access_token');
      sessionStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);
