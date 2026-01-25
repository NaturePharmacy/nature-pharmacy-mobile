/**
 * Product Helper Utilities
 * Shared functions for product-related calculations and formatting
 */

import { PRODUCT_CONFIG } from './constants';

/**
 * Calculate discount percentage
 * @param price Current price
 * @param compareAtPrice Original price (optional)
 * @returns Discount percentage (0 if no discount)
 */
export const calculateDiscount = (price: number, compareAtPrice?: number): number => {
  if (!compareAtPrice || compareAtPrice <= price) return 0;
  return Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
};

/**
 * Check if product has a discount
 * @param price Current price
 * @param compareAtPrice Original price (optional)
 * @returns True if product has a valid discount
 */
export const hasDiscount = (price: number, compareAtPrice?: number): boolean => {
  return compareAtPrice !== undefined && compareAtPrice > price;
};

/**
 * Calculate savings amount
 * @param price Current price
 * @param compareAtPrice Original price (optional)
 * @returns Savings amount in currency
 */
export const calculateSavings = (price: number, compareAtPrice?: number): number => {
  if (!compareAtPrice || compareAtPrice <= price) return 0;
  return compareAtPrice - price;
};

/**
 * Render star rating as string
 * @param rating Rating value (0-5)
 * @param maxStars Maximum stars (default: 5)
 * @returns String of star emojis
 */
export const renderStars = (rating: number, maxStars: number = PRODUCT_CONFIG.RATING_MAX): string => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  let stars = '';
  for (let i = 0; i < maxStars; i++) {
    if (i < fullStars) {
      stars += '★';
    } else if (i === fullStars && hasHalfStar) {
      stars += '½';
    } else {
      stars += '☆';
    }
  }
  return stars;
};

/**
 * Format price with currency
 * @param price Price value
 * @param currency Currency code (default: EUR)
 * @param locale Locale for formatting (default: fr-FR)
 * @returns Formatted price string
 */
export const formatPrice = (
  price: number,
  currency: string = 'EUR',
  locale: string = 'fr-FR'
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(price);
};

/**
 * Check if product is low on stock
 * @param stock Current stock quantity
 * @returns True if stock is below threshold
 */
export const isLowStock = (stock: number): boolean => {
  return stock > 0 && stock < PRODUCT_CONFIG.LOW_STOCK_THRESHOLD;
};

/**
 * Check if product is out of stock
 * @param stock Current stock quantity
 * @returns True if out of stock
 */
export const isOutOfStock = (stock: number): boolean => {
  return stock <= 0;
};

/**
 * Get stock status label
 * @param stock Current stock quantity
 * @returns Status label in French
 */
export const getStockStatusLabel = (stock: number): string => {
  if (stock <= 0) return 'Rupture de stock';
  if (stock < PRODUCT_CONFIG.LOW_STOCK_THRESHOLD) return `Plus que ${stock} en stock`;
  return 'En stock';
};

/**
 * Get stock status color
 * @param stock Current stock quantity
 * @returns Color key for status
 */
export const getStockStatusColor = (stock: number): 'error' | 'warning' | 'success' => {
  if (stock <= 0) return 'error';
  if (stock < PRODUCT_CONFIG.LOW_STOCK_THRESHOLD) return 'warning';
  return 'success';
};

/**
 * Truncate product name for display
 * @param name Product name
 * @param maxLength Maximum length
 * @returns Truncated name with ellipsis if needed
 */
export const truncateName = (name: string, maxLength: number = 50): string => {
  if (name.length <= maxLength) return name;
  return `${name.substring(0, maxLength - 3)}...`;
};

/**
 * Format review count for display
 * @param count Number of reviews
 * @returns Formatted string
 */
export const formatReviewCount = (count: number): string => {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`;
  }
  return count.toString();
};
