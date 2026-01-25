/**
 * OrderSummary Component
 * Displays order totals (subtotal, shipping, tax, total)
 */

import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../../utils/constants';
import { formatPrice } from '../../utils/productHelpers';

interface OrderSummaryProps {
  subtotal: number;
  shipping: number;
  tax?: number;
  total: number;
  discount?: number;
  showDivider?: boolean;
}

interface SummaryRowProps {
  label: string;
  value: string;
  isTotal?: boolean;
  isDiscount?: boolean;
}

const SummaryRow: React.FC<SummaryRowProps> = memo(
  ({ label, value, isTotal, isDiscount }) => (
    <View style={[styles.row, isTotal && styles.totalRow]}>
      <Text style={[styles.label, isTotal && styles.totalLabel]}>{label}</Text>
      <Text
        style={[
          styles.value,
          isTotal && styles.totalValue,
          isDiscount && styles.discountValue,
        ]}
      >
        {value}
      </Text>
    </View>
  )
);

export const OrderSummary: React.FC<OrderSummaryProps> = memo(
  ({ subtotal, shipping, tax, total, discount, showDivider = true }) => {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Récapitulatif</Text>

        <SummaryRow label="Sous-total" value={formatPrice(subtotal)} />

        {discount !== undefined && discount > 0 && (
          <SummaryRow
            label="Réduction"
            value={`-${formatPrice(discount)}`}
            isDiscount
          />
        )}

        <SummaryRow
          label="Livraison"
          value={shipping === 0 ? 'Gratuite' : formatPrice(shipping)}
        />

        {tax !== undefined && (
          <SummaryRow label="TVA" value={formatPrice(tax)} />
        )}

        {showDivider && <View style={styles.divider} />}

        <SummaryRow label="Total" value={formatPrice(total)} isTotal />
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    paddingVertical: SPACING.sm,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  totalRow: {
    marginTop: SPACING.sm,
    marginBottom: 0,
  },
  label: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
  },
  totalLabel: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text.primary,
  },
  value: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.text.primary,
  },
  totalValue: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.primary,
  },
  discountValue: {
    color: COLORS.success,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.sm,
  },
});
