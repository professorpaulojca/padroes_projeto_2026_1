import { Box } from '@mui/material';
import { Outlet } from 'react-router';

export const AuthLayout = () => {
  return (
    <Box sx={{ minHeight: '100vh' }}>
      <Outlet />
    </Box>
  );
};
