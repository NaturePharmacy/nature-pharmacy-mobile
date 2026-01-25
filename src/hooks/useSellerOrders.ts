/**
 * useSellerOrders Hook
 * Manages seller order data and status updates
 */

import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { sellerService } from '../services/seller.service';
import { logError } from '../utils/logger';
import type { Order } from '../types';

type OrderFilter = 'all' | 'pending' | 'processing' | 'shipped' | 'delivered';

interface UseSellerOrdersOptions {
  initialFilter?: OrderFilter;
}

interface UseSellerOrdersReturn {
  orders: Order[];
  filteredOrders: Order[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  activeFilter: OrderFilter;
  pendingCount: number;
  setActiveFilter: (filter: OrderFilter) => void;
  refresh: () => Promise<void>;
  updateOrderStatus: (orderId: string, currentStatus: string) => void;
}

const STATUS_TRANSITIONS: Record<string, string> = {
  pending: 'processing',
  processing: 'shipped',
  shipped: 'delivered',
};

const STATUS_LABELS: Record<string, string> = {
  processing: 'en cours',
  shipped: 'expédié',
  delivered: 'livré',
};

export function useSellerOrders(
  options: UseSellerOrdersOptions = {}
): UseSellerOrdersReturn {
  const { initialFilter = 'all' } = options;

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<OrderFilter>(initialFilter);

  const loadOrders = useCallback(async (isRefresh: boolean = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      const statusFilter = activeFilter === 'all' ? undefined : activeFilter;
      const response = await sellerService.getOrders({ status: statusFilter });
      setOrders(response.items || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur de chargement des commandes';
      setError(errorMessage);
      logError('Error loading seller orders', err, 'useSellerOrders');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const filteredOrders = orders.filter(order => {
    if (activeFilter === 'all') return true;
    return order.status === activeFilter;
  });

  const pendingCount = orders.filter(o => o.status === 'pending').length;

  const refresh = useCallback(async () => {
    await loadOrders(true);
  }, [loadOrders]);

  const updateOrderStatus = useCallback(
    (orderId: string, currentStatus: string) => {
      const nextStatus = STATUS_TRANSITIONS[currentStatus];
      if (!nextStatus) return;

      Alert.alert(
        'Mettre à jour la commande',
        `Marquer cette commande comme "${STATUS_LABELS[nextStatus]}" ?`,
        [
          { text: 'Annuler', style: 'cancel' },
          {
            text: 'Confirmer',
            onPress: async () => {
              try {
                await sellerService.updateOrderStatus(orderId, nextStatus as 'processing' | 'shipped' | 'delivered');
                Alert.alert('Succès', 'Statut mis à jour');
                loadOrders();
              } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Impossible de mettre à jour';
                Alert.alert('Erreur', errorMessage);
              }
            },
          },
        ]
      );
    },
    [loadOrders]
  );

  return {
    orders,
    filteredOrders,
    isLoading,
    isRefreshing,
    error,
    activeFilter,
    pendingCount,
    setActiveFilter,
    refresh,
    updateOrderStatus,
  };
}
