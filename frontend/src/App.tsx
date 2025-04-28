import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import OwnerDashboard from './components/dashboard/OwnerDashboard';
import EmployeeDashboard from './components/dashboard/EmployeeDashboard';

import './App.css';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});


const PrivateRoute: React.FC<{ children: React.ReactNode; allowedUserType: 'owner' | 'employee' }> = ({
  children,
  allowedUserType,
}) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (user?.type !== allowedUserType) {
    return <Navigate to={`/${user?.type}/dashboard`} />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/owner/dashboard/*"
              element={
                <PrivateRoute allowedUserType="owner">
                  <OwnerDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/employee/dashboard/*"
              element={
                <PrivateRoute allowedUserType="employee">
                  <EmployeeDashboard />
                </PrivateRoute>
              }
            />
            <Route path="/" element={<Navigate to="/login" />} />
          </Routes>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
};

export default App;
