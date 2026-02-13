import { createBrowserRouter, Navigate } from 'react-router';

import { AuthLayout, MainLayout } from '@/layouts';
import { LoginPage } from '@/features/auth';
import { DashboardPage } from '@/features/dashboard';
import { NotFoundPage } from '@/pages';
import { ProtectedRoute } from './ProtectedRoute';

export const router = createBrowserRouter([
  // Rota raiz — redireciona para login
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },

  // Rotas públicas (autenticação)
  {
    element: <AuthLayout />,
    children: [
      {
        path: '/login',
        element: <LoginPage />,
      },
    ],
  },

  // Rotas protegidas (requerem autenticação)
  {
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: '/dashboard',
        element: <DashboardPage />,
      },
    ],
  },

  // 404
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
