/**
 * ShippingAddressCard Component
 * Displays shipping address information
 */

import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from '../common/Card';
import { COLORS, SPACING, TYPOGRAPHY } from '../../utils/constants';

interface Address {
  fullName: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
  phone?: string;
}

interface ShippingAddressCardProps {
  address: Address;
  title?: string;
  editable?: boolean;
  onEdit?: () => void;
}

export const ShippingAddressCard: React.FC<ShippingAddressCardProps> = memo(
  ({ address, title = 'Adresse de livraison', editable = false, onEdit }) => {
    return (
      <Card variant="outlined" padding="medium" style={styles.card}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.icon}>📍</Text>
            <Text style={styles.title}>{title}</Text>
          </View>
          {editable && onEdit && (
            <TouchableOpacity onPress={onEdit} style={styles.editButton}>
              <Text style={styles.editText}>Modifier</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.addressContent}>
          <Text style={styles.name}>{address.fullName}</Text>
          <Text style={styles.addressLine}>{address.street}</Text>
          <Text style={styles.addressLine}>
            {address.postalCode} {address.city}
          </Text>
          <Text style={styles.addressLine}>{address.country}</Text>
          {address.phone && (
            <Text style={styles.phone}>📞 {address.phone}</Text>
          )}
        </View>
      </Card>
    );
  }
);

const styles = StyleSheet.create({
  card: {
    marginBottom: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    fontSize: 18,
    marginRight: SPACING.xs,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text.primary,
  },
  editButton: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  editText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  addressContent: {
    paddingLeft: SPACING.lg + SPACING.xs,
  },
  name: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  addressLine: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
    marginBottom: 2,
  },
  phone: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
    marginTop: SPACING.xs,
  },
});
