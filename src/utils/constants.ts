/**
 * Application Constants
 */

// API Configuration
export const API_CONFIG = {
  BASE_URL: __DEV__ ? 'http://localhost:3000' : 'https://votre-domaine.com',
  API_PATH: '/api',
  TIMEOUT: 10000,
};

// App Information
export const APP_INFO = {
  NAME: 'Nature Pharmacy',
  VERSION: '1.0.0',
  BUNDLE_ID: {
    IOS: 'com.naturepharmacy.app',
    ANDROID: 'com.naturepharmacy.app',
  },
};

// Colors (matching web platform)
export const COLORS = {
  primary: '#10B981',
  primaryDark: '#059669',
  primaryLight: '#34D399',

  secondary: '#6366F1',
  accent: '#F59E0B',

  background: '#FFFFFF',
  surface: '#F9FAFB',
  card: '#FFFFFF',

  text: {
    primary: '#111827',
    secondary: '#6B7280',
    disabled: '#9CA3AF',
    white: '#FFFFFF',
  },

  border: '#E5E7EB',
  divider: '#F3F4F6',

  error: '#EF4444',
  warning: '#F59E0B',
  success: '#10B981',
  info: '#3B82F6',

  // Status colors
  status: {
    pending: '#F59E0B',
    processing: '#3B82F6',
    shipped: '#8B5CF6',
    delivered: '#10B981',
    cancelled: '#EF4444',
  },
};

// Spacing
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Typography
export const TYPOGRAPHY = {
  fontFamily: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};

// Border Radius
export const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

// Screen Dimensions
export const SCREEN = {
  FULL_WIDTH: 0, // Will be set at runtime
  FULL_HEIGHT: 0, // Will be set at runtime
};

// Pagination
export const PAGINATION = {
  DEFAULT_LIMIT: 20,
  PRODUCTS_PER_PAGE: 12,
};

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: '@nature_pharmacy:auth_token',
  USER: '@nature_pharmacy:user',
  CART: '@nature_pharmacy:cart',
  LANGUAGE: '@nature_pharmacy:language',
  THEME: '@nature_pharmacy:theme',
  ONBOARDING_COMPLETED: '@nature_pharmacy:onboarding_completed',
};

// Order Status
export const ORDER_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const;

// Payment Status
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded',
} as const;

// Product Categories
export const CATEGORIES = [
  { id: 'medicinal-plants', name: 'Plantes Médicinales', icon: '🌿' },
  { id: 'essential-oils', name: 'Huiles Essentielles', icon: '💧' },
  { id: 'traditional-remedies', name: 'Remèdes Traditionnels', icon: '🏺' },
  { id: 'herbal-teas', name: 'Tisanes Thérapeutiques', icon: '🍵' },
  { id: 'supplements', name: 'Compléments Naturels', icon: '💊' },
  { id: 'natural-cosmetics', name: 'Cosmétiques Naturels', icon: '🧴' },
];

// Regex Patterns
export const REGEX = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[\d\s\-+()]+$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Erreur de connexion. Vérifiez votre connexion internet.',
  UNKNOWN_ERROR: 'Une erreur est survenue. Veuillez réessayer.',
  INVALID_CREDENTIALS: 'Email ou mot de passe incorrect.',
  SESSION_EXPIRED: 'Votre session a expiré. Veuillez vous reconnecter.',
  VALIDATION_ERROR: 'Certains champs sont invalides.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Connexion réussie !',
  REGISTER_SUCCESS: 'Inscription réussie ! Vérifiez votre email.',
  ORDER_PLACED: 'Commande passée avec succès !',
  PRODUCT_ADDED: 'Produit ajouté au panier',
  PROFILE_UPDATED: 'Profil mis à jour avec succès',
};

// Cart Configuration
export const CART_CONFIG = {
  TAX_RATE: 0.1, // 10% tax
  FREE_SHIPPING_THRESHOLD: 50, // Free shipping over 50€
  STANDARD_SHIPPING_COST: 10, // 10€ shipping fee
  MAX_QUANTITY_PER_ITEM: 99,
  MIN_QUANTITY_PER_ITEM: 1,
} as const;

// Product Configuration
export const PRODUCT_CONFIG = {
  LOW_STOCK_THRESHOLD: 10, // Show "low stock" warning
  MAX_IMAGES: 5,
  MAX_REVIEW_LENGTH: 500,
  MIN_REVIEW_LENGTH: 10,
  RATING_MAX: 5,
} as const;

// Search Configuration
export const SEARCH_CONFIG = {
  DEBOUNCE_MS: 300,
  MIN_QUERY_LENGTH: 2,
  MAX_HISTORY_ITEMS: 10,
  RESULTS_PER_PAGE: 20,
} as const;

// Toast Configuration
export const TOAST_CONFIG = {
  DEFAULT_DURATION: 3000,
  ERROR_DURATION: 5000,
  SUCCESS_DURATION: 2000,
} as const;

// Animation Configuration
export const ANIMATION_CONFIG = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
  SPRING_TENSION: 80,
  SPRING_FRICTION: 10,
} as const;
