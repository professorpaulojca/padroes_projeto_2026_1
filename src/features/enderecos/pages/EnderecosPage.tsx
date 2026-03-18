import { useEffect, useState, useCallback } from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  Button,
} from '@mui/material';
import {
  Search,
  Add,
  Edit,
  Delete,
  LocationOn,
  Star,
} from '@mui/icons-material';

import { PageHeader, EmptyState, ConfirmDialog } from '@/components/ui';
import { useEnderecoStore } from '../stores';
import { EnderecoDrawer } from '../components';
import { TIPO_ENDERECO_LABELS } from '@/types';
import type { Endereco } from '@/types';
import type { EnderecoFormData } from '../schemas';

export const EnderecosPage = () => {
  const {
    enderecos,
    isLoading,
    error,
    listar,
    criar,
    atualizar,
    excluir,
    clearError,
  } = useEnderecoStore();

  const [busca, setBusca] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editando, setEditando] = useState<Endereco | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  useEffect(() => {
    listar();
  }, [listar]);

  const enderecosFiltrados = enderecos.filter((e) => {
    const termo = busca.toLowerCase();
    return (
      e.cep?.toLowerCase().includes(termo) ||
      e.logradouro?.toLowerCase().includes(termo) ||
      e.bairro?.toLowerCase().includes(termo) ||
      e.cidade?.toLowerCase().includes(termo)
    );
  });

  const handleCriar = useCallback(async (data: EnderecoFormData) => {
    await criar(data);
  }, [criar]);

  const handleEditar = useCallback(async (data: EnderecoFormData) => {
    if (editando) {
      await atualizar(editando.id, data);
      setEditando(null);
    }
  }, [editando, atualizar]);

  const handleExcluir = useCallback(async () => {
    if (deleteId !== null) {
      await excluir(deleteId);
      setDeleteId(null);
    }
  }, [deleteId, excluir]);

  return (
    <Box>
      <PageHeader
        title="Endereços"
        subtitle="Gerencie os endereços cadastrados"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Endereços' }]}
        action={
          <Button variant="contained" startIcon={<Add />} onClick={() => { setEditando(null); setDrawerOpen(true); }}>
            Novo Endereço
          </Button>
        }
      />

      {error && (
        <Alert severity="error" onClose={clearError} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TextField
        placeholder="Buscar por CEP, logradouro, bairro ou cidade..."
        size="small"
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        sx={{ mb: 3, width: { xs: '100%', sm: 400 } }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <Search color="action" />
              </InputAdornment>
            ),
          },
        }}
      />

      {enderecosFiltrados.length === 0 && !isLoading ? (
        <EmptyState
          title="Nenhum endereço encontrado"
          description={busca ? 'Tente outro termo de busca.' : 'Comece adicionando um novo endereço.'}
          action={
            !busca && (
              <Button variant="outlined" startIcon={<Add />} onClick={() => { setEditando(null); setDrawerOpen(true); }}>
                Adicionar Endereço
              </Button>
            )
          }
        />
      ) : (
        <Grid container spacing={2}>
          {enderecosFiltrados.map((endereco) => (
            <Grid key={endereco.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocationOn color="primary" fontSize="small" />
                      <Typography variant="subtitle1" fontWeight={600}>
                        {endereco.logradouro}, {endereco.numero}
                      </Typography>
                    </Box>
                    {endereco.enderecoPrincipal === 'SIM' && (
                      <Tooltip title="Endereço principal">
                        <Star color="warning" fontSize="small" />
                      </Tooltip>
                    )}
                  </Box>
                  {endereco.complemento && (
                    <Typography variant="body2" color="text.secondary">
                      {endereco.complemento}
                    </Typography>
                  )}
                  <Typography variant="body2" color="text.secondary">
                    {endereco.bairro} — {endereco.cidade}/{endereco.estado}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    CEP: {endereco.cep}
                  </Typography>
                  <Box sx={{ mt: 1.5 }}>
                    <Chip
                      label={TIPO_ENDERECO_LABELS[endereco.tipoEndereco] || endereco.tipoEndereco}
                      size="small"
                      variant="outlined"
                      color="primary"
                    />
                  </Box>
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 1.5 }}>
                  <Tooltip title="Editar">
                    <IconButton size="small" onClick={() => { setEditando(endereco); setDrawerOpen(true); }}>
                      <Edit fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Excluir">
                    <IconButton size="small" color="error" onClick={() => setDeleteId(endereco.id)}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <EnderecoDrawer
        open={drawerOpen}
        onClose={() => { setDrawerOpen(false); setEditando(null); }}
        onSubmit={editando ? handleEditar : handleCriar}
        endereco={editando}
        loading={isLoading}
      />

      <ConfirmDialog
        open={deleteId !== null}
        title="Excluir Endereço"
        message="Tem certeza que deseja excluir este endereço? Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        onConfirm={handleExcluir}
        onCancel={() => setDeleteId(null)}
        loading={isLoading}
      />
    </Box>
  );
};
