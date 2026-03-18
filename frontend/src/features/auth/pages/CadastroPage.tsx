import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link as RouterLink } from 'react-router';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Typography,
  Alert,
  Link,
  Avatar,
  Fade,
} from '@mui/material';
import { PersonAddOutlined } from '@mui/icons-material';

import { LoadingButton, PasswordInput } from '@/components/ui';
import { api } from '@/lib/axios';
import { createLogger } from '@/lib/logger';
import { cadastroSchema, type CadastroFormData } from '../schemas';

const log = createLogger('CADASTRO');

export const CadastroPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CadastroFormData>({
    resolver: zodResolver(cadastroSchema),
    defaultValues: {
      nomeExibicao: '',
      email: '',
      senha: '',
      confirmarSenha: '',
    },
  });

  const onSubmit = async (data: CadastroFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      log.info(`Cadastro: email=${data.email}`);
      await api.post('/auth/cadastro', {
        email: data.email,
        senha: data.senha,
        nomeExibicao: data.nomeExibicao,
      });
      log.info(`Cadastro bem-sucedido: email=${data.email}`);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      let message = 'Erro ao criar conta';
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const axiosErr = err as { response?: { data?: { erro?: string } } };
        if (axiosErr.response?.data?.erro) message = axiosErr.response.data.erro;
      }
      log.error(`Erro no cadastro: ${message}`);
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Fade in timeout={600}>
      <Card
        elevation={8}
        sx={{ width: '100%', maxWidth: 440, mx: 'auto', overflow: 'visible' }}
      >
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
            <Avatar
              sx={{
                width: 56,
                height: 56,
                bgcolor: 'secondary.main',
                mb: 2,
                boxShadow: '0 4px 14px rgba(156, 39, 176, 0.4)',
              }}
            >
              <PersonAddOutlined fontSize="large" />
            </Avatar>
            <Typography variant="h4" component="h1" fontWeight={700}>
              Criar Conta
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Preencha os dados para se cadastrar
            </Typography>
          </Box>

          {error && (
            <Fade in>
              <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 3, borderRadius: 2 }}>
                {error}
              </Alert>
            </Fade>
          )}

          {success && (
            <Fade in>
              <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
                Conta criada com sucesso! Redirecionando para o login...
              </Alert>
            </Fade>
          )}

          <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}
          >
            <Controller
              name="nomeExibicao"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Nome de exibição"
                  placeholder="Seu nome completo"
                  fullWidth
                  autoFocus
                  error={!!errors.nomeExibicao}
                  helperText={errors.nomeExibicao?.message}
                  disabled={isLoading || success}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              )}
            />

            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Email"
                  type="email"
                  placeholder="seu@email.com"
                  fullWidth
                  autoComplete="email"
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  disabled={isLoading || success}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              )}
            />

            <Controller
              name="senha"
              control={control}
              render={({ field }) => (
                <PasswordInput
                  {...field}
                  label="Senha"
                  placeholder="Mínimo 6 caracteres"
                  fullWidth
                  autoComplete="new-password"
                  error={!!errors.senha}
                  helperText={errors.senha?.message}
                  disabled={isLoading || success}
                  showStrength
                />
              )}
            />

            <Controller
              name="confirmarSenha"
              control={control}
              render={({ field }) => (
                <PasswordInput
                  {...field}
                  label="Confirmar Senha"
                  placeholder="Repita a senha"
                  fullWidth
                  autoComplete="new-password"
                  error={!!errors.confirmarSenha}
                  helperText={errors.confirmarSenha?.message}
                  disabled={isLoading || success}
                />
              )}
            />

            <LoadingButton
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              loading={isLoading}
              disabled={success}
              sx={{ mt: 1, py: 1.5, fontSize: '1rem' }}
            >
              Criar Conta
            </LoadingButton>
          </Box>

          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Já tem uma conta?{' '}
              <Link component={RouterLink} to="/login" color="primary" underline="hover" sx={{ fontWeight: 600 }}>
                Fazer login
              </Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Fade>
  );
};
