/**
 * Product Detail Screen
 */

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '@store/store';
import { addToCart } from '@store/slices/cartSlice';
import { Button, Card, Badge, Loading } from '@components';
import { useWishlist } from '@hooks/useWishlist';
import { productService } from '@services/product.service';
import { logError } from '@utils/logger';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '@utils/constants';
import type { Product, Review, ProductDetailScreenNavigationProp, ProductDetailScreenRouteProp } from '@types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_HEIGHT = SCREEN_WIDTH;

const ProductDetailScreen: React.FC = () => {
  const navigation = useNavigation<ProductDetailScreenNavigationProp>();
  const route = useRoute<ProductDetailScreenRouteProp>();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  const { isInWishlist, toggle: toggleWishlist } = useWishlist();

  const { productId } = route.params;

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const isFavorite = useMemo(
    () => product ? isInWishlist(product._id) : false,
    [product, isInWishlist]
  );

  useEffect(() => {
    loadProduct();
  }, [productId]);

  const loadProduct = async () => {
    try {
      setIsLoading(true);
      const [productData, reviewsData] = await Promise.all([
        productService.getProductById(productId),
        productService.getProductReviews(productId),
      ]);
      setProduct(productData);
      setReviews(reviewsData);
    } catch (error) {
      logError('Error loading product', error, 'ProductDetailScreen');
      Alert.alert('Erreur', 'Impossible de charger le produit');
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = useCallback(() => {
    if (!product) return;

    if (quantity > product.stock) {
      Alert.alert('Stock insuffisant', `Seulement ${product.stock} disponible(s)`);
      return;
    }

    dispatch(addToCart({ product, quantity }));
    Alert.alert(
      'Ajouté au panier',
      `${quantity} × ${product.name} ajouté(s) au panier`,
      [
        { text: 'Continuer', style: 'cancel' },
        {
          text: 'Voir le panier',
          onPress: () => navigation.navigate('Cart', undefined),
        },
      ]
    );
  }, [product, quantity, dispatch, navigation]);

  const handleBuyNow = useCallback(() => {
    if (!product) return;
    dispatch(addToCart({ product, quantity }));
    navigation.navigate('Checkout', undefined);
  }, [product, quantity, dispatch, navigation]);

  const handleToggleFavorite = useCallback(() => {
    if (!product) return;
    toggleWishlist(product);
  }, [product, toggleWishlist]);

  const incrementQuantity = useCallback(() => {
    if (product && quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  }, [product, quantity]);

  const decrementQuantity = useCallback(() => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  }, [quantity]);

  const renderStars = useCallback((rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Text key={i} style={styles.star}>
          {i <= rating ? '⭐' : '☆'}
        </Text>
      );
    }
    return stars;
  }, []);

  const hasDiscount = useMemo(
    () => product?.compareAtPrice && product.compareAtPrice > product.price,
    [product]
  );

  const discountPercent = useMemo(
    () =>
      hasDiscount && product
        ? Math.round(((product.compareAtPrice! - product.price) / product.compareAtPrice!) * 100)
        : 0,
    [hasDiscount, product]
  );

  if (isLoading || !product) {
    return (
      <View style={styles.container}>
        <Loading fullScreen />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.headerIcon}>←</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={handleToggleFavorite}>
          <Text style={styles.headerIcon}>{isFavorite ? '❤️' : '🤍'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Gallery */}
        <View style={styles.imageGallery}>
          <Image
            source={{ uri: product.images[selectedImageIndex] }}
            style={styles.mainImage}
            resizeMode="cover"
          />

          {/* Badges */}
          <View style={styles.badges}>
            {hasDiscount && (
              <Badge variant="error" size="medium">
                -{discountPercent}%
              </Badge>
            )}
            {product.isOrganic && (
              <Badge variant="success" size="medium" style={{ marginLeft: SPACING.xs }}>
                🌱 Bio
              </Badge>
            )}
          </View>

          {/* Image Thumbnails */}
          {product.images.length > 1 && (
            <View style={styles.thumbnails}>
              {product.images.map((image, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.thumbnail,
                    selectedImageIndex === index && styles.thumbnailActive,
                  ]}
                  onPress={() => setSelectedImageIndex(index)}>
                  <Image
                    source={{ uri: image }}
                    style={styles.thumbnailImage}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Product Info */}
        <View style={styles.content}>
          {/* Name & Category */}
          <Text style={styles.category}>{product.category}</Text>
          <Text style={styles.name}>{product.name}</Text>

          {/* Rating */}
          <View style={styles.ratingContainer}>
            <View style={styles.stars}>{renderStars(Math.round(product.rating))}</View>
            <Text style={styles.ratingText}>
              {product.rating.toFixed(1)} ({product.reviewCount} avis)
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

            {/* Stock Status */}
            {product.stock > 0 ? (
              <View style={styles.stockBadge}>
                <Text style={styles.stockText}>
                  {product.stock < 10 ? `Plus que ${product.stock}` : 'En stock'}
                </Text>
              </View>
            ) : (
              <Badge variant="error">Rupture de stock</Badge>
            )}
          </View>

          {/* Description */}
          <Card variant="outlined" padding="medium" style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{product.description}</Text>
          </Card>

          {/* Seller Info */}
          <Card variant="outlined" padding="medium" style={styles.section}>
            <Text style={styles.sectionTitle}>Vendeur</Text>
            <View style={styles.sellerInfo}>
              <View style={styles.sellerAvatar}>
                <Text style={styles.sellerAvatarText}>
                  {product.seller.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.sellerDetails}>
                <Text style={styles.sellerName}>{product.seller.name}</Text>
                <View style={styles.sellerRating}>
                  <Text style={styles.sellerRatingText}>⭐</Text>
                  <Text style={styles.sellerRatingText}>
                    {product.seller.rating.toFixed(1)}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.sellerButton}
                onPress={() =>
                  navigation.navigate('SellerProfile', {
                    sellerId: product.seller._id,
                  })
                }>
                <Text style={styles.sellerButtonText}>Voir profil</Text>
              </TouchableOpacity>
            </View>
          </Card>

          {/* Reviews */}
          {reviews.length > 0 && (
            <Card variant="outlined" padding="medium" style={styles.section}>
              <View style={styles.reviewsHeader}>
                <Text style={styles.sectionTitle}>
                  Avis clients ({reviews.length})
                </Text>
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate('ProductReviews', {
                      productId: product._id,
                    })
                  }>
                  <Text style={styles.seeAllText}>Voir tout</Text>
                </TouchableOpacity>
              </View>

              {reviews.slice(0, 3).map(review => (
                <View key={review._id} style={styles.review}>
                  <View style={styles.reviewHeader}>
                    <View>
                      <Text style={styles.reviewAuthor}>{review.user.name}</Text>
                      <View style={styles.reviewStars}>
                        {renderStars(review.rating)}
                      </View>
                    </View>
                    <Text style={styles.reviewDate}>
                      {new Date(review.createdAt).toLocaleDateString('fr-FR')}
                    </Text>
                  </View>
                  <Text style={styles.reviewComment} numberOfLines={3}>
                    {review.comment}
                  </Text>
                </View>
              ))}
            </Card>
          )}
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      {product.stock > 0 && (
        <View style={styles.bottomActions}>
          {/* Quantity Selector */}
          <View style={styles.quantityContainer}>
            <Text style={styles.quantityLabel}>Quantité</Text>
            <View style={styles.quantityControls}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={decrementQuantity}>
                <Text style={styles.quantityButtonText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.quantityValue}>{quantity}</Text>
              <TouchableOpacity
                style={[
                  styles.quantityButton,
                  quantity >= product.stock && styles.quantityButtonDisabled,
                ]}
                onPress={incrementQuantity}
                disabled={quantity >= product.stock}>
                <Text
                  style={[
                    styles.quantityButtonText,
                    quantity >= product.stock && styles.quantityButtonTextDisabled,
                  ]}>
                  +
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <Button
              title="Ajouter au panier"
              onPress={handleAddToCart}
              variant="outline"
              style={styles.addToCartButton}
            />
            <Button
              title="Acheter maintenant"
              onPress={handleBuyNow}
              style={styles.buyNowButton}
            />
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    position: 'absolute',
    top: SPACING.xl,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    zIndex: 10,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerIcon: {
    fontSize: 24,
  },
  imageGallery: {
    backgroundColor: COLORS.surface,
  },
  mainImage: {
    width: SCREEN_WIDTH,
    height: IMAGE_HEIGHT,
  },
  badges: {
    position: 'absolute',
    top: SPACING.md,
    left: SPACING.md,
    flexDirection: 'row',
  },
  thumbnails: {
    flexDirection: 'row',
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 2,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  thumbnailActive: {
    borderColor: COLORS.primary,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  content: {
    padding: SPACING.lg,
  },
  category: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.xs,
  },
  name: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
    lineHeight: 32,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  stars: {
    flexDirection: 'row',
    marginRight: SPACING.sm,
  },
  star: {
    fontSize: 16,
  },
  ratingText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  price: {
    fontSize: TYPOGRAPHY.fontSize.xxxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.primary,
  },
  comparePrice: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text.secondary,
    textDecorationLine: 'line-through',
    marginTop: SPACING.xs,
  },
  stockBadge: {
    backgroundColor: `${COLORS.success}15`,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
  },
  stockText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.success,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  description: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text.secondary,
    lineHeight: 24,
  },
  sellerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sellerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  sellerAvatarText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text.white,
  },
  sellerDetails: {
    flex: 1,
  },
  sellerName: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  sellerRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sellerRatingText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
    marginRight: 2,
  },
  sellerButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  sellerButtonText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  seeAllText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  review: {
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  reviewAuthor: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  reviewStars: {
    flexDirection: 'row',
  },
  reviewDate: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.text.secondary,
  },
  reviewComment: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
    lineHeight: 20,
  },
  bottomActions: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  quantityContainer: {
    marginBottom: SPACING.md,
  },
  quantityLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  quantityButtonDisabled: {
    opacity: 0.5,
  },
  quantityButtonText: {
    fontSize: 20,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text.primary,
  },
  quantityButtonTextDisabled: {
    color: COLORS.text.disabled,
  },
  quantityValue: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text.primary,
    marginHorizontal: SPACING.lg,
    minWidth: 32,
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  addToCartButton: {
    flex: 1,
  },
  buyNowButton: {
    flex: 1,
  },
});

export default ProductDetailScreen;
