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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Search,
  AddLocationAlt,
  Edit,
  Delete,
  LocationOn,
  Star,
  CheckCircle,
  Warning,
} from '@mui/icons-material';

import { PageHeader, EmptyState, ConfirmDialog } from '@/components/ui';
import { useEnderecoStore } from '../stores';
import { EnderecoDrawer } from '../components';
import { TIPO_ENDERECO_LABELS } from '@/types';
import type { Endereco, TipoEndereco } from '@/types';
import type { EnderecoFormData } from '../schemas';

const CARD_GRADIENTS: Record<string, string> = {
  RESIDENCIAL: 'linear-gradient(135deg, #1565c0, #42a5f5)',
  COMERCIAL: 'linear-gradient(135deg, #7b1fa2, #ba68c8)',
  COBRANCA: 'linear-gradient(135deg, #2e7d32, #66bb6a)',
  ENTREGA: 'linear-gradient(135deg, #ed6c02, #ffb74d)',
  OUTRO: 'linear-gradient(135deg, #616161, #9e9e9e)',
};

const TIPO_CHIP_COLORS: Record<string, string> = {
  RESIDENCIAL: '#1976d2',
  COMERCIAL: '#9c27b0',
  COBRANCA: '#2e7d32',
  ENTREGA: '#ed6c02',
  OUTRO: '#616161',
};

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
  const [filtroTipo, setFiltroTipo] = useState<string>('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editando, setEditando] = useState<Endereco | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  useEffect(() => {
    listar();
  }, [listar]);

  const enderecosFiltrados = enderecos.filter((e) => {
    const termo = busca.toLowerCase();
    const matchBusca =
      e.cep?.toLowerCase().includes(termo) ||
      e.logradouro?.toLowerCase().includes(termo) ||
      e.bairro?.toLowerCase().includes(termo) ||
      e.cidade?.toLowerCase().includes(termo);
    const matchTipo = !filtroTipo || e.tipoEndereco === filtroTipo;
    return matchBusca && matchTipo;
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
          <Button
            variant="contained"
            startIcon={<AddLocationAlt />}
            onClick={() => { setEditando(null); setDrawerOpen(true); }}
            sx={{ fontWeight: 600 }}
          >
            Novo Endereço
          </Button>
        }
      />

      {error && (
        <Alert severity="error" onClose={clearError} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Info note */}
      <Alert severity="info" sx={{ mb: 3, borderRadius: 2, borderLeft: '4px solid #1976d2' }}>
        <strong>Relação N:N — Endereço × Pessoa:</strong> Um endereço pode pertencer a múltiplas pessoas. Ao vincular um endereço já cadastrado a outra pessoa, o sistema reutiliza o registro.
      </Alert>

      {/* Toolbar */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          placeholder="Buscar por rua, bairro, CEP ou cidade..."
          size="small"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          sx={{ width: { xs: '100%', sm: 360 } }}
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
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Tipo</InputLabel>
          <Select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            label="Tipo"
          >
            <MenuItem value="">Todos os tipos</MenuItem>
            {(Object.entries(TIPO_ENDERECO_LABELS) as [TipoEndereco, string][]).map(([val, label]) => (
              <MenuItem key={val} value={val}>{label}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Cards Grid */}
      {enderecosFiltrados.length === 0 && !isLoading ? (
        <EmptyState
          title="Nenhum endereço encontrado"
          description={busca || filtroTipo ? 'Tente outro filtro.' : 'Comece adicionando um novo endereço.'}
          action={
            !busca && !filtroTipo && (
              <Button variant="outlined" startIcon={<AddLocationAlt />} onClick={() => { setEditando(null); setDrawerOpen(true); }}>
                Adicionar Endereço
              </Button>
            )
          }
        />
      ) : (
        <Grid container spacing={2}>
          {enderecosFiltrados.map((endereco) => {
            const gradient = CARD_GRADIENTS[endereco.tipoEndereco] || CARD_GRADIENTS.OUTRO;
            const chipColor = TIPO_CHIP_COLORS[endereco.tipoEndereco] || '#616161';
            const isPrincipal = endereco.enderecoPrincipal === 'SIM';

            return (
              <Grid key={endereco.id} size={{ xs: 12, sm: 6, md: 4 }}>
                <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 2, overflow: 'hidden' }}>
                  {/* Card map header */}
                  <Box sx={{
                    height: 80,
                    background: gradient,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    px: 2,
                  }}>
                    <Box>
                      <Chip
                        label={TIPO_ENDERECO_LABELS[endereco.tipoEndereco] || endereco.tipoEndereco}
                        size="small"
                        sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#fff', fontWeight: 600, fontSize: 11 }}
                      />
                    </Box>
                    {isPrincipal && (
                      <Chip
                        icon={<Star sx={{ color: '#fff !important', fontSize: 14 }} />}
                        label="Principal"
                        size="small"
                        sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#fff', fontWeight: 600, fontSize: 11 }}
                      />
                    )}
                  </Box>

                  <CardContent sx={{ flex: 1, pt: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <LocationOn sx={{ color: chipColor, fontSize: 20 }} />
                      <Typography variant="subtitle1" fontWeight={600}>
                        {endereco.logradouro}, {endereco.numero}
                      </Typography>
                    </Box>
                    {endereco.complemento && (
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 3.5 }}>
                        {endereco.complemento}
                      </Typography>
                    )}
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 3.5 }}>
                      {endereco.bairro} · {endereco.cidade} — {endereco.estado}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 3.5 }}>
                      CEP: {endereco.cep} · {endereco.pais}
                    </Typography>

                    <Box sx={{ mt: 1.5, ml: 3.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <CheckCircle sx={{ fontSize: 14, color: '#2e7d32' }} />
                      <Typography variant="caption" sx={{ color: '#2e7d32', fontWeight: 600 }}>
                        CEP válido
                      </Typography>
                    </Box>
                  </CardContent>

                  <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
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
            );
          })}
        </Grid>
      )}

      {/* Drawer */}
      <EnderecoDrawer
        open={drawerOpen}
        onClose={() => { setDrawerOpen(false); setEditando(null); }}
        onSubmit={editando ? handleEditar : handleCriar}
        endereco={editando}
        loading={isLoading}
      />

      {/* Delete confirmation */}
      <ConfirmDialog
        open={deleteId !== null}
        title="Excluir Endereço"
        message="Tem certeza que deseja excluir este endereço? Esta ação não pode ser desfeita."
        confirmLabel="Sim, excluir"
        onConfirm={handleExcluir}
        onCancel={() => setDeleteId(null)}
        loading={isLoading}
      />
    </Box>
  );
};
