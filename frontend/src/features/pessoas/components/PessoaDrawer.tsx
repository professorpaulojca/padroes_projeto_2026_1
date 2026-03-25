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
  Alert,
  Button,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from '@mui/material';
import { Close, Save, LocationOn } from '@mui/icons-material';
import { useNavigate } from 'react-router';

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

interface TabPanelProps {
  children?: React.ReactNode;
  value: number;
  index: number;
}

const TabPanel = ({ children, value, index }: TabPanelProps) => (
  <Box role="tabpanel" hidden={value !== index} sx={{ pt: 2.5 }}>
    {value === index && children}
  </Box>
);

export const PessoaDrawer = ({ open, onClose, onSubmit, pessoa, loading }: PessoaDrawerProps) => {
  const isEditing = !!pessoa;
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);
  const [drawerTab, setDrawerTab] = useState(0);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PessoaFormData>({
    resolver: zodResolver(pessoaSchema),
    values: pessoa
      ? {
          nome: pessoa.nome,
          sobrenome: pessoa.sobrenome || '',
          cpf: pessoa.cpf || '',
          rg: pessoa.rg || '',
          dataNascimento: pessoa.dataNascimento,
          sexo: pessoa.sexo || '',
          email: pessoa.email || '',
          telefone: pessoa.telefone || '',
          celular: pessoa.celular || '',
          observacoes: pessoa.observacoes || '',
          tipoSanguineo: pessoa.tipoSanguineo || '',
          estadoCivil: pessoa.estadoCivil || '',
          nacionalidade: pessoa.nacionalidade || '',
          naturalidade: pessoa.naturalidade || '',
          profissao: pessoa.profissao || '',
          empresa: pessoa.empresa || '',
        }
      : {
          nome: '', sobrenome: '', cpf: '', rg: '', dataNascimento: '',
          sexo: '', email: '', telefone: '', celular: '', observacoes: '',
          tipoSanguineo: '', estadoCivil: '', nacionalidade: '', naturalidade: '',
          profissao: '', empresa: '',
        },
  });

  const handleFormSubmit = async (data: PessoaFormData) => {
    await onSubmit(data);
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      reset();
      setDrawerTab(0);
      onClose();
    }, 1000);
  };

  const handleClose = () => {
    setSuccess(false);
    setDrawerTab(0);
    reset();
    onClose();
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={handleClose}
      PaperProps={{ sx: { width: { xs: '100%', sm: 560 } } }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2.5, borderBottom: '1px solid', borderColor: 'divider', flexShrink: 0 }}>
        <Typography variant="h6" fontWeight={800}>
          {isEditing ? '✏️ Editar Pessoa' : '➕ Nova Pessoa'}
        </Typography>
        <IconButton onClick={handleClose}>
          <Close />
        </IconButton>
      </Box>

      {/* Body */}
      <Box
        component="form"
        onSubmit={handleSubmit(handleFormSubmit)}
        sx={{ p: 3, flex: 1, overflow: 'auto' }}
      >
        {/* Success Alert */}
        {success && (
          <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
            Dados salvos com sucesso!
          </Alert>
        )}

        {/* Drawer Tabs */}
        <Tabs
          value={drawerTab}
          onChange={(_, v) => setDrawerTab(v)}
          sx={{
            mb: 0,
            borderBottom: '2px solid',
            borderColor: 'divider',
            '& .MuiTab-root': { fontWeight: 600, textTransform: 'none', fontSize: 13, minHeight: 40, py: 1 },
          }}
        >
          <Tab label="Dados Básicos" />
          <Tab label="Dados Extras" />
        </Tabs>

        {/* Tab 0: Dados Básicos */}
        <TabPanel value={drawerTab} index={0}>
          {/* Section: Identificação */}
          <Typography
            variant="overline"
            color="text.secondary"
            sx={{ fontWeight: 700, letterSpacing: '0.06em', mb: 1.5, pb: 1, borderBottom: '1px solid', borderColor: 'divider', display: 'block' }}
          >
            Identificação
          </Typography>

          <Grid container spacing={1.8} sx={{ mb: 2.5 }}>
            <Grid size={{ xs: 6 }}>
              <Controller
                name="nome"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Nome *"
                    placeholder="Nome"
                    fullWidth
                    autoFocus
                    error={!!errors.nome}
                    helperText={errors.nome?.message}
                    disabled={loading}
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Controller
                name="sobrenome"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Sobrenome"
                    placeholder="Sobrenome"
                    fullWidth
                    disabled={loading}
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Controller
                name="cpf"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="CPF"
                    placeholder="123.456.789-00"
                    fullWidth
                    disabled={loading}
                    slotProps={{ inputLabel: { shrink: true }, input: { sx: { fontFamily: 'monospace' } } }}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Controller
                name="rg"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="RG"
                    placeholder="12.345.678-9"
                    fullWidth
                    disabled={loading}
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Controller
                name="dataNascimento"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Data de nascimento *"
                    placeholder="dd/MM/yyyy"
                    fullWidth
                    error={!!errors.dataNascimento}
                    helperText={errors.dataNascimento?.message || 'Formato: dd/MM/yyyy'}
                    disabled={loading}
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Controller
                name="sexo"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel shrink>Sexo</InputLabel>
                    <Select {...field} label="Sexo" displayEmpty disabled={loading}>
                      <MenuItem value="">Não informar</MenuItem>
                      <MenuItem value="Feminino">Feminino</MenuItem>
                      <MenuItem value="Masculino">Masculino</MenuItem>
                      <MenuItem value="Outro">Outro</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>
          </Grid>

          {/* Section: Contato */}
          <Typography
            variant="overline"
            color="text.secondary"
            sx={{ fontWeight: 700, letterSpacing: '0.06em', mb: 1.5, pb: 1, borderBottom: '1px solid', borderColor: 'divider', display: 'block' }}
          >
            Contato
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.8, mb: 2.5 }}>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="E-mail"
                  placeholder="email@exemplo.com"
                  type="email"
                  fullWidth
                  disabled={loading}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              )}
            />
            <Grid container spacing={1.8}>
              <Grid size={{ xs: 6 }}>
                <Controller
                  name="telefone"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Telefone"
                      placeholder="(11) 98765-4321"
                      fullWidth
                      disabled={loading}
                      slotProps={{ inputLabel: { shrink: true } }}
                    />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Controller
                  name="celular"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Celular"
                      placeholder="(11) 99999-8888"
                      fullWidth
                      disabled={loading}
                      slotProps={{ inputLabel: { shrink: true } }}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </Box>

          {/* Section: Status */}
          <Typography
            variant="overline"
            color="text.secondary"
            sx={{ fontWeight: 700, letterSpacing: '0.06em', mb: 1.5, pb: 1, borderBottom: '1px solid', borderColor: 'divider', display: 'block' }}
          >
            Status
          </Typography>

          <Grid container spacing={1.8}>
            <Grid size={{ xs: 6 }}>
              <TextField
                label="Status"
                value={pessoa?.situacao || 'Ativo'}
                fullWidth
                disabled
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Controller
                name="observacoes"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Observações"
                    placeholder="Observações opcionais…"
                    fullWidth
                    disabled={loading}
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                )}
              />
            </Grid>
          </Grid>
        </TabPanel>

        {/* Tab 1: Dados Extras */}
        <TabPanel value={drawerTab} index={1}>
          <Typography
            variant="overline"
            color="text.secondary"
            sx={{ fontWeight: 700, letterSpacing: '0.06em', mb: 1.5, pb: 1, borderBottom: '1px solid', borderColor: 'divider', display: 'block' }}
          >
            Dados adicionais
          </Typography>

          <Grid container spacing={1.8} sx={{ mb: 2 }}>
            <Grid size={{ xs: 6 }}>
              <Controller
                name="tipoSanguineo"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel shrink>Tipo Sanguíneo</InputLabel>
                    <Select {...field} label="Tipo Sanguíneo" displayEmpty disabled={loading}>
                      <MenuItem value="">Não informado</MenuItem>
                      <MenuItem value="A+">A+</MenuItem>
                      <MenuItem value="A-">A-</MenuItem>
                      <MenuItem value="B+">B+</MenuItem>
                      <MenuItem value="B-">B-</MenuItem>
                      <MenuItem value="AB+">AB+</MenuItem>
                      <MenuItem value="AB-">AB-</MenuItem>
                      <MenuItem value="O+">O+</MenuItem>
                      <MenuItem value="O-">O-</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Controller
                name="estadoCivil"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel shrink>Estado civil</InputLabel>
                    <Select {...field} label="Estado civil" displayEmpty disabled={loading}>
                      <MenuItem value="">Não informado</MenuItem>
                      <MenuItem value="Solteiro(a)">Solteiro(a)</MenuItem>
                      <MenuItem value="Casado(a)">Casado(a)</MenuItem>
                      <MenuItem value="Divorciado(a)">Divorciado(a)</MenuItem>
                      <MenuItem value="Viúvo(a)">Viúvo(a)</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Controller
                name="nacionalidade"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Nacionalidade"
                    placeholder="Brasileira"
                    fullWidth
                    disabled={loading}
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Controller
                name="naturalidade"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Naturalidade"
                    placeholder="São Paulo - SP"
                    fullWidth
                    disabled={loading}
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                )}
              />
            </Grid>
          </Grid>

          <Controller
            name="profissao"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Profissão"
                placeholder="Ex: Engenheiro(a) de Software"
                fullWidth
                disabled={loading}
                sx={{ mb: 1.8 }}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            )}
          />

          <Controller
            name="empresa"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Empresa / Organização"
                placeholder="Ex: TechCorp Ltda."
                fullWidth
                disabled={loading}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            )}
          />
        </TabPanel>
      </Box>

      {/* Footer */}
      <Divider />
      <Box sx={{ p: 2, display: 'flex', gap: 1.5, flexShrink: 0 }}>
        <LoadingButton
          type="submit"
          variant="contained"
          loading={loading}
          startIcon={<Save />}
          onClick={handleSubmit(handleFormSubmit)}
          sx={{ flex: 2 }}
        >
          Salvar
        </LoadingButton>
        {isEditing && pessoa && (
          <Button
            variant="outlined"
            size="small"
            startIcon={<LocationOn />}
            onClick={() => { handleClose(); navigate(`/enderecos?pessoaId=${pessoa.id}`); }}
            sx={{ textTransform: 'none' }}
          >
            Ver Endereços
          </Button>
        )}
        <Button variant="text" onClick={handleClose} sx={{ textTransform: 'none', color: 'text.secondary' }}>
          Fechar
        </Button>
      </Box>
    </Drawer>
  );
};
