/**
 * Product List Screen
 * Liste de produits avec filtres et tri avancés
 */

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  RefreshControl,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ProductCard, ProductListSkeleton, Button, Card } from '@components';
import { productService } from '@services/product.service';
import { logError } from '@utils/logger';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '@utils/constants';
import type { Product, ProductListScreenNavigationProp, ProductListScreenRouteProp } from '@types';

interface FilterOptions {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  isOrganic?: boolean;
  inStock?: boolean;
  minRating?: number;
}

type SortOption = 'newest' | 'price-asc' | 'price-desc' | 'rating' | 'popular';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Plus récents' },
  { value: 'popular', label: 'Plus populaires' },
  { value: 'price-asc', label: 'Prix croissant' },
  { value: 'price-desc', label: 'Prix décroissant' },
  { value: 'rating', label: 'Mieux notés' },
];

const CATEGORIES = [
  { value: '', label: 'Toutes catégories' },
  { value: 'plantes', label: 'Plantes' },
  { value: 'huiles', label: 'Huiles essentielles' },
  { value: 'thes', label: 'Thés & Infusions' },
  { value: 'epices', label: 'Épices' },
  { value: 'complements', label: 'Compléments' },
  { value: 'cosmetiques', label: 'Cosmétiques' },
];

const PRICE_RANGES = [
  { min: undefined, max: undefined, label: 'Tous les prix' },
  { min: 0, max: 10, label: 'Moins de 10€' },
  { min: 10, max: 25, label: '10€ - 25€' },
  { min: 25, max: 50, label: '25€ - 50€' },
  { min: 50, max: undefined, label: 'Plus de 50€' },
];

const ProductListScreen: React.FC = () => {
  const navigation = useNavigation<ProductListScreenNavigationProp>();
  const route = useRoute<ProductListScreenRouteProp>();

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [showFilters, setShowFilters] = useState(false);
  const [showSort, setShowSort] = useState(false);

  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [filters, setFilters] = useState<FilterOptions>({
    category: (route.params as any)?.category || '',
    isOrganic: false,
    inStock: true,
  });

  useEffect(() => {
    loadProducts(1);
  }, [sortBy, filters]);

  const loadProducts = async (pageNum: number) => {
    try {
      if (pageNum === 1) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      const response = await productService.getProducts({
        page: pageNum,
        limit: 20,
        category: filters.category || undefined,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        isOrganic: filters.isOrganic || undefined,
        inStock: filters.inStock || undefined,
        minRating: filters.minRating,
        sortBy,
      });

      if (pageNum === 1) {
        setProducts(response.items);
      } else {
        setProducts(prev => [...prev, ...response.items]);
      }

      setHasMore(response.hasMore);
      setPage(pageNum);
    } catch (error) {
      logError('Error loading products', error, 'ProductListScreen');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadProducts(1);
    setIsRefreshing(false);
  };

  const handleLoadMore = () => {
    if (!isLoadingMore && hasMore) {
      loadProducts(page + 1);
    }
  };

  const handleApplyFilters = () => {
    setShowFilters(false);
    loadProducts(1);
  };

  const handleResetFilters = () => {
    setFilters({
      category: '',
      isOrganic: false,
      inStock: true,
    });
  };

  const handleSortSelect = (value: SortOption) => {
    setSortBy(value);
    setShowSort(false);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.category) count++;
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) count++;
    if (filters.isOrganic) count++;
    if (!filters.inStock) count++;
    if (filters.minRating) count++;
    return count;
  };

  const renderProduct = useCallback(
    ({ item }: { item: Product }) => <ProductCard product={item} />,
    []
  );

  const keyExtractor = useCallback((item: Product) => item._id, []);

  const getItemLayout = useCallback(
    (_data: ArrayLike<Product> | null | undefined, index: number) => ({
      length: 200,
      offset: 200 * Math.floor(index / 2),
      index,
    }),
    []
  );

  const renderEmpty = () => {
    if (isLoading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>📦</Text>
        <Text style={styles.emptyTitle}>Aucun produit trouvé</Text>
        <Text style={styles.emptyText}>
          Essayez de modifier vos filtres ou votre recherche
        </Text>
        <Button
          title="Réinitialiser les filtres"
          onPress={handleResetFilters}
          variant="outline"
          style={styles.resetButton}
        />
      </View>
    );
  };

  const renderFooter = () => {
    if (!isLoadingMore) return null;
    return (
      <View style={styles.loadingMore}>
        <ProductListSkeleton count={2} />
      </View>
    );
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Produits</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate('Search' )}>
            <Text style={styles.iconText}>🔍</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Filters & Sort Bar */}
      <View style={styles.filtersBar}>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(true)}>
          <Text style={styles.filterIcon}>🎛️</Text>
          <Text style={styles.filterText}>Filtres</Text>
          {activeFiltersCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.sortButton}
          onPress={() => setShowSort(true)}>
          <Text style={styles.sortIcon}>⬍</Text>
          <Text style={styles.sortText}>
            {SORT_OPTIONS.find(opt => opt.value === sortBy)?.label}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Products List */}
      {isLoading ? (
        <View style={styles.content}>
          <ProductListSkeleton count={6} />
        </View>
      ) : (
        <FlatList
          data={products}
          renderItem={renderProduct}
          keyExtractor={keyExtractor}
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
          getItemLayout={getItemLayout}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={5}
          initialNumToRender={6}
        />
      )}

      {/* Sort Modal */}
      <Modal
        visible={showSort}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSort(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowSort(false)}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Trier par</Text>
              <TouchableOpacity onPress={() => setShowSort(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            {SORT_OPTIONS.map(option => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.modalOption,
                  sortBy === option.value && styles.modalOptionActive,
                ]}
                onPress={() => handleSortSelect(option.value as SortOption)}>
                <Text
                  style={[
                    styles.modalOptionText,
                    sortBy === option.value && styles.modalOptionTextActive,
                  ]}>
                  {option.label}
                </Text>
                {sortBy === option.value && (
                  <Text style={styles.checkIcon}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Filters Modal */}
      <Modal
        visible={showFilters}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFilters(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowFilters(false)}>
          <View style={[styles.modalContent, styles.filtersModal]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filtres</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Category Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Catégorie</Text>
              {CATEGORIES.map(cat => (
                <TouchableOpacity
                  key={cat.value}
                  style={[
                    styles.modalOption,
                    filters.category === cat.value && styles.modalOptionActive,
                  ]}
                  onPress={() =>
                    setFilters(prev => ({ ...prev, category: cat.value }))
                  }>
                  <Text
                    style={[
                      styles.modalOptionText,
                      filters.category === cat.value &&
                        styles.modalOptionTextActive,
                    ]}>
                    {cat.label}
                  </Text>
                  {filters.category === cat.value && (
                    <Text style={styles.checkIcon}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Price Range Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Prix</Text>
              {PRICE_RANGES.map((range, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.modalOption,
                    filters.minPrice === range.min &&
                      filters.maxPrice === range.max &&
                      styles.modalOptionActive,
                  ]}
                  onPress={() =>
                    setFilters(prev => ({
                      ...prev,
                      minPrice: range.min,
                      maxPrice: range.max,
                    }))
                  }>
                  <Text
                    style={[
                      styles.modalOptionText,
                      filters.minPrice === range.min &&
                        filters.maxPrice === range.max &&
                        styles.modalOptionTextActive,
                    ]}>
                    {range.label}
                  </Text>
                  {filters.minPrice === range.min &&
                    filters.maxPrice === range.max && (
                      <Text style={styles.checkIcon}>✓</Text>
                    )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Other Filters */}
            <View style={styles.filterSection}>
              <TouchableOpacity
                style={styles.checkboxOption}
                onPress={() =>
                  setFilters(prev => ({ ...prev, isOrganic: !prev.isOrganic }))
                }>
                <View
                  style={[
                    styles.checkbox,
                    filters.isOrganic && styles.checkboxChecked,
                  ]}>
                  {filters.isOrganic && (
                    <Text style={styles.checkboxIcon}>✓</Text>
                  )}
                </View>
                <Text style={styles.checkboxLabel}>Produits bio uniquement</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.checkboxOption}
                onPress={() =>
                  setFilters(prev => ({ ...prev, inStock: !prev.inStock }))
                }>
                <View
                  style={[
                    styles.checkbox,
                    filters.inStock && styles.checkboxChecked,
                  ]}>
                  {filters.inStock && <Text style={styles.checkboxIcon}>✓</Text>}
                </View>
                <Text style={styles.checkboxLabel}>En stock uniquement</Text>
              </TouchableOpacity>
            </View>

            {/* Action Buttons */}
            <View style={styles.filterActions}>
              <Button
                title="Réinitialiser"
                onPress={handleResetFilters}
                variant="outline"
                style={styles.filterActionButton}
              />
              <Button
                title="Appliquer"
                onPress={handleApplyFilters}
                style={styles.filterActionButton}
              />
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
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
  headerRight: {
    width: 40,
    alignItems: 'flex-end',
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 20,
  },
  filtersBar: {
    flexDirection: 'row',
    padding: SPACING.md,
    gap: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterIcon: {
    fontSize: 16,
    marginRight: SPACING.xs,
  },
  filterText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.text.primary,
  },
  filterBadge: {
    marginLeft: SPACING.xs,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  filterBadgeText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text.white,
  },
  sortButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sortIcon: {
    fontSize: 16,
    marginRight: SPACING.xs,
  },
  sortText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.text.primary,
  },
  content: {
    flex: 1,
    padding: SPACING.lg,
  },
  productsList: {
    padding: SPACING.lg,
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
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.xl,
  },
  resetButton: {
    marginTop: SPACING.md,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    paddingBottom: SPACING.xl,
    maxHeight: '80%',
  },
  filtersModal: {
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text.primary,
  },
  modalClose: {
    fontSize: 24,
    color: COLORS.text.secondary,
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalOptionActive: {
    backgroundColor: `${COLORS.primary}10`,
  },
  modalOptionText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text.primary,
  },
  modalOptionTextActive: {
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  checkIcon: {
    fontSize: 20,
    color: COLORS.primary,
  },
  filterSection: {
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filterSectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text.secondary,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  checkboxOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.border,
    marginRight: SPACING.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkboxIcon: {
    fontSize: 16,
    color: COLORS.text.white,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  checkboxLabel: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text.primary,
  },
  filterActions: {
    flexDirection: 'row',
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  filterActionButton: {
    flex: 1,
  },
});

export default ProductListScreen;
