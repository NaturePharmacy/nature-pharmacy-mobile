/**
 * useOrders Hook
 * Manages order fetching and status updates
 */

import { useState, useEffect, useCallback } from 'react';
import { orderService } from '../services/order.service';
import { Order } from '../types';

interface UseOrdersOptions {
  status?: string;
  page?: number;
  limit?: number;
}

export function useOrders(options: UseOrdersOptions = {}) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await orderService.getUserOrders(options);
      setOrders(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch orders';
      setError(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [options]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await fetchOrders();
  }, [fetchOrders]);

  const cancelOrder = useCallback(
    async (orderId: string) => {
      try {
        await orderService.cancelOrder(orderId);
        // Update local state
        setOrders((prev) =>
          prev.map((order) =>
            order.id === orderId ? { ...order, status: 'cancelled' } : order
          )
        );
        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to cancel order';
        setError(message);
        return false;
      }
    },
    []
  );

  return {
    orders,
    loading,
    error,
    refreshing,
    refresh,
    cancelOrder,
  };
}
