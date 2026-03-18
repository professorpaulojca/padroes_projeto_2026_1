import { type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router';
import { createLogger } from '@/lib/logger';
import { useAuthStore } from '@/features/auth';

const log = createLogger('ROUTER');

interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    log.warn(`Acesso negado (não autenticado): ${location.pathname} → redirecionando para /login`);
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
