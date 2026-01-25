/**
 * Zod Validation Schemas
 * Runtime validation for API responses and form data
 */

import { z } from 'zod';
import { REGEX, CART_CONFIG, PRODUCT_CONFIG } from './constants';

// ============================================================================
// Primitive Validators
// ============================================================================

export const emailSchema = z.string().email('Email invalide');

export const passwordSchema = z
  .string()
  .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre'
  );

export const phoneSchema = z
  .string()
  .regex(REGEX.PHONE, 'Numéro de téléphone invalide')
  .optional();

// ============================================================================
// User Schemas
// ============================================================================

export const userSchema = z.object({
  _id: z.string(),
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: emailSchema,
  role: z.enum(['buyer', 'seller', 'admin']),
  avatar: z.string().url().optional(),
  phone: phoneSchema,
  addresses: z.array(z.lazy(() => addressSchema)).optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const loginRequestSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Le mot de passe est requis'),
});

export const registerRequestSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  role: z.enum(['buyer', 'seller']).default('buyer'),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

// ============================================================================
// Address Schemas
// ============================================================================

export const addressSchema = z.object({
  _id: z.string().optional(),
  fullName: z.string().min(2, 'Le nom complet est requis'),
  street: z.string().min(5, 'L\'adresse est requise'),
  city: z.string().min(2, 'La ville est requise'),
  postalCode: z.string().min(4, 'Le code postal est requis'),
  country: z.string().min(2, 'Le pays est requis'),
  phone: phoneSchema,
  isDefault: z.boolean().optional().default(false),
});

// ============================================================================
// Product Schemas
// ============================================================================

export const sellerSchema = z.object({
  _id: z.string(),
  name: z.string(),
  rating: z.number().min(0).max(5).optional(),
});

export const productSchema = z.object({
  _id: z.string(),
  name: z.string().min(3, 'Le nom du produit est requis'),
  description: z.string(),
  price: z.number().positive('Le prix doit être positif'),
  compareAtPrice: z.number().positive().optional(),
  images: z.array(z.string().url()).max(PRODUCT_CONFIG.MAX_IMAGES),
  category: z.string(),
  stock: z.number().int().min(0),
  rating: z.number().min(0).max(PRODUCT_CONFIG.RATING_MAX).default(0),
  reviewCount: z.number().int().min(0).default(0),
  isOrganic: z.boolean().optional().default(false),
  seller: sellerSchema,
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const productListResponseSchema = z.object({
  items: z.array(productSchema),
  total: z.number().int().min(0),
  page: z.number().int().min(1),
  limit: z.number().int().min(1),
  totalPages: z.number().int().min(0),
});

// ============================================================================
// Cart Schemas
// ============================================================================

export const cartItemSchema = z.object({
  product: productSchema,
  quantity: z.number()
    .int()
    .min(CART_CONFIG.MIN_QUANTITY_PER_ITEM)
    .max(CART_CONFIG.MAX_QUANTITY_PER_ITEM),
});

export const cartSchema = z.object({
  items: z.array(cartItemSchema),
  totalItems: z.number().int().min(0),
  subtotal: z.number().min(0),
  tax: z.number().min(0),
  shipping: z.number().min(0),
  total: z.number().min(0),
});

// ============================================================================
// Order Schemas
// ============================================================================

export const orderStatusSchema = z.enum([
  'pending',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
]);

export const paymentStatusSchema = z.enum([
  'pending',
  'paid',
  'failed',
  'refunded',
]);

export const orderItemSchema = z.object({
  product: productSchema,
  quantity: z.number().int().min(1),
  price: z.number().positive(),
});

export const orderSchema = z.object({
  _id: z.string(),
  orderNumber: z.string(),
  user: userSchema.pick({ _id: true, name: true, email: true, role: true }),
  items: z.array(orderItemSchema),
  shippingAddress: addressSchema,
  status: orderStatusSchema,
  paymentStatus: paymentStatusSchema,
  paymentMethod: z.enum(['card', 'paypal', 'mobile_money', 'cash_on_delivery']),
  subtotal: z.number().min(0).optional(),
  shippingCost: z.number().min(0),
  tax: z.number().min(0).optional(),
  total: z.number().positive(),
  notes: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// ============================================================================
// Review Schemas
// ============================================================================

export const reviewSchema = z.object({
  _id: z.string(),
  user: userSchema.pick({ _id: true, name: true }),
  product: z.string(),
  rating: z.number().int().min(1).max(PRODUCT_CONFIG.RATING_MAX),
  comment: z.string()
    .min(PRODUCT_CONFIG.MIN_REVIEW_LENGTH, `Le commentaire doit contenir au moins ${PRODUCT_CONFIG.MIN_REVIEW_LENGTH} caractères`)
    .max(PRODUCT_CONFIG.MAX_REVIEW_LENGTH, `Le commentaire ne peut pas dépasser ${PRODUCT_CONFIG.MAX_REVIEW_LENGTH} caractères`),
  createdAt: z.string(),
});

export const createReviewSchema = z.object({
  rating: z.number().int().min(1).max(PRODUCT_CONFIG.RATING_MAX),
  comment: z.string()
    .min(PRODUCT_CONFIG.MIN_REVIEW_LENGTH)
    .max(PRODUCT_CONFIG.MAX_REVIEW_LENGTH),
});

// ============================================================================
// API Response Schemas
// ============================================================================

export const apiErrorSchema = z.object({
  message: z.string(),
  code: z.string().optional(),
  field: z.string().optional(),
});

export const authResponseSchema = z.object({
  user: userSchema,
  token: z.string(),
});

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Safely parse data with a Zod schema
 * Returns the parsed data or null if validation fails
 */
export function safeParse<T>(schema: z.ZodSchema<T>, data: unknown): T | null {
  const result = schema.safeParse(data);
  if (result.success) {
    return result.data;
  }
  return null;
}

/**
 * Parse data with a Zod schema and throw on error
 */
export function parse<T>(schema: z.ZodSchema<T>, data: unknown): T {
  return schema.parse(data);
}

/**
 * Get validation errors as a record of field -> error message
 */
export function getValidationErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const path = issue.path.join('.');
    if (!errors[path]) {
      errors[path] = issue.message;
    }
  }
  return errors;
}

// ============================================================================
// Type Exports
// ============================================================================

export type User = z.infer<typeof userSchema>;
export type LoginRequest = z.infer<typeof loginRequestSchema>;
export type RegisterRequest = z.infer<typeof registerRequestSchema>;
export type Address = z.infer<typeof addressSchema>;
export type Product = z.infer<typeof productSchema>;
export type CartItem = z.infer<typeof cartItemSchema>;
export type Cart = z.infer<typeof cartSchema>;
export type Order = z.infer<typeof orderSchema>;
export type Review = z.infer<typeof reviewSchema>;
export type ApiError = z.infer<typeof apiErrorSchema>;
