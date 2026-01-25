/**
 * useWishlist Hook
 * Provides easy access to wishlist functionality
 */

import { useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppDispatch, useAppSelector } from '../store/store';
import {
  addToWishlist,
  removeFromWishlist,
  toggleWishlist,
  clearWishlist,
  loadWishlistFromStorage,
  setWishlistLoading,
  selectIsInWishlist,
  selectWishlistCount,
} from '../store/slices/wishlistSlice';
import { logError } from '../utils/logger';
import type { Product } from '../types';

const WISHLIST_STORAGE_KEY = '@nature_pharmacy:wishlist';

interface UseWishlistReturn {
  items: Product[];
  count: number;
  isLoading: boolean;
  isInWishlist: (productId: string) => boolean;
  add: (product: Product) => void;
  remove: (productId: string) => void;
  toggle: (product: Product) => void;
  clear: () => void;
}

export function useWishlist(): UseWishlistReturn {
  const dispatch = useAppDispatch();
  const items = useAppSelector(state => state.wishlist?.items ?? []);
  const isLoading = useAppSelector(state => state.wishlist?.isLoading ?? false);
  const count = useAppSelector(state => selectWishlistCount(state as { wishlist: { items: Product[]; isLoading: boolean } }));

  // Load wishlist from storage on mount
  useEffect(() => {
    const loadWishlist = async () => {
      try {
        dispatch(setWishlistLoading(true));
        const stored = await AsyncStorage.getItem(WISHLIST_STORAGE_KEY);
        if (stored) {
          const parsedItems = JSON.parse(stored) as Product[];
          dispatch(loadWishlistFromStorage(parsedItems));
        } else {
          dispatch(setWishlistLoading(false));
        }
      } catch (error) {
        logError('Failed to load wishlist', error, 'useWishlist');
        dispatch(setWishlistLoading(false));
      }
    };

    loadWishlist();
  }, [dispatch]);

  const isInWishlist = useCallback(
    (productId: string): boolean => {
      return items.some(item => item._id === productId);
    },
    [items]
  );

  const add = useCallback(
    (product: Product) => {
      dispatch(addToWishlist(product));
    },
    [dispatch]
  );

  const remove = useCallback(
    (productId: string) => {
      dispatch(removeFromWishlist(productId));
    },
    [dispatch]
  );

  const toggle = useCallback(
    (product: Product) => {
      dispatch(toggleWishlist(product));
    },
    [dispatch]
  );

  const clear = useCallback(() => {
    dispatch(clearWishlist());
  }, [dispatch]);

  return {
    items,
    count,
    isLoading,
    isInWishlist,
    add,
    remove,
    toggle,
    clear,
  };
}
