import { useState } from 'react';
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
  Alert,
  Button,
  Grid,
} from '@mui/material';
import { Close, Save, Search } from '@mui/icons-material';

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
  const [cepInfo, setCepInfo] = useState<{ logradouro: string; bairro: string; cidade: string; estado: string } | null>(
    endereco ? { logradouro: endereco.logradouro, bairro: endereco.bairro, cidade: endereco.cidade, estado: endereco.estado } : null
  );
  const [cepLoading, setCepLoading] = useState(false);
  const [cepError, setCepError] = useState<string | null>(null);
  const [cepSuccess, setCepSuccess] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    getValues,
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

  const handleBuscarCep = async () => {
    const cep = getValues('cep').replace(/\D/g, '');
    if (cep.length !== 8) {
      setCepError('CEP deve ter 8 dígitos');
      return;
    }
    setCepLoading(true);
    setCepError(null);
    setCepSuccess(false);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await res.json();
      if (data.erro) {
        setCepError('CEP não encontrado');
        setCepInfo(null);
      } else {
        setCepInfo({
          logradouro: data.logradouro || '',
          bairro: data.bairro || '',
          cidade: data.localidade || '',
          estado: data.uf || '',
        });
        setCepSuccess(true);
      }
    } catch {
      setCepError('Erro ao buscar CEP');
    } finally {
      setCepLoading(false);
    }
  };

  const handleFormSubmit = async (data: EnderecoFormData) => {
    await onSubmit(data);
    reset();
    setCepInfo(null);
    setCepSuccess(false);
    onClose();
  };

  const handleClose = () => {
    reset();
    setCepInfo(null);
    setCepError(null);
    setCepSuccess(false);
    onClose();
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={handleClose}
      PaperProps={{ sx: { width: { xs: '100%', sm: 520 } } }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2.5, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h6" fontWeight={700}>
          {isEditing ? '📍 Editar Endereço' : '📍 Novo Endereço'}
        </Typography>
        <IconButton onClick={handleClose}>
          <Close />
        </IconButton>
      </Box>

      {/* Form */}
      <Box
        component="form"
        onSubmit={handleSubmit(handleFormSubmit)}
        sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 0, flex: 1, overflow: 'auto' }}
      >
        <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
          Digite o CEP para preencher automaticamente via ViaCEP.
        </Alert>

        {/* Section: Localização */}
        <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: '0.1em', mb: 2 }}>
          Localização
        </Typography>

        {/* CEP + Buscar */}
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Controller
            name="cep"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="CEP *"
                placeholder="01310-100"
                fullWidth
                error={!!errors.cep}
                helperText={errors.cep?.message || 'Preenchimento automático via API ViaCEP.'}
                disabled={loading}
                sx={{ fontFamily: 'monospace' }}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            )}
          />
          <Button
            variant="contained"
            onClick={handleBuscarCep}
            disabled={cepLoading || loading}
            startIcon={<Search />}
            sx={{ minWidth: 130, alignSelf: 'flex-start', mt: 0, height: 56 }}
          >
            {cepLoading ? 'Buscando...' : 'Buscar CEP'}
          </Button>
        </Box>

        {cepError && (
          <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>{cepError}</Alert>
        )}
        {cepSuccess && (
          <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
            CEP encontrado! Campos preenchidos automaticamente.
          </Alert>
        )}

        {/* CEP details (read-only) */}
        {cepInfo && (
          <Box sx={{ mb: 2 }}>
            <TextField
              label="Logradouro"
              value={cepInfo.logradouro}
              fullWidth
              disabled
              size="small"
              sx={{ mb: 1.5 }}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <Grid container spacing={1.5} sx={{ mb: 1.5 }}>
              <Grid size={{ xs: 6 }}>
                <TextField label="Bairro" value={cepInfo.bairro} fullWidth disabled size="small" slotProps={{ inputLabel: { shrink: true } }} />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField label="Cidade" value={cepInfo.cidade} fullWidth disabled size="small" slotProps={{ inputLabel: { shrink: true } }} />
              </Grid>
            </Grid>
            <Grid container spacing={1.5}>
              <Grid size={{ xs: 4 }}>
                <TextField label="Estado" value={cepInfo.estado} fullWidth disabled size="small" slotProps={{ inputLabel: { shrink: true } }} />
              </Grid>
              <Grid size={{ xs: 8 }}>
                <TextField label="País" value="Brasil" fullWidth disabled size="small" slotProps={{ inputLabel: { shrink: true } }} />
              </Grid>
            </Grid>
          </Box>
        )}

        <Grid container spacing={1.5} sx={{ mb: 2 }}>
          <Grid size={{ xs: 4 }}>
            <Controller
              name="numero"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Número *"
                  placeholder="123"
                  fullWidth
                  error={!!errors.numero}
                  helperText={errors.numero?.message}
                  disabled={loading}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 8 }}>
            <Controller
              name="complemento"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Complemento"
                  placeholder="Apto, sala, bloco..."
                  fullWidth
                  error={!!errors.complemento}
                  helperText={errors.complemento?.message}
                  disabled={loading}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              )}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        {/* Section: Classificação */}
        <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: '0.1em', mb: 2 }}>
          Classificação
        </Typography>

        <Controller
          name="tipoEndereco"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth error={!!errors.tipoEndereco} sx={{ mb: 2 }}>
              <InputLabel>Tipo de endereço</InputLabel>
              <Select {...field} label="Tipo de endereço" disabled={loading}>
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
      </Box>

      {/* Footer */}
      <Divider />
      <Box sx={{ p: 2.5, display: 'flex', gap: 1.5 }}>
        <LoadingButton
          type="submit"
          variant="contained"
          fullWidth
          loading={loading}
          startIcon={<Save />}
          onClick={handleSubmit(handleFormSubmit)}
        >
          Salvar endereço
        </LoadingButton>
        <Button variant="text" onClick={handleClose} sx={{ textTransform: 'none', color: 'text.secondary' }}>
          Cancelar
        </Button>
      </Box>
    </Drawer>
  );
};
