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
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import { LockResetOutlined } from '@mui/icons-material';

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

const steps = ['Informe o email', 'Código de verificação', 'Nova senha'];

export const EsqueciSenhaPage = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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
      setActiveStep(2);
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

  return (
    <Fade in timeout={600}>
      <Card
        elevation={8}
        sx={{ width: '100%', maxWidth: 480, mx: 'auto', overflow: 'visible' }}
      >
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
            <Avatar
              sx={{
                width: 56,
                height: 56,
                bgcolor: 'primary.main',
                mb: 2,
                boxShadow: '0 4px 14px rgba(25, 118, 210, 0.4)',
              }}
            >
              <LockResetOutlined fontSize="large" />
            </Avatar>
            <Typography variant="h4" component="h1" fontWeight={700}>
              Recuperar Senha
            </Typography>
          </Box>

          <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && (
            <Fade in>
              <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 3, borderRadius: 2 }}>
                {error}
              </Alert>
            </Fade>
          )}

          {/* Step 0: Email */}
          {activeStep === 0 && (
            <Box
              component="form"
              onSubmit={emailForm.handleSubmit(handleEnviarEmail)}
              noValidate
              sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}
            >
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Informe seu email cadastrado. Enviaremos um código de recuperação.
              </Typography>
              <Controller
                name="email"
                control={emailForm.control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Email"
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
                sx={{ py: 1.5 }}
              >
                Enviar Código
              </LoadingButton>
            </Box>
          )}

          {/* Step 1: Token + Nova Senha */}
          {activeStep === 1 && (
            <Box
              component="form"
              onSubmit={redefinirForm.handleSubmit(handleRedefinir)}
              noValidate
              sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}
            >
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Insira o código recebido e defina sua nova senha.
              </Typography>
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
                    label="Nova Senha"
                    placeholder="Mínimo 6 caracteres"
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
                    label="Confirmar Nova Senha"
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
                sx={{ py: 1.5 }}
              >
                Redefinir Senha
              </LoadingButton>
            </Box>
          )}

          {/* Step 2: Sucesso */}
          {activeStep === 2 && success && (
            <Alert severity="success" sx={{ borderRadius: 2 }}>
              Senha redefinida com sucesso! Redirecionando para o login...
            </Alert>
          )}

          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Link
              component={RouterLink}
              to="/login"
              variant="body2"
              color="primary"
              underline="hover"
              sx={{ fontWeight: 500 }}
            >
              Voltar para o login
            </Link>
          </Box>
        </CardContent>
      </Card>
    </Fade>
  );
};
