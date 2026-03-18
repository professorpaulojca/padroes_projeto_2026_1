import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Typography,
  Alert,
  Tabs,
  Tab,
  Divider,
  Avatar,
  Chip,
  Skeleton,
} from '@mui/material';

import { PageHeader, LoadingButton, PasswordInput } from '@/components/ui';
import { useAuthStore } from '@/features/auth';
import { usuarioService } from '../services';
import {
  perfilSchema,
  type PerfilFormData,
  alterarSenhaSchema,
  type AlterarSenhaFormData,
} from '../schemas';
import { createLogger } from '@/lib/logger';
import type { Usuario } from '@/types';

const log = createLogger('PERFIL');

interface TabPanelProps {
  children?: React.ReactNode;
  value: number;
  index: number;
}

const TabPanel = ({ children, value, index }: TabPanelProps) => (
  <Box role="tabpanel" hidden={value !== index} sx={{ pt: 3 }}>
    {value === index && children}
  </Box>
);

export const PerfilPage = () => {
  const { user, setUser } = useAuthStore();
  const [tab, setTab] = useState(0);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchPerfil = async () => {
      try {
        const data = await usuarioService.buscarMeuPerfil();
        setUsuario(data);
        log.info(`Perfil carregado: id=${data.id}`);
      } catch {
        setError('Erro ao carregar perfil');
      } finally {
        setLoading(false);
      }
    };
    fetchPerfil();
  }, []);

  const perfilForm = useForm<PerfilFormData>({
    resolver: zodResolver(perfilSchema),
    values: usuario ? { nomeExibicao: usuario.nomeExibicao } : { nomeExibicao: '' },
  });

  const senhaForm = useForm<AlterarSenhaFormData>({
    resolver: zodResolver(alterarSenhaSchema),
    defaultValues: { senhaAtual: '', novaSenha: '', confirmarSenha: '' },
  });

  const extractError = (err: unknown): string => {
    if (typeof err === 'object' && err !== null && 'response' in err) {
      const axiosErr = err as { response?: { data?: { erro?: string } } };
      if (axiosErr.response?.data?.erro) return axiosErr.response.data.erro;
    }
    if (err instanceof Error) return err.message;
    return 'Erro inesperado';
  };

  const handleSalvarPerfil = async (data: PerfilFormData) => {
    if (!usuario) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const atualizado = await usuarioService.atualizarPerfil(usuario.id, {
        nomeExibicao: data.nomeExibicao,
        pessoaId: usuario.pessoaId,
      });
      setUsuario(atualizado);
      if (user) {
        setUser({ ...user, name: atualizado.nomeExibicao });
      }
      setSuccess('Perfil atualizado com sucesso!');
      log.info('Perfil salvo');
    } catch (err) {
      setError(extractError(err));
    } finally {
      setSaving(false);
    }
  };

  const handleAlterarSenha = async (data: AlterarSenhaFormData) => {
    if (!usuario) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await usuarioService.alterarSenha(usuario.id, {
        senhaAtual: data.senhaAtual,
        novaSenha: data.novaSenha,
      });
      senhaForm.reset();
      setSuccess('Senha alterada com sucesso!');
      log.info('Senha alterada');
    } catch (err) {
      setError(extractError(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box>
        <PageHeader title="Meu Perfil" breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Perfil' }]} />
        <Card><CardContent><Skeleton height={200} /></CardContent></Card>
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title="Meu Perfil"
        subtitle="Gerencie suas informações pessoais"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Perfil' }]}
      />

      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      {/* User info header */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 3, p: 3 }}>
          <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main', fontSize: 24 }}>
            {usuario?.nomeExibicao?.charAt(0)?.toUpperCase() || 'U'}
          </Avatar>
          <Box>
            <Typography variant="h5" fontWeight={600}>
              {usuario?.nomeExibicao || 'Usuário'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {usuario?.email}
            </Typography>
            <Box sx={{ mt: 0.5, display: 'flex', gap: 1 }}>
              <Chip
                label={usuario?.perfil}
                size="small"
                color="primary"
                variant="outlined"
              />
              <Chip
                label={usuario?.ativo ? 'Ativo' : 'Inativo'}
                size="small"
                color={usuario?.ativo ? 'success' : 'error'}
                variant="outlined"
              />
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Card>
        <Tabs value={tab} onChange={(_, v) => { setTab(v); setError(null); setSuccess(null); }} sx={{ px: 2 }}>
          <Tab label="Dados Pessoais" />
          <Tab label="Segurança" />
        </Tabs>
        <Divider />
        <CardContent sx={{ p: 3 }}>
          {/* Tab 0: Dados */}
          <TabPanel value={tab} index={0}>
            <Box
              component="form"
              onSubmit={perfilForm.handleSubmit(handleSalvarPerfil)}
              sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: 480 }}
            >
              <TextField
                label="Email"
                value={usuario?.email || ''}
                fullWidth
                disabled
                slotProps={{ inputLabel: { shrink: true } }}
              />
              <Controller
                name="nomeExibicao"
                control={perfilForm.control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Nome de exibição"
                    fullWidth
                    error={!!perfilForm.formState.errors.nomeExibicao}
                    helperText={perfilForm.formState.errors.nomeExibicao?.message}
                    disabled={saving}
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                )}
              />
              {usuario?.pessoaNome && (
                <TextField
                  label="Pessoa vinculada"
                  value={usuario.pessoaNome}
                  fullWidth
                  disabled
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              )}
              <LoadingButton
                type="submit"
                variant="contained"
                loading={saving}
                sx={{ alignSelf: 'flex-start' }}
              >
                Salvar Alterações
              </LoadingButton>
            </Box>
          </TabPanel>

          {/* Tab 1: Segurança */}
          <TabPanel value={tab} index={1}>
            <Box
              component="form"
              onSubmit={senhaForm.handleSubmit(handleAlterarSenha)}
              sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: 480 }}
            >
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Altere sua senha de acesso ao sistema.
              </Typography>
              <Controller
                name="senhaAtual"
                control={senhaForm.control}
                render={({ field }) => (
                  <PasswordInput
                    {...field}
                    label="Senha Atual"
                    fullWidth
                    autoComplete="current-password"
                    error={!!senhaForm.formState.errors.senhaAtual}
                    helperText={senhaForm.formState.errors.senhaAtual?.message}
                    disabled={saving}
                  />
                )}
              />
              <Controller
                name="novaSenha"
                control={senhaForm.control}
                render={({ field }) => (
                  <PasswordInput
                    {...field}
                    label="Nova Senha"
                    fullWidth
                    autoComplete="new-password"
                    error={!!senhaForm.formState.errors.novaSenha}
                    helperText={senhaForm.formState.errors.novaSenha?.message}
                    disabled={saving}
                    showStrength
                  />
                )}
              />
              <Controller
                name="confirmarSenha"
                control={senhaForm.control}
                render={({ field }) => (
                  <PasswordInput
                    {...field}
                    label="Confirmar Nova Senha"
                    fullWidth
                    autoComplete="new-password"
                    error={!!senhaForm.formState.errors.confirmarSenha}
                    helperText={senhaForm.formState.errors.confirmarSenha?.message}
                    disabled={saving}
                  />
                )}
              />
              <LoadingButton
                type="submit"
                variant="contained"
                loading={saving}
                sx={{ alignSelf: 'flex-start' }}
              >
                Alterar Senha
              </LoadingButton>
            </Box>
          </TabPanel>
        </CardContent>
      </Card>
    </Box>
  );
};
