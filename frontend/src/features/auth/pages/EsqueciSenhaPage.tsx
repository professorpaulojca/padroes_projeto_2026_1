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
import {
  Key,
  MarkEmailRead,
  LockReset,
  CheckCircle,
  Send,
  Verified,
  Save,
  Login,
  Info,
} from '@mui/icons-material';

import { LoadingButton, PasswordInput } from '@/components/ui';
import { api } from '@/lib/axios';
import { createLogger } from '@/lib/logger';
import {
  esqueciSenhaSchema,
  type EsqueciSenhaFormData,
  redefinirSenhaSchema,
  type RedefinirSenhaFormData,
} from '../schemas';

const log = createLogger('ESQUECI_SENHA');

const stepLabels = ['E-mail', 'Código', 'Nova senha'];

interface StepIndicatorProps {
  activeStep: number;
}

const StepIndicator = ({ activeStep }: StepIndicatorProps) => (
  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 4, gap: 0 }}>
    {stepLabels.map((label, i) => {
      const isDone = i < activeStep;
      const isActive = i === activeStep;
      return (
        <Box key={i} sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{
              width: 32, height: 32, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              bgcolor: isDone ? '#2e7d32' : isActive ? '#1976d2' : '#e0e0e0',
              color: isDone || isActive ? '#fff' : '#999',
              fontSize: 14, fontWeight: 700,
            }}>
              {isDone ? <CheckCircle sx={{ fontSize: 18 }} /> : i + 1}
            </Box>
            <Typography variant="caption" fontWeight={isActive ? 600 : 400} color={isActive ? 'primary' : 'text.secondary'} sx={{ fontSize: 11 }}>
              {label}
            </Typography>
          </Box>
          {i < stepLabels.length - 1 && (
            <Box sx={{ width: 48, height: 2, bgcolor: isDone ? '#2e7d32' : '#e0e0e0', mx: 1, mt: -2 }} />
          )}
        </Box>
      );
    })}
  </Box>
);

export const EsqueciSenhaPage = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');

  const emailForm = useForm<EsqueciSenhaFormData>({
    resolver: zodResolver(esqueciSenhaSchema),
    defaultValues: { email: '' },
  });

  const redefinirForm = useForm<RedefinirSenhaFormData>({
    resolver: zodResolver(redefinirSenhaSchema),
    defaultValues: { token: '', novaSenha: '', confirmarSenha: '' },
  });

  const handleEnviarEmail = async (data: EsqueciSenhaFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      log.info(`Solicitação de recuperação: email=${data.email}`);
      await api.post('/auth/esqueci-senha', { email: data.email });
      log.info('Token de recuperação enviado');
      setSubmittedEmail(data.email);
      setActiveStep(1);
    } catch (err) {
      let message = 'Erro ao enviar email de recuperação';
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const axiosErr = err as { response?: { data?: { erro?: string } } };
        if (axiosErr.response?.data?.erro) message = axiosErr.response.data.erro;
      }
      log.error(`Erro: ${message}`);
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRedefinir = async (data: RedefinirSenhaFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      log.info('Redefinindo senha com token');
      await api.post('/auth/redefinir-senha', {
        token: data.token,
        novaSenha: data.novaSenha,
      });
      log.info('Senha redefinida com sucesso');
      setSuccess(true);
      setActiveStep(3);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      let message = 'Erro ao redefinir senha';
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const axiosErr = err as { response?: { data?: { erro?: string } } };
        if (axiosErr.response?.data?.erro) message = axiosErr.response.data.erro;
      }
      log.error(`Erro: ${message}`);
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const cardSx = {
    width: '100%',
    maxWidth: 480,
    borderRadius: 4,
    overflow: 'visible',
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      bgcolor: '#f0f4ff',
      py: 4,
      px: 2,
    }}>
      {/* Step 0: Email */}
      {activeStep === 0 && (
        <Fade in timeout={600}>
          <Card elevation={8} sx={cardSx}>
            <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
              <StepIndicator activeStep={0} />

              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                <Avatar variant="rounded" sx={{ width: 56, height: 56, bgcolor: '#0288d1', mb: 2, borderRadius: '14px' }}>
                  <Key fontSize="large" />
                </Avatar>
                <Typography sx={{ fontSize: 24, fontWeight: 800 }}>Esqueci minha senha</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, textAlign: 'center' }}>
                  Informe seu e-mail cadastrado e enviaremos um código de verificação.
                </Typography>
              </Box>

              <Alert severity="info" icon={<Info />} sx={{ mb: 3, borderRadius: 2, bgcolor: '#e0f2fe' }}>
                Verifique também sua caixa de spam após o envio.
              </Alert>

              {error && (
                <Fade in>
                  <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 3, borderRadius: 2 }}>
                    {error}
                  </Alert>
                </Fade>
              )}

              <Box
                component="form"
                onSubmit={emailForm.handleSubmit(handleEnviarEmail)}
                noValidate
                sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}
              >
                <Controller
                  name="email"
                  control={emailForm.control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="E-mail cadastrado"
                      type="email"
                      placeholder="seu@email.com"
                      fullWidth
                      autoFocus
                      autoComplete="email"
                      error={!!emailForm.formState.errors.email}
                      helperText={emailForm.formState.errors.email?.message}
                      disabled={isLoading}
                      slotProps={{ inputLabel: { shrink: true } }}
                    />
                  )}
                />
                <LoadingButton
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  loading={isLoading}
                  startIcon={!isLoading ? <Send /> : undefined}
                  sx={{ py: 1.5 }}
                >
                  Enviar código
                </LoadingButton>
              </Box>

              <Box sx={{ textAlign: 'center', mt: 3 }}>
                <Link component={RouterLink} to="/login" variant="body2" color="primary" underline="hover" sx={{ fontWeight: 500 }}>
                  ← Voltar ao login
                </Link>
              </Box>
            </CardContent>
          </Card>
        </Fade>
      )}

      {/* Step 1: Verification Code + New Password */}
      {activeStep === 1 && (
        <Fade in timeout={600}>
          <Card elevation={8} sx={cardSx}>
            <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
              <StepIndicator activeStep={1} />

              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                <Avatar variant="rounded" sx={{ width: 56, height: 56, bgcolor: '#0288d1', mb: 2, borderRadius: '14px' }}>
                  <MarkEmailRead fontSize="large" />
                </Avatar>
                <Typography sx={{ fontSize: 24, fontWeight: 800 }}>Verifique seu e-mail</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, textAlign: 'center' }}>
                  Enviamos um código de verificação para <strong>{submittedEmail}</strong>
                </Typography>
              </Box>

              {error && (
                <Fade in>
                  <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 3, borderRadius: 2 }}>
                    {error}
                  </Alert>
                </Fade>
              )}

              <Box
                component="form"
                onSubmit={redefinirForm.handleSubmit(handleRedefinir)}
                noValidate
                sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}
              >
                <Controller
                  name="token"
                  control={redefinirForm.control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Código de verificação"
                      placeholder="Cole o código aqui"
                      fullWidth
                      autoFocus
                      error={!!redefinirForm.formState.errors.token}
                      helperText={redefinirForm.formState.errors.token?.message}
                      disabled={isLoading}
                      sx={{
                        '& input': { fontSize: 20, fontWeight: 700, letterSpacing: 4, textAlign: 'center' },
                      }}
                      slotProps={{ inputLabel: { shrink: true } }}
                    />
                  )}
                />

                <Controller
                  name="novaSenha"
                  control={redefinirForm.control}
                  render={({ field }) => (
                    <PasswordInput
                      {...field}
                      label="Nova senha"
                      placeholder="Mínimo 8 caracteres"
                      fullWidth
                      autoComplete="new-password"
                      error={!!redefinirForm.formState.errors.novaSenha}
                      helperText={redefinirForm.formState.errors.novaSenha?.message}
                      disabled={isLoading}
                      showStrength
                    />
                  )}
                />

                <Controller
                  name="confirmarSenha"
                  control={redefinirForm.control}
                  render={({ field }) => (
                    <PasswordInput
                      {...field}
                      label="Confirmar nova senha"
                      placeholder="Repita a nova senha"
                      fullWidth
                      autoComplete="new-password"
                      error={!!redefinirForm.formState.errors.confirmarSenha}
                      helperText={redefinirForm.formState.errors.confirmarSenha?.message}
                      disabled={isLoading}
                    />
                  )}
                />

                <LoadingButton
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  loading={isLoading}
                  startIcon={!isLoading ? <Save /> : undefined}
                  sx={{ py: 1.5 }}
                >
                  Salvar nova senha
                </LoadingButton>
              </Box>

              <Box sx={{ textAlign: 'center', mt: 3 }}>
                <Link
                  component="button"
                  variant="body2"
                  color="primary"
                  underline="hover"
                  onClick={() => { setActiveStep(0); setError(null); }}
                  sx={{ fontWeight: 500 }}
                >
                  ← Usar outro e-mail
                </Link>
              </Box>
            </CardContent>
          </Card>
        </Fade>
      )}

      {/* Step 3: Success */}
      {activeStep === 3 && success && (
        <Fade in timeout={600}>
          <Card elevation={8} sx={cardSx}>
            <CardContent sx={{ p: { xs: 3, sm: 4 }, textAlign: 'center' }}>
              <StepIndicator activeStep={3} />

              <Box sx={{
                width: 72, height: 72, borderRadius: '50%', bgcolor: '#dcfce7',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                mx: 'auto', mb: 3,
              }}>
                <CheckCircle sx={{ fontSize: 36, color: '#2e7d32' }} />
              </Box>

              <Typography sx={{ fontSize: 24, fontWeight: 800, mb: 1 }}>Senha redefinida!</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Sua senha foi alterada com sucesso. Faça login com a nova senha.
              </Typography>

              <LoadingButton
                variant="contained"
                size="large"
                fullWidth
                startIcon={<Login />}
                onClick={() => navigate('/login')}
                sx={{ py: 1.5 }}
              >
                Ir para o login
              </LoadingButton>
            </CardContent>
          </Card>
        </Fade>
      )}
    </Box>
  );
};
