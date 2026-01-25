/**
 * useCart Hook
 * Provides easy access to cart state and actions
 */

import { useSelector, useDispatch } from 'react-redux';
import { useCallback, useMemo } from 'react';
import { RootState } from '../store/store';
import {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  applyCoupon,
  removeCoupon,
} from '../store/slices/cartSlice';
import { Product } from '../types';

export function useCart() {
  const dispatch = useDispatch();
  const { items, coupon } = useSelector((state: RootState) => state.cart);

  // Calculate totals
  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }, [items]);

  const discount = useMemo(() => {
    if (!coupon) return 0;
    if (coupon.type === 'percentage') {
      return (subtotal * coupon.value) / 100;
    }
    return coupon.value;
  }, [coupon, subtotal]);

  const total = useMemo(() => {
    return Math.max(0, subtotal - discount);
  }, [subtotal, discount]);

  const itemCount = useMemo(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }, [items]);

  // Actions
  const handleAddToCart = useCallback(
    (product: Product, quantity: number = 1) => {
      dispatch(addToCart({ product, quantity }));
    },
    [dispatch]
  );

  const handleRemoveFromCart = useCallback(
    (productId: string) => {
      dispatch(removeFromCart(productId));
    },
    [dispatch]
  );

  const handleUpdateQuantity = useCallback(
    (productId: string, quantity: number) => {
      if (quantity <= 0) {
        dispatch(removeFromCart(productId));
      } else {
        dispatch(updateQuantity({ productId, quantity }));
      }
    },
    [dispatch]
  );

  const handleClearCart = useCallback(() => {
    dispatch(clearCart());
  }, [dispatch]);

  const handleApplyCoupon = useCallback(
    (couponCode: string, value: number, type: 'percentage' | 'fixed') => {
      dispatch(applyCoupon({ code: couponCode, value, type }));
    },
    [dispatch]
  );

  const handleRemoveCoupon = useCallback(() => {
    dispatch(removeCoupon());
  }, [dispatch]);

  const isInCart = useCallback(
    (productId: string) => {
      return items.some((item) => item.product.id === productId);
    },
    [items]
  );

  const getItemQuantity = useCallback(
    (productId: string) => {
      const item = items.find((item) => item.product.id === productId);
      return item ? item.quantity : 0;
    },
    [items]
  );

  return {
    // State
    items,
    coupon,
    subtotal,
    discount,
    total,
    itemCount,
    isEmpty: items.length === 0,

    // Actions
    addToCart: handleAddToCart,
    removeFromCart: handleRemoveFromCart,
    updateQuantity: handleUpdateQuantity,
    clearCart: handleClearCart,
    applyCoupon: handleApplyCoupon,
    removeCoupon: handleRemoveCoupon,

    // Helpers
    isInCart,
    getItemQuantity,
  };
}
