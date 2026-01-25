/**
 * Categories Screen
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ProductCard, ProductListSkeleton } from '@components';
import { productService } from '@services/product.service';
import { logError } from '@utils/logger';
import { COLORS, SPACING, TYPOGRAPHY } from '@utils/constants';
import type { Product, CategoriesScreenNavigationProp, CategoriesScreenRouteProp } from '@types';

interface Category {
  id: string;
  name: string;
  icon: string;
  slug: string;
}

const CATEGORIES: Category[] = [
  { id: '1', name: 'Tous', icon: '📦', slug: '' },
  { id: '2', name: 'Plantes', icon: '🌿', slug: 'plantes' },
  { id: '3', name: 'Huiles', icon: '🧴', slug: 'huiles' },
  { id: '4', name: 'Thés', icon: '🍵', slug: 'thes' },
  { id: '5', name: 'Épices', icon: '🌶️', slug: 'epices' },
  { id: '6', name: 'Compléments', icon: '💊', slug: 'complements' },
  { id: '7', name: 'Cosmétiques', icon: '💄', slug: 'cosmetiques' },
];

const CategoriesScreen: React.FC = () => {
  const navigation = useNavigation<CategoriesScreenNavigationProp>();
  const route = useRoute<CategoriesScreenRouteProp>();

  const [selectedCategory, setSelectedCategory] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const loadProducts = async (categorySlug: string, pageNum: number = 1) => {
    try {
      if (pageNum === 1) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      const response = await productService.getProducts({
        page: pageNum,
        limit: 20,
        category: categorySlug || undefined,
      });

      if (pageNum === 1) {
        setProducts(response.items);
      } else {
        setProducts(prev => [...prev, ...response.items]);
      }

      setHasMore(response.hasMore);
      setPage(pageNum);
    } catch (error) {
      logError('Error loading products', error, 'CategoriesScreen');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadProducts(selectedCategory, 1);
    setIsRefreshing(false);
  };

  const handleLoadMore = () => {
    if (!isLoadingMore && hasMore) {
      loadProducts(selectedCategory, page + 1);
    }
  };

  const handleCategorySelect = (slug: string) => {
    setSelectedCategory(slug);
    loadProducts(slug, 1);
  };

  useEffect(() => {
    // Check if category was passed from navigation
    const categoryParam = (route.params as any)?.category;
    if (categoryParam) {
      setSelectedCategory(categoryParam);
      loadProducts(categoryParam, 1);
    } else {
      loadProducts('', 1);
    }
  }, []);

  const renderCategoryFilter = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={[
        styles.categoryFilter,
        selectedCategory === item.slug && styles.categoryFilterActive,
      ]}
      onPress={() => handleCategorySelect(item.slug)}>
      <Text style={styles.categoryIcon}>{item.icon}</Text>
      <Text
        style={[
          styles.categoryFilterText,
          selectedCategory === item.slug && styles.categoryFilterTextActive,
        ]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderProduct = ({ item }: { item: Product }) => (
    <ProductCard product={item} />
  );

  const renderFooter = () => {
    if (!isLoadingMore) return null;
    return (
      <View style={styles.loadingMore}>
        <ProductListSkeleton count={2} />
      </View>
    );
  };

  const renderEmpty = () => {
    if (isLoading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>📦</Text>
        <Text style={styles.emptyTitle}>Aucun produit trouvé</Text>
        <Text style={styles.emptyText}>
          Il n'y a pas de produits dans cette catégorie pour le moment.
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Catégories</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Search' )}>
          <Text style={styles.searchIcon}>🔍</Text>
        </TouchableOpacity>
      </View>

      {/* Category Filters */}
      <FlatList
        data={CATEGORIES}
        renderItem={renderCategoryFilter}
        keyExtractor={item => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesFilter}
        style={styles.categoriesFilterContainer}
      />

      {/* Products Grid */}
      {isLoading ? (
        <View style={styles.content}>
          <ProductListSkeleton count={6} />
        </View>
      ) : (
        <FlatList
          data={products}
          renderItem={renderProduct}
          keyExtractor={item => item._id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.productsList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmpty}
        />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    paddingTop: SPACING.xl,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text.primary,
  },
  searchIcon: {
    fontSize: 24,
  },
  categoriesFilterContainer: {
    flexGrow: 0,
    marginBottom: SPACING.md,
  },
  categoriesFilter: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
  },
  categoryFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryFilterActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryIcon: {
    fontSize: 18,
    marginRight: SPACING.xs,
  },
  categoryFilterText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.text.primary,
  },
  categoryFilterTextActive: {
    color: COLORS.text.white,
  },
  content: {
    flex: 1,
    padding: SPACING.lg,
  },
  productsList: {
    padding: SPACING.lg,
    paddingTop: SPACING.sm,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  loadingMore: {
    paddingVertical: SPACING.lg,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxxl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: SPACING.md,
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
    paddingHorizontal: SPACING.xl,
  },
});

export default CategoriesScreen;
