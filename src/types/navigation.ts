/**
 * Navigation Types
 * Définition complète des types pour React Navigation
 */

import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

// =============================================================================
// ROOT STACK
// =============================================================================

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type RootStackNavigationProp = StackNavigationProp<RootStackParamList>;

// =============================================================================
// AUTH STACK
// =============================================================================

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type AuthStackNavigationProp = StackNavigationProp<AuthStackParamList>;

// Login Screen
export type LoginScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Login'>;

// Register Screen
export type RegisterScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Register'>;

// ForgotPassword Screen
export type ForgotPasswordScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'ForgotPassword'>;

// =============================================================================
// MAIN TAB NAVIGATOR
// =============================================================================

export type MainTabParamList = {
  Home: undefined;
  Categories: { category?: string };
  Cart: undefined;
  Profile: undefined;
};

export type MainTabNavigationProp = BottomTabNavigationProp<MainTabParamList>;

// =============================================================================
// MAIN STACK (Toutes les pages accessibles depuis Main)
// =============================================================================

export type MainStackParamList = {
  // Tab Screens
  Home: undefined;
  Categories: { category?: string };
  Cart: undefined;
  Profile: undefined;

  // Product Screens
  ProductDetail: { productId: string };
  ProductList: {
    category?: string;
    featured?: boolean;
    recent?: boolean;
  };
  Search: { query?: string };

  // Checkout Screens
  Checkout: undefined;
  Address: {
    addressId?: string;
    isEdit?: boolean;
    address?: import('./models').Address;
    onSave?: (address: import('./models').Address) => void;
  };
  Payment: {
    orderId: string;
    amount: number;
  };
  OrderConfirmation: {
    orderId: string;
  };

  // Order Screens
  Orders: { status?: string };
  OrderDetail: { orderId: string };

  // Seller Screens (si role === 'seller')
  SellerDashboard: undefined;
  SellerProducts: { action?: string };
  SellerOrders: undefined;
  SellerProfile: {
    sellerId: string;
  };
  SellerSettings: undefined;
  SellerAnalytics: undefined;
  EditProduct: { productId?: string; mode: 'create' | 'edit' };

  // Review Screens
  ProductReviews: {
    productId: string;
  };

  // Utility Screens
  Notifications: undefined;
  Settings: undefined;
  Support: undefined;

  // Profile Screens
  EditProfile: undefined;
  Addresses: undefined;
  Security: undefined;
  Favorites: undefined;
  Help: undefined;
  Terms: undefined;
  SellerPayments: undefined;
};

export type MainStackNavigationProp = StackNavigationProp<MainStackParamList>;

// =============================================================================
// TYPED NAVIGATION HOOKS PAR ÉCRAN
// =============================================================================

// Home Screen
export type HomeScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Home'>,
  StackNavigationProp<MainStackParamList>
>;

// Categories Screen
export type CategoriesScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Categories'>,
  StackNavigationProp<MainStackParamList>
>;
export type CategoriesScreenRouteProp = RouteProp<MainTabParamList, 'Categories'>;

// Cart Screen
export type CartScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Cart'>,
  StackNavigationProp<MainStackParamList>
>;

// Profile Screen
export type ProfileScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Profile'>,
  StackNavigationProp<MainStackParamList>
>;

// Product Detail Screen
export type ProductDetailScreenNavigationProp = StackNavigationProp<MainStackParamList, 'ProductDetail'>;
export type ProductDetailScreenRouteProp = RouteProp<MainStackParamList, 'ProductDetail'>;

// Product List Screen
export type ProductListScreenNavigationProp = StackNavigationProp<MainStackParamList, 'ProductList'>;
export type ProductListScreenRouteProp = RouteProp<MainStackParamList, 'ProductList'>;

// Search Screen
export type SearchScreenNavigationProp = StackNavigationProp<MainStackParamList, 'Search'>;
export type SearchScreenRouteProp = RouteProp<MainStackParamList, 'Search'>;

// Checkout Screen
export type CheckoutScreenNavigationProp = StackNavigationProp<MainStackParamList, 'Checkout'>;

// Address Screen
export type AddressScreenNavigationProp = StackNavigationProp<MainStackParamList, 'Address'>;
export type AddressScreenRouteProp = RouteProp<MainStackParamList, 'Address'>;

// Payment Screen
export type PaymentScreenNavigationProp = StackNavigationProp<MainStackParamList, 'Payment'>;
export type PaymentScreenRouteProp = RouteProp<MainStackParamList, 'Payment'>;

// Order Confirmation Screen
export type OrderConfirmationScreenNavigationProp = StackNavigationProp<MainStackParamList, 'OrderConfirmation'>;
export type OrderConfirmationScreenRouteProp = RouteProp<MainStackParamList, 'OrderConfirmation'>;

// Orders List Screen
export type OrdersListScreenNavigationProp = StackNavigationProp<MainStackParamList, 'Orders'>;
export type OrdersListScreenRouteProp = RouteProp<MainStackParamList, 'Orders'>;

// Order Detail Screen
export type OrderDetailScreenNavigationProp = StackNavigationProp<MainStackParamList, 'OrderDetail'>;
export type OrderDetailScreenRouteProp = RouteProp<MainStackParamList, 'OrderDetail'>;

// Seller Dashboard Screen
export type SellerDashboardScreenNavigationProp = StackNavigationProp<MainStackParamList, 'SellerDashboard'>;

// Seller Products Screen
export type SellerProductsScreenNavigationProp = StackNavigationProp<MainStackParamList, 'SellerProducts'>;

// Seller Orders Screen
export type SellerOrdersScreenNavigationProp = StackNavigationProp<MainStackParamList, 'SellerOrders'>;

// Notifications Screen
export type NotificationsScreenNavigationProp = StackNavigationProp<MainStackParamList, 'Notifications'>;

// Settings Screen
export type SettingsScreenNavigationProp = StackNavigationProp<MainStackParamList, 'Settings'>;

// Support Screen
export type SupportScreenNavigationProp = StackNavigationProp<MainStackParamList, 'Support'>;

// =============================================================================
// HELPER TYPES
// =============================================================================

/**
 * Type guard pour vérifier si un écran nécessite authentification
 */
export function requiresAuth(routeName: keyof MainStackParamList): boolean {
  const authRequiredScreens: (keyof MainStackParamList)[] = [
    'Checkout',
    'Payment',
    'OrderConfirmation',
    'Orders',
    'OrderDetail',
    'SellerDashboard',
    'SellerProducts',
    'SellerOrders',
    'Notifications',
    'Settings',
  ];
  return authRequiredScreens.includes(routeName);
}

/**
 * Type guard pour vérifier si un écran nécessite le rôle seller
 */
export function requiresSeller(routeName: keyof MainStackParamList): boolean {
  const sellerScreens: (keyof MainStackParamList)[] = [
    'SellerDashboard',
    'SellerProducts',
    'SellerOrders',
  ];
  return sellerScreens.includes(routeName);
}
