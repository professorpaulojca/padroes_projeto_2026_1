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
  Divider,
} from '@mui/material';
import { PersonAdd, HowToReg } from '@mui/icons-material';

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

  const steps = [
    'Preencha seus dados básicos',
    'Crie uma senha segura',
    'Acesse o sistema imediatamente',
    '(Opcional) Associe a uma Pessoa',
  ];

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Left Panel - Hero */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flex: 1,
          background: 'linear-gradient(135deg, #7b1fa2 0%, #9c27b0 50%, #ba68c8 100%)',
          flexDirection: 'column',
          justifyContent: 'center',
          px: 6,
          py: 4,
          position: 'relative',
          overflow: 'hidden',
          color: '#fff',
        }}
      >
        <Box sx={{ position: 'absolute', top: -100, right: -100, width: 300, height: 300, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.06)' }} />
        <Box sx={{ position: 'absolute', bottom: -60, left: -60, width: 200, height: 200, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.06)' }} />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 4 }}>
          <PersonAdd sx={{ fontSize: 28 }} />
          <Typography sx={{ fontSize: 24, fontWeight: 800 }}>Criar conta</Typography>
        </Box>

        <Typography sx={{ fontSize: 34, fontWeight: 800, mb: 2, lineHeight: 1.2 }}>
          Comece a gerenciar em minutos
        </Typography>
        <Typography variant="body1" sx={{ mb: 4, opacity: 0.85, maxWidth: 480 }}>
          Cadastre-se gratuitamente e tenha acesso a todas as funcionalidades do sistema.
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {steps.map((step, i) => (
            <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{
                width: 32, height: 32, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, fontWeight: 700,
              }}>
                {i + 1}
              </Box>
              <Typography variant="body1" fontWeight={500}>{step}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Right Panel - Registration Form */}
      <Box
        sx={{
          width: { xs: '100%', md: 560 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: '#f0f4ff',
          px: { xs: 2, sm: 4 },
          py: 4,
        }}
      >
        <Fade in timeout={600}>
          <Card
            elevation={8}
            sx={{ width: '100%', maxWidth: 460, borderRadius: 4, overflow: 'visible' }}
          >
            <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
                <Avatar
                  variant="rounded"
                  sx={{
                    width: 52, height: 52, bgcolor: '#9c27b0',
                    mb: 2, borderRadius: '14px',
                    boxShadow: '0 4px 14px rgba(156,39,176,0.4)',
                  }}
                >
                  <PersonAdd fontSize="large" />
                </Avatar>
                <Typography sx={{ fontSize: 22, fontWeight: 800 }}>Criar nova conta</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Preencha os dados abaixo para se cadastrar
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
                      label="Nome de exibição *"
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
                      label="E-mail *"
                      type="email"
                      placeholder="seu@email.com"
                      fullWidth
                      autoComplete="email"
                      error={!!errors.email}
                      helperText={errors.email?.message || 'Será usado para login e notificações.'}
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
                      label="Senha *"
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
                      label="Confirmar senha *"
                      placeholder="Repita a senha"
                      fullWidth
                      autoComplete="new-password"
                      error={!!errors.confirmarSenha}
                      helperText={errors.confirmarSenha?.message}
                      disabled={isLoading || success}
                    />
                  )}
                />

                <Alert severity="info" sx={{ borderRadius: 2, bgcolor: '#f3e8ff', color: '#7b1fa2', '& .MuiAlert-icon': { color: '#9c27b0' } }}>
                  Após o cadastro, você poderá associar este usuário a uma <strong>Pessoa</strong> cadastrada no sistema (opcional).
                </Alert>

                <LoadingButton
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  loading={isLoading}
                  disabled={success}
                  startIcon={!isLoading ? <HowToReg /> : undefined}
                  sx={{
                    mt: 1, py: 1.5, fontSize: 15, fontWeight: 700,
                    bgcolor: '#9c27b0',
                    boxShadow: '0 4px 14px rgba(156,39,176,0.4)',
                    '&:hover': { bgcolor: '#7b1fa2' },
                  }}
                >
                  Criar conta
                </LoadingButton>
              </Box>

              <Divider sx={{ my: 3 }}>
                <Typography variant="body2" color="text.secondary">ou</Typography>
              </Divider>

              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Já tem conta?{' '}
                  <Link component={RouterLink} to="/login" color="primary" underline="hover" sx={{ fontWeight: 600 }}>
                    Fazer login
                  </Link>
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Fade>
      </Box>
    </Box>
  );
};
