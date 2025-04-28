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
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormHelperText,
  Tooltip,
  DialogContentText,
  Badge,
  Chip,
  InputAdornment,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Notifications as NotificationsIcon, Check as CheckIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import type { GridProps } from '@mui/material/Grid';
import DashboardLayout from '../layout/DashboardLayout';
import DashboardCard from '../layout/DashboardCard';
import { Notification as NotificationType, CreateNotificationData as CreateNotificationDataType } from '../../types';
import ChatWidget from '../chat/ChatWidget';
import { useTheme } from '@mui/material/styles';

interface Employee {
  employee_id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  password?: string;
}

interface Customer {
  customer_id: number;
  name: string;
  email: string;
  address: string;
  phone: string;
}

interface Newspaper {
  newspaper_id: number;
  name: string;
  title: string;
  publisher: string;
  frequency: string;
  price: number;
  owner_id: number;
}

interface Notification {
  id: number;
  recipient_id: number;
  message: string;
  type: 'info' | 'alert';
  read: boolean;
  created_at: string;
}

interface Payment {
  payment_id: number;
  subscription_id: number;
  amount: number;
  payment_date: string;
  status: 'paid' | 'late' | 'pending';
  due_date: string;
}

interface Subscription {
  subscription_id: number;
  customer_id: number;
  newspaper_id: number;
  start_date: string;
  end_date: string;
  status: 'active' | 'suspended' | 'cancelled';
  monthly_fee: number;
  next_payment_date: string;
  created_at: string;
  customer?: Customer;
  newspaper?: Newspaper;
  Customer?: Customer;
  Newspaper?: Newspaper;
}

interface Delivery {
  delivery_id: number;
  employee_id: number;
  customer_id: number;
  newspaper_id: number;
  delivery_date: string;
  status: 'pending' | 'delivered' | 'failed' | 'completed';
}

interface FormData {
  // Common fields
  id?: number;
  showPasswordField?: boolean;

  // Employee fields
  employee_id?: number;
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
  password?: string;

  // Customer fields
  customer_id?: number;
  address?: string;

  // Newspaper fields
  newspaper_id?: number;
  title?: string;
  publisher?: string;
  frequency?: string;
  price?: number;
  owner_id?: number;

  // Subscription fields
  subscription_id?: number;
  start_date?: string;
  end_date?: string;
  status?: 'active' | 'suspended' | 'cancelled';
  monthly_fee?: number;
  next_payment_date?: string;
}

const OwnerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [newspapers, setNewspapers] = useState<Newspaper[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<number | ''>('');
  const [selectedCustomer, setSelectedCustomer] = useState<number | ''>('');
  const [selectedNewspaper, setSelectedNewspaper] = useState<number | ''>('');
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState<'employee' | 'customer' | 'newspaper' | 'subscription'>('employee');
  const [formData, setFormData] = useState<FormData>({});
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: string; id: number; name: string } | null>(null);
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const theme = useTheme();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
  try {
    console.log('Fetching data for owner dashboard... Owner ID:', user?.id);
    
    // First, get the newspapers for this owner - these will be used to filter other data
    const newspapersData = await api.getNewspapers();
    
    // Get the owner's newspaper IDs
    const ownerNewspaperIds = newspapersData.map(n => n.newspaper_id);
    console.log('Owner newspaper IDs:', ownerNewspaperIds);
    
    // Fetch the rest of the data
    const [
      employeesData, 
      customersData,  
      notificationsData,
      paymentsData,
      subscriptionsData,
      deliveriesData
    ] = await Promise.all([
      api.getEmployees(),
      api.getCustomers(),
      api.getNotifications(),
      api.getPayments(),
      api.getSubscriptions(),
      api.getDeliveries()
    ]);
    
    // Filter subscriptions to only include those for this owner's newspapers
    const filteredSubscriptions = subscriptionsData.filter(sub => 
      ownerNewspaperIds.includes(sub.newspaper_id)
    );
    
    console.log('Filtered subscriptions count:', filteredSubscriptions.length);
    console.log('Total subscriptions count:', subscriptionsData.length);
    
    // Get IDs of customers who have subscriptions with this owner's newspapers
    const ownerCustomerIds = new Set(filteredSubscriptions.map(sub => sub.customer_id));
    
    // Filter customers
    const filteredCustomers = customersData.filter(customer => 
      ownerCustomerIds.has(customer.customer_id)
    );
    
    console.log('Filtered customers count:', filteredCustomers.length);
    console.log('Total customers count:', customersData.length);
    
    // Filter payments to only include those for this owner's subscriptions
    const ownerSubscriptionIds = filteredSubscriptions.map(sub => sub.subscription_id);
    const filteredPayments = paymentsData.filter(payment => 
      ownerSubscriptionIds.includes(payment.subscription_id)
    );
    
    console.log('Filtered payments count:', filteredPayments.length);
    
    // Filter deliveries to only include those for this owner's newspapers
    const filteredDeliveries = deliveriesData.filter(delivery => 
      ownerNewspaperIds.includes(delivery.newspaper_id) &&
      delivery.status !== 'delivered'
    );
    
    // Enrich subscriptions with customer and newspaper data
    const enrichedSubscriptions = filteredSubscriptions.map(sub => {
      const customerData = sub.customer || sub.Customer || 
                         filteredCustomers.find(c => c.customer_id === sub.customer_id);
      const newspaperData = sub.newspaper || sub.Newspaper || 
                          newspapersData.find(n => n.newspaper_id === sub.newspaper_id);

      return {
        ...sub,
        customer: customerData,
        newspaper: newspaperData
      };
    });
    
    setEmployees(employeesData);
    setCustomers(filteredCustomers);
    setNewspapers(newspapersData);
    setNotifications(notificationsData);
    setUnreadCount(notificationsData.filter((n: NotificationType) => !n.read).length);
    setPayments(filteredPayments);
    setSubscriptions(enrichedSubscriptions);
    setDeliveries(filteredDeliveries);

    // Check for payment notifications after data is loaded
    await checkPaymentNotifications();
  } catch (error) {
    console.error('Error fetching data:', error);
    setFormErrors({ submit: 'Error fetching data. Please try again.' });
  }
};

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleOpenDialog = (type: 'employee' | 'customer' | 'newspaper' | 'subscription', data?: any) => {
    setDialogType(type);
    if (data) {
      const formattedData = {
        ...data,
        password: ''
      };
      setFormData(formattedData);
    } else {
      setFormData({});
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({});
  };

  const validateForm = (data: FormData): { [key: string]: string } => {
    const errors: { [key: string]: string } = {};
    
    switch (dialogType) {
      case 'employee': {
        if (!data.name?.trim()) errors.name = 'Name is required';
      if (!data.email?.trim()) {
        errors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        errors.email = 'Invalid email format';
      }
        if (!data.employee_id && !data.password?.trim()) {
        errors.password = 'Password is required for new employees';
      }
        if (!data.role?.trim()) errors.role = 'Role is required';
        if (data.phone && !/^\+?[\d\s-]{10,}$/.test(data.phone)) {
          errors.phone = 'Invalid phone number format';
        }
        break;
      }
      
      case 'customer': {
        if (!data.name?.trim()) errors.name = 'Name is required';
        if (!data.email?.trim()) {
          errors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
          errors.email = 'Invalid email format';
        }
        if (!data.address?.trim()) errors.address = 'Address is required';
        if (data.phone && !/^\+?[\d\s-]{10,}$/.test(data.phone)) {
          errors.phone = 'Invalid phone number format';
        }
        break;
      }
      
      case 'newspaper': {
        if (!data.name?.trim()) errors.name = 'Name is required';
        if (!data.title?.trim()) errors.title = 'Title is required';
        if (!data.publisher?.trim()) errors.publisher = 'Publisher is required';
        if (!data.frequency?.trim()) errors.frequency = 'Frequency is required';
        if (!data.price || data.price <= 0) {
          errors.price = 'Price must be greater than 0';
        }
        break;
      }
      
      case 'subscription': {
        console.log('Validating subscription data:', data);
        if (!data.customer_id) errors.customer_id = 'Customer is required';
        if (!data.newspaper_id) errors.newspaper_id = 'Newspaper is required';
        if (!data.start_date) {
          errors.start_date = 'Start date is required';
        } else if (data.end_date) {
          const startDate = new Date(data.start_date);
          const endDate = new Date(data.end_date);
          if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime()) && endDate < startDate) {
            errors.end_date = 'End date cannot be before start date';
          }
        }
        if (!data.monthly_fee || data.monthly_fee <= 0) {
          errors.monthly_fee = 'Monthly fee must be greater than 0';
        }
        if (!data.status) errors.status = 'Status is required';
        console.log('Validation errors:', errors);
        break;
      }
    }
    
    return errors;
  };

  const calculateMonthlyAmount = (newspaperPrice: number, deliveryDays: string[], paymentFrequency: 'monthly' | 'quarterly' | 'yearly' = 'monthly') => {
    // Calculate base monthly amount (price per day * number of days in a month)
    const daysPerMonth = 30;
    const baseAmount = newspaperPrice * daysPerMonth;

    // Apply discount based on payment frequency
    let discountMultiplier = 1;
    switch (paymentFrequency) {
      case 'quarterly':
        discountMultiplier = 0.95; // 5% discount
        break;
      case 'yearly':
        discountMultiplier = 0.90; // 10% discount
        break;
      default:
        discountMultiplier = 1;
    }

    return baseAmount * discountMultiplier;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const errors = validateForm(formData);
    setFormErrors(errors);

    if (Object.keys(errors).length === 0) {
      try {
        let response;
        
        switch (dialogType) {
          case 'employee': {
            const employeeData = {
              name: formData.name!,
              email: formData.email!,
              phone: formData.phone || null,
              role: formData.role!,
              owner_id: user?.id, // Add this line to include owner_id for both create and update
              ...(formData.password && formData.password.trim() !== '' ? { password: formData.password } : {})
            };
            
            if (formData.employee_id) {
              response = await api.updateEmployee(formData.employee_id, employeeData);
            } else {
              response = await api.createEmployee(employeeData);
            }
            break;
          }
          
          case 'customer': {
            const customerData = {
              name: formData.name!,
              email: formData.email!,
              phone: formData.phone || null,
              address: formData.address!
            };
            
            if (formData.customer_id) {
              response = await api.updateCustomer(formData.customer_id, customerData);
            } else {
              response = await api.createCustomer(customerData);
            }
            break;
          }
          
          case 'newspaper': {
            const newspaperData = {
              name: formData.name!,
              title: formData.title!,
              publisher: formData.publisher!,
              frequency: formData.frequency!,
              price: formData.price!,
              owner_id: user?.id
            };
            
            if (formData.newspaper_id) {
              response = await api.updateNewspaper(formData.newspaper_id, newspaperData);
            } else {
              response = await api.createNewspaper(newspaperData);
            }
            break;
          }
          
          case 'subscription': {
            try {
              console.log('Submitting subscription data:', formData);
              const subscriptionData = {
                customer_id: formData.customer_id!,
                newspaper_id: formData.newspaper_id!,
                start_date: formData.start_date || new Date().toISOString().split('T')[0],
                end_date: formData.end_date || null,
                status: formData.status || 'active',
                monthly_fee: formData.monthly_fee!,
                next_payment_date: formData.next_payment_date || (() => {
                  const date = new Date();
                  date.setDate(date.getDate() + 30);
                  return date.toISOString().split('T')[0];
                })()
              };
              
              console.log('Processed subscription data:', subscriptionData);
              
              if (formData.subscription_id) {
                console.log('Updating subscription:', formData.subscription_id);
                response = await api.updateSubscription(formData.subscription_id, subscriptionData);
              } else {
                console.log('Creating new subscription');
                response = await api.createSubscription(subscriptionData);
                console.log('Subscription created:', response);
                
                if (response && response.subscription_id) {
                  console.log('Creating initial payment record');
                  const paymentData = {
                    subscription_id: response.subscription_id,
                    amount: subscriptionData.monthly_fee,
                    payment_date: new Date().toISOString().split('T')[0],
                    due_date: subscriptionData.next_payment_date,
                    status: 'pending'
                  };
                  console.log('Payment data:', paymentData);
                  await api.createPayment(paymentData);
                } else {
                  console.error('No subscription_id received from createSubscription');
                  throw new Error('Failed to create subscription: No ID received');
                }
              }
              
              console.log('Subscription operation successful, refreshing data...');
              await fetchData();
              handleCloseDialog();
            } catch (error: unknown) {
              console.error('Error in subscription operation:', error);
              let errorMessage = 'Please try again.';
              
              if (error instanceof Error) {
                errorMessage = error.message;
              } else if (typeof error === 'string') {
                errorMessage = error;
              } else if (error && typeof error === 'object' && 'message' in error) {
                errorMessage = String(error.message);
              }
              
              setFormErrors({ 
                submit: `Error ${formData.subscription_id ? 'updating' : 'creating'} subscription. ${errorMessage}`
              });
              setIsSubmitting(false);
              return; // Prevent dialog from closing on error
            }
            break;
          }
        }

        await fetchData(); // Refresh data
        handleCloseDialog();
      } catch (error) {
        console.error('Error submitting form:', error);
        setFormErrors({ submit: 'Error submitting form. Please try again.' });
      }
    }
    setIsSubmitting(false);
  };

  const handleAssignDelivery = async () => {
    if (selectedEmployee && selectedCustomer && selectedNewspaper) {
      try {
        // Check if there's an active subscription for this customer-newspaper combination
        const validSubscription = subscriptions.some(sub => 
          sub.customer_id === selectedCustomer && 
          sub.newspaper_id === selectedNewspaper && 
          sub.status === 'active'
        );
        
        if (!validSubscription) {
          // Show error or create a notification
          const errorNotification: CreateNotificationDataType = {
            recipient_id: user?.id || 0,
            message: 'Cannot assign delivery: No active subscription found for this customer and newspaper',
            type: 'alert',
            read: false,
            created_at: new Date().toISOString()
          };
          
          const newNotification = await api.createNotification(errorNotification);
          setNotifications(prev => [...prev, newNotification]);
          setUnreadCount(prev => prev + 1);
          return;
        }
        
        const today = new Date().toISOString().split('T')[0];
        await api.createDelivery({
          employee_id: selectedEmployee,
          customer_id: selectedCustomer,
          newspaper_id: selectedNewspaper,
          delivery_date: today,
          status: 'pending'
        });
        setSelectedEmployee('');
        setSelectedCustomer('');
        setSelectedNewspaper('');
        fetchData();
      } catch (error) {
        console.error('Error assigning delivery:', error);
      }
    }
  };

  const handleNewspaperSubmit = async (formData: any) => {
    try {
      const owner = JSON.parse(localStorage.getItem('user') || '{}');
      console.log('Current user from localStorage:', owner);
      
      if (!owner.owner_id) {
        console.error('No owner_id found in localStorage');
        setFormErrors({ submit: 'Error: Owner ID not found' });
        return;
      }

      if (formData.newspaper_id) {
        console.log('Updating newspaper:', formData);
        await api.updateNewspaper(formData.newspaper_id, {
          name: formData.name,
          title: formData.title,
          publisher: formData.publisher,
          frequency: formData.frequency,
          price: formData.price
        });
      } else {
        console.log('Creating new newspaper with data:', {
          ...formData,
          owner_id: owner.owner_id
        });
        await api.createNewspaper({
          name: formData.name,
          title: formData.title,
          publisher: formData.publisher,
          frequency: formData.frequency,
          price: formData.price,
          owner_id: owner.owner_id
        });
      }
      fetchData();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving newspaper:', error);
      setFormErrors({ submit: 'Error saving newspaper' });
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;

    try {
      switch (itemToDelete.type) {
        case 'employee':
          await api.deleteEmployee(itemToDelete.id);
          setEmployees(employees.filter(emp => emp.employee_id !== itemToDelete.id));
          break;
          
        case 'customer':
          await api.deleteCustomer(itemToDelete.id);
          setCustomers(customers.filter(cust => cust.customer_id !== itemToDelete.id));
          break;
          
        case 'newspaper':
          await api.deleteNewspaper(itemToDelete.id);
          setNewspapers(newspapers.filter(news => news.newspaper_id !== itemToDelete.id));
          break;
          
        case 'subscription':
          await api.updateSubscription(itemToDelete.id, { status: 'cancelled' });
          // Update the subscription status immediately
          setSubscriptions(subscriptions.map(sub => 
            sub.subscription_id === itemToDelete.id 
              ? { ...sub, status: 'cancelled' } 
              : sub
          ));
          
          // Remove the cancelled subscription after 30 seconds
          setTimeout(() => {
            setSubscriptions(prev => prev.filter(sub => 
              sub.subscription_id !== itemToDelete.id
            ));
          }, 30000); // 30 seconds
          break;
          
        default:
          console.error('Unknown item type:', itemToDelete.type);
          return;
      }
      
      handleCloseDeleteDialog();
    } catch (error) {
      console.error('Error deleting item:', error);
      setFormErrors({ delete: 'Error deleting item. Please try again.' });
    }
  };

  const handleOpenDeleteDialog = (type: 'employee' | 'customer' | 'newspaper' | 'subscription', id: number, name: string) => {
    setItemToDelete({ type, id, name });
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  // Add notification handlers
  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await api.markNotificationAsRead(notificationId);
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleDeleteNotification = async (notificationId: number) => {
    try {
      await api.deleteNotification(notificationId);
      setNotifications(notifications.filter(n => n.id !== notificationId));
      const wasUnread = notifications.find(n => n.id === notificationId)?.read === false;
      if (wasUnread) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleUpdateDeliveryStatus = async (deliveryId: number, newStatus: 'pending' | 'delivered' | 'failed' | 'completed') => {
    try {
      await api.updateDelivery(deliveryId, { status: newStatus });
      
      setDeliveries(prev => prev.map(delivery => 
        delivery.delivery_id === deliveryId 
          ? { ...delivery, status: newStatus }
          : delivery
      ));

      if (newStatus === 'delivered') {
        setTimeout(() => {
          setDeliveries(prev => prev.filter(delivery => delivery.delivery_id !== deliveryId));
        }, 20000);
      }
    } catch (error) {
      console.error('Error updating delivery status:', error);
      const errorNotification: CreateNotificationDataType = {
        recipient_id: user?.id || 0,
        message: 'Failed to update delivery status',
        type: 'alert',
        read: false,
        created_at: new Date().toISOString()
      };
      
      try {
        const newNotification = await api.createNotification(errorNotification);
        if (newNotification) {
          setNotifications(prev => [...prev, newNotification]);
          setUnreadCount(prev => prev + 1);
        }
      } catch (notifError) {
        console.error('Error creating error notification:', notifError);
      }
    }
  };

  // Add useEffect to filter out cancelled subscriptions when component mounts
  useEffect(() => {
    // Filter out cancelled subscriptions from initial data load after 30 seconds
    const timer = setTimeout(() => {
      setSubscriptions(prev => prev.filter(sub => sub.status !== 'cancelled'));
    }, 30000);

    return () => clearTimeout(timer); // Cleanup timer on component unmount
  }, []);

  // Add this helper function to calculate total subscription amount for a customer
  const calculateCustomerTotalAmount = (customerId: number) => {
    return subscriptions
      .filter(sub => sub.customer_id === customerId && sub.status === 'active')
      .reduce((total, sub) => total + (sub.monthly_fee || 0), 0);
  };

  // Update the checkPaymentNotifications function to be async
  const checkPaymentNotifications = async () => {
    const today = new Date();
    
    for (const subscription of subscriptions) {
      if (subscription.status !== 'active') continue;

      const nextPaymentDate = new Date(subscription.next_payment_date);
      const customerName = subscription.customer?.name || 
                          subscription.Customer?.name || 
                          customers.find(c => c.customer_id === subscription.customer_id)?.name || 
                          'Unknown Customer';
      const newspaperTitle = subscription.newspaper?.title || 
                            subscription.Newspaper?.title || 
                            newspapers.find(n => n.newspaper_id === subscription.newspaper_id)?.title || 
                            'Unknown Newspaper';

      // Check if payment is overdue
      if (nextPaymentDate < today) {
        const daysOverdue = Math.floor((today.getTime() - nextPaymentDate.getTime()) / (1000 * 60 * 60 * 24));
        
        const overdueNotificationExists = notifications.some(
          n => n.message.includes(`Payment overdue for ${customerName}`) &&
              n.created_at > nextPaymentDate.toISOString()
        );

        if (!overdueNotificationExists) {
          const overdueNotification: CreateNotificationDataType = {
            recipient_id: user?.id || 0,
            message: `Payment overdue for ${customerName}'s ${newspaperTitle} subscription by ${daysOverdue} days. Amount: $${subscription.monthly_fee.toFixed(2)}`,
            type: 'alert',
            read: false,
            created_at: new Date().toISOString()
          };
          
          try {
            const newOverdueNotification = await api.createNotification(overdueNotification);
            if (newOverdueNotification) {
              setNotifications(prevNotifications => [...prevNotifications, newOverdueNotification]);
              setUnreadCount(prevCount => prevCount + 1);
            }
          } catch (error: unknown) {
            console.error('Error creating overdue notification:', error);
          }
        }
      }
      // Check if payment is due soon
      else if (nextPaymentDate.getTime() - today.getTime() <= 7 * 24 * 60 * 60 * 1000) {
        const daysUntilDue = Math.ceil((nextPaymentDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        const upcomingNotificationExists = notifications.some(
          n => n.message.includes(`Payment due soon for ${customerName}`) &&
              n.created_at > new Date(today.getTime() - 24 * 60 * 60 * 1000).toISOString()
        );

        if (!upcomingNotificationExists) {
          const upcomingNotification: CreateNotificationDataType = {
            recipient_id: user?.id || 0,
            message: `Payment due soon for ${customerName}'s ${newspaperTitle} subscription in ${daysUntilDue} days. Amount: $${subscription.monthly_fee.toFixed(2)}`,
            type: 'info',
            read: false,
            created_at: new Date().toISOString()
          };
          
          try {
            const newUpcomingNotification = await api.createNotification(upcomingNotification);
            if (newUpcomingNotification) {
              setNotifications(prevNotifications => [...prevNotifications, newUpcomingNotification]);
              setUnreadCount(prevCount => prevCount + 1);
            }
          } catch (error: unknown) {
            console.error('Error creating upcoming payment notification:', error);
          }
        }
      }
    }
  };

  // Update the useEffect for notifications check
  useEffect(() => {
    let checkInterval: NodeJS.Timeout;

    // Check immediately when subscriptions or notifications change
    if (subscriptions.length > 0) {
      checkPaymentNotifications().catch(error => 
        console.error('Error checking payment notifications:', error)
      );
    }

    // Set up interval to check every hour
    checkInterval = setInterval(() => {
      checkPaymentNotifications().catch(error => 
        console.error('Error checking payment notifications:', error)
      );
    }, 60 * 60 * 1000);

    return () => {
      if (checkInterval) clearInterval(checkInterval);
    }; // Cleanup on unmount
  }, [subscriptions, notifications, customers, newspapers]);

  return (
    <DashboardLayout title="Owner Dashboard">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ mb: 2 }}>
          Notifications
          <IconButton 
            color="primary" 
            onClick={() => setShowNotifications(!showNotifications)}
            sx={{ ml: 2 }}
          >
            <Badge badgeContent={unreadCount} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
        </Typography>

        {/* Notifications Section */}
        {showNotifications && (
          <DashboardCard title="Notifications">
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Message</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {notifications.map((notification) => (
                    <TableRow key={notification.id}>
                      <TableCell>{notification.message}</TableCell>
                      <TableCell>
                        <Chip 
                          label={notification.type} 
                          color={notification.type === 'alert' ? 'error' : 'info'} 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(notification.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={notification.read ? 'Read' : 'Unread'} 
                          color={notification.read ? 'default' : 'primary'} 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell>
                        {!notification.read && (
                          <IconButton onClick={() => handleMarkAsRead(notification.id)}>
                            <CheckIcon />
                          </IconButton>
                        )}
                        <IconButton onClick={() => handleDeleteNotification(notification.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </DashboardCard>
        )}

        {/* Newspaper Management */}
        <DashboardCard 
          title="Newspaper Management" 
          actionButton={{
            label: "Add Newspaper",
            onClick: () => handleOpenDialog('newspaper')
          }}
        >
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Title</TableCell>
                  <TableCell>Publisher</TableCell>
                  <TableCell>Frequency</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {newspapers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No newspapers found. Add your first newspaper!
                    </TableCell>
                  </TableRow>
                ) : (
                  newspapers.map((newspaper) => (
                    <TableRow key={newspaper.newspaper_id}>
                      <TableCell>{newspaper.name}</TableCell>
                      <TableCell>{newspaper.title}</TableCell>
                      <TableCell>{newspaper.publisher}</TableCell>
                      <TableCell>{newspaper.frequency}</TableCell>
                      <TableCell>${newspaper.price.toFixed(2)}</TableCell>
                      <TableCell>
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDialog('newspaper', newspaper)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDeleteDialog('newspaper', newspaper.newspaper_id, newspaper.name)}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </DashboardCard>

        {/* Delivery Management */}
        <DashboardCard title="Delivery Management">
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Employee</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Newspaper</TableCell>
                  <TableCell>Delivery Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {deliveries.map((delivery) => (
                  <TableRow key={delivery.delivery_id}>
                    <TableCell>
                      {employees.find(e => e.employee_id === delivery.employee_id)?.name}
                    </TableCell>
                    <TableCell>
                      {customers.find(c => c.customer_id === delivery.customer_id)?.name}
                    </TableCell>
                    <TableCell>
                      {newspapers.find(n => n.newspaper_id === delivery.newspaper_id)?.title}
                    </TableCell>
                    <TableCell>
                      {new Date(delivery.delivery_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={delivery.status} 
                        color={
                          delivery.status === 'delivered' ? 'success' :
                          delivery.status === 'pending' ? 'warning' :
                          'error'
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton 
                        onClick={() => handleUpdateDeliveryStatus(delivery.delivery_id, 'delivered')}
                        disabled={delivery.status === 'delivered'}
                      >
                        <CheckIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DashboardCard>

        {/* Subscriptions Section */}
        <DashboardCard 
          title="Subscriptions Management" 
          actionButton={{
            label: "Add Subscription",
            onClick: () => handleOpenDialog('subscription')
          }}
        >
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Customer</TableCell>
                  <TableCell>Newspaper</TableCell>
                  <TableCell>Start Date</TableCell>
                  <TableCell>End Date</TableCell>
                  <TableCell>Monthly Fee</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Next Payment</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {subscriptions
                  .filter(subscription => subscription.status !== 'cancelled' || 
                    new Date(subscription.created_at).getTime() > Date.now() - 30000) // Show cancelled subscriptions only for 30 seconds
                  .map((subscription) => {
                  // Get customer and newspaper data, trying both lowercase and uppercase keys
                  const customerName = subscription.customer?.name || 
                                     subscription.Customer?.name || 
                                     customers.find(c => c.customer_id === subscription.customer_id)?.name || 
                                     'N/A';
                  const newspaperTitle = subscription.newspaper?.title || 
                                       subscription.Newspaper?.title || 
                                       newspapers.find(n => n.newspaper_id === subscription.newspaper_id)?.title || 
                                       'N/A';
                  
                  return (
                    <TableRow key={subscription.subscription_id}>
                      <TableCell>{customerName}</TableCell>
                      <TableCell>{newspaperTitle}</TableCell>
                      <TableCell>{new Date(subscription.start_date).toLocaleDateString()}</TableCell>
                      <TableCell>{subscription.end_date ? new Date(subscription.end_date).toLocaleDateString() : 'Ongoing'}</TableCell>
                      <TableCell>${subscription.monthly_fee.toFixed(2)}</TableCell>
                      <TableCell>
                        <Chip 
                          label={subscription.status} 
                          color={
                            subscription.status === 'active' ? 'success' : 
                            subscription.status === 'suspended' ? 'warning' : 
                            'error'
                          }
                          size="small" 
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(subscription.next_payment_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Edit">
                          <IconButton 
                            size="small" 
                            onClick={() => handleOpenDialog('subscription', subscription)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton 
                            size="small"
                            onClick={() => handleOpenDeleteDialog(
                              'subscription', 
                              subscription.subscription_id, 
                              `${customerName}'s ${newspaperTitle} subscription`
                            )}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </DashboardCard>

        {/* Payments Section */}
        <DashboardCard title="Recent Payments">
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Customer</TableCell>
                  <TableCell>Total Monthly Amount</TableCell>
                  <TableCell>Next Payment Date</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {/* Group payments by customer */}
                {Array.from(new Set(subscriptions.map(sub => sub.customer_id)))
                  .map(customerId => {
                    const customer = customers.find(c => c.customer_id === customerId);
                    const customerSubs = subscriptions.filter(sub => 
                      sub.customer_id === customerId && sub.status === 'active'
                    );
                    const totalAmount = calculateCustomerTotalAmount(customerId);
                    const nextPaymentDate = customerSubs.length > 0 
                      ? new Date(Math.min(...customerSubs.map(sub => new Date(sub.next_payment_date).getTime())))
                      : null;

                    return customer && customerSubs.length > 0 ? (
                      <TableRow key={customerId}>
                        <TableCell>{customer.name}</TableCell>
                        <TableCell>${totalAmount.toFixed(2)}</TableCell>
                        <TableCell>
                          {nextPaymentDate ? nextPaymentDate.toLocaleDateString() : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={nextPaymentDate && nextPaymentDate < new Date() ? 'Overdue' : 'Upcoming'} 
                            color={nextPaymentDate && nextPaymentDate < new Date() ? 'error' : 'success'}
                            size="small" 
                          />
                        </TableCell>
                      </TableRow>
                    ) : null;
                  })}
              </TableBody>
            </Table>
          </TableContainer>
        </DashboardCard>

        {/* Employee Management */}
        <DashboardCard 
          title="Employee Management" 
          actionButton={{
            label: "Add Employee",
            onClick: () => handleOpenDialog('employee')
          }}
        >
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {employees.map((employee) => (
                  <TableRow key={employee.employee_id}>
                    <TableCell>{employee.name}</TableCell>
                    <TableCell>{employee.email}</TableCell>
                    <TableCell>{employee.phone || 'N/A'}</TableCell>
                    <TableCell>{employee.role}</TableCell>
                    <TableCell>
                      <Tooltip title="Edit">
                      <IconButton 
                        size="small" 
                        onClick={() => handleOpenDialog('employee', employee)}
                      >
                        <EditIcon />
                      </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDeleteDialog('employee', employee.employee_id, employee.name)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DashboardCard>

        {/* Customer Management */}
        <DashboardCard 
          title="Customer Management" 
          actionButton={{
            label: "Add Customer",
            onClick: () => handleOpenDialog('customer')
          }}
        >
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Address</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {customers.map((customer) => (
                  <TableRow key={customer.customer_id}>
                    <TableCell>{customer.name}</TableCell>
                    <TableCell>{customer.email}</TableCell>
                    <TableCell>{customer.phone || 'N/A'}</TableCell>
                    <TableCell>{customer.address || 'N/A'}</TableCell>
                    <TableCell>
                      <Tooltip title="Edit">
                      <IconButton 
                        size="small" 
                        onClick={() => handleOpenDialog('customer', customer)}
                      >
                        <EditIcon />
                      </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                      <IconButton 
                        size="small" 
                          onClick={() => handleOpenDeleteDialog('customer', customer.customer_id, customer.name)}
                          color="error"
                      >
                          <DeleteIcon />
                      </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DashboardCard>

        {/* Assignment Section */}
        <DashboardCard title="Assign Deliveries">
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Employee</InputLabel>
            <Select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value as number)}
            >
              {employees.map((employee) => (
                <MenuItem key={employee.employee_id} value={employee.employee_id}>
                  {employee.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Customer</InputLabel>
            <Select
              value={selectedCustomer}
              onChange={(e) => setSelectedCustomer(e.target.value as number)}
            >
              {customers.map((customer) => (
                <MenuItem key={customer.customer_id} value={customer.customer_id}>
                  {customer.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Newspaper</InputLabel>
            <Select
              value={selectedNewspaper}
              onChange={(e) => setSelectedNewspaper(e.target.value as number)}
            >
              {newspapers.map((newspaper) => (
                <MenuItem key={newspaper.newspaper_id} value={newspaper.newspaper_id}>
                  {newspaper.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="contained"
            fullWidth
            onClick={handleAssignDelivery}
            disabled={!selectedEmployee || !selectedCustomer || !selectedNewspaper}
          >
            Assign Delivery
          </Button>
        </DashboardCard>
      </Box>

      {/* Dialog for adding/editing */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>
          {formData.employee_id || formData.customer_id || formData.newspaper_id || formData.subscription_id ? 'Edit' : 'Add'} {dialogType}
        </DialogTitle>
        <DialogContent>
          {formErrors.submit && (
            <Typography color="error" sx={{ mb: 2 }}>
              {formErrors.submit}
            </Typography>
          )}
          
          <TextField
            autoFocus
            margin="dense"
            label="Name"
            fullWidth
            required
            value={formData.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={!!formErrors.name}
            helperText={formErrors.name}
          />
          
          <TextField
            margin="dense"
            label="Email"
            type="email"
            fullWidth
            required
            value={formData.email || ''}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            error={!!formErrors.email}
            helperText={formErrors.email}
          />
          
          {dialogType === 'employee' && (
            <>
              {(!formData.employee_id) && (
                <TextField
                  margin="dense"
                  label="Password"
                  type="password"
                  fullWidth
                  required={!formData.employee_id}
                  value={formData.password || ''}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  error={!!formErrors.password}
                  helperText={formErrors.password}
                />
              )}
              
              <TextField
                margin="dense"
                label="Phone"
                fullWidth
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
              
              <FormControl fullWidth margin="dense" error={!!formErrors.role}>
                <InputLabel>Role</InputLabel>
                <Select
                  value={formData.role || 'delivery'}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  required
                >
                  <MenuItem value="delivery">Delivery</MenuItem>
                  <MenuItem value="manager">Manager</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                </Select>
                {formErrors.role && (
                  <FormHelperText>{formErrors.role}</FormHelperText>
                )}
              </FormControl>
            </>
          )}
          
          {dialogType === 'customer' && (
            <TextField
              margin="dense"
              label="Address"
              fullWidth
              required
              value={formData.address || ''}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          )}
          
          {dialogType === 'newspaper' && (
            <>
              <TextField
                margin="dense"
                label="Title"
                fullWidth
                required
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
              <TextField
                margin="dense"
                label="Publisher"
                fullWidth
                required
                value={formData.publisher || ''}
                onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
              />
              <TextField
                margin="dense"
                label="Frequency"
                fullWidth
                required
                value={formData.frequency || ''}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
              />
              <TextField
                margin="dense"
                label="Price"
                type="number"
                fullWidth
                required
                value={formData.price || ''}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || undefined })}
              />
            </>
          )}

          {dialogType === 'subscription' && (
            <>
              <FormControl fullWidth margin="dense">
                <InputLabel>Customer</InputLabel>
                <Select
                  value={formData.customer_id || ''}
                  onChange={(e) => setFormData({ ...formData, customer_id: Number(e.target.value) || undefined })}
                  required
                >
                  {customers.map((customer) => (
                    <MenuItem key={customer.customer_id} value={customer.customer_id}>
                      {customer.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth margin="dense">
                <InputLabel>Newspaper</InputLabel>
                <Select
                  value={formData.newspaper_id || ''}
                  onChange={(e) => {
                    const newspaperId = Number(e.target.value);
                    const newspaper = newspapers.find(n => n.newspaper_id === newspaperId);
                    const monthlyFee = newspaper?.price ? newspaper.price * 30 : 0;
                    console.log('Selected newspaper:', newspaper);
                    console.log('Calculated monthly fee:', monthlyFee);
                    setFormData({
                      ...formData,
                      newspaper_id: newspaperId || undefined,
                      monthly_fee: monthlyFee
                    });
                  }}
                  required
                >
                  {newspapers.map((newspaper) => (
                    <MenuItem key={newspaper.newspaper_id} value={newspaper.newspaper_id}>
                      {newspaper.title} - ${newspaper.price}/day (${newspaper.price * 30}/month)
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                margin="dense"
                label="Start Date"
                type="date"
                fullWidth
                required
                value={formData.start_date || new Date().toISOString().split('T')[0]}
                onChange={(e) => {
                  const startDate = new Date(e.target.value);
                  const nextPaymentDate = new Date(startDate);
                  nextPaymentDate.setDate(nextPaymentDate.getDate() + 30);
                  
                  setFormData({ 
                    ...formData, 
                    start_date: e.target.value,
                    next_payment_date: nextPaymentDate.toISOString().split('T')[0]
                  });
                }}
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                margin="dense"
                label="End Date"
                type="date"
                fullWidth
                value={formData.end_date || ''}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                InputLabelProps={{ shrink: true }}
                helperText="Leave empty for ongoing subscription"
              />

              <TextField
                margin="dense"
                label="Monthly Fee"
                type="number"
                fullWidth
                required
                value={formData.monthly_fee || 0}
                onChange={(e) => setFormData({ ...formData, monthly_fee: parseFloat(e.target.value) || 0 })}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />

              <FormControl fullWidth margin="dense">
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status || 'active'}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === 'active' || value === 'suspended' || value === 'cancelled') {
                      setFormData({ ...formData, status: value });
                    }
                  }}
                  required
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="suspended">Suspended</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete {itemToDelete?.name}? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add ChatWidget at the end of the component */}
      <ChatWidget ownerId={user?.id || user?.owner_id} />
    </DashboardLayout>
  );
};

export default OwnerDashboard;