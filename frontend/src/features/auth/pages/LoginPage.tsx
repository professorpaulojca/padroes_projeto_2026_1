import { useState, useEffect, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link as RouterLink } from 'react-router';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Typography,
  IconButton,
  InputAdornment,
  FormControlLabel,
  Checkbox,
  Alert,
  Link,
  Avatar,
  Fade,
  Divider,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  LockOutlined,
  Email,
  People,
  LocationOn,
  Security,
  Hub,
  Login,
  ErrorOutline,
} from '@mui/icons-material';

import { LoadingButton } from '@/components/ui';
import { useAuthStore } from '../stores';
import { loginSchema, type LoginFormData } from '../schemas';

export const LoginPage = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  const { login, isLoading, error, clearError, failedAttempts, lockedUntil } = useAuthStore();

  useEffect(() => {
    if (!lockedUntil) {
      setCooldownSeconds(0);
      return;
    }
    const updateCooldown = () => {
      const remaining = Math.ceil((lockedUntil - Date.now()) / 1000);
      setCooldownSeconds(remaining > 0 ? remaining : 0);
    };
    updateCooldown();
    const interval = setInterval(updateCooldown, 1000);
    return () => clearInterval(interval);
  }, [lockedUntil]);

  const isLocked = cooldownSeconds > 0;

  const savedEmail = localStorage.getItem('remembered_email') || '';
  const savedRememberMe = localStorage.getItem('remember_me') === 'true';

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: savedEmail,
      password: '',
      rememberMe: savedRememberMe,
    },
  });

  const onSubmit = useCallback(async (data: LoginFormData) => {
    if (isLocked) return;
    try {
      clearError();
      await login(data.email, data.password, data.rememberMe);
      navigate('/dashboard');
    } catch {
      // Erro tratado pelo store
    }
  }, [isLocked, clearError, login, navigate]);

  const features = [
    { icon: <People sx={{ fontSize: 20 }} />, text: 'Gestão completa de pessoas' },
    { icon: <LocationOn sx={{ fontSize: 20 }} />, text: 'Endereços com busca por CEP' },
    { icon: <Security sx={{ fontSize: 20 }} />, text: 'Controle de acesso por perfil' },
  ];

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Left Panel - Hero */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flex: 1,
          background: 'linear-gradient(135deg, #1565c0 0%, #1976d2 50%, #42a5f5 100%)',
          flexDirection: 'column',
          justifyContent: 'center',
          px: 6,
          py: 4,
          position: 'relative',
          overflow: 'hidden',
          color: '#fff',
        }}
      >
        {/* Decorative circles */}
        <Box sx={{ position: 'absolute', top: -100, right: -100, width: 300, height: 300, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.06)' }} />
        <Box sx={{ position: 'absolute', bottom: -60, left: -60, width: 200, height: 200, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.06)' }} />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 4 }}>
          <Hub sx={{ fontSize: 32 }} />
          <Typography variant="h5" fontWeight={800}>Sistema de Gestão</Typography>
        </Box>

        <Typography sx={{ fontSize: 38, fontWeight: 800, mb: 2, lineHeight: 1.2 }}>
          Gerencie pessoas e endereços com simplicidade
        </Typography>
        <Typography variant="body1" sx={{ mb: 4, opacity: 0.85, maxWidth: 480 }}>
          Plataforma centralizada para cadastro de pessoas, endereços, vínculos e muito mais.
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {features.map((f, i) => (
            <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ p: 1, bgcolor: 'rgba(255,255,255,0.15)', borderRadius: 1.5, display: 'flex' }}>
                {f.icon}
              </Box>
              <Typography variant="body1" fontWeight={500}>{f.text}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Right Panel - Login Form */}
      <Box
        sx={{
          width: { xs: '100%', md: 520 },
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
            sx={{
              width: '100%',
              maxWidth: 420,
              borderRadius: 4,
              overflow: 'visible',
            }}
          >
            <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
              {/* Header */}
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
                <Avatar
                  variant="rounded"
                  sx={{
                    width: 56,
                    height: 56,
                    bgcolor: '#1976d2',
                    mb: 2,
                    borderRadius: '14px',
                    boxShadow: '0 4px 14px rgba(25,118,210,0.4)',
                  }}
                >
                  <LockOutlined fontSize="large" />
                </Avatar>
                <Typography sx={{ fontSize: 24, fontWeight: 800 }} color="text.primary">
                  Bem-vindo de volta
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Faça login para acessar sua conta
                </Typography>
              </Box>

              {/* Error Alert */}
              {error && (
                <Fade in>
                  <Alert
                    severity="error"
                    icon={<ErrorOutline />}
                    onClose={clearError}
                    sx={{ mb: 3, borderRadius: 2, bgcolor: '#fee2e2' }}
                  >
                    E-mail ou senha incorretos. Verifique e tente novamente.
                  </Alert>
                </Fade>
              )}

              {/* Lockout Warning */}
              {isLocked && (
                <Fade in>
                  <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
                    Muitas tentativas falhas ({failedAttempts}). Aguarde {cooldownSeconds}s para tentar novamente.
                  </Alert>
                </Fade>
              )}

              {/* Login Form */}
              <Box
                component="form"
                onSubmit={handleSubmit(onSubmit)}
                noValidate
                sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}
              >
                {/* Email */}
                <Box>
                  <Typography variant="caption" fontWeight={600} sx={{ mb: 0.5, display: 'block', fontSize: 13 }}>
                    E-mail
                  </Typography>
                  <Controller
                    name="email"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        type="email"
                        placeholder="seu@email.com"
                        fullWidth
                        autoComplete="email"
                        autoFocus
                        error={!!errors.email}
                        helperText={errors.email?.message}
                        disabled={isLoading || isLocked}
                        sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#fafbff' } }}
                        slotProps={{
                          input: {
                            endAdornment: (
                              <InputAdornment position="end">
                                <Email color="action" fontSize="small" />
                              </InputAdornment>
                            ),
                          },
                        }}
                      />
                    )}
                  />
                </Box>

                {/* Password */}
                <Box>
                  <Typography variant="caption" fontWeight={600} sx={{ mb: 0.5, display: 'block', fontSize: 13 }}>
                    Senha
                  </Typography>
                  <Controller
                    name="password"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        fullWidth
                        autoComplete="current-password"
                        error={!!errors.password}
                        helperText={errors.password?.message}
                        disabled={isLoading || isLocked}
                        sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#fafbff' } }}
                        slotProps={{
                          input: {
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small" tabIndex={-1}>
                                  {showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                              </InputAdornment>
                            ),
                          },
                        }}
                      />
                    )}
                  />
                </Box>

                {/* Remember me + Forgot password */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: -1 }}>
                  <Controller
                    name="rememberMe"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={
                          <Checkbox
                            {...field}
                            checked={field.value}
                            size="small"
                            sx={{ color: '#1976d2', '&.Mui-checked': { color: '#1976d2' } }}
                            disabled={isLoading}
                          />
                        }
                        label={<Typography variant="body2" color="text.secondary">Lembrar de mim</Typography>}
                      />
                    )}
                  />
                  <Link
                    component={RouterLink}
                    to="/esqueci-senha"
                    variant="body2"
                    color="primary"
                    underline="hover"
                    sx={{ fontWeight: 600 }}
                  >
                    Esqueci minha senha
                  </Link>
                </Box>

                {/* Submit Button */}
                <LoadingButton
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  loading={isLoading}
                  disabled={isLocked}
                  startIcon={!isLoading && !isLocked ? <Login /> : undefined}
                  sx={{
                    mt: 1,
                    py: 1.5,
                    fontSize: 15,
                    fontWeight: 700,
                    bgcolor: '#1976d2',
                    boxShadow: '0 4px 14px rgba(25,118,210,0.4)',
                    '&:hover': { bgcolor: '#1565c0' },
                  }}
                >
                  {isLocked ? `Aguarde ${cooldownSeconds}s` : 'Entrar'}
                </LoadingButton>
              </Box>

              {/* Divider */}
              <Divider sx={{ my: 3 }}>
                <Typography variant="body2" color="text.secondary">ou</Typography>
              </Divider>

              {/* Footer */}
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Não tem conta?{' '}
                  <Link component={RouterLink} to="/cadastro" color="primary" underline="hover" sx={{ fontWeight: 600 }}>
                    Criar conta grátis
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
