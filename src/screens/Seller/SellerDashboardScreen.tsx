/**
 * Seller Dashboard Screen
 * Tableau de bord vendeur avec statistiques et analytics
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppSelector } from '@store/store';
import { Card, Loading } from '@components';
import { orderService } from '@services/order.service';
import { logError } from '@utils/logger';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '@utils/constants';
import type { SellerDashboardScreenNavigationProp } from '@types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const STAT_CARD_WIDTH = (SCREEN_WIDTH - SPACING.lg * 3) / 2;

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  totalProducts: number;
  activeProducts: number;
  averageRating: number;
  totalReviews: number;
  conversionRate: number;
}

interface RecentOrder {
  _id: string;
  orderNumber: string;
  customer: string;
  total: number;
  status: string;
  createdAt: string;
}

const SellerDashboardScreen: React.FC = () => {
  const navigation = useNavigation<SellerDashboardScreenNavigationProp>();
  const { user } = useAppSelector(state => state.auth);

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');

  useEffect(() => {
    loadDashboardData();
  }, [selectedPeriod]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      // TODO: Call API to get seller stats
      // Simulated data for now
      const mockStats: DashboardStats = {
        totalRevenue: 12450.80,
        totalOrders: 156,
        pendingOrders: 8,
        totalProducts: 24,
        activeProducts: 22,
        averageRating: 4.7,
        totalReviews: 89,
        conversionRate: 3.2,
      };

      const mockOrders: RecentOrder[] = [
        {
          _id: '1',
          orderNumber: 'ORD-2024-001',
          customer: 'Marie Dupont',
          total: 89.90,
          status: 'pending',
          createdAt: new Date().toISOString(),
        },
        {
          _id: '2',
          orderNumber: 'ORD-2024-002',
          customer: 'Jean Martin',
          total: 145.50,
          status: 'processing',
          createdAt: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          _id: '3',
          orderNumber: 'ORD-2024-003',
          customer: 'Sophie Bernard',
          total: 67.20,
          status: 'shipped',
          createdAt: new Date(Date.now() - 7200000).toISOString(),
        },
      ];

      setStats(mockStats);
      setRecentOrders(mockOrders);
    } catch (error) {
      logError('Error loading dashboard', error, 'SellerDashboardScreen');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadDashboardData();
    setIsRefreshing(false);
  };

  const formatCurrency = (amount: number): string => {
    return `${amount.toFixed(2)} €`;
  };

  const getStatusColor = (status: string): string => {
    const colors: { [key: string]: string } = {
      pending: COLORS.warning,
      processing: COLORS.info,
      shipped: COLORS.primary,
      delivered: COLORS.success,
      cancelled: COLORS.error,
    };
    return colors[status] || COLORS.text.secondary;
  };

  const getStatusLabel = (status: string): string => {
    const labels: { [key: string]: string } = {
      pending: 'En attente',
      processing: 'En cours',
      shipped: 'Expédié',
      delivered: 'Livré',
      cancelled: 'Annulé',
    };
    return labels[status] || status;
  };

  const renderStatCard = (
    title: string,
    value: string | number,
    icon: string,
    color: string,
    subtitle?: string
  ) => (
    <Card variant="elevated" padding="medium" style={styles.statCard}>
      <View style={styles.statHeader}>
        <View style={[styles.statIcon, { backgroundColor: `${color}20` }]}>
          <Text style={styles.statIconText}>{icon}</Text>
        </View>
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </Card>
  );

  const renderPeriodButton = (period: typeof selectedPeriod, label: string) => (
    <TouchableOpacity
      key={period}
      style={[
        styles.periodButton,
        selectedPeriod === period && styles.periodButtonActive,
      ]}
      onPress={() => setSelectedPeriod(period)}>
      <Text
        style={[
          styles.periodButtonText,
          selectedPeriod === period && styles.periodButtonTextActive,
        ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  if (isLoading || !stats) {
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
        <View>
          <Text style={styles.greeting}>Bonjour {user?.name} 👋</Text>
          <Text style={styles.subtitle}>Tableau de bord vendeur</Text>
        </View>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => navigation.navigate('SellerSettings' )}>
          <Text style={styles.settingsIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }>
        {/* Period Filter */}
        <View style={styles.periodFilter}>
          {renderPeriodButton('week', 'Semaine')}
          {renderPeriodButton('month', 'Mois')}
          {renderPeriodButton('year', 'Année')}
        </View>

        {/* Main Stats */}
        <View style={styles.statsGrid}>
          {renderStatCard(
            'Revenus',
            formatCurrency(stats.totalRevenue),
            '💰',
            COLORS.success,
            '+12% vs mois dernier'
          )}
          {renderStatCard(
            'Commandes',
            stats.totalOrders.toString(),
            '📦',
            COLORS.primary,
            `${stats.pendingOrders} en attente`
          )}
          {renderStatCard(
            'Produits',
            stats.totalProducts.toString(),
            '🏷️',
            COLORS.info,
            `${stats.activeProducts} actifs`
          )}
          {renderStatCard(
            'Note moyenne',
            stats.averageRating.toFixed(1),
            '⭐',
            COLORS.warning,
            `${stats.totalReviews} avis`
          )}
        </View>

        {/* Quick Actions */}
        <Card variant="outlined" padding="medium" style={styles.section}>
          <Text style={styles.sectionTitle}>Actions rapides</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('SellerProducts' , { action: 'add' } )}>
              <View style={[styles.actionIcon, { backgroundColor: `${COLORS.primary}20` }]}>
                <Text style={styles.actionIconText}>+</Text>
              </View>
              <Text style={styles.actionLabel}>Ajouter produit</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('SellerOrders' )}>
              <View style={[styles.actionIcon, { backgroundColor: `${COLORS.warning}20` }]}>
                <Text style={styles.actionIconText}>📋</Text>
              </View>
              <Text style={styles.actionLabel}>Commandes</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('SellerProducts' )}>
              <View style={[styles.actionIcon, { backgroundColor: `${COLORS.info}20` }]}>
                <Text style={styles.actionIconText}>📦</Text>
              </View>
              <Text style={styles.actionLabel}>Mes produits</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('SellerAnalytics' )}>
              <View style={[styles.actionIcon, { backgroundColor: `${COLORS.secondary}20` }]}>
                <Text style={styles.actionIconText}>📊</Text>
              </View>
              <Text style={styles.actionLabel}>Analytics</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Recent Orders */}
        <Card variant="outlined" padding="medium" style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Commandes récentes</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('SellerOrders' )}>
              <Text style={styles.seeAllText}>Voir tout</Text>
            </TouchableOpacity>
          </View>

          {recentOrders.map((order, index) => (
            <TouchableOpacity
              key={order._id}
              style={[
                styles.orderItem,
                index < recentOrders.length - 1 && styles.orderItemBorder,
              ]}
              onPress={() =>
                navigation.navigate('OrderDetail' , { orderId: order._id } )
              }>
              <View style={styles.orderInfo}>
                <Text style={styles.orderNumber}>{order.orderNumber}</Text>
                <Text style={styles.orderCustomer}>{order.customer}</Text>
                <View style={styles.orderMeta}>
                  <View
                    style={[
                      styles.orderStatus,
                      { backgroundColor: `${getStatusColor(order.status)}20` },
                    ]}>
                    <Text
                      style={[
                        styles.orderStatusText,
                        { color: getStatusColor(order.status) },
                      ]}>
                      {getStatusLabel(order.status)}
                    </Text>
                  </View>
                  <Text style={styles.orderTime}>
                    {new Date(order.createdAt).toLocaleTimeString('fr-FR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>
              </View>
              <Text style={styles.orderTotal}>{formatCurrency(order.total)}</Text>
            </TouchableOpacity>
          ))}
        </Card>

        {/* Performance Metrics */}
        <Card variant="outlined" padding="medium" style={styles.section}>
          <Text style={styles.sectionTitle}>Performance</Text>

          <View style={styles.metricRow}>
            <View style={styles.metricLeft}>
              <Text style={styles.metricLabel}>Taux de conversion</Text>
              <Text style={styles.metricValue}>{stats.conversionRate}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${stats.conversionRate * 10}%` },
                ]}
              />
            </View>
          </View>

          <View style={styles.metricRow}>
            <View style={styles.metricLeft}>
              <Text style={styles.metricLabel}>Panier moyen</Text>
              <Text style={styles.metricValue}>
                {formatCurrency(stats.totalRevenue / stats.totalOrders)}
              </Text>
            </View>
            <Text style={styles.metricChange}>+8%</Text>
          </View>

          <View style={styles.metricRow}>
            <View style={styles.metricLeft}>
              <Text style={styles.metricLabel}>Taux de satisfaction</Text>
              <Text style={styles.metricValue}>
                {((stats.averageRating / 5) * 100).toFixed(0)}%
              </Text>
            </View>
            <Text style={styles.metricChange}>+2%</Text>
          </View>
        </Card>

        <View style={styles.bottomSpacer} />
      </ScrollView>
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
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  greeting: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
  },
  settingsButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsIcon: {
    fontSize: 24,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  periodFilter: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  periodButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  periodButtonText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.text.primary,
  },
  periodButtonTextActive: {
    color: COLORS.text.white,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  statCard: {
    width: STAT_CARD_WIDTH,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statIconText: {
    fontSize: 20,
  },
  statValue: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  statTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
    marginBottom: 2,
  },
  statSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.success,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text.primary,
  },
  seeAllText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    alignItems: 'center',
    flex: 1,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  actionIconText: {
    fontSize: 24,
  },
  actionLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.text.primary,
    textAlign: 'center',
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  orderItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  orderInfo: {
    flex: 1,
  },
  orderNumber: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  orderCustomer: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs,
  },
  orderMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  orderStatus: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  orderStatusText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  orderTime: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.text.secondary,
  },
  orderTotal: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.primary,
    marginLeft: SPACING.md,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  metricLeft: {
    flex: 1,
  },
  metricLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs,
  },
  metricValue: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text.primary,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: COLORS.surface,
    borderRadius: 4,
    marginLeft: SPACING.md,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.success,
    borderRadius: 4,
  },
  metricChange: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.success,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  bottomSpacer: {
    height: SPACING.xl,
  },
});

export default SellerDashboardScreen;
