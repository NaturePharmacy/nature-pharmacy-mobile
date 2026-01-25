/**
 * Seller Products Screen
 * Gestion du catalogue produits du vendeur (CRUD)
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Card, Button, Loading } from '@components';
import { productService } from '@services/product.service';
import { logError } from '@utils/logger';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '@utils/constants';
import type { Product, SellerProductsScreenNavigationProp } from '@types';

type ProductFilter = 'all' | 'active' | 'draft' | 'out_of_stock';

const FILTER_OPTIONS: { value: ProductFilter; label: string }[] = [
  { value: 'all', label: 'Tous' },
  { value: 'active', label: 'Actifs' },
  { value: 'draft', label: 'Brouillons' },
  { value: 'out_of_stock', label: 'Rupture' },
];

const SellerProductsScreen: React.FC = () => {
  const navigation = useNavigation<SellerProductsScreenNavigationProp>();

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<ProductFilter>('all');

  useEffect(() => {
    loadProducts();
  }, [activeFilter]);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      // TODO: Call API to get seller products
      const mockProducts: Product[] = [
        {
          _id: '1',
          name: 'Huile essentielle de Lavande Bio',
          price: 12.99,
          images: ['https://via.placeholder.com/150'],
          stock: 45,
          rating: 4.8,
          reviewCount: 23,
          category: 'huiles',
          description: 'Huile essentielle 100% pure',
          isOrganic: true,
          seller: {
            _id: 'seller1',
            name: 'Nature Shop',
            rating: 4.7,
          },
        },
        {
          _id: '2',
          name: 'Thé vert Matcha Premium',
          price: 24.50,
          images: ['https://via.placeholder.com/150'],
          stock: 0,
          rating: 4.9,
          reviewCount: 56,
          category: 'thes',
          description: 'Matcha grade cérémonial',
          isOrganic: true,
          seller: {
            _id: 'seller1',
            name: 'Nature Shop',
            rating: 4.7,
          },
        },
      ];
      setProducts(mockProducts);
    } catch (error) {
      logError('Error loading seller products', error, 'SellerProductsScreen');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadProducts();
    setIsRefreshing(false);
  };

  const handleAddProduct = useCallback(() => {
    navigation.navigate('EditProduct' , { mode: 'create' });
  }, [navigation]);

  const handleEditProduct = useCallback((productId: string) => {
    navigation.navigate('EditProduct' , { productId, mode: 'edit' });
  }, [navigation]);

  const handleDeleteProduct = useCallback((productId: string, productName: string) => {
    Alert.alert(
      'Supprimer le produit',
      `Êtes-vous sûr de vouloir supprimer "${productName}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              // TODO: Call API to delete product
              Alert.alert('Succès', 'Produit supprimé');
              loadProducts();
            } catch (error) {
              const message = error instanceof Error ? error.message : 'Impossible de supprimer le produit';
              Alert.alert('Erreur', message);
            }
          },
        },
      ]
    );
  }, [loadProducts]);

  const handleToggleStatus = useCallback(async (productId: string, currentStatus: boolean) => {
    try {
      // TODO: Call API to toggle product active status
      Alert.alert(
        'Succès',
        currentStatus ? 'Produit désactivé' : 'Produit activé'
      );
      loadProducts();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur de mise à jour';
      Alert.alert('Erreur', message);
    }
  }, [loadProducts]);

  const renderFilterButton = useCallback((filter: typeof FILTER_OPTIONS[0]) => (
    <TouchableOpacity
      key={filter.value}
      style={[
        styles.filterButton,
        activeFilter === filter.value && styles.filterButtonActive,
      ]}
      onPress={() => setActiveFilter(filter.value)}>
      <Text
        style={[
          styles.filterButtonText,
          activeFilter === filter.value && styles.filterButtonTextActive,
        ]}>
        {filter.label}
      </Text>
    </TouchableOpacity>
  ), [activeFilter]);

  const handleViewProduct = useCallback((productId: string) => {
    navigation.navigate('ProductDetail', { productId });
  }, [navigation]);

  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const renderProductCard = useCallback(({ item }: { item: Product }) => (
    <Card variant="outlined" padding="small" style={styles.productCard}>
      <View style={styles.productContent}>
        {/* Image */}
        <Image
          source={{ uri: item.images[0] }}
          style={styles.productImage}
          resizeMode="cover"
        />

        {/* Info */}
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>
            {item.name}
          </Text>

          <View style={styles.productMeta}>
            <Text style={styles.productPrice}>{item.price.toFixed(2)} €</Text>
            <View style={styles.productRating}>
              <Text style={styles.ratingText}>⭐ {item.rating.toFixed(1)}</Text>
              <Text style={styles.reviewCount}>({item.reviewCount})</Text>
            </View>
          </View>

          <View style={styles.productStock}>
            {item.stock > 0 ? (
              <>
                <View
                  style={[
                    styles.stockBadge,
                    item.stock < 10 && styles.stockBadgeWarning,
                  ]}>
                  <Text
                    style={[
                      styles.stockText,
                      item.stock < 10 && styles.stockTextWarning,
                    ]}>
                    {item.stock} en stock
                  </Text>
                </View>
              </>
            ) : (
              <View style={styles.stockBadgeError}>
                <Text style={styles.stockTextError}>Rupture de stock</Text>
              </View>
            )}
            {item.isOrganic && <Text style={styles.bioBadge}>🌱 Bio</Text>}
          </View>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.productActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleEditProduct(item._id)}>
          <Text style={styles.actionIcon}>✏️</Text>
          <Text style={styles.actionText}>Modifier</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleViewProduct(item._id)}>
          <Text style={styles.actionIcon}>👁️</Text>
          <Text style={styles.actionText}>Voir</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDeleteProduct(item._id, item.name)}>
          <Text style={styles.actionIcon}>🗑️</Text>
          <Text style={[styles.actionText, styles.actionTextDanger]}>
            Supprimer
          </Text>
        </TouchableOpacity>
      </View>
    </Card>
  ), [handleEditProduct, handleViewProduct, handleDeleteProduct]);

  const renderEmpty = useCallback(() => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📦</Text>
      <Text style={styles.emptyTitle}>Aucun produit</Text>
      <Text style={styles.emptyText}>
        Commencez par ajouter votre premier produit à votre catalogue
      </Text>
      <Button
        title="Ajouter un produit"
        onPress={handleAddProduct}
        style={styles.emptyButton}
      />
    </View>
  ), [handleAddProduct]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleGoBack}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Mes Produits</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddProduct}>
          <Text style={styles.addIcon}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <FlatList
          data={FILTER_OPTIONS}
          renderItem={({ item }) => renderFilterButton(item)}
          keyExtractor={item => item.value}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersList}
        />
      </View>

      {/* Products List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Loading fullScreen />
        </View>
      ) : (
        <FlatList
          data={products}
          renderItem={renderProductCard}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.productsList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
          }
          ListEmptyComponent={renderEmpty}
        />
      )}

      {/* Floating Add Button */}
      {products.length > 0 && (
        <TouchableOpacity style={styles.fab} onPress={handleAddProduct}>
          <Text style={styles.fabIcon}>+</Text>
        </TouchableOpacity>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.lg,
    paddingTop: SPACING.xl,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: COLORS.text.primary,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text.primary,
  },
  addButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 20,
  },
  addIcon: {
    fontSize: 24,
    color: COLORS.text.white,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  filtersContainer: {
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filtersList: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  filterButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: SPACING.sm,
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterButtonText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.text.primary,
  },
  filterButtonTextActive: {
    color: COLORS.text.white,
  },
  loadingContainer: {
    flex: 1,
  },
  productsList: {
    padding: SPACING.lg,
  },
  productCard: {
    marginBottom: SPACING.md,
  },
  productContent: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  productImage: {
    width: 100,
    height: 100,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.surface,
  },
  productInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  productName: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  productMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  productPrice: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.primary,
  },
  productRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  ratingText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
  },
  reviewCount: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.text.secondary,
  },
  productStock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  stockBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: `${COLORS.success}20`,
  },
  stockBadgeWarning: {
    backgroundColor: `${COLORS.warning}20`,
  },
  stockBadgeError: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: `${COLORS.error}20`,
  },
  stockText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.success,
  },
  stockTextWarning: {
    color: COLORS.warning,
  },
  stockTextError: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.error,
  },
  bioBadge: {
    fontSize: TYPOGRAPHY.fontSize.xs,
  },
  productActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
  },
  actionIcon: {
    fontSize: 16,
  },
  actionText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.primary,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  actionTextDanger: {
    color: COLORS.error,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxxl,
    paddingHorizontal: SPACING.xl,
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
    textAlign: 'center',
  },
  emptyText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  emptyButton: {
    marginTop: SPACING.md,
  },
  fab: {
    position: 'absolute',
    right: SPACING.lg,
    bottom: SPACING.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabIcon: {
    fontSize: 32,
    color: COLORS.text.white,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
});

export default SellerProductsScreen;
