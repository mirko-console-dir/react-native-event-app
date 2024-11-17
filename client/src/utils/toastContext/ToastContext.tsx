import React, { createContext, useContext, useState, ReactNode } from 'react';

type ToastType = 'success' | 'error' | 'warning';

export interface ToastState {
  message: string;
  type: ToastType;
  visible: boolean;
}

interface ToastContextType {
  toast: ToastState;
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toast, setToast] = useState<ToastState>({ message: '', type: 'success', visible: false });

  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type, visible: true });
    setTimeout(() => {
      setToast({ message: '', type: 'success', visible: false });
    }, 1000); 
  }

  const success = (message: string) => showToast(message, 'success')
  const error = (message: string) => showToast(message, 'error')
  const warning = (message: string) => showToast(message, 'warning')

  return (
    <ToastContext.Provider value={{ toast, success, error, warning }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
