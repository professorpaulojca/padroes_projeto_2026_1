import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Drawer,
  Box,
  Typography,
  TextField,
  IconButton,
  Divider,
} from '@mui/material';
import { Close } from '@mui/icons-material';

import { LoadingButton } from '@/components/ui';
import { pessoaSchema, type PessoaFormData } from '../schemas';
import type { Pessoa } from '@/types';

interface PessoaDrawerProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: PessoaFormData) => Promise<void>;
  pessoa?: Pessoa | null;
  loading: boolean;
}

export const PessoaDrawer = ({ open, onClose, onSubmit, pessoa, loading }: PessoaDrawerProps) => {
  const isEditing = !!pessoa;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PessoaFormData>({
    resolver: zodResolver(pessoaSchema),
    values: pessoa
      ? { nome: pessoa.nome, dataNascimento: pessoa.dataNascimento }
      : { nome: '', dataNascimento: '' },
  });

  const handleFormSubmit = async (data: PessoaFormData) => {
    await onSubmit(data);
    reset();
    onClose();
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: { xs: '100%', sm: 420 } } }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2 }}>
        <Typography variant="h6" fontWeight={600}>
          {isEditing ? 'Editar Pessoa' : 'Nova Pessoa'}
        </Typography>
        <IconButton onClick={onClose}>
          <Close />
        </IconButton>
      </Box>
      <Divider />
      <Box
        component="form"
        onSubmit={handleSubmit(handleFormSubmit)}
        sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}
      >
        <Controller
          name="nome"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Nome completo"
              placeholder="Maria da Silva"
              fullWidth
              autoFocus
              error={!!errors.nome}
              helperText={errors.nome?.message}
              disabled={loading}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          )}
        />
        <Controller
          name="dataNascimento"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Data de nascimento"
              placeholder="dd/MM/yyyy"
              fullWidth
              error={!!errors.dataNascimento}
              helperText={errors.dataNascimento?.message || 'Formato: dd/MM/yyyy'}
              disabled={loading}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          )}
        />
        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <LoadingButton
            type="submit"
            variant="contained"
            fullWidth
            loading={loading}
          >
            {isEditing ? 'Salvar' : 'Criar'}
          </LoadingButton>
        </Box>
      </Box>
    </Drawer>
  );
};
