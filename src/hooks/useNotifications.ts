/**
 * useNotifications Hook
 * Manages notifications state and actions
 */

import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logError } from '../utils/logger';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}

const NOTIFICATIONS_KEY = '@notifications';

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  // Load notifications from AsyncStorage
  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const stored = await AsyncStorage.getItem(NOTIFICATIONS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setNotifications(parsed);
        setUnreadCount(parsed.filter((n: Notification) => !n.read).length);
      }
    } catch (error) {
      logError('Failed to load notifications', error, 'useNotifications');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Save notifications to AsyncStorage
  const saveNotifications = useCallback(async (newNotifications: Notification[]) => {
    try {
      await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(newNotifications));
      setNotifications(newNotifications);
      setUnreadCount(newNotifications.filter((n) => !n.read).length);
    } catch (error) {
      logError('Failed to save notifications', error, 'useNotifications');
    }
  }, []);

  // Add a new notification
  const addNotification = useCallback(
    (notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => {
      const newNotification: Notification = {
        ...notification,
        id: Date.now().toString(),
        read: false,
        createdAt: new Date().toISOString(),
      };
      saveNotifications([newNotification, ...notifications]);
    },
    [notifications, saveNotifications]
  );

  // Mark notification as read
  const markAsRead = useCallback(
    (notificationId: string) => {
      const updated = notifications.map((n) =>
        n.id === notificationId ? { ...n, read: true } : n
      );
      saveNotifications(updated);
    },
    [notifications, saveNotifications]
  );

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    saveNotifications(updated);
  }, [notifications, saveNotifications]);

  // Delete notification
  const deleteNotification = useCallback(
    (notificationId: string) => {
      const updated = notifications.filter((n) => n.id !== notificationId);
      saveNotifications(updated);
    },
    [notifications, saveNotifications]
  );

  // Clear all notifications
  const clearAll = useCallback(() => {
    saveNotifications([]);
  }, [saveNotifications]);

  return {
    notifications,
    loading,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    refresh: loadNotifications,
  };
}
