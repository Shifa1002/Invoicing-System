import React, { useState, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { SnackbarProvider } from 'notistack';
import { GlobalStyles, IconButton, useTheme } from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import { createAppTheme } from './theme';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard/Dashboard';
import Clients from './pages/Clients/Clients';
import Products from './pages/Products/Products';
import Contracts from './pages/Contracts/Contracts';
import Invoices from './pages/Invoices/Invoices';
import jwtDecode from 'jwt-decode';

// Global styles
const globalStyles = {
  '*': {
    boxSizing: 'border-box',
    margin: 0,
    padding: 0,
  },
  html: {
    height: '100%',
    width: '100%',
  },
  body: {
    height: '100%',
    width: '100%',
  },
  '#root': {
    height: '100%',
    width: '100%',
  },
  // Custom scrollbar
  '::-webkit-scrollbar': {
    width: '8px',
    height: '8px',
  },
  '::-webkit-scrollbar-track': {
    background: 'transparent',
  },
  '::-webkit-scrollbar-thumb': {
    background: 'rgba(0, 0, 0, 0.2)',
    borderRadius: '4px',
    '&:hover': {
      background: 'rgba(0, 0, 0, 0.3)',
    },
  },
  // Selection
  '::selection': {
    background: 'rgba(25, 118, 210, 0.2)',
  },
};

function ThemeToggle() {
  const theme = useTheme();
  const { toggleColorMode } = theme;

  return (
    <IconButton
      onClick={toggleColorMode}
      color="inherit"
      sx={{
        ml: 1,
        color: theme.palette.text.primary,
      }}
    >
      {theme.palette.mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
    </IconButton>
  );
}

function isTokenValid(token) {
  if (!token) return false;
  try {
    const decoded = jwtDecode(token);
    if (!decoded.exp) return true;
    return Date.now() < decoded.exp * 1000;
  } catch {
    return false;
  }
}

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!isTokenValid(token)) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  const [mode, setMode] = useState('light');
  const theme = useMemo(
    () =>
      createAppTheme(mode, {
        toggleColorMode: () => {
          setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
        },
      }),
    [mode]
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GlobalStyles styles={globalStyles} />
      <SnackbarProvider
        maxSnack={3}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        autoHideDuration={3000}
        Components={{
          success: (props) => (
            <SnackbarProvider
              {...props}
              sx={{
                backgroundColor: theme.palette.success.main,
                color: theme.palette.success.contrastText,
                '& .MuiSnackbarContent-message': {
                  color: theme.palette.success.contrastText,
                },
              }}
            />
          ),
          error: (props) => (
            <SnackbarProvider
              {...props}
              sx={{
                backgroundColor: theme.palette.error.main,
                color: theme.palette.error.contrastText,
                '& .MuiSnackbarContent-message': {
                  color: theme.palette.error.contrastText,
                },
              }}
            />
          ),
          warning: (props) => (
            <SnackbarProvider
              {...props}
              sx={{
                backgroundColor: theme.palette.warning.main,
                color: theme.palette.warning.contrastText,
                '& .MuiSnackbarContent-message': {
                  color: theme.palette.warning.contrastText,
                },
              }}
            />
          ),
          info: (props) => (
            <SnackbarProvider
              {...props}
              sx={{
                backgroundColor: theme.palette.info.main,
                color: theme.palette.info.contrastText,
                '& .MuiSnackbarContent-message': {
                  color: theme.palette.info.contrastText,
                },
              }}
            />
          ),
        }}
      >
        <Router>
          <Layout themeToggle={<ThemeToggle />}>
            <Routes>
              <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
              <Route path="/clients" element={<PrivateRoute><Clients /></PrivateRoute>} />
              <Route path="/products" element={<PrivateRoute><Products /></PrivateRoute>} />
              <Route path="/contracts" element={<PrivateRoute><Contracts /></PrivateRoute>} />
              <Route path="/invoices" element={<PrivateRoute><Invoices /></PrivateRoute>} />
              <Route path="/login" element={<Login />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
        </Router>
      </SnackbarProvider>
    </ThemeProvider>
  );
}

export default App; 