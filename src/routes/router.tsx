import { createBrowserRouter, Navigate } from 'react-router';

import { AuthLayout, MainLayout } from '@/layouts';
import { LoginPage, CadastroPage, EsqueciSenhaPage } from '@/features/auth';
import { DashboardPage } from '@/features/dashboard';
import { PessoasPage } from '@/features/pessoas';
import { EnderecosPage } from '@/features/enderecos';
import { PerfilPage } from '@/features/perfil';
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
      {
        path: '/cadastro',
        element: <CadastroPage />,
      },
      {
        path: '/esqueci-senha',
        element: <EsqueciSenhaPage />,
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
      {
        path: '/pessoas',
        element: <PessoasPage />,
      },
      {
        path: '/enderecos',
        element: <EnderecosPage />,
      },
      {
        path: '/perfil',
        element: <PerfilPage />,
      },
    ],
  },

  // 404
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
