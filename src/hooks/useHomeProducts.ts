/**
 * useHomeProducts Hook
 * Manages home screen product data (featured + recent products)
 */

import { useState, useEffect, useCallback } from 'react';
import { productService } from '../services/product.service';
import { logError } from '../utils/logger';
import type { Product } from '../types';

interface UseHomeProductsReturn {
  featuredProducts: Product[];
  recentProducts: Product[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useHomeProducts(): UseHomeProductsReturn {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = useCallback(async (isRefresh: boolean = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      const [featured, recent] = await Promise.all([
        productService.getFeaturedProducts(),
        productService.getProducts({ page: 1, limit: 10 }),
      ]);

      setFeaturedProducts(featured);
      setRecentProducts(recent.items || recent.products || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur de chargement des produits';
      setError(errorMessage);
      logError('Error loading home products', err, 'useHomeProducts');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const refresh = useCallback(async () => {
    await loadProducts(true);
  }, [loadProducts]);

  return {
    featuredProducts,
    recentProducts,
    isLoading,
    isRefreshing,
    error,
    refresh,
  };
}
