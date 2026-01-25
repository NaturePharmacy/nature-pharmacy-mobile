/**
 * useProductSearch Hook
 * Manages product search with debouncing and history
 */

import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { productService } from '../services/product.service';
import { useDebounce } from './useDebounce';
import { logError } from '../utils/logger';
import type { Product } from '../types';

const SEARCH_HISTORY_KEY = '@search_history';
const MAX_HISTORY_ITEMS = 10;

interface UseProductSearchOptions {
  initialQuery?: string;
  debounceMs?: number;
  minQueryLength?: number;
}

interface UseProductSearchReturn {
  query: string;
  setQuery: (query: string) => void;
  results: Product[];
  isLoading: boolean;
  error: string | null;
  searchHistory: string[];
  clearHistory: () => Promise<void>;
  removeHistoryItem: (item: string) => Promise<void>;
  hasSearched: boolean;
}

export function useProductSearch(
  options: UseProductSearchOptions = {}
): UseProductSearchReturn {
  const { initialQuery = '', debounceMs = 300, minQueryLength = 2 } = options;

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const debouncedQuery = useDebounce(query, debounceMs);

  // Load search history on mount
  useEffect(() => {
    loadSearchHistory();
  }, []);

  const loadSearchHistory = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(SEARCH_HISTORY_KEY);
      if (stored) {
        setSearchHistory(JSON.parse(stored));
      }
    } catch (err) {
      logError('Failed to load search history', err, 'useProductSearch');
    }
  }, []);

  const saveSearchHistory = useCallback(async (newHistory: string[]) => {
    try {
      await AsyncStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
      setSearchHistory(newHistory);
    } catch (err) {
      logError('Failed to save search history', err, 'useProductSearch');
    }
  }, []);

  const addToHistory = useCallback(
    async (searchTerm: string) => {
      const trimmed = searchTerm.trim().toLowerCase();
      if (!trimmed || trimmed.length < minQueryLength) return;

      const filtered = searchHistory.filter(
        item => item.toLowerCase() !== trimmed
      );
      const newHistory = [searchTerm.trim(), ...filtered].slice(0, MAX_HISTORY_ITEMS);
      await saveSearchHistory(newHistory);
    },
    [searchHistory, saveSearchHistory, minQueryLength]
  );

  // Perform search when debounced query changes
  useEffect(() => {
    const performSearch = async () => {
      if (debouncedQuery.length < minQueryLength) {
        setResults([]);
        setHasSearched(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      setHasSearched(true);

      try {
        const response = await productService.searchProducts(debouncedQuery);
        setResults(response.items || []);

        // Add successful search to history
        if (response.items && response.items.length > 0) {
          addToHistory(debouncedQuery);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erreur de recherche';
        setError(errorMessage);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    performSearch();
  }, [debouncedQuery, minQueryLength, addToHistory]);

  const clearHistory = useCallback(async () => {
    await saveSearchHistory([]);
  }, [saveSearchHistory]);

  const removeHistoryItem = useCallback(
    async (item: string) => {
      const newHistory = searchHistory.filter(h => h !== item);
      await saveSearchHistory(newHistory);
    },
    [searchHistory, saveSearchHistory]
  );

  const setQueryWithHistory = useCallback((newQuery: string) => {
    setQuery(newQuery);
  }, []);

  return {
    query,
    setQuery: setQueryWithHistory,
    results,
    isLoading,
    error,
    searchHistory,
    clearHistory,
    removeHistoryItem,
    hasSearched,
  };
}
