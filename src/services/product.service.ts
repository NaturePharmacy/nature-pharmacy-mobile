/**
 * Product Service
 */

import api from './api';
import type { Product, ProductFilters, PaginatedResponse, Review } from '@types';

export const productService = {
  /**
   * Get all products with filters and pagination
   */
  getProducts: async (params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    sort?: string;
    minPrice?: number;
    maxPrice?: number;
    isOrganic?: boolean;
    isFeatured?: boolean;
  }): Promise<PaginatedResponse<Product>> => {
    const response = await api.get<PaginatedResponse<Product>>('/products', { params });
    return response.data;
  },

  /**
   * Get product by ID
   */
  getProductById: async (id: string): Promise<Product> => {
    const response = await api.get<{ product: Product }>(`/products/${id}`);
    return response.data.product;
  },

  /**
   * Get product by slug
   */
  getProductBySlug: async (slug: string): Promise<Product> => {
    const response = await api.get<{ product: Product }>(`/products/slug/${slug}`);
    return response.data.product;
  },

  /**
   * Search products
   */
  searchProducts: async (query: string, page = 1, limit = 20): Promise<PaginatedResponse<Product>> => {
    const response = await api.get<PaginatedResponse<Product>>('/products/search', {
      params: { q: query, page, limit },
    });
    return response.data;
  },

  /**
   * Get featured products
   */
  getFeaturedProducts: async (limit = 10): Promise<Product[]> => {
    const response = await api.get<{ products: Product[] }>('/products/featured', {
      params: { limit },
    });
    return response.data.products;
  },

  /**
   * Get products by category
   */
  getProductsByCategory: async (
    category: string,
    page = 1,
    limit = 20
  ): Promise<PaginatedResponse<Product>> => {
    const response = await api.get<PaginatedResponse<Product>>(`/products/category/${category}`, {
      params: { page, limit },
    });
    return response.data;
  },

  /**
   * Get product reviews
   */
  getProductReviews: async (productId: string, page = 1, limit = 10): Promise<PaginatedResponse<Review>> => {
    const response = await api.get<PaginatedResponse<Review>>(`/products/${productId}/reviews`, {
      params: { page, limit },
    });
    return response.data;
  },

  /**
   * Add product review
   */
  addProductReview: async (
    productId: string,
    data: {
      rating: number;
      title: string;
      comment: string;
    }
  ): Promise<Review> => {
    const response = await api.post<{ review: Review }>(`/products/${productId}/reviews`, data);
    return response.data.review;
  },

  /**
   * Get related products
   */
  getRelatedProducts: async (productId: string, limit = 6): Promise<Product[]> => {
    const response = await api.get<{ products: Product[] }>(`/products/${productId}/related`, {
      params: { limit },
    });
    return response.data.products;
  },
};
