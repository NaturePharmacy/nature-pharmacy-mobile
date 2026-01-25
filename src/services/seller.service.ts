/**
 * Seller Service
 * API calls for seller dashboard and product management
 */

import api from './api';
import type { Product, Order, PaginatedResponse } from '@types';

export interface SellerStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  averageRating: number;
  pendingOrders: number;
  revenueGrowth: number;
  ordersGrowth: number;
}

export interface SellerRevenueData {
  date: string;
  revenue: number;
  orders: number;
}

export interface CreateProductData {
  name: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  category: string;
  stock: number;
  images: string[];
  isOrganic?: boolean;
  ingredients?: string;
  usage?: string;
  weight?: string;
  dimensions?: string;
}

export interface UpdateProductData extends Partial<CreateProductData> {
  isActive?: boolean;
}

export const sellerService = {
  /**
   * Get seller dashboard stats
   */
  getDashboardStats: async (): Promise<SellerStats> => {
    const response = await api.get<{ stats: SellerStats }>('/seller/dashboard/stats');
    return response.data.stats;
  },

  /**
   * Get seller revenue data for charts
   */
  getRevenueData: async (period: 'week' | 'month' | 'year' = 'month'): Promise<SellerRevenueData[]> => {
    const response = await api.get<{ data: SellerRevenueData[] }>('/seller/dashboard/revenue', {
      params: { period },
    });
    return response.data.data;
  },

  /**
   * Get seller products
   */
  getProducts: async (params?: {
    page?: number;
    limit?: number;
    status?: 'active' | 'draft' | 'out_of_stock';
    search?: string;
  }): Promise<PaginatedResponse<Product>> => {
    const response = await api.get<PaginatedResponse<Product>>('/seller/products', { params });
    return response.data;
  },

  /**
   * Get single product by ID
   */
  getProduct: async (productId: string): Promise<Product> => {
    const response = await api.get<{ product: Product }>(`/seller/products/${productId}`);
    return response.data.product;
  },

  /**
   * Create new product
   */
  createProduct: async (data: CreateProductData): Promise<Product> => {
    const response = await api.post<{ product: Product }>('/seller/products', data);
    return response.data.product;
  },

  /**
   * Update product
   */
  updateProduct: async (productId: string, data: UpdateProductData): Promise<Product> => {
    const response = await api.put<{ product: Product }>(`/seller/products/${productId}`, data);
    return response.data.product;
  },

  /**
   * Delete product
   */
  deleteProduct: async (productId: string): Promise<void> => {
    await api.delete(`/seller/products/${productId}`);
  },

  /**
   * Toggle product active status
   */
  toggleProductStatus: async (productId: string): Promise<Product> => {
    const response = await api.patch<{ product: Product }>(`/seller/products/${productId}/toggle-status`);
    return response.data.product;
  },

  /**
   * Upload product images
   */
  uploadProductImages: async (productId: string, images: FormData): Promise<string[]> => {
    const response = await api.post<{ urls: string[] }>(
      `/seller/products/${productId}/images`,
      images,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.urls;
  },

  /**
   * Get seller orders
   */
  getOrders: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<PaginatedResponse<Order>> => {
    const response = await api.get<PaginatedResponse<Order>>('/seller/orders', { params });
    return response.data;
  },

  /**
   * Get single order
   */
  getOrder: async (orderId: string): Promise<Order> => {
    const response = await api.get<{ order: Order }>(`/seller/orders/${orderId}`);
    return response.data.order;
  },

  /**
   * Update order status
   */
  updateOrderStatus: async (
    orderId: string,
    status: 'processing' | 'shipped' | 'delivered',
    trackingNumber?: string
  ): Promise<Order> => {
    const response = await api.patch<{ order: Order }>(`/seller/orders/${orderId}/status`, {
      status,
      trackingNumber,
    });
    return response.data.order;
  },

  /**
   * Get seller profile
   */
  getProfile: async () => {
    const response = await api.get('/seller/profile');
    return response.data;
  },

  /**
   * Update seller profile
   */
  updateProfile: async (data: {
    storeName?: string;
    storeDescription?: string;
    phone?: string;
    address?: string;
    logo?: string;
    banner?: string;
  }) => {
    const response = await api.put('/seller/profile', data);
    return response.data;
  },

  /**
   * Get seller analytics
   */
  getAnalytics: async (params?: {
    startDate?: string;
    endDate?: string;
  }) => {
    const response = await api.get('/seller/analytics', { params });
    return response.data;
  },

  /**
   * Get top selling products
   */
  getTopProducts: async (limit = 5): Promise<Product[]> => {
    const response = await api.get<{ products: Product[] }>('/seller/analytics/top-products', {
      params: { limit },
    });
    return response.data.products;
  },
};
