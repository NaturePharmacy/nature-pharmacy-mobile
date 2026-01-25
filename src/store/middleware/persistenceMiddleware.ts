/**
 * Redux Persistence Middleware
 * Automatically persists specified slices to AsyncStorage
 */

import { Middleware, AnyAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logError, logDebug } from '../../utils/logger';

// Storage key prefix
const STORAGE_PREFIX = '@nature_pharmacy:redux:';

// Configuration for which slices to persist
interface PersistConfig {
  key: string;
  whitelist?: string[]; // Only persist these keys from the slice
  blacklist?: string[]; // Don't persist these keys from the slice
  debounceMs?: number; // Debounce writes to storage
}

const DEFAULT_DEBOUNCE_MS = 1000;

// Debounce timers
const debounceTimers: Record<string, NodeJS.Timeout> = {};

/**
 * Creates a persistence middleware for Redux
 * @param configs Array of persistence configurations
 */
export const createPersistenceMiddleware = (
  configs: PersistConfig[]
): Middleware => {
  const configMap = new Map(configs.map(c => [c.key, c]));

  return store => next => (action: AnyAction) => {
    const result = next(action);

    // Check if action belongs to a persisted slice
    const actionSlice = action.type.split('/')[0];
    const config = configMap.get(actionSlice);

    if (config) {
      const debounceMs = config.debounceMs ?? DEFAULT_DEBOUNCE_MS;

      // Clear existing timer
      if (debounceTimers[config.key]) {
        clearTimeout(debounceTimers[config.key]);
      }

      // Debounce the storage write
      debounceTimers[config.key] = setTimeout(() => {
        const state = store.getState();
        const sliceState = state[config.key];

        if (sliceState !== undefined) {
          let dataToPersist = sliceState;

          // Apply whitelist
          if (config.whitelist) {
            dataToPersist = {};
            for (const key of config.whitelist) {
              if (key in sliceState) {
                dataToPersist[key] = sliceState[key];
              }
            }
          }

          // Apply blacklist
          if (config.blacklist) {
            dataToPersist = { ...sliceState };
            for (const key of config.blacklist) {
              delete dataToPersist[key];
            }
          }

          persistToStorage(config.key, dataToPersist);
        }
      }, debounceMs);
    }

    return result;
  };
};

/**
 * Persist data to AsyncStorage
 */
const persistToStorage = async (key: string, data: unknown): Promise<void> => {
  try {
    const storageKey = `${STORAGE_PREFIX}${key}`;
    await AsyncStorage.setItem(storageKey, JSON.stringify(data));
    logDebug(`Persisted ${key} to storage`, undefined, 'Persistence');
  } catch (error) {
    logError(`Failed to persist ${key}`, error, 'Persistence');
  }
};

/**
 * Load persisted state from AsyncStorage
 * @param keys Array of slice keys to load
 * @returns Partial preloaded state
 */
export const loadPersistedState = async (
  keys: string[]
): Promise<Record<string, unknown>> => {
  const preloadedState: Record<string, unknown> = {};

  try {
    const storageKeys = keys.map(key => `${STORAGE_PREFIX}${key}`);
    const results = await AsyncStorage.multiGet(storageKeys);

    for (let i = 0; i < results.length; i++) {
      const [, value] = results[i];
      if (value) {
        try {
          preloadedState[keys[i]] = JSON.parse(value);
          logDebug(`Loaded ${keys[i]} from storage`, undefined, 'Persistence');
        } catch {
          logError(`Failed to parse ${keys[i]} from storage`, undefined, 'Persistence');
        }
      }
    }
  } catch (error) {
    logError('Failed to load persisted state', error, 'Persistence');
  }

  return preloadedState;
};

/**
 * Clear all persisted Redux state
 */
export const clearPersistedState = async (): Promise<void> => {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const reduxKeys = allKeys.filter(key => key.startsWith(STORAGE_PREFIX));
    await AsyncStorage.multiRemove(reduxKeys);
    logDebug('Cleared all persisted Redux state', undefined, 'Persistence');
  } catch (error) {
    logError('Failed to clear persisted state', error, 'Persistence');
  }
};

/**
 * Clear persisted state for specific slices
 */
export const clearPersistedSlice = async (key: string): Promise<void> => {
  try {
    const storageKey = `${STORAGE_PREFIX}${key}`;
    await AsyncStorage.removeItem(storageKey);
    logDebug(`Cleared persisted state for ${key}`, undefined, 'Persistence');
  } catch (error) {
    logError(`Failed to clear persisted state for ${key}`, error, 'Persistence');
  }
};
