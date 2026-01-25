/**
 * Cart Slice - Redux Toolkit
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS, CART_CONFIG } from '@utils/constants';
import { logError } from '../../utils/logger';
import type { Cart, CartItem, Product } from '@types';

// Initial state
const initialState: Cart = {
  items: [],
  totalItems: 0,
  subtotal: 0,
  tax: 0,
  shipping: 0,
  total: 0,
};

// Helper functions
const calculateTotals = (items: CartItem[]): Omit<Cart, 'items'> => {
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const tax = subtotal * CART_CONFIG.TAX_RATE;
  const shipping = subtotal > CART_CONFIG.FREE_SHIPPING_THRESHOLD
    ? 0
    : CART_CONFIG.STANDARD_SHIPPING_COST;
  const total = subtotal + tax + shipping;
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    totalItems,
    subtotal,
    tax,
    shipping,
    total,
  };
};

const saveCartToStorage = async (cart: Cart) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
  } catch (error) {
    logError('Error saving cart', error, 'CartSlice');
  }
};

// Slice
const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<{ product: Product; quantity?: number }>) => {
      const { product, quantity = 1 } = action.payload;
      const existingItem = state.items.find(item => item.product._id === product._id);

      if (existingItem) {
        // Update quantity if item exists
        existingItem.quantity += quantity;
      } else {
        // Add new item
        state.items.push({ product, quantity });
      }

      // Recalculate totals
      const totals = calculateTotals(state.items);
      Object.assign(state, totals);

      // Save to storage
      saveCartToStorage(state);
    },

    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.product._id !== action.payload);

      // Recalculate totals
      const totals = calculateTotals(state.items);
      Object.assign(state, totals);

      // Save to storage
      saveCartToStorage(state);
    },

    updateQuantity: (state, action: PayloadAction<{ productId: string; quantity: number }>) => {
      const { productId, quantity } = action.payload;
      const item = state.items.find(item => item.product._id === productId);

      if (item) {
        if (quantity <= 0) {
          // Remove item if quantity is 0 or less
          state.items = state.items.filter(item => item.product._id !== productId);
        } else {
          item.quantity = quantity;
        }

        // Recalculate totals
        const totals = calculateTotals(state.items);
        Object.assign(state, totals);

        // Save to storage
        saveCartToStorage(state);
      }
    },

    clearCart: state => {
      state.items = [];
      state.totalItems = 0;
      state.subtotal = 0;
      state.tax = 0;
      state.shipping = 0;
      state.total = 0;

      // Clear from storage
      AsyncStorage.removeItem(STORAGE_KEYS.CART);
    },

    loadCartFromStorage: (state, action: PayloadAction<Cart>) => {
      return action.payload;
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart, loadCartFromStorage } =
  cartSlice.actions;

export default cartSlice.reducer;
