/**
 * Search Screen
 * Recherche de produits avec suggestions et historique
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ProductCard, Card } from '@components';
import { productService } from '@services/product.service';
import { logError } from '@utils/logger';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '@utils/constants';
import type { Product, SearchScreenNavigationProp } from '@types';

const SEARCH_HISTORY_KEY = '@search_history';
const MAX_HISTORY_ITEMS = 10;

const POPULAR_SEARCHES = [
  'Huile essentielle lavande',
  'Thé vert bio',
  'Curcuma',
  'Spiruline',
  'Huile de coco',
  'Ginseng',
  'Camomille',
  'Gingembre',
];

const CATEGORIES = [
  { id: '1', name: 'Plantes', icon: '🌿', slug: 'plantes' },
  { id: '2', name: 'Huiles', icon: '🧴', slug: 'huiles' },
  { id: '3', name: 'Thés', icon: '🍵', slug: 'thes' },
  { id: '4', name: 'Épices', icon: '🌶️', slug: 'epices' },
];

const SearchScreen: React.FC = () => {
  const navigation = useNavigation<SearchScreenNavigationProp>();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    loadSearchHistory();
  }, []);

  useEffect(() => {
    if (searchQuery.length > 0) {
      const timer = setTimeout(() => {
        handleSearch(searchQuery);
      }, 500); // Debounce 500ms

      return () => clearTimeout(timer);
    } else {
      setShowResults(false);
      setSuggestions([]);
    }
  }, [searchQuery]);

  const loadSearchHistory = async () => {
    try {
      const history = await AsyncStorage.getItem(SEARCH_HISTORY_KEY);
      if (history) {
        setSearchHistory(JSON.parse(history));
      }
    } catch (error) {
      logError('Error loading search history', error, 'SearchScreen');
    }
  };

  const saveSearchHistory = async (query: string) => {
    try {
      const newHistory = [query, ...searchHistory.filter(item => item !== query)].slice(
        0,
        MAX_HISTORY_ITEMS
      );
      setSearchHistory(newHistory);
      await AsyncStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
    } catch (error) {
      logError('Error saving search history', error, 'SearchScreen');
    }
  };

  const clearSearchHistory = async () => {
    try {
      setSearchHistory([]);
      await AsyncStorage.removeItem(SEARCH_HISTORY_KEY);
    } catch (error) {
      logError('Error clearing search history', error, 'SearchScreen');
    }
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setShowResults(false);
      return;
    }

    try {
      setIsSearching(true);
      const results = await productService.searchProducts(query);
      setSearchResults(results.items);
      setShowResults(true);

      // Generate suggestions based on search results
      const productNames = results.items.slice(0, 5).map(p => p.name);
      setSuggestions(productNames);
    } catch (error) {
      logError('Error searching products', error, 'SearchScreen');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchSubmit = (query: string) => {
    if (query.trim()) {
      saveSearchHistory(query.trim());
      handleSearch(query.trim());
    }
  };

  const handleSuggestionPress = (suggestion: string) => {
    setSearchQuery(suggestion);
    handleSearchSubmit(suggestion);
  };

  const handleCategoryPress = (categorySlug: string) => {
    navigation.navigate('ProductList' , { category: categorySlug } );
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <ProductCard product={item} />
  );

  const renderSuggestion = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => handleSuggestionPress(item)}>
      <Text style={styles.suggestionIcon}>🔍</Text>
      <Text style={styles.suggestionText} numberOfLines={1}>
        {item}
      </Text>
    </TouchableOpacity>
  );

  const renderHistoryItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={styles.historyItem}
      onPress={() => handleSuggestionPress(item)}>
      <Text style={styles.historyIcon}>🕐</Text>
      <Text style={styles.historyText}>{item}</Text>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => {
          const newHistory = searchHistory.filter(h => h !== item);
          setSearchHistory(newHistory);
          AsyncStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
        }}>
        <Text style={styles.removeIcon}>✕</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderPopularSearch = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={styles.popularChip}
      onPress={() => handleSuggestionPress(item)}>
      <Text style={styles.popularText}>{item}</Text>
    </TouchableOpacity>
  );

  const renderCategory = ({ item }: { item: typeof CATEGORIES[0] }) => (
    <TouchableOpacity
      style={styles.categoryCard}
      onPress={() => handleCategoryPress(item.slug)}>
      <Text style={styles.categoryIcon}>{item.icon}</Text>
      <Text style={styles.categoryName}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header with Search Bar */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>

        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un produit..."
            placeholderTextColor={COLORS.text.secondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={() => handleSearchSubmit(searchQuery)}
            autoFocus
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => setSearchQuery('')}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
          {isSearching && (
            <ActivityIndicator size="small" color={COLORS.primary} />
          )}
        </View>
      </View>

      {/* Content */}
      {showResults ? (
        // Search Results
        <View style={styles.content}>
          {searchResults.length > 0 ? (
            <>
              <Text style={styles.resultsCount}>
                {searchResults.length} résultat{searchResults.length > 1 ? 's' : ''}{' '}
                pour "{searchQuery}"
              </Text>
              <FlatList
                data={searchResults}
                renderItem={renderProduct}
                keyExtractor={item => item._id}
                numColumns={2}
                columnWrapperStyle={styles.row}
                contentContainerStyle={styles.productsList}
                showsVerticalScrollIndicator={false}
              />
            </>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={styles.emptyTitle}>Aucun résultat</Text>
              <Text style={styles.emptyText}>
                Aucun produit ne correspond à votre recherche "{searchQuery}"
              </Text>
            </View>
          )}
        </View>
      ) : (
        // Search Suggestions & History
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          {/* Suggestions (when typing) */}
          {searchQuery.length > 0 && suggestions.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Suggestions</Text>
              <Card variant="outlined" padding="none">
                <FlatList
                  data={suggestions}
                  renderItem={renderSuggestion}
                  keyExtractor={(item, index) => index.toString()}
                  scrollEnabled={false}
                />
              </Card>
            </View>
          )}

          {/* Search History */}
          {searchHistory.length > 0 && searchQuery.length === 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recherches récentes</Text>
                <TouchableOpacity onPress={clearSearchHistory}>
                  <Text style={styles.clearHistoryText}>Effacer</Text>
                </TouchableOpacity>
              </View>
              <Card variant="outlined" padding="none">
                <FlatList
                  data={searchHistory}
                  renderItem={renderHistoryItem}
                  keyExtractor={(item, index) => index.toString()}
                  scrollEnabled={false}
                />
              </Card>
            </View>
          )}

          {/* Popular Searches */}
          {searchQuery.length === 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Recherches populaires</Text>
              <FlatList
                data={POPULAR_SEARCHES}
                renderItem={renderPopularSearch}
                keyExtractor={(item, index) => index.toString()}
                numColumns={2}
                columnWrapperStyle={styles.popularRow}
                scrollEnabled={false}
              />
            </View>
          )}

          {/* Categories */}
          {searchQuery.length === 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Parcourir par catégorie</Text>
              <FlatList
                data={CATEGORIES}
                renderItem={renderCategory}
                keyExtractor={item => item.id}
                numColumns={2}
                columnWrapperStyle={styles.categoriesRow}
                scrollEnabled={false}
              />
            </View>
          )}
        </ScrollView>
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
    padding: SPACING.lg,
    paddingTop: SPACING.xl,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: SPACING.sm,
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
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchIcon: {
    fontSize: 20,
    marginRight: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text.primary,
  },
  clearButton: {
    padding: SPACING.xs,
    marginLeft: SPACING.xs,
  },
  clearIcon: {
    fontSize: 18,
    color: COLORS.text.secondary,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  resultsCount: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  productsList: {
    padding: SPACING.lg,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
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
  section: {
    marginBottom: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.sm,
  },
  clearHistoryText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  suggestionIcon: {
    fontSize: 18,
    marginRight: SPACING.md,
  },
  suggestionText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text.primary,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  historyIcon: {
    fontSize: 18,
    marginRight: SPACING.md,
  },
  historyText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text.primary,
  },
  removeButton: {
    padding: SPACING.xs,
  },
  removeIcon: {
    fontSize: 18,
    color: COLORS.text.secondary,
  },
  popularRow: {
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  popularChip: {
    flex: 1,
    marginHorizontal: SPACING.xs,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  popularText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.primary,
    textAlign: 'center',
  },
  categoriesRow: {
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  categoryCard: {
    flex: 1,
    marginHorizontal: SPACING.xs,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  categoryIcon: {
    fontSize: 32,
    marginBottom: SPACING.sm,
  },
  categoryName: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.text.primary,
  },
});

export default SearchScreen;
