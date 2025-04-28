import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Typography, Tabs, Tab } from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';

// ===== GLASS MORPHISM BACKGROUND COMPONENT =====
const GlassBackground = () => (
  <Box sx={{
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: -1,
    overflow: 'hidden',
    background: 'linear-gradient(135deg, #1a2a3a 0%, #2c3e50 100%)',
  }}>
    {/* Animated gradient orbs */}
    <motion.div
      animate={{
        x: [0, 50, -30, 0],
        y: [0, 40, -20, 0],
      }}
      transition={{
        duration: 25,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      style={{
        position: 'absolute',
        top: '20%',
        left: '10%',
        width: '300px',
        height: '300px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(52,152,219,0.3) 0%, transparent 70%)',
        filter: 'blur(40px)',
      }}
    />
    
    <motion.div
      animate={{
        x: [0, -40, 30, 0],
        y: [0, -30, 40, 0],
      }}
      transition={{
        duration: 30,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      style={{
        position: 'absolute',
        bottom: '15%',
        right: '10%',
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(231,76,60,0.2) 0%, transparent 70%)',
        filter: 'blur(50px)',
      }}
    />
    
    {/* Newspaper texture overlay */}
    <div style={{
      position: 'absolute',
      width: '100%',
      height: '100%',
      backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z\' fill=\'%239C92AC\' fill-opacity=\'0.05\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")',
      opacity: 0.15,
    }}/>
  </Box>
);

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState<'owner' | 'employee'>('owner');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.login(email, password, userType);
      if (!response || !response.token || !response[userType]) {
        throw new Error('Invalid response from server');
      }
      
      setTimeout(() => {
        login(response.token, { ...response[userType], type: userType });
        navigate(`/${userType}/dashboard`);
      }, 800);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 2,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Enhanced Glass Background */}
      <GlassBackground />

      {/* Floating newspaper particles */}
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={i}
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            rotate: Math.random() * 360,
            opacity: 0
          }}
          animate={{
            y: [0, -window.innerHeight],
            x: [0, Math.random() * 100 - 50],
            opacity: [0, 0.8, 0],
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            delay: Math.random() * 5
          }}
          style={{
            position: 'absolute',
            fontSize: `${Math.random() * 20 + 10}px`,
            opacity: 0,
          }}
        >
          📰
        </motion.div>
      ))}

      {/* Main Glass Card */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        style={{ width: '100%', maxWidth: '900px' }}
      >
        <Box sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          backdropFilter: 'blur(16px)',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        }}>
          {/* Left Panel - Newspaper Theme */}
          <Box sx={{
            flex: 1,
            display: { xs: 'none', md: 'flex' },
            flexDirection: 'column',
            justifyContent: 'center',
            padding: 4,
            background: 'linear-gradient(135deg, rgba(41,128,185,0.2) 0%, rgba(44,62,80,0.3) 100%)',
            position: 'relative',
          }}>
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Typography variant="h4" sx={{
                fontWeight: 800,
                color: 'white',
                mb: 1,
                textShadow: '0 2px 10px rgba(0,0,0,0.3)'
              }}>
                Newspaper
              </Typography>
              <Typography variant="h4" sx={{
                fontWeight: 800,
                color: 'white',
                mb: 1,
                textShadow: '0 2px 10px rgba(0,0,0,0.3)'
              }}>
                Delivery Management System
              </Typography>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <Typography variant="body1" sx={{
                color: 'rgba(255,255,255,0.8)',
                mb: 3,
                fontSize: '1.1rem',
                lineHeight: 1.6
              }}>
                Streamline your newspaper delivery operations with our comprehensive management system. Track deliveries, manage subscriptions, and optimize your business workflow.
              </Typography>
            </motion.div>

            {/* Newspaper delivery illustration */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.9 }}
              style={{
                position: 'relative',
                height: '150px',
                marginTop: '2rem'
              }}
            >
              <Box sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: '100%',
                height: '80px',
                backgroundColor: 'rgba(255,255,255,0.2)',
                borderRadius: '8px',
                backdropFilter: 'blur(5px)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}/>
              
              <motion.div
                animate={{
                  x: [0, 20, 0],
                  y: [0, -10, 0]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  repeatType: 'reverse'
                }}
                style={{
                  position: 'absolute',
                  left: '30%',
                  bottom: '40px',
                  fontSize: '40px'
                }}
              >
                🚚
              </motion.div>
              
              <motion.div
                animate={{
                  rotate: [0, 5, -5, 0]
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  repeatType: 'reverse'
                }}
                style={{
                  position: 'absolute',
                  right: '20%',
                  bottom: '50px',
                  fontSize: '30px'
                }}
              >
                📰
              </motion.div>
            </motion.div>
          </Box>

          {/* Right Panel - Login Form */}
          <Box sx={{
            flex: 1,
            padding: 4,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
          }}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Typography variant="h4" sx={{
                fontWeight: 700,
                color: '#2c3e50',
                mb: 1,
                textAlign: 'center'
              }}>
                Delivery Portal
              </Typography>
              
              <Typography variant="body2" sx={{
                color: '#7f8c8d',
                mb: 3,
                textAlign: 'center'
              }}>
                Sign in to manage newspaper deliveries
              </Typography>

              <Tabs
                value={userType}
                onChange={(_, newValue) => setUserType(newValue)}
                variant="fullWidth"
                sx={{ 
                  mb: 3,
                  '& .MuiTabs-indicator': {
                    height: '3px',
                    backgroundColor: '#3498db'
                  }
                }}
              >
                <Tab 
                  label="Owner" 
                  value="owner"
                  sx={{
                    fontWeight: 600,
                    color: userType === 'owner' ? '#3498db' : '#95a5a6',
                    '&.Mui-selected': { color: '#3498db' }
                  }}
                />
                <Tab 
                  label="Employee" 
                  value="employee"
                  sx={{
                    fontWeight: 600,
                    color: userType === 'employee' ? '#3498db' : '#95a5a6',
                    '&.Mui-selected': { color: '#3498db' }
                  }}
                />
              </Tabs>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                  >
                    <Box sx={{
                      mb: 2,
                      p: 2,
                      backgroundColor: 'rgba(231, 76, 60, 0.1)',
                      borderRadius: '8px',
                      borderLeft: '4px solid #e74c3c'
                    }}>
                      <Typography color="#e74c3c">
                        {error}
                      </Typography>
                    </Box>
                  </motion.div>
                )}
              </AnimatePresence>

              <Box component="form" onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  label="Email"
                  variant="outlined"
                  margin="normal"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                      '& fieldset': {
                        borderColor: '#dfe6e9',
                      },
                      '&:hover fieldset': {
                        borderColor: '#3498db',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#3498db',
                        boxShadow: '0 0 0 3px rgba(52, 152, 219, 0.2)'
                      }
                    }
                  }}
                />
                
                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  variant="outlined"
                  margin="normal"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                      '& fieldset': {
                        borderColor: '#dfe6e9',
                      },
                      '&:hover fieldset': {
                        borderColor: '#3498db',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#3498db',
                        boxShadow: '0 0 0 3px rgba(52, 152, 219, 0.2)'
                      }
                    }
                  }}
                />
                
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    size="large"
                    type="submit"
                    disabled={loading}
                    sx={{
                      mt: 3,
                      mb: 2,
                      py: 1.5,
                      borderRadius: '8px',
                      fontWeight: 600,
                      fontSize: '1rem',
                      background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
                      boxShadow: '0 4px 15px rgba(52, 152, 219, 0.3)',
                      '&:hover': {
                        boxShadow: '0 6px 20px rgba(52, 152, 219, 0.4)'
                      }
                    }}
                  >
                    {loading ? (
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        style={{ display: 'inline-block' }}
                      >
                        ⏳
                      </motion.span>
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                </motion.div>

                {userType === 'owner' && (
                  <Typography 
                    component={RouterLink}
                    to="/register"
                    variant="body2"
                    sx={{
                      display: 'block',
                      textAlign: 'center',
                      mt: 2,
                      color: '#3498db',
                      textDecoration: 'none',
                      '&:hover': {
                        textDecoration: 'underline'
                      }
                    }}
                  >
                    Don't have an account? Register
                  </Typography>
                )}
              </Box>
            </motion.div>
          </Box>
        </Box>
      </motion.div>

      <Typography 
        variant="body2" 
        sx={{
          position: 'fixed',
          bottom: 16,
          left: 0,
          right: 0,
          textAlign: 'center',
          color: 'rgba(255,255,255,0.7)',
        }}
      >
        © {new Date().getFullYear()} Newspaper Delivery Mangement System
      </Typography>
    </Box>
  );
};

export default Login;