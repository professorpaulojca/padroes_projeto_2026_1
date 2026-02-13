import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router';
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
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  LockOutlined,
} from '@mui/icons-material';

import { LoadingButton } from '@/components/ui';
import { useAuthStore } from '../stores';
import { loginSchema, type LoginFormData } from '../schemas';

export const LoginPage = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const { login, isLoading, error, clearError } = useAuthStore();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      clearError();
      await login(data.email, data.password);
      navigate('/dashboard');
    } catch {
      // Erro já tratado pelo store
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <Fade in timeout={600}>
      <Card
        elevation={8}
        sx={{
          width: '100%',
          maxWidth: 440,
          mx: 'auto',
          overflow: 'visible',
        }}
      >
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          {/* Header */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              mb: 4,
            }}
          >
            <Avatar
              sx={{
                width: 56,
                height: 56,
                bgcolor: 'primary.main',
                mb: 2,
                boxShadow: '0 4px 14px rgba(25, 118, 210, 0.4)',
              }}
            >
              <LockOutlined fontSize="large" />
            </Avatar>
            <Typography
              variant="h4"
              component="h1"
              fontWeight={700}
              color="text.primary"
            >
              Bem-vindo
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Faça login para acessar o sistema
            </Typography>
          </Box>

          {/* Error Alert */}
          {error && (
            <Fade in>
              <Alert
                severity="error"
                onClose={clearError}
                sx={{ mb: 3, borderRadius: 2 }}
              >
                {error}
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
                  autoFocus
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  disabled={isLoading}
                  slotProps={{
                    inputLabel: { shrink: true },
                  }}
                />
              )}
            />

            {/* Password */}
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Senha"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••"
                  fullWidth
                  autoComplete="current-password"
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  disabled={isLoading}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="alternar visibilidade da senha"
                            onClick={togglePasswordVisibility}
                            edge="end"
                            size="small"
                            tabIndex={-1}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                    inputLabel: { shrink: true },
                  }}
                />
              )}
            />

            {/* Remember me + Forgot password */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mt: -1,
              }}
            >
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
                        color="primary"
                        disabled={isLoading}
                      />
                    }
                    label={
                      <Typography variant="body2" color="text.secondary">
                        Lembrar-me
                      </Typography>
                    }
                  />
                )}
              />
              <Link
                href="#"
                variant="body2"
                color="primary"
                underline="hover"
                sx={{ fontWeight: 500 }}
              >
                Esqueceu a senha?
              </Link>
            </Box>

            {/* Submit Button */}
            <LoadingButton
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              loading={isLoading}
              sx={{
                mt: 1,
                py: 1.5,
                fontSize: '1rem',
              }}
            >
              Entrar
            </LoadingButton>
          </Box>

          {/* Footer */}
          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Não tem uma conta?{' '}
              <Link
                href="#"
                color="primary"
                underline="hover"
                sx={{ fontWeight: 600 }}
              >
                Criar conta
              </Link>
            </Typography>
          </Box>

          {/* Demo credentials hint */}
          <Alert
            severity="info"
            variant="outlined"
            sx={{ mt: 3, borderRadius: 2 }}
          >
            <Typography variant="caption" component="div">
              <strong>Credenciais de teste:</strong>
              <br />
              Email: admin@email.com
              <br />
              Senha: 123456
            </Typography>
          </Alert>
        </CardContent>
      </Card>
    </Fade>
  );
};
