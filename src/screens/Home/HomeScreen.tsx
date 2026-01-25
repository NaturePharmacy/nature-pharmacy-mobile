/**
 * Home Screen
 */

import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppSelector } from '@store/store';
import { ProductCard, ProductListSkeleton } from '@components';
import { useHomeProducts } from '@hooks';
import { COLORS, SPACING, TYPOGRAPHY } from '@utils/constants';
import type { HomeScreenNavigationProp } from '@types';

interface Category {
  id: string;
  name: string;
  icon: string;
  slug: string;
}

const CATEGORIES: Category[] = [
  { id: '1', name: 'Plantes', icon: '🌿', slug: 'plantes' },
  { id: '2', name: 'Huiles', icon: '🧴', slug: 'huiles' },
  { id: '3', name: 'Thés', icon: '🍵', slug: 'thes' },
  { id: '4', name: 'Épices', icon: '🌶️', slug: 'epices' },
  { id: '5', name: 'Compléments', icon: '💊', slug: 'complements' },
  { id: '6', name: 'Cosmétiques', icon: '💄', slug: 'cosmetiques' },
];

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { user } = useAppSelector(state => state.auth);

  const {
    featuredProducts,
    recentProducts,
    isLoading,
    isRefreshing,
    refresh,
  } = useHomeProducts();

  const handleCategoryPress = useCallback((category: Category) => {
    navigation.navigate('Categories', { category: category.slug });
  }, [navigation]);

  const renderCategoryItem = useCallback(({ item }: { item: Category }) => (
    <TouchableOpacity
      style={styles.categoryItem}
      onPress={() => handleCategoryPress(item)}>
      <View style={styles.categoryIconContainer}>
        <Text style={styles.categoryIcon}>{item.icon}</Text>
      </View>
      <Text style={styles.categoryName}>{item.name}</Text>
    </TouchableOpacity>
  ), [handleCategoryPress]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Bienvenue 👋</Text>
        </View>
        <ProductListSkeleton count={4} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={refresh} />
      }>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>
            Bonjour {user?.name?.split(' ')[0] || 'Visiteur'} 👋
          </Text>
          <Text style={styles.subtitle}>Découvrez nos produits naturels</Text>
        </View>
      </View>

      {/* Search Bar */}
      <TouchableOpacity
        style={styles.searchBar}
        onPress={() => navigation.navigate('Search', { query: undefined })}>
        <Text style={styles.searchIcon}>🔍</Text>
        <Text style={styles.searchPlaceholder}>
          Rechercher un produit...
        </Text>
      </TouchableOpacity>

      {/* Categories */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Catégories</Text>
        <FlatList
          data={CATEGORIES}
          renderItem={renderCategoryItem}
          keyExtractor={item => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        />
      </View>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Produits en vedette ⭐</Text>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('ProductList', { featured: true })
              }>
              <Text style={styles.seeAll}>Voir tout</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.productsScroll}>
            {featuredProducts.slice(0, 5).map(product => (
              <View key={product._id} style={styles.featuredProductCard}>
                <ProductCard product={product} />
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Recent Products */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Nouveautés 🆕</Text>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('ProductList', { recent: true })
            }>
            <Text style={styles.seeAll}>Voir tout</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.productsGrid}>
          {recentProducts.slice(0, 6).map(product => (
            <ProductCard key={product._id} product={product} />
          ))}
        </View>
      </View>

      {/* Promotional Banner */}
      <TouchableOpacity style={styles.promoBanner}>
        <View style={styles.promoContent}>
          <Text style={styles.promoIcon}>🎁</Text>
          <View style={styles.promoTextContainer}>
            <Text style={styles.promoTitle}>Livraison gratuite</Text>
            <Text style={styles.promoSubtitle}>
              Sur toutes les commandes de plus de 50€
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Bio Section */}
      <View style={styles.bioSection}>
        <Text style={styles.bioIcon}>🌱</Text>
        <Text style={styles.bioTitle}>100% Naturel & Bio</Text>
        <Text style={styles.bioText}>
          Tous nos produits sont certifiés biologiques et issus de l'agriculture
          durable
        </Text>
      </View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
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
  greeting: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text.secondary,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    padding: SPACING.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchIcon: {
    fontSize: 20,
    marginRight: SPACING.sm,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text.secondary,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text.primary,
  },
  seeAll: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  categoriesList: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  categoryIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  categoryIcon: {
    fontSize: 32,
  },
  categoryName: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.primary,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  productsScroll: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
  },
  featuredProductCard: {
    width: 180,
    marginRight: SPACING.md,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.lg,
    justifyContent: 'space-between',
  },
  promoBanner: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: SPACING.lg,
  },
  promoContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  promoIcon: {
    fontSize: 48,
    marginRight: SPACING.md,
  },
  promoTextContainer: {
    flex: 1,
  },
  promoTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text.white,
    marginBottom: SPACING.xs,
  },
  promoSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.white,
    opacity: 0.9,
  },
  bioSection: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
    backgroundColor: `${COLORS.success}15`,
    borderRadius: 16,
    padding: SPACING.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: `${COLORS.success}30`,
  },
  bioIcon: {
    fontSize: 48,
    marginBottom: SPACING.sm,
  },
  bioTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  bioText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  bottomSpacer: {
    height: SPACING.xl,
  },
});

export default HomeScreen;
