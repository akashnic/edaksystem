import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
  };

  const fetchUserProfile = async () => {
    try {
      const response = await api.get('accounts/users/me/');
      setUser({ authenticated: true, ...response.data });
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
      logout();
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      fetchUserProfile().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (username, password) => {
    try {
      const response = await api.post('token/', { username, password });
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      
      const profile = await api.get('accounts/users/me/');
      setUser({ authenticated: true, ...profile.data });
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.detail || 'Login failed' };
    }
  };

  const isAdmin = user?.role === 'ADMIN';
  const isReceiver = user?.role === 'RECEIVER' || isAdmin;
  const isDispatcher = user?.role === 'DISPATCHER' || isAdmin;

  const value = { user, login, logout, loading, isAdmin, isReceiver, isDispatcher };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};
