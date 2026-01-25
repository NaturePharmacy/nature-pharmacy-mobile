/**
 * useCheckout Hook
 * Manages checkout flow state and order submission
 */

import { useState, useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import { orderService } from '../services/order.service';
import type { Address, CartItem } from '../types';

type PaymentMethod = 'card' | 'mobile_money' | 'cash_on_delivery';

interface CheckoutState {
  step: 'address' | 'payment' | 'review' | 'confirmation';
  selectedAddress: Address | null;
  paymentMethod: PaymentMethod | null;
  isProcessing: boolean;
  orderId: string | null;
  error: string | null;
}

interface UseCheckoutOptions {
  cartItems: CartItem[];
  cartTotal: number;
  shippingCost?: number;
  onOrderComplete?: (orderId: string) => void;
}

interface UseCheckoutReturn {
  state: CheckoutState;
  totalWithShipping: number;
  canProceed: boolean;
  setAddress: (address: Address) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  nextStep: () => void;
  previousStep: () => void;
  submitOrder: () => Promise<void>;
  reset: () => void;
}

const STEPS: CheckoutState['step'][] = ['address', 'payment', 'review', 'confirmation'];

export function useCheckout(options: UseCheckoutOptions): UseCheckoutReturn {
  const { cartItems, cartTotal, shippingCost = 5, onOrderComplete } = options;

  const [state, setState] = useState<CheckoutState>({
    step: 'address',
    selectedAddress: null,
    paymentMethod: null,
    isProcessing: false,
    orderId: null,
    error: null,
  });

  const totalWithShipping = useMemo(() => {
    return cartTotal + shippingCost;
  }, [cartTotal, shippingCost]);

  const canProceed = useMemo(() => {
    switch (state.step) {
      case 'address':
        return state.selectedAddress !== null;
      case 'payment':
        return state.paymentMethod !== null;
      case 'review':
        return state.selectedAddress !== null && state.paymentMethod !== null;
      default:
        return false;
    }
  }, [state.step, state.selectedAddress, state.paymentMethod]);

  const setAddress = useCallback((address: Address) => {
    setState(prev => ({
      ...prev,
      selectedAddress: address,
      error: null,
    }));
  }, []);

  const setPaymentMethod = useCallback((method: PaymentMethod) => {
    setState(prev => ({
      ...prev,
      paymentMethod: method,
      error: null,
    }));
  }, []);

  const nextStep = useCallback(() => {
    const currentIndex = STEPS.indexOf(state.step);
    if (currentIndex < STEPS.length - 1 && canProceed) {
      setState(prev => ({
        ...prev,
        step: STEPS[currentIndex + 1],
      }));
    }
  }, [state.step, canProceed]);

  const previousStep = useCallback(() => {
    const currentIndex = STEPS.indexOf(state.step);
    if (currentIndex > 0) {
      setState(prev => ({
        ...prev,
        step: STEPS[currentIndex - 1],
      }));
    }
  }, [state.step]);

  const submitOrder = useCallback(async () => {
    if (!state.selectedAddress || !state.paymentMethod) {
      Alert.alert('Erreur', 'Veuillez compléter toutes les informations');
      return;
    }

    setState(prev => ({ ...prev, isProcessing: true, error: null }));

    try {
      const orderData = {
        items: cartItems.map(item => ({
          productId: item.product._id,
          quantity: item.quantity,
          price: item.product.price,
        })),
        shippingAddress: state.selectedAddress,
        paymentMethod: state.paymentMethod,
        subtotal: cartTotal,
        shippingCost,
        total: totalWithShipping,
      };

      const response = await orderService.createOrder(orderData);

      setState(prev => ({
        ...prev,
        step: 'confirmation',
        orderId: response.orderId,
        isProcessing: false,
      }));

      onOrderComplete?.(response.orderId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la commande';
      setState(prev => ({
        ...prev,
        isProcessing: false,
        error: errorMessage,
      }));
      Alert.alert('Erreur', errorMessage);
    }
  }, [state.selectedAddress, state.paymentMethod, cartItems, cartTotal, shippingCost, totalWithShipping, onOrderComplete]);

  const reset = useCallback(() => {
    setState({
      step: 'address',
      selectedAddress: null,
      paymentMethod: null,
      isProcessing: false,
      orderId: null,
      error: null,
    });
  }, []);

  return {
    state,
    totalWithShipping,
    canProceed,
    setAddress,
    setPaymentMethod,
    nextStep,
    previousStep,
    submitOrder,
    reset,
  };
}
