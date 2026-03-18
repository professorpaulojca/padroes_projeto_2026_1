import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Drawer,
  Box,
  Typography,
  TextField,
  IconButton,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { Close } from '@mui/icons-material';

import { LoadingButton } from '@/components/ui';
import { enderecoSchema, type EnderecoFormData } from '../schemas';
import type { Endereco, TipoEndereco } from '@/types';

const TIPO_LABELS: Record<TipoEndereco, string> = {
  RESIDENCIAL: 'Residencial',
  COMERCIAL: 'Comercial',
  COBRANCA: 'Cobrança',
  ENTREGA: 'Entrega',
  OUTRO: 'Outro',
};

interface EnderecoDrawerProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: EnderecoFormData) => Promise<void>;
  endereco?: Endereco | null;
  loading: boolean;
}

export const EnderecoDrawer = ({ open, onClose, onSubmit, endereco, loading }: EnderecoDrawerProps) => {
  const isEditing = !!endereco;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EnderecoFormData>({
    resolver: zodResolver(enderecoSchema),
    values: endereco
      ? {
          cep: endereco.cep,
          numero: endereco.numero,
          complemento: endereco.complemento || '',
          tipoEndereco: endereco.tipoEndereco,
          enderecoPrincipal: endereco.enderecoPrincipal,
        }
      : {
          cep: '',
          numero: '',
          complemento: '',
          tipoEndereco: 'RESIDENCIAL',
          enderecoPrincipal: 'NAO',
        },
  });

  const handleFormSubmit = async (data: EnderecoFormData) => {
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
          {isEditing ? 'Editar Endereço' : 'Novo Endereço'}
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
          name="cep"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="CEP"
              placeholder="01310-100"
              fullWidth
              autoFocus
              error={!!errors.cep}
              helperText={errors.cep?.message || 'O endereço será preenchido automaticamente pelo CEP'}
              disabled={loading}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          )}
        />

        <Controller
          name="numero"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Número"
              placeholder="123"
              fullWidth
              error={!!errors.numero}
              helperText={errors.numero?.message}
              disabled={loading}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          )}
        />

        <Controller
          name="complemento"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Complemento"
              placeholder="Apto 42, Bloco B"
              fullWidth
              error={!!errors.complemento}
              helperText={errors.complemento?.message}
              disabled={loading}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          )}
        />

        <Controller
          name="tipoEndereco"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth error={!!errors.tipoEndereco}>
              <InputLabel>Tipo de Endereço</InputLabel>
              <Select {...field} label="Tipo de Endereço" disabled={loading}>
                {(Object.entries(TIPO_LABELS) as [TipoEndereco, string][]).map(([value, label]) => (
                  <MenuItem key={value} value={value}>{label}</MenuItem>
                ))}
              </Select>
              {errors.tipoEndereco && (
                <FormHelperText>{errors.tipoEndereco.message}</FormHelperText>
              )}
            </FormControl>
          )}
        />

        <Controller
          name="enderecoPrincipal"
          control={control}
          render={({ field }) => (
            <FormControlLabel
              control={
                <Switch
                  checked={field.value === 'SIM'}
                  onChange={(e) => field.onChange(e.target.checked ? 'SIM' : 'NAO')}
                  disabled={loading}
                />
              }
              label="Endereço principal"
            />
          )}
        />

        <LoadingButton
          type="submit"
          variant="contained"
          fullWidth
          loading={loading}
          sx={{ mt: 1 }}
        >
          {isEditing ? 'Salvar' : 'Criar'}
        </LoadingButton>
      </Box>
    </Drawer>
  );
};
