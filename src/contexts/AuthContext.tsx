import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { loginStart, loginSuccess, loginFailure, logout } from '../store/slices/authSlice';
import * as SecureStore from 'expo-secure-store';
import { authAPI } from '../services/api';

interface AuthContextType {
  isAuthenticated: boolean;
  user: any;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const dispatch = useDispatch();
  const { isAuthenticated, user, loading, error } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const token = await SecureStore.getItemAsync('authToken');
      if (token) {
        // Verificar si el token es válido
        const userData = await authAPI.verifyToken(token);
        dispatch(loginSuccess({ user: userData, token }));
      }
    } catch (error) {
      await SecureStore.deleteItemAsync('authToken');
    }
  };

  const login = async (email: string, password: string) => {
    try {
      dispatch(loginStart());
      const response = await authAPI.login(email, password);
      await SecureStore.setItemAsync('authToken', response.token);
      dispatch(loginSuccess(response));
    } catch (error: any) {
      dispatch(loginFailure(error.message || 'Error al iniciar sesión'));
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      dispatch(loginStart());
      const response = await authAPI.register(email, password, name);
      await SecureStore.setItemAsync('authToken', response.token);
      dispatch(loginSuccess(response));
    } catch (error: any) {
      dispatch(loginFailure(error.message || 'Error al registrarse'));
      throw error;
    }
  };

  const logoutUser = async () => {
    try {
      await SecureStore.deleteItemAsync('authToken');
      dispatch(logout());
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const clearError = () => {
    dispatch({ type: 'auth/clearError' });
  };

  const value: AuthContextType = {
    isAuthenticated,
    user,
    loading,
    error,
    login,
    register,
    logout: logoutUser,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

