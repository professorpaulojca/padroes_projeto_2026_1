import { useState } from 'react';
import { Outlet, useNavigate, useLocation, Link as RouterLink } from 'react-router';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  useMediaQuery,
  useTheme,
  Breadcrumbs,
  Link,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  People,
  LocationOn,
  ManageAccounts,
  Logout,
  Person,
  Hub,
  NavigateNext,
} from '@mui/icons-material';
import { useAuthStore } from '@/features/auth';

const DRAWER_WIDTH = 240;

const mainNavItems = [
  { label: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
  { label: 'Pessoas', icon: <People />, path: '/pessoas' },
  { label: 'Endereços', icon: <LocationOn />, path: '/enderecos' },
];

const userNavItems = [
  { label: 'Meu Perfil', icon: <ManageAccounts />, path: '/perfil' },
];

const pathTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/pessoas': 'Pessoas',
  '/enderecos': 'Endereços',
  '/perfil': 'Meu Perfil',
};

export const MainLayout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    setAnchorEl(null);
    await logout();
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase()
    : 'U';

  const currentTitle = pathTitles[location.pathname] || 'Sistema';

  const renderNavSection = (title: string, items: typeof mainNavItems) => (
    <>
      <Typography
        variant="overline"
        sx={{ px: 3, pt: 2, pb: 0.5, display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: 11, letterSpacing: '0.1em', fontWeight: 700 }}
      >
        {title}
      </Typography>
      <List sx={{ px: 1 }}>
        {items.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                component={RouterLink}
                to={item.path}
                onClick={() => isMobile && setDrawerOpen(false)}
                sx={{
                  borderRadius: 2,
                  py: 1,
                  color: 'rgba(255,255,255,0.7)',
                  ...(isActive && {
                    bgcolor: 'rgba(255,255,255,0.15)',
                    color: '#fff',
                    borderRight: '3px solid #42a5f5',
                  }),
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.1)',
                    color: '#fff',
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>{item.icon}</ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{ fontSize: 14, fontWeight: isActive ? 600 : 400 }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </>
  );

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: '#1565c0' }}>
      {/* Logo */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2.5, py: 2.5 }}>
        <Box sx={{ p: 1, bgcolor: 'rgba(255,255,255,0.15)', borderRadius: 2, display: 'flex' }}>
          <Hub sx={{ color: '#fff', fontSize: 24 }} />
        </Box>
        <Box>
          <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: 15, lineHeight: 1.2 }}>
            Padrões
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>
            de Projeto
          </Typography>
        </Box>
      </Box>

      {renderNavSection('Principal', mainNavItems)}
      {renderNavSection('Usuário', userNavItems)}

      <Box sx={{ flex: 1 }} />

      {/* User footer */}
      <Box sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <Box
          component={RouterLink}
          to="/perfil"
          sx={{ display: 'flex', alignItems: 'center', gap: 1.5, textDecoration: 'none' }}
        >
          <Avatar sx={{ width: 36, height: 36, bgcolor: '#42a5f5', fontSize: 14, fontWeight: 700 }}>
            {initials}
          </Avatar>
          <Box sx={{ overflow: 'hidden' }}>
            <Typography variant="body2" fontWeight={600} noWrap sx={{ color: '#fff' }}>
              {user?.name || 'Usuário'}
            </Typography>
            <Typography variant="caption" noWrap sx={{ color: 'rgba(255,255,255,0.6)' }}>
              {user?.perfil || ''}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <Drawer
        variant={isMobile ? 'temporary' : 'persistent'}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{
          width: drawerOpen ? DRAWER_WIDTH : 0,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            border: 'none',
            bgcolor: '#1565c0',
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Main content */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', transition: 'margin-left 0.3s' }}>
        {/* Top Bar */}
        <AppBar
          position="sticky"
          color="default"
          elevation={0}
          sx={{ borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', height: 60 }}
        >
          <Toolbar sx={{ minHeight: 60 }}>
            <IconButton edge="start" onClick={() => setDrawerOpen(!drawerOpen)} sx={{ mr: 2 }}>
              <MenuIcon />
            </IconButton>

            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="subtitle1" fontWeight={800} sx={{ fontSize: 18 }}>
                {currentTitle}
              </Typography>
              <Breadcrumbs separator={<NavigateNext sx={{ fontSize: 14 }} />} sx={{ '& .MuiBreadcrumbs-li': { fontSize: 12 } }}>
                <Link component={RouterLink} to="/dashboard" underline="hover" color="text.secondary" sx={{ fontSize: 12 }}>
                  Dashboard
                </Link>
                {location.pathname !== '/dashboard' && (
                  <Typography variant="caption" color="text.primary" sx={{ fontSize: 12 }}>
                    {currentTitle}
                  </Typography>
                )}
              </Breadcrumbs>
            </Box>

            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: 13, fontWeight: 700 }}>
                {initials}
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              <MenuItem onClick={() => { setAnchorEl(null); navigate('/perfil'); }}>
                <ListItemIcon><Person fontSize="small" /></ListItemIcon>
                Meu Perfil
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <ListItemIcon><Logout fontSize="small" /></ListItemIcon>
                Sair
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>

        {/* Page content */}
        <Box
          component="main"
          sx={{ flexGrow: 1, p: 3, backgroundColor: '#f4f6fb' }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};
