/**
 * Cart Screen
 */

import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '@store/store';
import {
  removeFromCart,
  updateQuantity,
  clearCart,
} from '@store/slices/cartSlice';
import { Button, Card } from '@components';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '@utils/constants';
import type { CartItem, CartScreenNavigationProp } from '@types';

const CartScreen: React.FC = () => {
  const navigation = useNavigation<CartScreenNavigationProp>();
  const dispatch = useAppDispatch();
  const { items, subtotal, tax, shipping, total, totalItems } = useAppSelector(
    state => state.cart
  );

  const handleRemoveItem = useCallback((productId: string) => {
    Alert.alert(
      'Supprimer du panier',
      'Êtes-vous sûr de vouloir supprimer cet article ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => dispatch(removeFromCart(productId)),
        },
      ]
    );
  }, [dispatch]);

  const handleUpdateQuantity = useCallback((productId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      handleRemoveItem(productId);
      return;
    }
    dispatch(updateQuantity({ productId, quantity: newQuantity }));
  }, [dispatch, handleRemoveItem]);

  const handleClearCart = useCallback(() => {
    Alert.alert(
      'Vider le panier',
      'Êtes-vous sûr de vouloir vider tout le panier ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Vider',
          style: 'destructive',
          onPress: () => dispatch(clearCart()),
        },
      ]
    );
  }, [dispatch]);

  const handleCheckout = useCallback(() => {
    navigation.navigate('Checkout', undefined);
  }, [navigation]);

  const renderCartItem = useCallback(({ item }: { item: CartItem }) => (
    <Card variant="outlined" padding="small" style={styles.cartItem}>
      <View style={styles.itemContent}>
        {/* Product Image */}
        <Image
          source={{ uri: item.product.images[0] }}
          style={styles.productImage}
          resizeMode="cover"
        />

        {/* Product Info */}
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>
            {item.product.name}
          </Text>
          <Text style={styles.productPrice}>
            {item.product.price.toFixed(2)} €
          </Text>

          {/* Quantity Controls */}
          <View style={styles.quantityControls}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() =>
                handleUpdateQuantity(item.product._id, item.quantity - 1)
              }>
              <Text style={styles.quantityButtonText}>−</Text>
            </TouchableOpacity>

            <Text style={styles.quantity}>{item.quantity}</Text>

            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() =>
                handleUpdateQuantity(item.product._id, item.quantity + 1)
              }
              disabled={item.quantity >= item.product.stock}>
              <Text
                style={[
                  styles.quantityButtonText,
                  item.quantity >= item.product.stock && styles.disabledText,
                ]}>
                +
              </Text>
            </TouchableOpacity>

            {/* Stock Warning */}
            {item.quantity >= item.product.stock && (
              <Text style={styles.stockWarning}>Stock max</Text>
            )}
          </View>
        </View>

        {/* Remove Button */}
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveItem(item.product._id)}>
          <Text style={styles.removeIcon}>🗑️</Text>
        </TouchableOpacity>
      </View>

      {/* Item Total */}
      <View style={styles.itemFooter}>
        <Text style={styles.itemTotal}>
          Total: {(item.product.price * item.quantity).toFixed(2)} €
        </Text>
      </View>
    </Card>
  ), [handleUpdateQuantity, handleRemoveItem]);

  const renderEmpty = useCallback(() => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>🛒</Text>
      <Text style={styles.emptyTitle}>Votre panier est vide</Text>
      <Text style={styles.emptyText}>
        Ajoutez des produits pour commencer vos achats
      </Text>
      <Button
        title="Découvrir les produits"
        onPress={() => navigation.navigate('Home', undefined)}
        style={styles.shopButton}
      />
    </View>
  ), [navigation]);

  const renderFooter = () => {
    if (items.length === 0) return null;

    return (
      <View style={styles.footer}>
        {/* Summary Card */}
        <Card variant="outlined" padding="medium" style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Résumé de la commande</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Sous-total ({totalItems} articles)</Text>
            <Text style={styles.summaryValue}>{subtotal.toFixed(2)} €</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>TVA (10%)</Text>
            <Text style={styles.summaryValue}>{tax.toFixed(2)} €</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Livraison</Text>
            <Text
              style={[
                styles.summaryValue,
                shipping === 0 && styles.freeShipping,
              ]}>
              {shipping === 0 ? 'GRATUIT' : `${shipping.toFixed(2)} €`}
            </Text>
          </View>

          {subtotal < 50 && (
            <View style={styles.freeShippingInfo}>
              <Text style={styles.freeShippingText}>
                💡 Plus que {(50 - subtotal).toFixed(2)} € pour la livraison
                gratuite !
              </Text>
            </View>
          )}

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{total.toFixed(2)} €</Text>
          </View>
        </Card>

        {/* Checkout Button */}
        <Button
          title="Passer la commande"
          onPress={handleCheckout}
          fullWidth
          size="large"
          style={styles.checkoutButton}
        />

        {/* Clear Cart */}
        <TouchableOpacity
          style={styles.clearCartButton}
          onPress={handleClearCart}>
          <Text style={styles.clearCartText}>Vider le panier</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Mon Panier</Text>
        {items.length > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{totalItems}</Text>
          </View>
        )}
      </View>

      {/* Cart Items */}
      <FlatList
        data={items}
        renderItem={renderCartItem}
        keyExtractor={item => item.product._id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    paddingTop: SPACING.xl,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text.primary,
  },
  badge: {
    marginLeft: SPACING.sm,
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text.white,
  },
  listContent: {
    padding: SPACING.lg,
  },
  cartItem: {
    marginBottom: SPACING.md,
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.surface,
  },
  productInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  productName: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  productPrice: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text.primary,
  },
  disabledText: {
    color: COLORS.text.disabled,
  },
  quantity: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text.primary,
    marginHorizontal: SPACING.md,
    minWidth: 24,
    textAlign: 'center',
  },
  stockWarning: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.warning,
    marginLeft: SPACING.sm,
  },
  removeButton: {
    padding: SPACING.xs,
  },
  removeIcon: {
    fontSize: 20,
  },
  itemFooter: {
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  itemTotal: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text.primary,
    textAlign: 'right',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxxl,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: SPACING.lg,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  shopButton: {
    marginTop: SPACING.md,
  },
  footer: {
    marginTop: SPACING.lg,
  },
  summaryCard: {
    marginBottom: SPACING.lg,
  },
  summaryTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  summaryLabel: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text.secondary,
  },
  summaryValue: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text.primary,
  },
  freeShipping: {
    color: COLORS.success,
  },
  freeShippingInfo: {
    backgroundColor: `${COLORS.success}15`,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    marginTop: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  freeShippingText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.success,
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.md,
  },
  totalLabel: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text.primary,
  },
  totalValue: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.primary,
  },
  checkoutButton: {
    marginBottom: SPACING.md,
  },
  clearCartButton: {
    padding: SPACING.md,
    alignItems: 'center',
  },
  clearCartText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.error,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
});

export default CartScreen;
