/**
 * Product Card Component
 */

import React, { memo, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch } from '@store/store';
import { addToCart } from '@store/slices/cartSlice';
import Card from '@components/common/Card';
import Badge from '@components/common/Badge';
import { OptimizedImage } from '@components/common/OptimizedImage';
import { useWishlist } from '@hooks/useWishlist';
import { COLORS, SPACING, TYPOGRAPHY } from '@utils/constants';
import type { Product, MainStackNavigationProp } from '@types';

interface ProductCardProps {
  product: Product;
  onPress?: () => void;
}

const ProductCard: React.FC<ProductCardProps> = memo(({ product, onPress }) => {
  const navigation = useNavigation<MainStackNavigationProp>();
  const dispatch = useAppDispatch();
  const { isInWishlist, toggle: toggleWishlist } = useWishlist();

  const isFavorite = useMemo(
    () => isInWishlist(product._id),
    [isInWishlist, product._id]
  );

  const hasDiscount = useMemo(
    () => product.compareAtPrice && product.compareAtPrice > product.price,
    [product.compareAtPrice, product.price]
  );

  const discountPercent = useMemo(
    () =>
      hasDiscount && product.compareAtPrice
        ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
        : 0,
    [hasDiscount, product.compareAtPrice, product.price]
  );

  const handlePress = useCallback(() => {
    if (onPress) {
      onPress();
    } else {
      navigation.navigate('ProductDetail', { productId: product._id });
    }
  }, [onPress, navigation, product._id]);

  const handleAddToCart = useCallback(() => {
    dispatch(addToCart({ product, quantity: 1 }));
  }, [dispatch, product]);

  const handleToggleWishlist = useCallback(() => {
    toggleWishlist(product);
  }, [toggleWishlist, product]);

  return (
    <Card variant="elevated" padding="none" style={styles.card} onPress={handlePress}>
      {/* Image */}
      <View style={styles.imageContainer}>
        <OptimizedImage
          source={{ uri: product.images[0] }}
          style={styles.image}
          resizeMode="cover"
          priority="normal"
        />

        {/* Wishlist Button */}
        <TouchableOpacity
          style={styles.wishlistButton}
          onPress={handleToggleWishlist}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
          accessibilityState={{ selected: isFavorite }}>
          <Text style={styles.wishlistIcon}>{isFavorite ? '❤️' : '🤍'}</Text>
        </TouchableOpacity>

        {/* Badges */}
        <View style={styles.badges}>
          {hasDiscount && (
            <Badge variant="error" size="small">
              -{discountPercent}%
            </Badge>
          )}
          {product.isOrganic && (
            <Badge variant="success" size="small" style={{ marginLeft: SPACING.xs }}>
              Bio
            </Badge>
          )}
        </View>

        {/* Stock Badge */}
        {product.stock < 10 && product.stock > 0 && (
          <View style={styles.lowStock}>
            <Badge variant="warning" size="small">
              Plus que {product.stock}
            </Badge>
          </View>
        )}

        {product.stock === 0 && (
          <View style={styles.outOfStock}>
            <Badge variant="error" size="small">
              Rupture de stock
            </Badge>
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Name */}
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>

        {/* Rating */}
        <View style={styles.rating}>
          <Text style={styles.stars}>⭐</Text>
          <Text style={styles.ratingText}>
            {product.rating.toFixed(1)} ({product.reviewCount})
          </Text>
        </View>

        {/* Price */}
        <View style={styles.priceContainer}>
          <View>
            <Text style={styles.price}>{product.price.toFixed(2)} €</Text>
            {hasDiscount && (
              <Text style={styles.comparePrice}>
                {product.compareAtPrice!.toFixed(2)} €
              </Text>
            )}
          </View>

          {/* Add to Cart Button */}
          {product.stock > 0 && (
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddToCart}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={`Ajouter ${product.name} au panier`}>
              <Text style={styles.addButtonText}>+</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Card>
  );
});

ProductCard.displayName = 'ProductCard';

const styles = StyleSheet.create({
  card: {
    width: '48%',
    marginBottom: SPACING.md,
  },
  imageContainer: {
    width: '100%',
    height: 150,
    backgroundColor: COLORS.surface,
    position: 'relative',
  },
  wishlistButton: {
    position: 'absolute',
    top: SPACING.xs,
    right: SPACING.xs,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  wishlistIcon: {
    fontSize: 14,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badges: {
    position: 'absolute',
    top: SPACING.sm,
    left: SPACING.sm,
    flexDirection: 'row',
  },
  lowStock: {
    position: 'absolute',
    bottom: SPACING.sm,
    left: SPACING.sm,
  },
  outOfStock: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: SPACING.sm,
  },
  name: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
    lineHeight: 18,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  stars: {
    fontSize: 12,
    marginRight: 4,
  },
  ratingText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.text.secondary,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  price: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.primary,
  },
  comparePrice: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.text.secondary,
    textDecorationLine: 'line-through',
    marginTop: 2,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 20,
    color: COLORS.text.white,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
});

export default ProductCard;
