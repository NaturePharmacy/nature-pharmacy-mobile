/**
 * Notifications Screen
 * Display and manage user notifications
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useNotifications, Notification } from '../../hooks';
import { Card, Button, Loading } from '../../components';
import { COLORS, SPACING } from '../../utils/constants';
import type { NotificationsScreenNavigationProp } from '@types';

export default function NotificationsScreen() {
  const navigation = useNavigation<NotificationsScreenNavigationProp>();
  const {
    notifications,
    loading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    refresh,
  } = useNotifications();

  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  const handleNotificationPress = useCallback((notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }

    // Navigate to action URL if provided
    if (notification.actionUrl) {
      // Parse and navigate based on URL
      // Example: /orders/123 -> navigate to OrderDetailScreen
      const parts = notification.actionUrl.split('/');
      if (parts[1] === 'orders' && parts[2]) {
        navigation.navigate('OrderDetail' , { orderId: parts[2] });
      }
    }
  }, [markAsRead, navigation]);

  const handleDelete = useCallback((notificationId: string, title: string) => {
    Alert.alert(
      'Supprimer la notification',
      `Êtes-vous sûr de vouloir supprimer "${title}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => deleteNotification(notificationId),
        },
      ]
    );
  }, [deleteNotification]);

  const handleClearAll = useCallback(() => {
    Alert.alert(
      'Supprimer toutes les notifications',
      'Êtes-vous sûr de vouloir supprimer toutes les notifications ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer tout',
          style: 'destructive',
          onPress: clearAll,
        },
      ]
    );
  }, [clearAll]);

  const filteredNotifications = useMemo(() =>
    filter === 'unread'
      ? notifications.filter((n) => !n.read)
      : notifications,
    [filter, notifications]
  );

  const getNotificationIcon = useCallback((type: Notification['type']) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      default:
        return 'ℹ️';
    }
  }, []);

  const getNotificationColor = useCallback((type: Notification['type']) => {
    switch (type) {
      case 'success':
        return COLORS.success;
      case 'warning':
        return COLORS.warning;
      case 'error':
        return COLORS.error;
      default:
        return COLORS.primary;
    }
  }, []);

  const renderNotification = useCallback(({ item }: { item: Notification }) => (
    <TouchableOpacity
      onPress={() => handleNotificationPress(item)}
      activeOpacity={0.7}
    >
      <Card
        variant="elevated"
        padding="medium"
        style={[styles.notificationCard, !item.read && styles.unreadCard]}
      >
        <View style={styles.notificationHeader}>
          <View style={styles.headerLeft}>
            <Text style={styles.notificationIcon}>
              {getNotificationIcon(item.type)}
            </Text>
            <View style={styles.notificationInfo}>
              <Text
                style={[styles.notificationTitle, !item.read && styles.unreadText]}
              >
                {item.title}
              </Text>
              <Text style={styles.notificationDate}>
                {new Date(item.createdAt).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => handleDelete(item.id, item.title)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.deleteButton}>🗑️</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.notificationMessage}>{item.message}</Text>

        {!item.read && (
          <View
            style={[
              styles.unreadIndicator,
              { backgroundColor: getNotificationColor(item.type) },
            ]}
          />
        )}
      </Card>
    </TouchableOpacity>
  ), [handleNotificationPress, handleDelete, getNotificationIcon, getNotificationColor]);

  const renderEmpty = useCallback(() => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>🔔</Text>
      <Text style={styles.emptyText}>
        {filter === 'unread'
          ? 'Aucune notification non lue'
          : 'Aucune notification'}
      </Text>
      <Text style={styles.emptySubtext}>
        {filter === 'unread'
          ? 'Toutes vos notifications ont été lues'
          : 'Vous recevrez ici les notifications importantes'}
      </Text>
    </View>
  ), [filter]);

  const setFilterAll = useCallback(() => setFilter('all'), []);
  const setFilterUnread = useCallback(() => setFilter('unread'), []);

  if (loading && !refreshing) {
    return <Loading />;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unreadCount}</Text>
          </View>
        )}
      </View>

      {/* Actions */}
      {notifications.length > 0 && (
        <View style={styles.actions}>
          <View style={styles.filters}>
            <TouchableOpacity
              style={[styles.filterButton, filter === 'all' && styles.filterActive]}
              onPress={setFilterAll}
            >
              <Text
                style={[
                  styles.filterText,
                  filter === 'all' && styles.filterTextActive,
                ]}
              >
                Toutes ({notifications.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterButton,
                filter === 'unread' && styles.filterActive,
              ]}
              onPress={setFilterUnread}
            >
              <Text
                style={[
                  styles.filterText,
                  filter === 'unread' && styles.filterTextActive,
                ]}
              >
                Non lues ({unreadCount})
              </Text>
            </TouchableOpacity>
          </View>

          {unreadCount > 0 && (
            <TouchableOpacity onPress={markAllAsRead}>
              <Text style={styles.markAllButton}>Tout marquer lu</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Notifications List */}
      <FlatList
        data={filteredNotifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
          />
        }
      />

      {/* Clear All Button */}
      {notifications.length > 0 && (
        <View style={styles.footer}>
          <Button
            title="Supprimer toutes les notifications"
            onPress={handleClearAll}
            variant="outline"
            size="medium"
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },
  badge: {
    position: 'absolute',
    right: SPACING.lg,
    backgroundColor: COLORS.error,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xs,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filters: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  filterButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 20,
    backgroundColor: COLORS.lightGray,
  },
  filterActive: {
    backgroundColor: COLORS.primary,
  },
  filterText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  filterTextActive: {
    color: COLORS.white,
  },
  markAllButton: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  listContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  notificationCard: {
    marginBottom: SPACING.md,
    position: 'relative',
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    flex: 1,
  },
  notificationIcon: {
    fontSize: 24,
    marginRight: SPACING.sm,
  },
  notificationInfo: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  unreadText: {
    fontWeight: '700',
  },
  notificationDate: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  deleteButton: {
    fontSize: 18,
    padding: SPACING.xs,
  },
  notificationMessage: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  unreadIndicator: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xl * 2,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: SPACING.lg,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingHorizontal: SPACING.xl,
  },
  footer: {
    padding: SPACING.lg,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
});
