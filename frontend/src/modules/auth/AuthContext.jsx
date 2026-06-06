import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  // Restore session on mount
  useEffect(() => {
    const token = localStorage.getItem('vb_access_token');
    if (token) {
      authApi.me()
        .then((data) => {
          setUser(data.user || data);
        })
        .catch(() => {
          localStorage.removeItem('vb_access_token');
          localStorage.removeItem('vb_refresh_token');
          setUser(null);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await authApi.login({ email, password });
    localStorage.setItem('vb_access_token', data.access_token);
    if (data.refresh_token) {
      localStorage.setItem('vb_refresh_token', data.refresh_token);
    }
    setUser(data.user);
    return data;
  }, []);

  const signup = useCallback(async ({ full_name, email, password, role }) => {
    const data = await authApi.signup({ full_name, email, password, role });
    localStorage.setItem('vb_access_token', data.access_token);
    if (data.refresh_token) {
      localStorage.setItem('vb_refresh_token', data.refresh_token);
    }
    setUser(data.user);
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('vb_access_token');
    localStorage.removeItem('vb_refresh_token');
    setUser(null);
  }, []);

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    signup,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
