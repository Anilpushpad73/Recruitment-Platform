import React, { createContext, useContext, useEffect, useState } from 'react';
import { authApi, ApiError } from '../lib/api';

interface User {
  id: string;
  email: string;
  fullName: string;
  createdAt: string;
  lastLogin?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error?: string }>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await authApi.getCurrentUser();
        setUser(response.user);
      } catch (error) {
        // Token is invalid, remove it
        localStorage.removeItem('authToken');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const response = await authApi.register({
        email,
        password,
        fullName,
      });

      setUser(response.user);

      return {};
    } catch (error: any) {
      if (error instanceof ApiError) {
        return { error: error.message };
      }
      return { error: 'An unexpected error occurred during sign up' };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const response = await authApi.login({
        email,
        password,
      });

      setUser(response.user);

      return {};
    } catch (error: any) {
      if (error instanceof ApiError) {
        return { error: error.message };
      }
      return { error: 'An unexpected error occurred during sign in' };
    }
  };

  const signOut = async () => {
    try {
      await authApi.logout();
    } finally {
      localStorage.removeItem('authToken');
      setUser(null);
    }
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};