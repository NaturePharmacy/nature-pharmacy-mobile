/**
 * Seller Orders Screen
 * Gestion des commandes du vendeur
 */

import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Card, OrderStatusBadge, Button } from '@components';
import { useSellerOrders } from '@hooks';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '@utils/constants';
import type { Order, SellerOrdersScreenNavigationProp } from '@types';

type OrderFilter = 'all' | 'pending' | 'processing' | 'shipped' | 'delivered';

const FILTER_OPTIONS: { value: OrderFilter; label: string }[] = [
  { value: 'all', label: 'Toutes' },
  { value: 'pending', label: 'En attente' },
  { value: 'processing', label: 'En cours' },
  { value: 'shipped', label: 'Expédiées' },
  { value: 'delivered', label: 'Livrées' },
];

const SellerOrdersScreen: React.FC = () => {
  const navigation = useNavigation<SellerOrdersScreenNavigationProp>();

  const {
    filteredOrders: orders,
    isLoading,
    isRefreshing,
    activeFilter,
    pendingCount,
    setActiveFilter,
    refresh,
    updateOrderStatus,
  } = useSellerOrders();

  const handleOrderPress = useCallback((orderId: string) => {
    navigation.navigate('OrderDetail' , { orderId });
  }, [navigation]);

  const formatDate = useCallback((date: string): string => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, []);

  const renderFilterButton = useCallback((filter: typeof FILTER_OPTIONS[0]) => (
    <TouchableOpacity
      key={filter.value}
      style={[
        styles.filterButton,
        activeFilter === filter.value && styles.filterButtonActive,
      ]}
      onPress={() => setActiveFilter(filter.value)}>
      <Text
        style={[
          styles.filterButtonText,
          activeFilter === filter.value && styles.filterButtonTextActive,
        ]}>
        {filter.label}
      </Text>
    </TouchableOpacity>
  ), [activeFilter]);

  const getActionButton = useCallback((order: Order) => {
    const statusActions: { [key: string]: string } = {
      pending: 'Accepter',
      processing: 'Expédier',
      shipped: 'Confirmer livraison',
    };

    const action = statusActions[order.status];
    if (!action) return null;

    return (
      <Button
        title={action}
        onPress={() => updateOrderStatus(order._id, order.status)}
        size="small"
        style={styles.actionButton}
      />
    );
  }, [updateOrderStatus]);

  const renderOrderCard = useCallback(({ item }: { item: Order }) => (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => handleOrderPress(item._id)}>
      <Card variant="outlined" padding="medium" style={styles.orderCard}>
        {/* Header */}
        <View style={styles.orderHeader}>
          <View style={styles.orderHeaderLeft}>
            <Text style={styles.orderNumber}>#{item.orderNumber}</Text>
            <Text style={styles.orderDate}>{formatDate(item.createdAt)}</Text>
          </View>
          <OrderStatusBadge status={item.status as any} />
        </View>

        {/* Customer Info */}
        <View style={styles.customerInfo}>
          <Text style={styles.customerIcon}>👤</Text>
          <View style={styles.customerDetails}>
            <Text style={styles.customerName}>{item.user.name}</Text>
            <Text style={styles.customerEmail}>{item.user.email}</Text>
          </View>
        </View>

        {/* Items */}
        <View style={styles.itemsSection}>
          <Text style={styles.itemsLabel}>
            {item.items.length} article{item.items.length > 1 ? 's' : ''}
          </Text>
          {item.items.slice(0, 2).map((orderItem, index) => (
            <View key={index} style={styles.itemRow}>
              <Text style={styles.itemName} numberOfLines={1}>
                • {orderItem.product.name}
              </Text>
              <Text style={styles.itemQuantity}>×{orderItem.quantity}</Text>
            </View>
          ))}
          {item.items.length > 2 && (
            <Text style={styles.moreItems}>
              +{item.items.length - 2} autre{item.items.length - 2 > 1 ? 's' : ''}
            </Text>
          )}
        </View>

        {/* Shipping Address */}
        <View style={styles.shippingSection}>
          <Text style={styles.shippingIcon}>📍</Text>
          <Text style={styles.shippingText} numberOfLines={1}>
            {item.shippingAddress.city}, {item.shippingAddress.postalCode}
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.orderFooter}>
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{item.total.toFixed(2)} €</Text>
          </View>

          {getActionButton(item)}
        </View>
      </Card>
    </TouchableOpacity>
  ), [handleOrderPress, getActionButton, formatDate]);

  const renderEmpty = useCallback(() => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📦</Text>
      <Text style={styles.emptyTitle}>
        {activeFilter === 'all'
          ? 'Aucune commande'
          : `Aucune commande ${FILTER_OPTIONS.find(f => f.value === activeFilter)?.label.toLowerCase()}`}
      </Text>
      <Text style={styles.emptyText}>
        {activeFilter === 'all'
          ? 'Les commandes de vos produits apparaîtront ici'
          : 'Aucune commande ne correspond à ce filtre'}
      </Text>
    </View>
  ), [activeFilter]);

  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleGoBack}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Commandes</Text>
        <View style={styles.headerRight}>
          {pendingCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {pendingCount}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <FlatList
          data={FILTER_OPTIONS}
          renderItem={({ item }) => renderFilterButton(item)}
          keyExtractor={item => item.value}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersList}
        />
      </View>

      {/* Orders List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrderCard}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.ordersList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={refresh} />
          }
          ListEmptyComponent={renderEmpty}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.lg,
    paddingTop: SPACING.xl,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: COLORS.text.primary,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text.primary,
  },
  headerRight: {
    width: 40,
    alignItems: 'flex-end',
  },
  badge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.error,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text.white,
  },
  filtersContainer: {
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filtersList: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  filterButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: SPACING.sm,
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterButtonText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.text.primary,
  },
  filterButtonTextActive: {
    color: COLORS.text.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text.secondary,
  },
  ordersList: {
    padding: SPACING.lg,
  },
  orderCard: {
    marginBottom: SPACING.md,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  orderHeaderLeft: {
    flex: 1,
  },
  orderNumber: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  orderDate: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  customerIcon: {
    fontSize: 24,
    marginRight: SPACING.sm,
  },
  customerDetails: {
    flex: 1,
  },
  customerName: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  customerEmail: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
  },
  itemsSection: {
    marginBottom: SPACING.md,
  },
  itemsLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  itemName: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.primary,
  },
  itemQuantity: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
    marginLeft: SPACING.sm,
  },
  moreItems: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
    fontStyle: 'italic',
    marginTop: SPACING.xs,
  },
  shippingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  shippingIcon: {
    fontSize: 16,
    marginRight: SPACING.xs,
  },
  shippingText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  totalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  totalLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
  },
  totalValue: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.primary,
  },
  actionButton: {
    marginLeft: SPACING.sm,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxxl,
    paddingHorizontal: SPACING.xl,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: SPACING.lg,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
});

export default SellerOrdersScreen;
