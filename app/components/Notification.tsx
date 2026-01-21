'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X, Bell } from 'lucide-react';

// Types
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title?: string;
  message: string;
  duration?: number;
  persistent?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
  timestamp: number;
}

// Context
interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  markAsRead: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Provider
export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: Date.now(),
      duration: notification.duration || (notification.persistent ? 0 : 5000)
    };

    setNotifications(prev => [newNotification, ...prev]);

    // Auto remove jika tidak persistent
    if (!notification.persistent && newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(newNotification.id);
      }, newNotification.duration);
    }
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === id ? { ...n, read: true } : n
      )
    );
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      addNotification,
      removeNotification,
      clearNotifications,
      markAsRead
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

// Hook
export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}

// Individual Notification Component
function NotificationItem({ notification, onRemove }: { notification: Notification; onRemove: (id: string) => void }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (!notification.persistent) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onRemove(notification.id), 300);
      }, notification.duration || 5000);

      return () => clearTimeout(timer);
    }
  }, [notification.id, notification.duration, notification.persistent, onRemove]);

  const getNotificationStyles = () => {
    switch (notification.type) {
      case 'success':
        return {
          bg: 'bg-green-50 border-green-200',
          icon: CheckCircle,
          iconBg: 'bg-green-100',
          iconColor: 'text-green-600',
          titleColor: 'text-green-800',
          messageColor: 'text-green-700'
        };
      case 'error':
        return {
          bg: 'bg-red-50 border-red-200',
          icon: XCircle,
          iconBg: 'bg-red-100',
          iconColor: 'text-red-600',
          titleColor: 'text-red-800',
          messageColor: 'text-red-700'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50 border-yellow-200',
          icon: AlertCircle,
          iconBg: 'bg-yellow-100',
          iconColor: 'text-yellow-600',
          titleColor: 'text-yellow-800',
          messageColor: 'text-yellow-700'
        };
      case 'info':
        return {
          bg: 'bg-blue-50 border-blue-200',
          icon: Info,
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600',
          titleColor: 'text-blue-800',
          messageColor: 'text-blue-700'
        };
      default:
        return {
          bg: 'bg-gray-50 border-gray-200',
          icon: Info,
          iconBg: 'bg-gray-100',
          iconColor: 'text-gray-600',
          titleColor: 'text-gray-800',
          messageColor: 'text-gray-700'
        };
    }
  };

  if (!isVisible) return null;

  const styles = getNotificationStyles();
  const IconComponent = styles.icon;

  return (
    <div className={`w-full sm:w-96 ${styles.bg} border rounded-lg shadow-lg p-4 mb-3 animate-in slide-in-from-right duration-300`}>
      <div className="flex items-start">
        <div className={`flex-shrink-0 w-10 h-10 ${styles.iconBg} rounded-full flex items-center justify-center`}>
          <IconComponent className={`w-5 h-5 ${styles.iconColor}`} />
        </div>
        <div className="ml-3 flex-1 min-w-0">
          {notification.title && (
            <h4 className={`text-sm font-semibold ${styles.titleColor} mb-1`}>
              {notification.title}
            </h4>
          )}
          <p className={`text-sm ${styles.messageColor} break-words`}>
            {notification.message}
          </p>
          {notification.action && (
            <button
              onClick={notification.action.onClick}
              className={`mt-2 text-sm font-medium ${styles.titleColor} hover:underline focus:outline-none`}
            >
              {notification.action.label}
            </button>
          )}
        </div>
        <div className="ml-3">
          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(() => onRemove(notification.id), 300);
            }}
            className={`text-gray-400 hover:text-gray-600 transition-colors focus:outline-none`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Notification Container
export function NotificationContainer() {
  const { notifications, removeNotification } = useNotification();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-h-screen overflow-y-auto">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onRemove={removeNotification}
        />
      ))}
    </div>
  );
}

// Helper functions untuk kemudahan
export const notificationHelpers = {
  success: (message: string, title?: string, options?: Partial<Omit<Notification, 'id' | 'type' | 'timestamp'>>) => ({
    type: 'success',
    message,
    title,
    ...options
  }),
  
  error: (message: string, title?: string, options?: Partial<Omit<Notification, 'id' | 'type' | 'timestamp'>>) => ({
    type: 'error',
    message,
    title,
    ...options
  }),
  
  warning: (message: string, title?: string, options?: Partial<Omit<Notification, 'id' | 'type' | 'timestamp'>>) => ({
    type: 'warning',
    message,
    title,
    ...options
  }),
  
  info: (message: string, title?: string, options?: Partial<Omit<Notification, 'id' | 'type' | 'timestamp'>>) => ({
    type: 'info',
    message,
    title,
    ...options
  })
};
