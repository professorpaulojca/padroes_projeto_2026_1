export interface User {
  id: number;
  name: string;
  email: string;
  perfil: string;
  avatar?: string;
}

export interface ApiError {
  erro: string;
  statusCode?: number;
}

export * from './models';
