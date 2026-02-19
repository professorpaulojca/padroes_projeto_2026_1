import { Box, Typography } from '@mui/material';
import { useAuthStore } from '@/features/auth';

export const DashboardPage = () => {
  const { user } = useAuthStore();

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h3" fontWeight={700} gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Bem-vindo{user?.name ? `, ${user.name}` : ''}! 🎉
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        Este é o painel principal. Mais funcionalidades serão adicionadas em breve.
      </Typography>
    </Box>
  );
};
