import { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Skeleton,
  Alert,
} from '@mui/material';
import { People, LocationOn, Person, TrendingUp } from '@mui/icons-material';

import { PageHeader } from '@/components/ui';
import { useAuthStore } from '@/features/auth';
import { api } from '@/lib/axios';
import { createLogger } from '@/lib/logger';
import type { Pessoa, Endereco } from '@/types';

const log = createLogger('DASHBOARD');

interface KpiCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  loading: boolean;
}

const KpiCard = ({ title, value, icon, color, loading }: KpiCardProps) => (
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

export const DashboardPage = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ pessoas: 0, enderecos: 0 });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [pessoasRes, enderecosRes] = await Promise.all([
          api.get<Pessoa[]>('/api/pessoas'),
          api.get<Endereco[]>('/api/enderecos'),
        ]);
        setStats({
          pessoas: pessoasRes.data.length,
          enderecos: enderecosRes.data.length,
        });
        log.info(`Dashboard carregado: ${pessoasRes.data.length} pessoas, ${enderecosRes.data.length} endereços`);
      } catch (err) {
        log.error('Erro ao carregar estatísticas do dashboard');
        setError('Não foi possível carregar as estatísticas');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <Box>
      <PageHeader
        title={`Olá, ${user?.name || 'Usuário'}!`}
        subtitle="Aqui está um resumo do sistema"
        breadcrumbs={[{ label: 'Dashboard' }]}
      />

      {error && (
        <Alert severity="warning" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard
            title="Total de Pessoas"
            value={stats.pessoas}
            icon={<People />}
            color="#1976d2"
            loading={loading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard
            title="Total de Endereços"
            value={stats.enderecos}
            icon={<LocationOn />}
            color="#2e7d32"
            loading={loading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard
            title="Meu Perfil"
            value={user?.perfil || '-'}
            icon={<Person />}
            color="#9c27b0"
            loading={false}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard
            title="Média End./Pessoa"
            value={stats.pessoas > 0 ? (stats.enderecos / stats.pessoas).toFixed(1) : '0'}
            icon={<TrendingUp />}
            color="#ed6c02"
            loading={loading}
          />
        </Grid>
      </Grid>
    </Box>
  );
};
