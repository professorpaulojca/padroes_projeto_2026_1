import { Box, Typography } from '@mui/material';
import { SearchOff } from '@mui/icons-material';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export const EmptyState = ({
  title = 'Nenhum resultado encontrado',
  description = 'Tente ajustar seus filtros ou adicione um novo item.',
  icon,
  action,
}: EmptyStateProps) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 8,
        px: 3,
        textAlign: 'center',
      }}
    >
      {icon || <SearchOff sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />}
      <Typography variant="h6" color="text.secondary" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body2" color="text.disabled" sx={{ maxWidth: 360, mb: action ? 3 : 0 }}>
        {description}
      </Typography>
      {action}
    </Box>
  );
};
