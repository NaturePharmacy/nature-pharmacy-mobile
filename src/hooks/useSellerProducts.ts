/**
 * useSellerProducts Hook
 * Manages seller product catalog data and CRUD operations
 */

import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { sellerService } from '../services/seller.service';
import { logError } from '../utils/logger';
import type { Product } from '../types';

type ProductFilter = 'all' | 'active' | 'draft' | 'out_of_stock';

interface UseSellerProductsOptions {
  initialFilter?: ProductFilter;
}

interface UseSellerProductsReturn {
  products: Product[];
  filteredProducts: Product[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  activeFilter: ProductFilter;
  setActiveFilter: (filter: ProductFilter) => void;
  refresh: () => Promise<void>;
  deleteProduct: (productId: string, productName: string) => void;
  toggleProductStatus: (productId: string, currentStatus: boolean) => Promise<void>;
}

export function useSellerProducts(
  options: UseSellerProductsOptions = {}
): UseSellerProductsReturn {
  const { initialFilter = 'all' } = options;

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<ProductFilter>(initialFilter);

  const loadProducts = useCallback(async (isRefresh: boolean = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      const statusFilter = activeFilter === 'all' ? undefined : activeFilter;
      const response = await sellerService.getProducts({ status: statusFilter as 'active' | 'draft' | 'out_of_stock' | undefined });
      setProducts(response.items || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur de chargement des produits';
      setError(errorMessage);
      logError('Error loading seller products', err, 'useSellerProducts');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const filteredProducts = products.filter(product => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'out_of_stock') return product.stock === 0;
    // Add more filter logic as needed
    return true;
  });

  const refresh = useCallback(async () => {
    await loadProducts(true);
  }, [loadProducts]);

  const deleteProduct = useCallback(
    (productId: string, productName: string) => {
      Alert.alert(
        'Supprimer le produit',
        `Êtes-vous sûr de vouloir supprimer "${productName}" ?`,
        [
          { text: 'Annuler', style: 'cancel' },
          {
            text: 'Supprimer',
            style: 'destructive',
            onPress: async () => {
              try {
                await sellerService.deleteProduct(productId);
                Alert.alert('Succès', 'Produit supprimé');
                loadProducts();
              } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Impossible de supprimer le produit';
                Alert.alert('Erreur', errorMessage);
              }
            },
          },
        ]
      );
    },
    [loadProducts]
  );

  const toggleProductStatus = useCallback(
    async (productId: string, _currentStatus: boolean) => {
      try {
        const updatedProduct = await sellerService.toggleProductStatus(productId);
        Alert.alert(
          'Succès',
          updatedProduct.isActive ? 'Produit activé' : 'Produit désactivé'
        );
        loadProducts();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erreur de mise à jour';
        Alert.alert('Erreur', errorMessage);
      }
    },
    [loadProducts]
  );

  return {
    products,
    filteredProducts,
    isLoading,
    isRefreshing,
    error,
    activeFilter,
    setActiveFilter,
    refresh,
    deleteProduct,
    toggleProductStatus,
  };
}
