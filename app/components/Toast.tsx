'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

interface ToastProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
  onClose?: () => void;
  show?: boolean;
  position?: 'top-right' | 'top-center' | 'bottom-right' | 'bottom-center';
}

export default function Toast({ 
  type, 
  message, 
  duration = 3000, 
  onClose,
  show = true,
  position = 'top-right'
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(show);

  useEffect(() => {
    setIsVisible(show);
  }, [show]);

  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onClose) {
          onClose();
        }
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-600',
          text: 'text-white',
          icon: CheckCircle
        };
      case 'error':
        return {
          bg: 'bg-red-600',
          text: 'text-white',
          icon: XCircle
        };
      case 'warning':
        return {
          bg: 'bg-yellow-600',
          text: 'text-white',
          icon: AlertCircle
        };
      case 'info':
        return {
          bg: 'bg-blue-600',
          text: 'text-white',
          icon: Info
        };
      default:
        return {
          bg: 'bg-gray-600',
          text: 'text-white',
          icon: Info
        };
    }
  };

  const getPositionStyles = () => {
    switch (position) {
      case 'top-right':
        return 'top-4 right-4';
      case 'top-center':
        return 'top-4 left-1/2 transform -translate-x-1/2';
      case 'bottom-right':
        return 'bottom-4 right-4';
      case 'bottom-center':
        return 'bottom-4 left-1/2 transform -translate-x-1/2';
      default:
        return 'top-4 right-4';
    }
  };

  const styles = getToastStyles();
  const positionStyles = getPositionStyles();
  const IconComponent = styles.icon;

  return (
    <div className={`fixed ${positionStyles} z-50 animate-in slide-in-from-right duration-300`}>
      <div className={`${styles.bg} ${styles.text} rounded-lg shadow-lg p-4 min-w-[300px] max-w-md flex items-center`}>
        <div className="flex-shrink-0 mr-3">
          <IconComponent className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium">
            {message}
          </p>
        </div>
        <div className="ml-3">
          <button
            onClick={() => {
              setIsVisible(false);
              if (onClose) {
                onClose();
              }
            }}
            className="hover:opacity-75 transition-opacity focus:outline-none"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Hook untuk mengelola toasts
export function useToast() {
  const [toasts, setToasts] = useState<Array<{ id: string; type: ToastProps['type']; message: string; position?: ToastProps['position'] }>>([]);

  const showToast = (type: ToastProps['type'], message: string, duration?: number, position?: ToastProps['position']) => {
    const id = Date.now().toString();
    const newToast = { id, type, message, position };
    
    setToasts(prev => [...prev, newToast]);
    
    if (duration !== 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
      }, duration || 3000);
    }
    
    return id;
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const clearToasts = () => {
    setToasts([]);
  };

  return {
    toasts,
    showToast,
    removeToast,
    clearToasts
  };
}

// Container untuk multiple toasts
export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          type={toast.type}
          message={toast.message}
          position={toast.position}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </>
  );
}
