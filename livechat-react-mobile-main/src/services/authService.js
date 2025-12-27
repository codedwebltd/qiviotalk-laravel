import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import notificationService from './notificationService';

const API_URL = "https://qiviotalk.online/api";

const authService = {
  register: async (userData) => {
    try {
      const response = await axios.post(`${API_URL}/register`, userData);

      if (response.data.status === 'success') {
        // Save to AsyncStorage instead of sessionStorage
        await AsyncStorage.setItem('token', response.data.token);
        await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
        await AsyncStorage.setItem('onboarding_completed', String(response.data.onboarding_completed));

        authService.startTokenValidation();

        // Initialize FCM notifications and register token with backend
        notificationService.initialize(response.data.token).catch(err => {
          console.error('Failed to initialize notifications:', err);
        });

        return { success: true, data: response.data };
      } else {
        return {
          success: false,
          message: response.data.message || 'Registration failed'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed',
        errors: error.response?.data?.errors
      };
    }
  },

  login: async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/login`, { email, password });

      if (response.data.status === 'success') {
        await AsyncStorage.setItem('token', response.data.token);
        await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
        await AsyncStorage.setItem('onboarding_completed', String(response.data.onboarding_completed));

        authService.startTokenValidation();

        // Initialize FCM notifications and register token with backend
        notificationService.initialize(response.data.token).catch(err => {
          console.error('Failed to initialize notifications:', err);
        });

        return { success: true, data: response.data };
      } else {
        return {
          success: false,
          message: response.data.message || 'Login failed'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      };
    }
  },

  logout: async () => {
    authService.stopTokenValidation();

    // Clean up notification service
    notificationService.cleanup();

    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    await AsyncStorage.removeItem('onboarding_completed');
    return { success: true };
  },

  getCurrentUser: async () => {
    const user = await AsyncStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
  
  getUserData: async (field = null) => {
    const user = await AsyncStorage.getItem('user');
    if (!user) return null;
    
    const userData = JSON.parse(user);
    
    if (!field) return userData;
    
    if (field.includes('.')) {
      const parts = field.split('.');
      let value = userData;
      
      for (const part of parts) {
        if (!value || typeof value !== 'object') return null;
        value = value[part];
      }
      return value;
    }
    
    return userData[field] || null;
  },
  
  isOnboardingCompleted: async () => {
    const completed = await AsyncStorage.getItem('onboarding_completed');
    return completed === 'true';
  },

  setOnboardingComplete: async (isComplete) => {
    try {
      await AsyncStorage.setItem('onboarding_completed', String(isComplete));
      return true;
    } catch (error) {
      console.error('Failed to set onboarding complete:', error);
      return false;
    }
  },

  isAuthenticated: async () => {
    const token = await AsyncStorage.getItem('token');
    return !!token;
  },

  getToken: async () => {
    return await AsyncStorage.getItem('token');
  },
  
  tokenValidationInterval: null,
  
  validateToken: async () => {
    try {
      const isAuth = await authService.isAuthenticated();
      if (!isAuth) {
        authService.stopTokenValidation();
        return false;
      }
      
      await axios.get(`${API_URL}/validate-token`);
      return true;
    } catch (error) {
      await authService.logout();
      return false;
    }
  },
  
  startTokenValidation: (interval = 1) => {
    authService.stopTokenValidation();
    const minutes = interval * 60 * 1000;
    authService.tokenValidationInterval = setInterval(
      authService.validateToken, 
      minutes
    );
    authService.validateToken();
  },
  
  stopTokenValidation: () => {
    if (authService.tokenValidationInterval) {
      clearInterval(authService.tokenValidationInterval);
      authService.tokenValidationInterval = null;
    }
  },

  getUserProfile: async () => {
    try {
      const response = await axios.get(`${API_URL}/user/profile`);
      if (response.data.status === 'success') {
        // Update AsyncStorage with fresh data
        await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
        await AsyncStorage.setItem('onboarding_completed', String(response.data.onboarding_completed));
        return response.data;
      }
      return null;
    } catch (error) {
      console.error('Failed to get user profile:', error);
      return null;
    }
  },

  getOnboardingData: async () => {
    try {
      const response = await axios.get(`${API_URL}/onboarding`);
      return response.data.onboarding;
    } catch (error) {
      return null;
    }
  },

  updateOnboarding: async (onboardingData) => {
    try {
      const response = await axios.post(`${API_URL}/onboarding/update`, onboardingData);
      
      if (response.data.status === 'success') {
        const userData = response.data.user;
        
        if (userData) {
          await AsyncStorage.setItem('user', JSON.stringify(userData));
          
          if (response.data.onboarding_completed !== undefined) {
            await AsyncStorage.setItem('onboarding_completed', String(response.data.onboarding_completed));
          }
        }
        
        return { success: true, data: response.data };
      } else {
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update onboarding'
      };
    }
  },

  skipOnboarding: async () => {
    try {
      const response = await axios.post(`${API_URL}/onboarding/skip`);
      
      if (response.data.status === 'success') {
        const userData = response.data.user;
        
        if (userData) {
          await AsyncStorage.setItem('user', JSON.stringify(userData));
          
          if (response.data.onboarding_completed !== undefined) {
            await AsyncStorage.setItem('onboarding_completed', String(response.data.onboarding_completed));
          }
        }
        
        return { success: true, data: response.data };
      } else {
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to skip onboarding'
      };
    }
  },

  setupAxiosInterceptors: () => {
    axios.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response && error.response.status === 401) {
          await authService.logout();
        }
        return Promise.reject(error);
      }
    );
  },

  getApiUrl: () => {
    return API_URL;
  }
};

export default authService;