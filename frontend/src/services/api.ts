import { config } from '../config/config';

interface Notification {
  id: number;
  recipient_id: number;
  message: string;
  type: 'info' | 'alert';
  read: boolean;
  created_at: string;
}

interface CreateNotificationData {
  recipient_id: number;
  message: string;
  type: 'info' | 'alert';
  read: boolean;
  created_at: string;
}

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };
};

const defaultOptions = {
  credentials: 'include' as RequestCredentials,
  mode: 'cors' as RequestMode,
};

const handleResponse = async (response: Response) => {
  const contentType = response.headers.get('content-type');
  if (!response.ok) {
    try {
      const errorData = contentType?.includes('application/json') 
        ? await response.json() 
        : { message: await response.text() };
      throw new Error(errorData.error || errorData.message || 'An error occurred');
    } catch (e) {
      throw new Error('Failed to parse error response');
    }
  }
  
  try {
    if (contentType?.includes('application/json')) {
      const data = await response.json();
      return data.data !== undefined ? data.data : data;
    }
    throw new Error('Invalid response format');
  } catch (e) {
    throw new Error('Failed to parse response data');
  }
};

export const api = {
  // Auth
  login: async (email: string, password: string, userType: 'owner' | 'employee') => {
    const response = await fetch(`${config.API_BASE_URL}/${userType}s/login`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      ...defaultOptions,
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(response);
  },

  register: async (ownerData: any) => {
    const response = await fetch(`${config.API_BASE_URL}/owners/register`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      ...defaultOptions,
      body: JSON.stringify(ownerData),
    });
    return handleResponse(response);
  },

  // Employee Management
  getEmployees: async () => {
    try {
      console.log('Fetching employees with headers:', getAuthHeader());
      const response = await fetch(`${config.API_BASE_URL}/employees`, {
        headers: getAuthHeader(),
        ...defaultOptions,
      });
      console.log('Employee response status:', response.status);
      const data = await handleResponse(response);
      console.log('Employee response data:', data);
      
      // Handle different response formats
      if (Array.isArray(data)) {
        return data;
      } else if (data && typeof data === 'object') {
        return data.data || data.employees || Object.values(data);
      }
      return [];
    } catch (error) {
      console.error('Error in getEmployees:', error);
      throw error;
    }
  },

  createEmployee: async (employeeData: any) => {
    const response = await fetch(`${config.API_BASE_URL}/employees`, {
      method: 'POST',
      headers: getAuthHeader(),
      ...defaultOptions,
      body: JSON.stringify(employeeData),
    });
    return handleResponse(response);
  },

  updateEmployee: async (id: number, employeeData: any) => {
    const response = await fetch(`${config.API_BASE_URL}/employees/${id}`, {
      method: 'PATCH',
      headers: getAuthHeader(),
      ...defaultOptions,
      body: JSON.stringify(employeeData),
    });
    return handleResponse(response);
  },

  deleteEmployee: async (id: number) => {
    const response = await fetch(`${config.API_BASE_URL}/employees/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader(),
      ...defaultOptions,
    });
    return handleResponse(response);
  },

  // Customer Management
  getCustomers: async () => {
    try {
      const response = await fetch(`${config.API_BASE_URL}/customers`, {
        headers: getAuthHeader(),
        ...defaultOptions,
      });
      const data = await handleResponse(response);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching customers:', error);
      return [];
    }
  },

  createCustomer: async (customerData: any) => {
    const response = await fetch(`${config.API_BASE_URL}/customers`, {
      method: 'POST',
      headers: getAuthHeader(),
      ...defaultOptions,
      body: JSON.stringify(customerData),
    });
    return handleResponse(response);
  },

  updateCustomer: async (id: number, customerData: any) => {
    const response = await fetch(`${config.API_BASE_URL}/customers/${id}`, {
      method: 'PATCH',
      headers: getAuthHeader(),
      ...defaultOptions,
      body: JSON.stringify(customerData),
    });
    return handleResponse(response);
  },

  deleteCustomer: async (id: number) => {
    const response = await fetch(`${config.API_BASE_URL}/customers/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader(),
      ...defaultOptions,
    });
    return handleResponse(response);
  },

  // Newspaper Management
  getNewspapers: async () => {
    try {
      console.log('Making request to:', `${config.API_BASE_URL}/newspapers`);
      console.log('Request headers:', getAuthHeader());
      
      const response = await fetch(`${config.API_BASE_URL}/newspapers`, {
        headers: getAuthHeader(),
        ...defaultOptions,
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      const newspapers = await handleResponse(response);
      console.log('Raw response data:', newspapers);
      
      if (!Array.isArray(newspapers)) {
        console.error('Invalid newspaper data format:', newspapers);
        return [];
      }
      
      const transformedData = newspapers.map(newspaper => ({
        ...newspaper,
        title: newspaper.title || newspaper.name,
        publisher: newspaper.publisher || 'Unknown',
        frequency: newspaper.frequency || 'Daily',
        price: Number(newspaper.price) || 0
      }));
      
      console.log('Transformed newspaper data:', transformedData);
      return transformedData;
    } catch (error) {
      console.error('Error fetching newspapers:', error);
      return [];
    }
  },

  createNewspaper: async (newspaperData: any) => {
    const response = await fetch(`${config.API_BASE_URL}/newspapers`, {
      method: 'POST',
      headers: getAuthHeader(),
      ...defaultOptions,
      body: JSON.stringify({
        ...newspaperData,
        title: newspaperData.title || newspaperData.name,
        publisher: newspaperData.publisher || 'Unknown',
        frequency: newspaperData.frequency || 'Daily'
      }),
    });
    return handleResponse(response);
  },

  updateNewspaper: async (id: number, newspaperData: any) => {
    const response = await fetch(`${config.API_BASE_URL}/newspapers/${id}`, {
      method: 'PATCH',
      headers: getAuthHeader(),
      ...defaultOptions,
      body: JSON.stringify({
        ...newspaperData,
        title: newspaperData.title || newspaperData.name,
        publisher: newspaperData.publisher || 'Unknown',
        frequency: newspaperData.frequency || 'Daily'
      }),
    });
    return handleResponse(response);
  },

  deleteNewspaper: async (id: number) => {
    const response = await fetch(`${config.API_BASE_URL}/newspapers/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader(),
      ...defaultOptions,
    });
    return handleResponse(response);
  },

  // Subscription Management
  getSubscriptions: async () => {
    const response = await fetch(`${config.API_BASE_URL}/subscriptions`, {
      headers: getAuthHeader(),
      ...defaultOptions,
    });
    const data = await handleResponse(response);
    return Array.isArray(data) ? data : [];
  },

  createSubscription: async (subscriptionData: any) => {
    const response = await fetch(`${config.API_BASE_URL}/subscriptions`, {
      method: 'POST',
      headers: getAuthHeader(),
      ...defaultOptions,
      body: JSON.stringify(subscriptionData),
    });
    return handleResponse(response);
  },

  updateSubscription: async (id: number, subscriptionData: any) => {
    const response = await fetch(`${config.API_BASE_URL}/subscriptions/${id}`, {
      method: 'PATCH',
      headers: getAuthHeader(),
      ...defaultOptions,
      body: JSON.stringify(subscriptionData),
    });
    return handleResponse(response);
  },

  // Notification Management
  getNotifications: async () => {
    try {
      const response = await fetch(`${config.API_BASE_URL}/notifications`, {
        headers: getAuthHeader(),
        ...defaultOptions,
      });
      const data = await handleResponse(response);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  },

  createNotification: async (notificationData: CreateNotificationData): Promise<Notification> => {
    const response = await fetch(`${config.API_BASE_URL}/notifications`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(notificationData)
    });
    return handleResponse(response);
  },

  markNotificationAsRead: async (id: number) => {
    const response = await fetch(`${config.API_BASE_URL}/notifications/${id}/read`, {
      method: 'PATCH',
      headers: getAuthHeader(),
      ...defaultOptions,
    });
    return handleResponse(response);
  },

  deleteNotification: async (id: number) => {
    const response = await fetch(`${config.API_BASE_URL}/notifications/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader(),
      ...defaultOptions,
    });
    return handleResponse(response);
  },

  // Payment Management
  getPayments: async () => {
    try {
      const response = await fetch(`${config.API_BASE_URL}/payments`, {
        headers: getAuthHeader(),
        ...defaultOptions,
      });
      const data = await handleResponse(response);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching payments:', error);
      return [];
    }
  },

  createPayment: async (paymentData: any) => {
    const response = await fetch(`${config.API_BASE_URL}/payments`, {
      method: 'POST',
      headers: getAuthHeader(),
      ...defaultOptions,
      body: JSON.stringify(paymentData),
    });
    return handleResponse(response);
  },

  getLatePayments: async () => {
    try {
      const response = await fetch(`${config.API_BASE_URL}/payments/late`, {
        headers: getAuthHeader(),
        ...defaultOptions,
      });
      const data = await handleResponse(response);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching late payments:', error);
      return [];
    }
  },

  getPaymentAnalytics: async (startDate: string, endDate: string) => {
    try {
      const response = await fetch(
        `${config.API_BASE_URL}/payments/analytics?startDate=${startDate}&endDate=${endDate}`, {
          headers: getAuthHeader(),
          ...defaultOptions,
        }
      );
      return handleResponse(response);
    } catch (error) {
      console.error('Error fetching payment analytics:', error);
      throw error;
    }
  },

  // Delivery Management
  getDeliveries: async () => {
    const response = await fetch(`${config.API_BASE_URL}/deliveries`, {
      headers: getAuthHeader(),
    });
    const data = await handleResponse(response);
    return Array.isArray(data) ? data : [];
  },

  createDelivery: async (deliveryData: any) => {
    const response = await fetch(`${config.API_BASE_URL}/deliveries`, {
      method: 'POST',
      headers: getAuthHeader(),
      ...defaultOptions,
      body: JSON.stringify({
        ...deliveryData,
        delivery_date: deliveryData.delivery_date || new Date().toISOString().split('T')[0],
        status: deliveryData.status || 'pending'
      }),
    });
    return handleResponse(response);
  },

  updateDelivery: async (id: number, deliveryData: any) => {
    const response = await fetch(`${config.API_BASE_URL}/deliveries/${id}`, {
      method: 'PATCH',
      headers: getAuthHeader(),
      body: JSON.stringify(deliveryData),
    });
    return handleResponse(response);
  },

  // Chatbot
  sendChatbotMessage: async (message: string) => {
    const response = await fetch(`${config.API_BASE_URL}/chatbot`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify({ message }),
    });
    return handleResponse(response);
  },
}; 