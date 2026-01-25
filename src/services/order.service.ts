/**
 * Order Service
 */

import api from './api';
import type { Order, PaginatedResponse } from '@types';

export const orderService = {
  /**
   * Create new order
   */
  createOrder: async (data: {
    items: Array<{
      product: string;
      quantity: number;
    }>;
    shippingAddress: {
      street: string;
      city: string;
      state: string;
      country: string;
      postalCode: string;
    };
    paymentMethod: 'stripe' | 'paypal';
  }): Promise<Order> => {
    const response = await api.post<{ order: Order }>('/orders', data);
    return response.data.order;
  },

  /**
   * Get all user orders
   */
  getMyOrders: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<PaginatedResponse<Order>> => {
    const response = await api.get<PaginatedResponse<Order>>('/orders/my-orders', { params });
    return response.data;
  },

  /**
   * Get order by ID
   */
  getOrderById: async (id: string): Promise<Order> => {
    const response = await api.get<{ order: Order }>(`/orders/${id}`);
    return response.data.order;
  },

  /**
   * Cancel order
   */
  cancelOrder: async (id: string, reason?: string): Promise<Order> => {
    const response = await api.put<{ order: Order }>(`/orders/${id}/cancel`, { reason });
    return response.data.order;
  },

  /**
   * Track order
   */
  trackOrder: async (id: string): Promise<{
    order: Order;
    tracking: {
      status: string;
      events: Array<{
        status: string;
        date: string;
        location?: string;
        description?: string;
      }>;
    };
  }> => {
    const response = await api.get(`/orders/${id}/track`);
    return response.data;
  },
};
