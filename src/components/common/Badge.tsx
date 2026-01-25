/**
 * Badge Component
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '@utils/constants';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
}

const Badge: React.FC<BadgeProps> = ({ children, variant = 'primary', size = 'medium', style }) => {
  const badgeStyle: ViewStyle[] = [
    styles.badge,
    styles[`badge_${variant}`],
    styles[`badge_${size}`],
    style,
  ];

  const textStyle: TextStyle[] = [
    styles.text,
    styles[`text_${variant}`],
    styles[`text_${size}`],
  ];

  return (
    <View style={badgeStyle}>
      <Text style={textStyle}>{children}</Text>
    </View>
  );
};

// Order Status Badge
interface OrderStatusBadgeProps {
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
}

export const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ status }) => {
  const statusConfig = {
    pending: { variant: 'warning' as const, label: 'En attente' },
    processing: { variant: 'info' as const, label: 'En cours' },
    shipped: { variant: 'info' as const, label: 'Expédié' },
    delivered: { variant: 'success' as const, label: 'Livré' },
    cancelled: { variant: 'error' as const, label: 'Annulé' },
  };

  const config = statusConfig[status];

  return <Badge variant={config.variant}>{config.label}</Badge>;
};

// Payment Status Badge
interface PaymentStatusBadgeProps {
  status: 'pending' | 'paid' | 'failed' | 'refunded';
}

export const PaymentStatusBadge: React.FC<PaymentStatusBadgeProps> = ({ status }) => {
  const statusConfig = {
    pending: { variant: 'warning' as const, label: 'En attente' },
    paid: { variant: 'success' as const, label: 'Payé' },
    failed: { variant: 'error' as const, label: 'Échoué' },
    refunded: { variant: 'info' as const, label: 'Remboursé' },
  };

  const config = statusConfig[status];

  return <Badge variant={config.variant}>{config.label}</Badge>;
};

// Count Badge (for cart, notifications)
interface CountBadgeProps {
  count: number;
  max?: number;
}

export const CountBadge: React.FC<CountBadgeProps> = ({ count, max = 99 }) => {
  const displayCount = count > max ? `${max}+` : count;

  if (count === 0) return null;

  return (
    <View style={styles.countBadge}>
      <Text style={styles.countText}>{displayCount}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs / 2,
    borderRadius: BORDER_RADIUS.full,
    alignSelf: 'flex-start',
  },
  badge_primary: {
    backgroundColor: COLORS.primary,
  },
  badge_secondary: {
    backgroundColor: COLORS.secondary,
  },
  badge_success: {
    backgroundColor: COLORS.success,
  },
  badge_warning: {
    backgroundColor: COLORS.warning,
  },
  badge_error: {
    backgroundColor: COLORS.error,
  },
  badge_info: {
    backgroundColor: COLORS.info,
  },
  badge_small: {
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
  },
  badge_medium: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs / 2,
  },
  badge_large: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  text: {
    color: COLORS.text.white,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  text_primary: {
    color: COLORS.text.white,
  },
  text_secondary: {
    color: COLORS.text.white,
  },
  text_success: {
    color: COLORS.text.white,
  },
  text_warning: {
    color: COLORS.text.white,
  },
  text_error: {
    color: COLORS.text.white,
  },
  text_info: {
    color: COLORS.text.white,
  },
  text_small: {
    fontSize: TYPOGRAPHY.fontSize.xs,
  },
  text_medium: {
    fontSize: TYPOGRAPHY.fontSize.sm,
  },
  text_large: {
    fontSize: TYPOGRAPHY.fontSize.md,
  },
  countBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.error,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  countText: {
    color: COLORS.text.white,
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
});

export default Badge;
