/**
 * Orders List Screen
 * Liste de toutes les commandes de l'utilisateur
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppSelector } from '@store/store';
import { Card, OrderStatusBadge, Loading } from '@components';
import { orderService } from '@services/order.service';
import { logError } from '@utils/logger';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '@utils/constants';
import type { Order, OrdersListScreenNavigationProp } from '@types';

type OrderFilter = 'all' | 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

const FILTER_OPTIONS: { value: OrderFilter; label: string }[] = [
  { value: 'all', label: 'Toutes' },
  { value: 'pending', label: 'En attente' },
  { value: 'processing', label: 'En cours' },
  { value: 'shipped', label: 'Expédiées' },
  { value: 'delivered', label: 'Livrées' },
  { value: 'cancelled', label: 'Annulées' },
];

const OrdersListScreen: React.FC = () => {
  const navigation = useNavigation<OrdersListScreenNavigationProp>();
  const { user } = useAppSelector(state => state.auth);

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<OrderFilter>('all');

  const loadOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      const ordersData = await orderService.getUserOrders({
        status: activeFilter !== 'all' ? activeFilter : undefined,
      });
      setOrders(ordersData);
    } catch (error) {
      logError('Error loading orders', error, 'OrdersListScreen');
    } finally {
      setIsLoading(false);
    }
  }, [activeFilter]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadOrders();
    setIsRefreshing(false);
  }, [loadOrders]);

  const handleOrderPress = useCallback((orderId: string) => {
    navigation.navigate('OrderDetail', { orderId });
  }, [navigation]);

  const formatDate = (date: string): string => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const renderFilterButton = (filter: typeof FILTER_OPTIONS[0]) => (
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
  );

  const renderOrderCard = ({ item }: { item: Order }) => (
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

        {/* Items Preview */}
        <View style={styles.itemsPreview}>
          <Text style={styles.itemsLabel}>
            {item.items.length} article{item.items.length > 1 ? 's' : ''}
          </Text>
          <View style={styles.itemsNames}>
            {item.items.slice(0, 2).map((orderItem, index) => (
              <Text key={index} style={styles.itemName} numberOfLines={1}>
                • {orderItem.product.name}
              </Text>
            ))}
            {item.items.length > 2 && (
              <Text style={styles.moreItems}>
                +{item.items.length - 2} autre{item.items.length - 2 > 1 ? 's' : ''}
              </Text>
            )}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.orderFooter}>
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{item.total.toFixed(2)} €</Text>
          </View>

          <TouchableOpacity
            style={styles.detailButton}
            onPress={() => handleOrderPress(item._id)}>
            <Text style={styles.detailButtonText}>Voir détails</Text>
            <Text style={styles.detailButtonIcon}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Tracking Info (if shipped) */}
        {(item.status === 'shipped' || item.status === 'delivered') &&
          item.trackingNumber && (
            <View style={styles.trackingBanner}>
              <Text style={styles.trackingIcon}>📦</Text>
              <Text style={styles.trackingText}>
                Suivi: {item.trackingNumber}
              </Text>
            </View>
          )}
      </Card>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📦</Text>
      <Text style={styles.emptyTitle}>
        {activeFilter === 'all'
          ? 'Aucune commande'
          : `Aucune commande ${FILTER_OPTIONS.find(f => f.value === activeFilter)?.label.toLowerCase()}`}
      </Text>
      <Text style={styles.emptyText}>
        {activeFilter === 'all'
          ? 'Vous n\'avez pas encore passé de commande'
          : 'Aucune commande ne correspond à ce filtre'}
      </Text>
      {activeFilter === 'all' && (
        <TouchableOpacity
          style={styles.shopButton}
          onPress={() =>
            navigation.reset({
              index: 0,
              routes: [{ name: 'Main', params: undefined }],
            })
          }>
          <Text style={styles.shopButtonText}>Découvrir les produits</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Mes Commandes</Text>
        <View style={styles.headerRight} />
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
          <Loading fullScreen />
        </View>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrderCard}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.ordersList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
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
  itemsPreview: {
    marginBottom: SPACING.md,
  },
  itemsLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs,
  },
  itemsNames: {
    gap: 2,
  },
  itemName: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.primary,
  },
  moreItems: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
    fontStyle: 'italic',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  detailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
  },
  detailButtonText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    marginRight: SPACING.xs,
  },
  detailButtonIcon: {
    fontSize: 20,
    color: COLORS.primary,
  },
  trackingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  trackingIcon: {
    fontSize: 16,
    marginRight: SPACING.sm,
  },
  trackingText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
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
    marginBottom: SPACING.xl,
  },
  shopButton: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.primary,
  },
  shopButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text.white,
  },
});

export default OrdersListScreen;
