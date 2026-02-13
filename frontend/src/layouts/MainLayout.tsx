import { Box } from '@mui/material';
import { Outlet } from 'react-router';

export const MainLayout = () => {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar e Header serão adicionados nas próximas fases */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          backgroundColor: 'background.default',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};
