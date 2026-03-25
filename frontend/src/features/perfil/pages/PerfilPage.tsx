import { useEffect, useState, useCallback } from 'react';
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
  Button,
  Paper,
  List,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  InputAdornment,
} from '@mui/material';
import {
  PhotoCamera,
  Edit,
  Save,
  Person,
  Link as LinkIcon,
  LinkOff,
  Search,
  Lock,
  History,
  Warning,
  Logout,
  DeleteForever,
  OpenInNew,
  LockReset,
} from '@mui/icons-material';

import { LoadingButton, PasswordInput } from '@/components/ui';
import { useAuthStore } from '@/features/auth';
import { usuarioService } from '../services';
import { pessoaService } from '@/features/pessoas/services';
import {
  perfilSchema,
  type PerfilFormData,
  alterarSenhaSchema,
  type AlterarSenhaFormData,
} from '../schemas';
import { createLogger } from '@/lib/logger';
import type { Usuario, Pessoa } from '@/types';

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
  const { user, setUser, logout } = useAuthStore();
  const [tab, setTab] = useState(0);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Pessoa vinculada
  const [pessoaVinculada, setPessoaVinculada] = useState<Pessoa | null>(null);
  const [searchMode, setSearchMode] = useState(false);
  const [pessoaSearch, setPessoaSearch] = useState('');
  const [pessoaResults, setPessoaResults] = useState<Pessoa[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [unlinkDialog, setUnlinkDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);

  const fetchPerfil = useCallback(async () => {
    try {
      const data = await usuarioService.buscarMeuPerfil();
      setUsuario(data);
      if (data.pessoaId) {
        try {
          const pessoa = await pessoaService.buscarPorId(data.pessoaId);
          setPessoaVinculada(pessoa);
        } catch { setPessoaVinculada(null); }
      } else {
        setPessoaVinculada(null);
      }
      log.info(`Perfil carregado: id=${data.id}`);
    } catch {
      setError('Erro ao carregar perfil');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPerfil(); }, [fetchPerfil]);

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
    setSaving(true); setError(null); setSuccess(null);
    try {
      const atualizado = await usuarioService.atualizarPerfil(usuario.id, {
        nomeExibicao: data.nomeExibicao,
        pessoaId: usuario.pessoaId,
      });
      setUsuario(atualizado);
      if (user) setUser({ ...user, name: atualizado.nomeExibicao });
      setSuccess('Dados atualizados com sucesso!');
      log.info('Perfil salvo');
    } catch (err) { setError(extractError(err)); }
    finally { setSaving(false); }
  };

  const handleAlterarSenha = async (data: AlterarSenhaFormData) => {
    if (!usuario) return;
    setSaving(true); setError(null); setSuccess(null);
    try {
      await usuarioService.alterarSenha(usuario.id, { senhaAtual: data.senhaAtual, novaSenha: data.novaSenha });
      senhaForm.reset();
      setSuccess('Senha alterada com sucesso!');
      log.info('Senha alterada');
    } catch (err) { setError(extractError(err)); }
    finally { setSaving(false); }
  };

  const handleSearchPessoa = async (query: string) => {
    setPessoaSearch(query);
    if (query.length < 3) { setPessoaResults([]); return; }
    setSearchLoading(true);
    try {
      const results = await pessoaService.buscarPorNome(query);
      setPessoaResults(results);
    } catch { setPessoaResults([]); }
    finally { setSearchLoading(false); }
  };

  const handleLinkPessoa = async (pessoa: Pessoa) => {
    if (!usuario) return;
    setSaving(true); setError(null); setSuccess(null);
    try {
      const atualizado = await usuarioService.atualizarPerfil(usuario.id, {
        nomeExibicao: usuario.nomeExibicao,
        pessoaId: pessoa.id,
      });
      setUsuario(atualizado);
      setPessoaVinculada(pessoa);
      setSearchMode(false);
      setPessoaSearch('');
      setPessoaResults([]);
      setSuccess('Pessoa vinculada com sucesso!');
    } catch (err) { setError(extractError(err)); }
    finally { setSaving(false); }
  };

  const handleUnlinkPessoa = async () => {
    if (!usuario) return;
    setSaving(true); setError(null); setSuccess(null);
    try {
      const atualizado = await usuarioService.atualizarPerfil(usuario.id, {
        nomeExibicao: usuario.nomeExibicao,
        pessoaId: null,
      });
      setUsuario(atualizado);
      setPessoaVinculada(null);
      setUnlinkDialog(false);
      setSuccess('Pessoa desvinculada com sucesso!');
    } catch (err) { setError(extractError(err)); }
    finally { setSaving(false); }
  };

  const handleDesativarConta = async () => {
    if (!usuario) return;
    try {
      await usuarioService.desativar(usuario.id);
      setDeleteDialog(false);
      logout();
    } catch (err) { setError(extractError(err)); setDeleteDialog(false); }
  };

  const initials = usuario?.nomeExibicao
    ?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'U';

  if (loading) {
    return (
      <Box>
        <Skeleton variant="rounded" height={140} sx={{ mb: 3, borderRadius: 3 }} />
        <Skeleton variant="rounded" height={300} sx={{ borderRadius: 3 }} />
      </Box>
    );
  }

  return (
    <Box>
      {/* Alerts */}
      {error && <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 2 }}>{success}</Alert>}

      {/* Profile Banner Header */}
      <Box sx={{
        background: 'linear-gradient(135deg, #1565c0, #1976d2)',
        borderRadius: 3,
        p: 3.5,
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        gap: 2.5,
        mb: 3,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          width: 200,
          height: 200,
          background: 'rgba(255,255,255,.06)',
          borderRadius: '50%',
          right: -40,
          top: -60,
        },
      }}>
        {/* Avatar with camera badge */}
        <Box sx={{ position: 'relative' }}>
          <Avatar sx={{
            width: 72,
            height: 72,
            bgcolor: 'rgba(255,255,255,.25)',
            fontSize: 26,
            fontWeight: 800,
            border: '3px solid rgba(255,255,255,.4)',
            cursor: 'pointer',
          }}>
            {initials}
          </Avatar>
          <Box sx={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: 22,
            height: 22,
            bgcolor: '#fff',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <PhotoCamera sx={{ fontSize: 13, color: 'primary.main' }} />
          </Box>
        </Box>

        <Box sx={{ flex: 1 }}>
          <Typography variant="h5" fontWeight={800}>{usuario?.nomeExibicao || 'Usuário'}</Typography>
          <Typography sx={{ fontSize: 14, opacity: 0.8, mt: 0.3 }}>{usuario?.email}</Typography>
          <Box sx={{ display: 'flex', gap: 1, mt: 1.3 }}>
            <Chip label={usuario?.perfil === 'ADMIN' ? 'Administrador' : 'Usuário'}
              size="small"
              sx={{ bgcolor: 'rgba(255,255,255,.2)', color: '#fff', fontWeight: 700, fontSize: 12 }}
            />
            <Chip
              label={usuario?.ativo ? '● Ativo' : '● Inativo'}
              size="small"
              sx={{
                bgcolor: usuario?.ativo ? '#dcfce7' : '#fee2e2',
                color: usuario?.ativo ? '#166534' : '#991b1b',
                fontWeight: 700, fontSize: 12,
              }}
            />
          </Box>
        </Box>

        <Button
          variant="outlined"
          startIcon={<Edit sx={{ fontSize: 16 }} />}
          onClick={() => setTab(0)}
          sx={{
            color: '#fff',
            borderColor: 'rgba(255,255,255,.4)',
            bgcolor: 'rgba(255,255,255,.2)',
            fontWeight: 600,
            textTransform: 'none',
            flexShrink: 0,
            '&:hover': { bgcolor: 'rgba(255,255,255,.3)', borderColor: 'rgba(255,255,255,.5)' },
          }}
        >
          Editar Perfil
        </Button>
      </Box>

      {/* Tabs */}
      <Tabs
        value={tab}
        onChange={(_, v) => { setTab(v); setError(null); setSuccess(null); }}
        sx={{
          mb: 3.5,
          borderBottom: '2px solid',
          borderColor: 'divider',
          '& .MuiTab-root': { fontWeight: 600, textTransform: 'none', fontSize: 14 },
        }}
      >
        <Tab label="Dados Pessoais" />
        <Tab label="Pessoa Vinculada" />
        <Tab label="Alterar Senha" />
        <Tab label="Conta" />
      </Tabs>

      {/* Tab 0: Dados Pessoais */}
      <TabPanel value={tab} index={0}>
        <Paper sx={{ p: 3, borderRadius: 3, mb: 2.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <Person sx={{ color: 'primary.main', fontSize: 20 }} />
            <Typography variant="subtitle1" fontWeight={700}>Informações do Usuário</Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
            Dados de acesso ao sistema. Estas informações são independentes de uma Pessoa cadastrada.
          </Typography>
          <Box
            component="form"
            onSubmit={perfilForm.handleSubmit(handleSalvarPerfil)}
            sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}
          >
            <Controller
              name="nomeExibicao"
              control={perfilForm.control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Nome de exibição *"
                  fullWidth
                  error={!!perfilForm.formState.errors.nomeExibicao}
                  helperText={perfilForm.formState.errors.nomeExibicao?.message}
                  disabled={saving}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              )}
            />
            <TextField
              label="E-mail *"
              value={usuario?.email || ''}
              fullWidth
              disabled
              helperText="Alterar o e-mail exige confirmação no novo endereço."
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Perfil de acesso"
                value={usuario?.perfil === 'ADMIN' ? 'Administrador' : 'Usuário'}
                fullWidth disabled
                slotProps={{ inputLabel: { shrink: true } }}
              />
              <TextField
                label="Status"
                value={usuario?.ativo ? 'Ativo' : 'Inativo'}
                fullWidth disabled
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 1.5, mt: 1 }}>
              <LoadingButton type="submit" variant="contained" loading={saving} startIcon={<Save sx={{ fontSize: 16 }} />}>
                Salvar alterações
              </LoadingButton>
              <Button variant="outlined" color="inherit" onClick={() => perfilForm.reset()}>
                Cancelar
              </Button>
            </Box>
          </Box>
        </Paper>
      </TabPanel>

      {/* Tab 1: Pessoa vinculada */}
      <TabPanel value={tab} index={1}>
        <Paper sx={{ p: 3, borderRadius: 3, mb: 2.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LinkIcon sx={{ color: 'secondary.main' }} />
              <Typography variant="subtitle1" fontWeight={700}>Pessoa Vinculada</Typography>
            </Box>
            {pessoaVinculada && !searchMode && (
              <Button size="small" variant="outlined" color="inherit" startIcon={<Edit sx={{ fontSize: 14 }} />}
                onClick={() => setSearchMode(true)} sx={{ textTransform: 'none' }}>
                Alterar
              </Button>
            )}
          </Box>

          <Alert severity="info" sx={{ mb: 2.5, borderRadius: 2 }}>
            Um usuário pode estar vinculado a uma Pessoa, mas isso é opcional. Um usuário sem Pessoa pode usar o sistema normalmente.
          </Alert>

          {!searchMode && pessoaVinculada && (
            <Box>
              <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: '.06em', mb: 1, display: 'block' }}>
                Vinculado a:
              </Typography>
              <Box sx={{
                background: 'linear-gradient(135deg, #f3e8ff, #ede9fe)',
                borderRadius: 2.5,
                p: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1.8,
              }}>
                <Avatar sx={{ width: 48, height: 48, bgcolor: 'secondary.main', fontWeight: 700 }}>
                  {pessoaVinculada.nome?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography fontWeight={700} fontSize={15}>{pessoaVinculada.nome}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Nascimento: {pessoaVinculada.dataNascimento} · Idade: {pessoaVinculada.idade}
                  </Typography>
                  <Chip
                    icon={<LinkIcon sx={{ fontSize: 13 }} />}
                    label="Vinculado"
                    size="small"
                    sx={{ mt: 0.8, bgcolor: '#f3e8ff', color: '#6b21a8', fontWeight: 700, fontSize: 11 }}
                  />
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, ml: 'auto' }}>
                  <Button size="small" variant="outlined" color="inherit" startIcon={<OpenInNew sx={{ fontSize: 14 }} />}
                    href="/pessoas" sx={{ textTransform: 'none', fontSize: 13 }}>
                    Ver Pessoa
                  </Button>
                  <Button size="small" variant="contained" color="error" startIcon={<LinkOff sx={{ fontSize: 14 }} />}
                    onClick={() => setUnlinkDialog(true)} sx={{ textTransform: 'none', fontSize: 13 }}>
                    Desvincular
                  </Button>
                </Box>
              </Box>
            </Box>
          )}

          {!searchMode && !pessoaVinculada && (
            <Box sx={{ textAlign: 'center', py: 3.5, color: 'text.secondary' }}>
              <LinkOff sx={{ fontSize: 40, opacity: 0.4, mb: 1 }} />
              <Typography fontSize={14} sx={{ mb: 1.5 }}>Nenhuma Pessoa vinculada.</Typography>
              <Button variant="contained" size="small" startIcon={<Search />} onClick={() => setSearchMode(true)}>
                Buscar e vincular
              </Button>
            </Box>
          )}

          {searchMode && (
            <Box>
              <Typography variant="body2" fontWeight={600} color="text.secondary" sx={{ mb: 1 }}>
                Buscar Pessoa para vincular:
              </Typography>
              <TextField
                fullWidth
                placeholder="Buscar por nome (mín. 3 caracteres)…"
                value={pessoaSearch}
                onChange={e => handleSearchPessoa(e.target.value)}
                size="small"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start"><Search sx={{ fontSize: 18, color: 'text.secondary' }} /></InputAdornment>
                    ),
                  },
                }}
                sx={{ mb: 1 }}
              />
              {searchLoading && <Typography variant="body2" color="text.secondary">Buscando...</Typography>}
              {pessoaResults.length > 0 && (
                <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
                  <List disablePadding>
                    {pessoaResults.map(p => (
                      <ListItemButton key={p.id} onClick={() => handleLinkPessoa(p)}
                        sx={{ borderBottom: '1px solid', borderColor: 'divider', '&:hover': { bgcolor: '#f8f0ff' } }}>
                        <ListItemAvatar>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main', fontSize: 12, fontWeight: 700 }}>
                            {p.nome?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={<Typography fontWeight={600} fontSize={14}>{p.nome}</Typography>}
                          secondary={`Nascimento: ${p.dataNascimento}`}
                        />
                        <Chip label="Disponível" size="small" sx={{ bgcolor: '#dcfce7', color: '#166534', fontWeight: 700, fontSize: 11 }} />
                      </ListItemButton>
                    ))}
                  </List>
                </Paper>
              )}
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Pessoas já vinculadas a outro usuário aparecem como indisponíveis.
              </Typography>
              <Button size="small" sx={{ mt: 1, textTransform: 'none' }}
                onClick={() => { setSearchMode(false); setPessoaSearch(''); setPessoaResults([]); }}>
                Cancelar busca
              </Button>
            </Box>
          )}
        </Paper>
      </TabPanel>

      {/* Tab 2: Alterar Senha */}
      <TabPanel value={tab} index={2}>
        <Paper sx={{ p: 3, borderRadius: 3, maxWidth: 520 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <Lock sx={{ color: 'primary.main', fontSize: 20 }} />
            <Typography variant="subtitle1" fontWeight={700}>Alterar Senha</Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
            Por segurança, confirme sua senha atual antes de criar uma nova.
          </Typography>
          <Box
            component="form"
            onSubmit={senhaForm.handleSubmit(handleAlterarSenha)}
            sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}
          >
            <Controller
              name="senhaAtual"
              control={senhaForm.control}
              render={({ field }) => (
                <PasswordInput {...field} label="Senha atual *" fullWidth autoComplete="current-password"
                  error={!!senhaForm.formState.errors.senhaAtual}
                  helperText={senhaForm.formState.errors.senhaAtual?.message} disabled={saving} />
              )}
            />
            <Controller
              name="novaSenha"
              control={senhaForm.control}
              render={({ field }) => (
                <PasswordInput {...field} label="Nova senha *" fullWidth autoComplete="new-password"
                  error={!!senhaForm.formState.errors.novaSenha}
                  helperText={senhaForm.formState.errors.novaSenha?.message} disabled={saving} showStrength />
              )}
            />
            <Controller
              name="confirmarSenha"
              control={senhaForm.control}
              render={({ field }) => (
                <PasswordInput {...field} label="Confirmar nova senha *" fullWidth autoComplete="new-password"
                  error={!!senhaForm.formState.errors.confirmarSenha}
                  helperText={senhaForm.formState.errors.confirmarSenha?.message} disabled={saving} />
              )}
            />
            <Box sx={{ display: 'flex', gap: 1.5, mt: 1 }}>
              <LoadingButton type="submit" variant="contained" loading={saving} startIcon={<LockReset sx={{ fontSize: 16 }} />}>
                Alterar senha
              </LoadingButton>
              <Button variant="outlined" color="inherit" onClick={() => senhaForm.reset()}>
                Cancelar
              </Button>
            </Box>
          </Box>
        </Paper>
      </TabPanel>

      {/* Tab 3: Conta */}
      <TabPanel value={tab} index={3}>
        {/* Histórico de acesso */}
        <Paper sx={{ p: 3, borderRadius: 3, mb: 2.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <History sx={{ color: 'primary.main', fontSize: 20 }} />
            <Typography variant="subtitle1" fontWeight={700}>Histórico de acesso</Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Últimos acessos ao sistema com este usuário.
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            {[
              { date: usuario?.atualizadoEm || 'Agora', device: 'Navegador — Sessão atual', current: true },
            ].map((item, i) => (
              <Box key={i} sx={{
                py: 1.2,
                borderBottom: '1px solid',
                borderColor: 'divider',
                fontSize: 13,
                display: 'flex',
                gap: 2,
                alignItems: 'center',
              }}>
                <Typography variant="body2" color="text.secondary" sx={{ minWidth: 150 }}>{item.date}</Typography>
                <Typography variant="body2">{item.device}</Typography>
                {item.current && (
                  <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 600, ml: 'auto' }}>
                    ● Sessão atual
                  </Typography>
                )}
              </Box>
            ))}
          </Box>
        </Paper>

        {/* Zona de perigo */}
        <Box sx={{
          bgcolor: '#fff5f5',
          border: '1.5px solid #fecaca',
          borderRadius: 3,
          p: 2.5,
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.8 }}>
            <Warning sx={{ fontSize: 18, color: 'error.main' }} />
            <Typography fontWeight={700} fontSize={15} color="error.main">Zona de Perigo</Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Estas ações são irreversíveis. Certifique-se antes de continuar.
          </Typography>
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            <Button variant="contained" color="error" size="small" startIcon={<Logout sx={{ fontSize: 15 }} />}
              onClick={logout} sx={{ textTransform: 'none' }}>
              Encerrar todas as sessões
            </Button>
            <Button variant="outlined" color="error" size="small" startIcon={<DeleteForever sx={{ fontSize: 15 }} />}
              onClick={() => setDeleteDialog(true)} sx={{ textTransform: 'none' }}>
              Excluir conta
            </Button>
          </Box>
        </Box>
      </TabPanel>

      {/* Unlink confirmation dialog */}
      <Dialog open={unlinkDialog} onClose={() => setUnlinkDialog(false)}>
        <DialogTitle>Desvincular Pessoa</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Deseja realmente desvincular <strong>{pessoaVinculada?.nome}</strong> do seu perfil?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUnlinkDialog(false)}>Cancelar</Button>
          <LoadingButton color="error" variant="contained" loading={saving} onClick={handleUnlinkPessoa}>
            Desvincular
          </LoadingButton>
        </DialogActions>
      </Dialog>

      {/* Delete account dialog */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogTitle>Excluir Conta</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja excluir sua conta? Esta ação é irreversível.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>Cancelar</Button>
          <Button color="error" variant="contained" onClick={handleDesativarConta}>
            Excluir conta
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
