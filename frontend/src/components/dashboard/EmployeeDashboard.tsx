import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  Snackbar,
  LinearProgress,
  ButtonGroup,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import DashboardLayout from '../layout/DashboardLayout';
import DashboardCard from '../layout/DashboardCard';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useTheme } from '@mui/material/styles';

interface Delivery {
  delivery_id: number;
  employee_id: number;
  customer_id: number;
  newspaper_id: number;
  delivery_date: string;
  status: string;
  customer?: {
    name: string;
    address: string;
  };
  newspaper?: {
    name: string;
    title: string;
    publisher: string;
    frequency: string;
    price: number;
  };
  // For auto-removal timer
  timeRemaining?: number;
  removing?: boolean;
}

interface Newspaper {
  newspaper_id: number;
  name: string;
  title: string;
  publisher: string;
  frequency: string;
  price: number;
}

interface Customer {
  customer_id: number;
  name: string;
  address: string;
  email: string;
  phone: string;
}

const AUTO_REMOVE_DELAY = 30; // seconds

const EmployeeDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [assignedNewspapers, setAssignedNewspapers] = useState<Newspaper[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [notification, setNotification] = useState<{type: 'success' | 'error' | 'info', message: string} | null>(null);
  const theme = useTheme();

  // Fetch deliveries when component mounts or user changes
  useEffect(() => {
    if (user && (user.id || user.employee_id)) {
      fetchDeliveries();
      fetchCustomers();
    }
  }, [user]);

  // Fetch newspapers when deliveries change
  useEffect(() => {
    if (deliveries.length > 0) {
      fetchAssignedNewspapers();
    }
  }, [deliveries]);

  // Cleanup function for timers
  const cleanupTimers = () => {
    setDeliveries(prev => {
      return prev.map(delivery => {
        if (delivery.timeRemaining) {
          return {
            ...delivery,
            timeRemaining: undefined,
            removing: false
          };
        }
        return delivery;
      });
    });
  };

  // Cleanup any timers when component unmounts
  useEffect(() => {
    return () => {
      cleanupTimers();
    };
  }, []);

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      
      if (!user) {
        return;
      }
      
      const employeeId = user.employee_id || user.id;
      
      const data = await api.getDeliveries();
      
      if (!Array.isArray(data)) {
        return;
      }
      
      // Filter deliveries for this employee
      const employeeDeliveries = data.filter(delivery => {
        const deliveryEmployeeId = Number(delivery.employee_id);
        const currentEmployeeId = Number(employeeId);
        
        return deliveryEmployeeId === currentEmployeeId;
      });
      
      // Preserve any active timers or countdown values
      const updatedDeliveries = employeeDeliveries.map(delivery => {
        const existingDelivery = deliveries.find(d => d.delivery_id === delivery.delivery_id);
        if (existingDelivery && existingDelivery.timeRemaining) {
          return {
            ...delivery,
            timeRemaining: existingDelivery.timeRemaining,
            removing: existingDelivery.removing
          };
        }
        return delivery;
      });
      
      setDeliveries(updatedDeliveries);
    } catch (error) {
      console.error('Error fetching deliveries:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const data = await api.getCustomers();
      if (Array.isArray(data)) {
        setCustomers(data);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const fetchAssignedNewspapers = async () => {
    try {
      const data = await api.getNewspapers();
      
      const employeeNewspaperIds = new Set(
        deliveries
          .filter(delivery => !delivery.removing)
          .map(delivery => delivery.newspaper_id)
      );
      
      const filtered = data.filter((newspaper: Newspaper) => 
        employeeNewspaperIds.has(newspaper.newspaper_id)
      );
      
      setAssignedNewspapers(filtered);
    } catch (error) {
      console.error('Error fetching assigned newspapers:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Function to start auto-removal countdown for a delivered item
  const startAutoRemovalTimer = (deliveryId: number) => {
    // Mark the delivery for countdown
    setDeliveries(prevDeliveries => {
      return prevDeliveries.map(delivery => {
        if (delivery.delivery_id === deliveryId) {
          return {
            ...delivery,
            timeRemaining: AUTO_REMOVE_DELAY,
            removing: false
          };
        }
        return delivery;
      });
    });
    
    // Create a countdown display effect
    const countdownInterval = setInterval(() => {
      setDeliveries(currentDeliveries => {
        const updatedDeliveries = currentDeliveries.map(d => {
          if (d.delivery_id === deliveryId) {
            const newTime = (d.timeRemaining || 0) - 1;
            return {
              ...d,
              timeRemaining: newTime > 0 ? newTime : 0
            };
          }
          return d;
        });
        return updatedDeliveries;
      });
    }, 1000);
    
    // Schedule the actual removal after 30 seconds
    setTimeout(() => {
      clearInterval(countdownInterval);
      
      // Remove the delivery
      setDeliveries(prev => 
        prev.filter(d => d.delivery_id !== deliveryId)
      );
      
      // Get newspaper ID from delivery that's about to be removed
      const deliveryToRemove = deliveries.find(d => d.delivery_id === deliveryId);
      const newspaperId = deliveryToRemove?.newspaper_id;
      
      // Check if any remaining deliveries still use this newspaper
      const newspaperStillNeeded = deliveries.some(
        d => d.newspaper_id === newspaperId && d.delivery_id !== deliveryId
      );
      
      // If newspaper is no longer needed, remove it from assigned newspapers
      if (!newspaperStillNeeded && newspaperId) {
        setAssignedNewspapers(prev => 
          prev.filter(newspaper => newspaper.newspaper_id !== newspaperId)
        );
      }
      
      // Show notification
      setNotification({
        type: 'info',
        message: 'Completed delivery removed from dashboard'
      });
      
      // Refresh data to ensure UI is up to date
      setTimeout(() => {
        fetchDeliveries();
        fetchAssignedNewspapers();
      }, 500);
    }, AUTO_REMOVE_DELAY * 1000);
  };

  const handleStatusUpdate = async (deliveryId: number, newStatus: string) => {
    try {
      await api.updateDelivery(deliveryId, { status: newStatus });
      
      // Update local state first
      setDeliveries(prev => 
        prev.map(d => d.delivery_id === deliveryId ? {...d, status: newStatus} : d)
      );
      
      // If marked as delivered, start the removal timer
      if (newStatus === 'delivered') {
        setNotification({
          type: 'success',
          message: 'Delivery marked as delivered. It will be removed from your dashboard in 30 seconds.'
        });
        
        // Start the removal timer
        startAutoRemovalTimer(deliveryId);
      } else if (newStatus === 'failed') {
        setNotification({
          type: 'error',
          message: 'Delivery marked as failed.'
        });
      }
      
      // Refresh data
      await fetchDeliveries();
    } catch (error) {
      console.error('Error updating delivery status:', error);
      setNotification({
        type: 'error',
        message: 'Failed to update delivery status'
      });
    }
  };

  const getStatusChipColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return <CheckCircleIcon fontSize="small" />;
      case 'pending':
        return <AccessTimeIcon fontSize="small" />;
      case 'failed':
        return <ErrorIcon fontSize="small" />;
      default:
        return undefined;
    }
  };

  // Get customer address for a delivery
  const getCustomerAddress = (customerId: number) => {
    const customer = customers.find(c => c.customer_id === customerId);
    return customer?.address || 'Address not available';
  };

  const handleCloseNotification = () => {
    setNotification(null);
  };

  return (
    <DashboardLayout title="Employee Dashboard">
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Delivery Assignments */}
        <DashboardCard title="Delivery Assignments">
          {loading ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Customer</TableCell>
                    <TableCell>Address</TableCell>
                    <TableCell>Newspaper</TableCell>
                    <TableCell>Delivery Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {deliveries.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        No deliveries assigned yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    deliveries.map((delivery) => {
                      // Find customer address from either delivery or customers list
                      const customerAddress = delivery.customer?.address || 
                                             getCustomerAddress(delivery.customer_id);
                      
                      return (
                        <TableRow 
                          key={delivery.delivery_id}
                          sx={delivery.removing ? { bgcolor: 'rgba(76, 175, 80, 0.1)' } : {}}
                        >
                          <TableCell>
                            {delivery.customer ? delivery.customer.name : 
                            `Customer #${delivery.customer_id}`}
                          </TableCell>
                          <TableCell>
                            {customerAddress}
                          </TableCell>
                          <TableCell>
                            {delivery.newspaper ? 
                              (delivery.newspaper.title || delivery.newspaper.name) : 
                              `Newspaper #${delivery.newspaper_id}`}
                          </TableCell>
                          <TableCell>
                            {delivery.delivery_date ? 
                              new Date(delivery.delivery_date).toLocaleDateString() : 
                              'N/A'}
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                              <Chip 
                                label={delivery.status || 'Unknown'} 
                                color={getStatusChipColor(delivery.status) as any}
                                size="small"
                                icon={getStatusIcon(delivery.status)}
                              />
                              
                              {delivery.timeRemaining !== undefined && delivery.timeRemaining > 0 && (
                                <Box sx={{ width: '100%' }}>
                                  <LinearProgress 
                                    variant="determinate" 
                                    value={(delivery.timeRemaining / AUTO_REMOVE_DELAY) * 100} 
                                    color="success"
                                  />
                                  <Typography variant="caption" fontSize={10} color="text.secondary">
                                    Removing in {delivery.timeRemaining}s
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                          </TableCell>
                          <TableCell>
                            {delivery.status === 'pending' ? (
                              <ButtonGroup size="small" variant="contained">
                                <Button
                                  color="primary"
                                  onClick={() => handleStatusUpdate(delivery.delivery_id, 'delivered')}
                                >
                                  Deliver
                                </Button>
                                <Button
                                  color="error"
                                  onClick={() => handleStatusUpdate(delivery.delivery_id, 'failed')}
                                >
                                  Mark Failed
                                </Button>
                              </ButtonGroup>
                            ) : delivery.status === 'delivered' ? (
                              <Chip 
                                label={delivery.timeRemaining ? `Removing in ${delivery.timeRemaining}s` : 'Completed'} 
                                color="success"
                                size="small"
                              />
                            ) : (
                              <Chip 
                                label="Failed" 
                                color="error"
                                size="small"
                              />
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DashboardCard>

        {/* Assigned Newspapers */}
        <DashboardCard title="Assigned Newspapers">
          {loading ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Title</TableCell>
                    <TableCell>Publisher</TableCell>
                    <TableCell>Frequency</TableCell>
                    <TableCell>Price</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {assignedNewspapers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        No newspapers assigned yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    assignedNewspapers.map((newspaper) => (
                      <TableRow key={newspaper.newspaper_id}>
                        <TableCell>{newspaper.title || newspaper.name}</TableCell>
                        <TableCell>{newspaper.publisher}</TableCell>
                        <TableCell>{newspaper.frequency}</TableCell>
                        <TableCell>${Number(newspaper.price).toFixed(2)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DashboardCard>

        {/* Delivery Summary */}
        <DashboardCard title="Delivery Summary">
          <Box sx={{ display: 'flex', justifyContent: 'space-around', p: 2 }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4">
                {deliveries.filter(d => d.status === 'pending').length}
              </Typography>
              <Typography variant="subtitle2" color="text.secondary">
                Pending Deliveries
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4">
                {deliveries.filter(d => d.status === 'delivered').length}
              </Typography>
              <Typography variant="subtitle2" color="text.secondary">
                Completed Deliveries
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4">
                {deliveries.filter(d => d.status === 'failed').length}
              </Typography>
              <Typography variant="subtitle2" color="text.secondary">
                Failed Deliveries
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
            <Button 
              variant="contained" 
              color="primary"
              onClick={fetchDeliveries}
              disabled={loading}
            >
              {loading ? 'Refreshing...' : 'Refresh Data'}
            </Button>
          </Box>
        </DashboardCard>
      </Box>

      {/* Notifications */}
      <Snackbar 
        open={!!notification} 
        autoHideDuration={6000} 
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification?.type || 'info'} 
          sx={{ width: '100%' }}
        >
          {notification?.message}
        </Alert>
      </Snackbar>
    </DashboardLayout>
  );
};

export default EmployeeDashboard;