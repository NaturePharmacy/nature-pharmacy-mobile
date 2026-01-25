/**
 * Wishlist Slice - Redux Toolkit
 * Manages user's wishlist/favorites
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logError, logDebug } from '../../utils/logger';
import type { Product } from '@types';

const WISHLIST_STORAGE_KEY = '@nature_pharmacy:wishlist';

interface WishlistState {
  items: Product[];
  isLoading: boolean;
}

const initialState: WishlistState = {
  items: [],
  isLoading: false,
};

// Helper to save wishlist to storage
const saveWishlistToStorage = async (items: Product[]) => {
  try {
    await AsyncStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items));
    logDebug('Wishlist saved to storage', { count: items.length }, 'Wishlist');
  } catch (error) {
    logError('Error saving wishlist', error, 'Wishlist');
  }
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    addToWishlist: (state, action: PayloadAction<Product>) => {
      const product = action.payload;
      const exists = state.items.some(item => item._id === product._id);

      if (!exists) {
        state.items.push(product);
        saveWishlistToStorage(state.items);
      }
    },

    removeFromWishlist: (state, action: PayloadAction<string>) => {
      const productId = action.payload;
      state.items = state.items.filter(item => item._id !== productId);
      saveWishlistToStorage(state.items);
    },

    toggleWishlist: (state, action: PayloadAction<Product>) => {
      const product = action.payload;
      const existingIndex = state.items.findIndex(item => item._id === product._id);

      if (existingIndex >= 0) {
        state.items.splice(existingIndex, 1);
      } else {
        state.items.push(product);
      }
      saveWishlistToStorage(state.items);
    },

    clearWishlist: (state) => {
      state.items = [];
      AsyncStorage.removeItem(WISHLIST_STORAGE_KEY);
    },

    loadWishlistFromStorage: (state, action: PayloadAction<Product[]>) => {
      state.items = action.payload;
      state.isLoading = false;
    },

    setWishlistLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const {
  addToWishlist,
  removeFromWishlist,
  toggleWishlist,
  clearWishlist,
  loadWishlistFromStorage,
  setWishlistLoading,
} = wishlistSlice.actions;

// Selector to check if a product is in wishlist
export const selectIsInWishlist = (state: { wishlist: WishlistState }, productId: string): boolean => {
  return state.wishlist.items.some(item => item._id === productId);
};

// Selector to get wishlist count
export const selectWishlistCount = (state: { wishlist: WishlistState }): number => {
  return state.wishlist.items.length;
};

export default wishlistSlice.reducer;
