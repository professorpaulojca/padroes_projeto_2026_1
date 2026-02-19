import type { Components, Theme } from '@mui/material/styles';

export const globalStyles: Components<Theme>['MuiCssBaseline'] = {
  styleOverrides: {
    '*': {
      margin: 0,
      padding: 0,
      boxSizing: 'border-box',
    },
    html: {
      scrollBehavior: 'smooth',
    },
    body: {
      minHeight: '100vh',
      WebkitFontSmoothing: 'antialiased',
      MozOsxFontSmoothing: 'grayscale',
    },
    '#root': {
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
    },
    a: {
      textDecoration: 'none',
      color: 'inherit',
    },
    '::-webkit-scrollbar': {
      width: '8px',
    },
    '::-webkit-scrollbar-track': {
      background: '#f1f1f1',
    },
    '::-webkit-scrollbar-thumb': {
      background: '#c1c1c1',
      borderRadius: '4px',
    },
    '::-webkit-scrollbar-thumb:hover': {
      background: '#a8a8a8',
    },
  },
};
