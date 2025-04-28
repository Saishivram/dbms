import React, { ReactNode } from 'react';
import { Box, Typography, Button, Paper, alpha, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface DashboardLayoutProps {
  title: string;
  children: ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ title, children }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const theme = useTheme();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box sx={{ 
      flexGrow: 1, 
      p: 3,
      bgcolor: '#e3f2fd',
      minHeight: '100vh'
    }}>
      <Paper
        elevation={0}
        sx={{
          mb: 4,
          p: 3,
          borderRadius: 2,
          background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          '&::after': {
            content: '""',
            position: 'absolute',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            background: alpha(theme.palette.common.white, 0.1),
            top: '-100px',
            right: '-50px',
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            width: '150px',
            height: '150px',
            borderRadius: '50%',
            background: alpha(theme.palette.common.white, 0.1),
            bottom: '-70px',
            left: '-50px',
          }
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{title}</Typography>
          <Button 
            variant="contained" 
            color="error" 
            onClick={handleLogout}
            sx={{
              bgcolor: alpha(theme.palette.common.white, 0.2),
              color: 'white',
              '&:hover': {
                bgcolor: alpha(theme.palette.common.white, 0.3),
              },
              px: 3,
            }}
          >
            Logout
          </Button>
        </Box>
      </Paper>

      <Box>
        {/* Main content */}
        {children}
      </Box>
    </Box>
  );
};

export default DashboardLayout;