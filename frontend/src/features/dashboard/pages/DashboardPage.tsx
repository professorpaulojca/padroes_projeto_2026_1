import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Skeleton,
  Alert,
  Avatar,
  Chip,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
} from '@mui/material';
import {
  People,
  LocationOn,
  ManageAccounts,
  PendingActions,
  PersonAdd,
  AddLocation,
  BarChart,
  TrendingUp,
  TrendingDown,
} from '@mui/icons-material';

import { useAuthStore } from '@/features/auth';
import { api } from '@/lib/axios';
import type { Pessoa, Endereco } from '@/types';

interface KpiCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  loading: boolean;
  delta?: string;
  deltaColor?: string;
  deltaIcon?: React.ReactNode;
}

const KpiCard = ({ title, value, icon, color, loading, delta, deltaColor, deltaIcon }: KpiCardProps) => (
  <Card sx={{ height: '100%' }}>
    <CardContent sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {title}
          </Typography>
          {loading ? (
            <Skeleton width={60} height={40} />
          ) : (
            <Typography variant="h3" fontWeight={700} color={color}>
              {value}
            </Typography>
          )}
          {delta && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
              {deltaIcon}
              <Typography variant="caption" sx={{ color: deltaColor || 'text.secondary' }}>
                {delta}
              </Typography>
            </Box>
          )}
        </Box>
        <Box
          sx={{
            p: 1.5,
            borderRadius: 2,
            bgcolor: `${color}15`,
            color,
            display: 'flex',
          }}
        >
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const AVATAR_COLORS = ['#1976d2', '#9c27b0', '#2e7d32', '#d32f2f', '#ed6c02'];

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [stats, setStats] = useState({ pessoas: 0, enderecos: 0 });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [pessoasRes, enderecosRes] = await Promise.all([
          api.get<Pessoa[]>('/api/pessoas'),
          api.get<Endereco[]>('/api/enderecos'),
        ]);
        setPessoas(pessoasRes.data);
        setStats({
          pessoas: pessoasRes.data.length,
          enderecos: enderecosRes.data.length,
        });
      } catch {
        setError('Não foi possível carregar as estatísticas');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const today = new Date();
  const dateStr = today.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const recentPessoas = pessoas.slice(0, 5);

  return (
    <Box>
      {/* Welcome Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={800} sx={{ fontSize: 24 }}>
          Bem-vindo, {user?.name || 'Usuário'}! 👋
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Aqui está um resumo do sistema hoje, {dateStr}.
        </Typography>
      </Box>

      {error && (
        <Alert severity="warning" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard
            title="Total de Pessoas"
            value={stats.pessoas}
            icon={<People />}
            color="#1976d2"
            loading={loading}
            delta="+12% este mês"
            deltaColor="#2e7d32"
            deltaIcon={<TrendingUp sx={{ fontSize: 14, color: '#2e7d32' }} />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard
            title="Endereços"
            value={stats.enderecos}
            icon={<LocationOn />}
            color="#9c27b0"
            loading={loading}
            delta="+8% este mês"
            deltaColor="#2e7d32"
            deltaIcon={<TrendingUp sx={{ fontSize: 14, color: '#2e7d32' }} />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard
            title="Usuários Ativos"
            value={1}
            icon={<ManageAccounts />}
            color="#2e7d32"
            loading={false}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard
            title="Pendentes"
            value={0}
            icon={<PendingActions />}
            color="#ed6c02"
            loading={false}
            delta="-2 desde ontem"
            deltaColor="#d32f2f"
            deltaIcon={<TrendingDown sx={{ fontSize: 14, color: '#d32f2f' }} />}
          />
        </Grid>
      </Grid>

      {/* Second row: Recent + Quick Actions */}
      <Grid container spacing={3}>
        {/* Recent Pessoas */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 3, pt: 3, pb: 1 }}>
                <Typography variant="h6" fontWeight={700}>Últimas Pessoas cadastradas</Typography>
                <Button
                  size="small"
                  onClick={() => navigate('/pessoas')}
                  sx={{ fontWeight: 600, textTransform: 'none' }}
                >
                  Ver todas →
                </Button>
              </Box>
              {loading ? (
                <Box sx={{ p: 3 }}>
                  {[1, 2, 3].map(i => <Skeleton key={i} height={50} sx={{ mb: 1 }} />)}
                </Box>
              ) : recentPessoas.length === 0 ? (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">Nenhuma pessoa cadastrada ainda.</Typography>
                </Box>
              ) : (
                <List sx={{ px: 1 }}>
                  {recentPessoas.map((pessoa, idx) => {
                    const initials = pessoa.nome.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
                    const color = AVATAR_COLORS[idx % AVATAR_COLORS.length];
                    return (
                      <Box key={pessoa.id}>
                        <ListItem sx={{ py: 1.5 }}>
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: color, width: 38, height: 38, fontSize: 14, fontWeight: 700 }}>
                              {initials}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={<Typography variant="body2" fontWeight={600}>{pessoa.nome}</Typography>}
                            secondary={`Nascimento: ${pessoa.dataNascimento}`}
                          />
                          <ListItemSecondaryAction>
                            <Chip
                              label="Ativa"
                              size="small"
                              sx={{ bgcolor: '#dcfce7', color: '#2e7d32', fontWeight: 600, fontSize: 11 }}
                            />
                          </ListItemSecondaryAction>
                        </ListItem>
                        {idx < recentPessoas.length - 1 && <Divider variant="inset" component="li" />}
                      </Box>
                    );
                  })}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Ações Rápidas</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Button
                  variant="contained"
                  startIcon={<PersonAdd />}
                  fullWidth
                  onClick={() => navigate('/pessoas')}
                  sx={{ justifyContent: 'flex-start', py: 1.5, bgcolor: '#1976d2', '&:hover': { bgcolor: '#1565c0' } }}
                >
                  Nova Pessoa
                </Button>
                <Button
                  variant="contained"
                  startIcon={<AddLocation />}
                  fullWidth
                  onClick={() => navigate('/enderecos')}
                  sx={{ justifyContent: 'flex-start', py: 1.5, bgcolor: '#9c27b0', '&:hover': { bgcolor: '#7b1fa2' } }}
                >
                  Novo Endereço
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* Chart Placeholder */}
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Cadastros por mês</Typography>
              <Box sx={{
                height: 180,
                borderRadius: 2,
                bgcolor: 'linear-gradient(135deg, #e3f2fd, #f3e8ff)',
                background: 'linear-gradient(135deg, #e3f2fd, #f3e8ff)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px dashed #d1d9e0',
              }}>
                <BarChart sx={{ fontSize: 40, color: '#9e9e9e', mb: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Gráfico de cadastros mensais
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
