import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router';
import { SentimentDissatisfied } from '@mui/icons-material';

export const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        p: 3,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <SentimentDissatisfied
        sx={{ fontSize: 80, color: 'rgba(255,255,255,0.8)', mb: 2 }}
      />
      <Typography variant="h1" color="white" fontWeight={800} sx={{ mb: 1 }}>
        404
      </Typography>
      <Typography variant="h5" color="rgba(255,255,255,0.85)" sx={{ mb: 3 }}>
        Página não encontrada
      </Typography>
      <Typography
        variant="body1"
        color="rgba(255,255,255,0.7)"
        sx={{ mb: 4, maxWidth: 400 }}
      >
        A página que você está procurando não existe ou foi movida.
      </Typography>
      <Button
        variant="contained"
        size="large"
        onClick={() => navigate('/')}
        sx={{
          bgcolor: 'white',
          color: 'primary.main',
          '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' },
          px: 4,
        }}
      >
        Voltar ao início
      </Button>
    </Box>
  );
};
