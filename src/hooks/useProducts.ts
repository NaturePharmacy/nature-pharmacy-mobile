/**
 * useProducts Hook
 * Manages product fetching, filtering, and pagination
 */

import { useState, useEffect, useCallback } from 'react';
import { productService } from '../services/product.service';
import { Product } from '../types';

interface UseProductsOptions {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  page?: number;
  limit?: number;
}

export function useProducts(options: UseProductsOptions = {}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [totalPages, setTotalPages] = useState(0);

  const fetchProducts = useCallback(
    async (reset: boolean = false) => {
      try {
        setLoading(true);
        setError(null);

        const data = await productService.getProducts({
          ...options,
          page: reset ? 1 : options.page || 1,
        });

        if (reset) {
          setProducts(data.products);
        } else {
          setProducts((prev) => [...prev, ...data.products]);
        }

        setHasMore(data.pagination.page < data.pagination.totalPages);
        setTotalPages(data.pagination.totalPages);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch products';
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [options]
  );

  useEffect(() => {
    fetchProducts(true);
  }, [options.category, options.search, options.minPrice, options.maxPrice, options.sort]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchProducts(false);
    }
  }, [loading, hasMore, fetchProducts]);

  const refresh = useCallback(() => {
    fetchProducts(true);
  }, [fetchProducts]);

  return {
    products,
    loading,
    error,
    hasMore,
    totalPages,
    loadMore,
    refresh,
  };
}
