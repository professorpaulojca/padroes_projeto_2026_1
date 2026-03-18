import { useEffect, useState, useCallback } from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Chip,
  Alert,
  Button,
} from '@mui/material';
import {
  Search,
  Add,
  Edit,
  Delete,
} from '@mui/icons-material';

import { PageHeader, EmptyState, ConfirmDialog } from '@/components/ui';
import { usePessoaStore } from '../stores';
import { PessoaDrawer } from '../components';
import type { Pessoa } from '@/types';
import type { PessoaFormData } from '../schemas';

export const PessoasPage = () => {
  const {
    pessoas,
    isLoading,
    error,
    listar,
    criar,
    atualizar,
    excluir,
    clearError,
  } = usePessoaStore();

  const [busca, setBusca] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editando, setEditando] = useState<Pessoa | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  useEffect(() => {
    listar();
  }, [listar]);

  const pessoasFiltradas = pessoas.filter((p) =>
    p.nome.toLowerCase().includes(busca.toLowerCase()),
  );

  const handleCriar = useCallback(async (data: PessoaFormData) => {
    await criar(data);
  }, [criar]);

  const handleEditar = useCallback(async (data: PessoaFormData) => {
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

  const handleOpenEdit = (pessoa: Pessoa) => {
    setEditando(pessoa);
    setDrawerOpen(true);
  };

  const handleOpenCreate = () => {
    setEditando(null);
    setDrawerOpen(true);
  };

  return (
    <Box>
      <PageHeader
        title="Pessoas"
        subtitle="Gerencie o cadastro de pessoas"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Pessoas' }]}
        action={
          <Button variant="contained" startIcon={<Add />} onClick={handleOpenCreate}>
            Nova Pessoa
          </Button>
        }
      />

      {error && (
        <Alert severity="error" onClose={clearError} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Search */}
      <TextField
        placeholder="Buscar por nome..."
        size="small"
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        sx={{ mb: 3, width: { xs: '100%', sm: 320 } }}
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

      {/* Table */}
      {pessoasFiltradas.length === 0 && !isLoading ? (
        <EmptyState
          title="Nenhuma pessoa encontrada"
          description={busca ? 'Tente outro termo de busca.' : 'Comece adicionando uma nova pessoa.'}
          action={
            !busca && (
              <Button variant="outlined" startIcon={<Add />} onClick={handleOpenCreate}>
                Adicionar Pessoa
              </Button>
            )
          }
        />
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Nome</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Data Nascimento</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Idade</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Endereços</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pessoasFiltradas.map((pessoa) => (
                <TableRow key={pessoa.id} hover>
                  <TableCell>{pessoa.nome}</TableCell>
                  <TableCell>{pessoa.dataNascimento}</TableCell>
                  <TableCell>{pessoa.idade}</TableCell>
                  <TableCell>
                    <Chip
                      label={pessoa.enderecos?.length || 0}
                      size="small"
                      color={pessoa.enderecos?.length > 0 ? 'primary' : 'default'}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Editar">
                      <IconButton size="small" onClick={() => handleOpenEdit(pessoa)}>
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Excluir">
                      <IconButton size="small" color="error" onClick={() => setDeleteId(pessoa.id)}>
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Drawer */}
      <PessoaDrawer
        open={drawerOpen}
        onClose={() => { setDrawerOpen(false); setEditando(null); }}
        onSubmit={editando ? handleEditar : handleCriar}
        pessoa={editando}
        loading={isLoading}
      />

      {/* Delete confirmation */}
      <ConfirmDialog
        open={deleteId !== null}
        title="Excluir Pessoa"
        message="Tem certeza que deseja excluir esta pessoa? Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        onConfirm={handleExcluir}
        onCancel={() => setDeleteId(null)}
        loading={isLoading}
      />
    </Box>
  );
};
