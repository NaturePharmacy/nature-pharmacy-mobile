/**
 * useAuth Hook
 * Provides easy access to authentication state and actions
 */

import { useSelector, useDispatch } from 'react-redux';
import { useCallback } from 'react';
import { RootState, AppDispatch } from '../store/store';
import { login, register, logout } from '../store/slices/authSlice';
import { LoginCredentials, RegisterData } from '../types';

export function useAuth() {
  const dispatch = useDispatch<AppDispatch>();
  const { user, token, loading, error } = useSelector((state: RootState) => state.auth);

  const isAuthenticated = !!token && !!user;
  const isSeller = user?.role === 'seller';
  const isAdmin = user?.role === 'admin';

  const handleLogin = useCallback(
    async (credentials: LoginCredentials) => {
      return dispatch(login(credentials)).unwrap();
    },
    [dispatch]
  );

  const handleRegister = useCallback(
    async (data: RegisterData) => {
      return dispatch(register(data)).unwrap();
    },
    [dispatch]
  );

  const handleLogout = useCallback(() => {
    dispatch(logout());
  }, [dispatch]);

  return {
    // State
    user,
    token,
    loading,
    error,
    isAuthenticated,
    isSeller,
    isAdmin,

    // Actions
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
  };
}
