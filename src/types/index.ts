/**
 * TypeScript Type Definitions
 */

// User Types
export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'buyer' | 'seller' | 'admin';
  phone?: string;
  avatar?: string;
  isEmailVerified: boolean;
  address?: Address;
  sellerInfo?: SellerInfo;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

export interface SellerInfo {
  storeName?: string;
  storeDescription?: string;
  storeLogo?: string;
  verified: boolean;
  rating: number;
  totalSales: number;
  stripeAccountId?: string;
  stripeOnboardingComplete: boolean;
}

// Auth Types
export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role?: 'buyer' | 'seller';
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Product Types
export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  category: string;
  subcategory?: string;
  images: string[];
  stock: number;
  seller: User | string;
  rating: number;
  reviewCount: number;
  specifications?: Specification[];
  benefits?: string[];
  ingredients?: string[];
  usage?: string;
  warnings?: string[];
  tags?: string[];
  isFeatured: boolean;
  isOrganic: boolean;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export interface Specification {
  name: string;
  value: string;
}

export interface ProductFilters {
  category?: string;
  subcategory?: string;
  minPrice?: number;
  maxPrice?: number;
  isOrganic?: boolean;
  isFeatured?: boolean;
  search?: string;
  sort?: 'price_asc' | 'price_desc' | 'rating' | 'newest' | 'popular';
}

// Cart Types
export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
}

// Order Types
export interface Order {
  _id: string;
  buyer: User | string;
  items: OrderItem[];
  totalAmount: {
    subtotal: number;
    tax: number;
    shipping: number;
    total: number;
    currency: string;
  };
  shippingAddress: Address;
  billingAddress?: Address;
  paymentMethod: 'stripe' | 'paypal';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded' | 'cancelled';
  paymentDetails?: PaymentDetails;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  trackingNumber?: string;
  estimatedDelivery?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  product: Product | string;
  seller: User | string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface PaymentDetails {
  paymentIntentId?: string;
  sessionId?: string;
  paypalOrderId?: string;
  paypalCaptureId?: string;
  paidAt?: string;
  refundedAt?: string;
  amount?: number;
  refundAmount?: number;
  currency?: string;
  failureReason?: string;
  pendingReason?: string;
}

// Review Types
export interface Review {
  _id: string;
  product: string;
  user: User | string;
  rating: number;
  title: string;
  comment: string;
  images?: string[];
  helpful: number;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
}

// Category Types
export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  icon?: string;
  parent?: string;
  subcategories?: Category[];
  productCount: number;
}

// Notification Types
export interface Notification {
  _id: string;
  user: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T = any> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Navigation Types
export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Auth: undefined;
  Main: undefined;
  ProductDetail: { productId: string };
  Cart: undefined;
  Checkout: undefined;
  OrderConfirmation: { orderId: string };
  Profile: undefined;
  EditProfile: undefined;
  Orders: undefined;
  OrderDetail: { orderId: string };
  Settings: undefined;
  Search: { query?: string };
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Categories: undefined;
  Cart: undefined;
  Profile: undefined;
};

// Form Types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'buyer' | 'seller';
}

export interface ShippingFormData {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  phone: string;
}

// Error Types
export interface ApiError {
  message: string;
  code?: string;
  field?: string;
}

// Navigation Types - Re-export
export * from './navigation';
