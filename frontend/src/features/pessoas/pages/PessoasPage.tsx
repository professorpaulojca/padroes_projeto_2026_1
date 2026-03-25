import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router';
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
  Avatar,
  Typography,
  TablePagination,
} from '@mui/material';
import {
  Search,
  PersonAdd,
  Edit,
  Delete,
  LocationOn,
} from '@mui/icons-material';

import { PageHeader, EmptyState, ConfirmDialog } from '@/components/ui';
import { usePessoaStore } from '../stores';
import { PessoaDrawer } from '../components';
import type { Pessoa } from '@/types';
import type { PessoaFormData } from '../schemas';

const AVATAR_COLORS = ['#1976d2', '#9c27b0', '#2e7d32', '#d32f2f', '#ed6c02', '#0288d1'];

const getStatusChip = (situacao?: string) => {
  switch (situacao) {
    case 'Ativo':
      return <Chip label="Ativa" size="small" sx={{ bgcolor: '#dcfce7', color: '#2e7d32', fontWeight: 600, fontSize: 11 }} />;
    case 'Inativo':
      return <Chip label="Inativo" size="small" sx={{ bgcolor: '#fee2e2', color: '#d32f2f', fontWeight: 600, fontSize: 11 }} />;
    default:
      return <Chip label={situacao || 'Ativa'} size="small" sx={{ bgcolor: '#dcfce7', color: '#2e7d32', fontWeight: 600, fontSize: 11 }} />;
  }
};

export const PessoasPage = () => {
  const navigate = useNavigate();
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
  const [deleteName, setDeleteName] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    listar();
  }, [listar]);

  const pessoasFiltradas = pessoas.filter((p) =>
    p.nome.toLowerCase().includes(busca.toLowerCase()),
  );

  const paginatedPessoas = pessoasFiltradas.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
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
      setDeleteName('');
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
          <Button
            variant="contained"
            startIcon={<PersonAdd />}
            onClick={handleOpenCreate}
            sx={{ fontWeight: 600 }}
          >
            Nova Pessoa
          </Button>
        }
      />

      {error && (
        <Alert severity="error" onClose={clearError} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Toolbar */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          placeholder="Buscar por nome..."
          size="small"
          value={busca}
          onChange={(e) => { setBusca(e.target.value); setPage(0); }}
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
        <Box sx={{ flex: 1 }} />
        <Typography variant="body2" color="text.secondary">
          {pessoasFiltradas.length} pessoa(s) cadastrada(s)
        </Typography>
      </Box>

      {/* Table */}
      {pessoasFiltradas.length === 0 && !isLoading ? (
        <EmptyState
          title="Nenhuma pessoa encontrada"
          description={busca ? 'Tente outro termo de busca.' : 'Comece adicionando uma nova pessoa.'}
          action={
            !busca && (
              <Button variant="outlined" startIcon={<PersonAdd />} onClick={handleOpenCreate}>
                Adicionar Pessoa
              </Button>
            )
          }
        />
      ) : (
        <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <Box sx={{ px: 3, py: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider' }}>
            <Typography variant="subtitle1" fontWeight={700}>Lista de Pessoas</Typography>
            <Typography variant="caption" color="text.secondary">
              Exibindo {page * rowsPerPage + 1}–{Math.min((page + 1) * rowsPerPage, pessoasFiltradas.length)} de {pessoasFiltradas.length}
            </Typography>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f8fafc' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Pessoa</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Data Nascimento</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Idade</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Endereços</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedPessoas.map((pessoa, idx) => {
                  const initials = pessoa.nome.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
                  const color = AVATAR_COLORS[(page * rowsPerPage + idx) % AVATAR_COLORS.length];
                  const endCount = pessoa.enderecos?.length || 0;
                  return (
                    <TableRow key={pessoa.id} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar sx={{ width: 34, height: 34, bgcolor: color, fontSize: 13, fontWeight: 700 }}>
                            {initials}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={600}>{pessoa.nome}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              Cadastrada {pessoa.dataNascimento}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{pessoa.dataNascimento}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{pessoa.idade} anos</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={`${endCount} end.`}
                          size="small"
                          color={endCount > 0 ? 'primary' : 'default'}
                          variant="outlined"
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell>
                        {getStatusChip(pessoa.situacao)}
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Ver endereços">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => navigate(`/enderecos?pessoaId=${pessoa.id}`)}
                          >
                            <LocationOn fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Editar">
                          <IconButton size="small" onClick={() => handleOpenEdit(pessoa)}>
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Excluir">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => { setDeleteId(pessoa.id); setDeleteName(pessoa.nome); }}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={pessoasFiltradas.length}
            page={page}
            onPageChange={(_, p) => setPage(p)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
            rowsPerPageOptions={[5, 10, 25]}
            labelRowsPerPage="Por página:"
            labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
          />
        </Paper>
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
        message={`Tem certeza que deseja excluir **${deleteName}**? Esta ação não pode ser desfeita.`}
        confirmLabel="Sim, excluir"
        onConfirm={handleExcluir}
        onCancel={() => { setDeleteId(null); setDeleteName(''); }}
        loading={isLoading}
      />
    </Box>
  );
};
