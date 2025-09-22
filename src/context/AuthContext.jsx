import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  useEffect(() => {
    // Check for existing token on app start
    const initAuth = async () => {
      try {
        const storedToken = localStorage.getItem('accessToken');
        const storedUser = localStorage.getItem('user');
        
        if (storedToken && storedUser) {
          console.log('🔍 Found stored token and user');
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    try {
      console.log('🔐 Attempting login with:', credentials.email);
      const response = await authService.login(credentials);
      console.log('✅ Login response:', response);
      
      const { user: userData, accessToken } = response;
      
      setUser(userData);
      setToken(accessToken);
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
      console.log('✅ User state updated:', userData);
      return { success: true, user: userData };
    } catch (error) {
      console.error('❌ Login error:', error);
      return { success: false, error: error.response?.data?.message || error.message };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      const { user: newUser, accessToken } = response;
      
      setUser(newUser);
      setToken(accessToken);
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('user', JSON.stringify(newUser));
      
      return { success: true, user: newUser };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      console.log('🚪 User logged out');
    }
  };

  const refreshToken = async () => {
    try {
      const response = await authService.refreshToken();
      const { accessToken } = response;
      
      setToken(accessToken);
      localStorage.setItem('accessToken', accessToken);
      
      return accessToken;
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
      throw error;
    }
  };

  // Manual auth state for testing
  const setManualAuth = (userData) => {
    setUser(userData);
    setToken('manual-token');
    localStorage.setItem('accessToken', 'manual-token');
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    refreshToken,
    setManualAuth,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
