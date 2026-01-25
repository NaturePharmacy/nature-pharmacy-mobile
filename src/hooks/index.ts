/**
 * Hooks Index
 * Central export for all custom hooks
 */

export { useDebounce } from './useDebounce';
export { useAuth } from './useAuth';
export { useCart } from './useCart';
export { useProducts } from './useProducts';
export { useOrders } from './useOrders';
export { useNotifications } from './useNotifications';
export type { Notification } from './useNotifications';

// Business logic hooks
export { useHomeProducts } from './useHomeProducts';
export { useSettings } from './useSettings';
export type { SettingsState } from './useSettings';
export { useSellerOrders } from './useSellerOrders';
export { useSellerProducts } from './useSellerProducts';
export { useCheckout } from './useCheckout';
export { useProductSearch } from './useProductSearch';
export { useToast, ToastProvider } from './useToast';
export { useWishlist } from './useWishlist';
