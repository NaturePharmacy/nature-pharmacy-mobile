/**
 * OrderItemsList Component
 * Displays list of items in an order
 */

import React, { memo } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../../utils/constants';
import { formatPrice } from '../../utils/productHelpers';

interface OrderItem {
  product: {
    _id: string;
    name: string;
    images: string[];
    price: number;
  };
  quantity: number;
  price: number;
}

interface OrderItemsListProps {
  items: OrderItem[];
  showImages?: boolean;
}

const OrderItemRow: React.FC<{ item: OrderItem; showImage: boolean }> = memo(
  ({ item, showImage }) => (
    <View style={styles.itemRow}>
      {showImage && (
        <Image
          source={{ uri: item.product.images[0] }}
          style={styles.itemImage}
          resizeMode="cover"
        />
      )}
      <View style={styles.itemInfo}>
        <Text style={styles.itemName} numberOfLines={2}>
          {item.product.name}
        </Text>
        <Text style={styles.itemQuantity}>Qté: {item.quantity}</Text>
      </View>
      <Text style={styles.itemPrice}>
        {formatPrice(item.price * item.quantity)}
      </Text>
    </View>
  )
);

export const OrderItemsList: React.FC<OrderItemsListProps> = memo(
  ({ items, showImages = true }) => {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Articles ({items.length})</Text>
        {items.map((item, index) => (
          <OrderItemRow
            key={`${item.product._id}-${index}`}
            item={item}
            showImage={showImages}
          />
        ))}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: SPACING.sm,
    backgroundColor: COLORS.surface,
  },
  itemInfo: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  itemName: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  itemQuantity: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.text.secondary,
  },
  itemPrice: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.primary,
  },
});
