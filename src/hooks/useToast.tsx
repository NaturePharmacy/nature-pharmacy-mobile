/**
 * useToast Hook
 * Global toast notification system with context provider
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Toast } from '../components/common/Toast';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastOptions {
  type?: ToastType;
  duration?: number;
  action?: {
    label: string;
    onPress: () => void;
  };
}

interface ToastState {
  visible: boolean;
  message: string;
  type: ToastType;
  duration: number;
  action?: {
    label: string;
    onPress: () => void;
  };
}

interface ToastContextValue {
  showToast: (message: string, options?: ToastOptions) => void;
  showSuccess: (message: string, options?: Omit<ToastOptions, 'type'>) => void;
  showError: (message: string, options?: Omit<ToastOptions, 'type'>) => void;
  showWarning: (message: string, options?: Omit<ToastOptions, 'type'>) => void;
  showInfo: (message: string, options?: Omit<ToastOptions, 'type'>) => void;
  hideToast: () => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const DEFAULT_DURATION = 3000;

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toast, setToast] = useState<ToastState>({
    visible: false,
    message: '',
    type: 'info',
    duration: DEFAULT_DURATION,
  });

  const showToast = useCallback((message: string, options: ToastOptions = {}) => {
    setToast({
      visible: true,
      message,
      type: options.type || 'info',
      duration: options.duration || DEFAULT_DURATION,
      action: options.action,
    });
  }, []);

  const showSuccess = useCallback(
    (message: string, options: Omit<ToastOptions, 'type'> = {}) => {
      showToast(message, { ...options, type: 'success' });
    },
    [showToast]
  );

  const showError = useCallback(
    (message: string, options: Omit<ToastOptions, 'type'> = {}) => {
      showToast(message, { ...options, type: 'error', duration: options.duration || 5000 });
    },
    [showToast]
  );

  const showWarning = useCallback(
    (message: string, options: Omit<ToastOptions, 'type'> = {}) => {
      showToast(message, { ...options, type: 'warning' });
    },
    [showToast]
  );

  const showInfo = useCallback(
    (message: string, options: Omit<ToastOptions, 'type'> = {}) => {
      showToast(message, { ...options, type: 'info' });
    },
    [showToast]
  );

  const hideToast = useCallback(() => {
    setToast(prev => ({ ...prev, visible: false }));
  }, []);

  return (
    <ToastContext.Provider
      value={{
        showToast,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        hideToast,
      }}
    >
      {children}
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        duration={toast.duration}
        action={toast.action}
        onHide={hideToast}
      />
    </ToastContext.Provider>
  );
};

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
