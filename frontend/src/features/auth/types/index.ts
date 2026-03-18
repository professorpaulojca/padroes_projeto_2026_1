export interface AuthUser {
  id: number;
  name: string;
  email: string;
  perfil: string;
  avatar?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

/** Espelha LoginResponseDTO do backend */
export interface LoginResponseBackend {
  token: string;
  tipo: string;
  email: string;
  nomeExibicao: string;
  perfil: string;
}

export interface LoginResponse {
  user: AuthUser;
  accessToken: string;
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
