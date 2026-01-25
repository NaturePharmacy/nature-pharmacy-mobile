/**
 * Profile Screen
 */

import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '@store/store';
import { logout } from '@store/slices/authSlice';
import { Card } from '@components';
import { logError } from '@utils/logger';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '@utils/constants';
import type { ProfileScreenNavigationProp, MainStackParamList } from '@types';

interface MenuItem {
  id: string;
  icon: string;
  title: string;
  subtitle?: string;
  screen?: keyof MainStackParamList;
  action?: () => void;
  danger?: boolean;
}

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);

  const handleLogout = useCallback(() => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnexion',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(logout()).unwrap();
            } catch (error) {
              logError('Logout error', error, 'ProfileScreen');
            }
          },
        },
      ]
    );
  }, [dispatch]);

  const accountMenuItems: MenuItem[] = [
    {
      id: '1',
      icon: '👤',
      title: 'Informations personnelles',
      subtitle: 'Nom, email, téléphone',
      screen: 'EditProfile',
    },
    {
      id: '2',
      icon: '📍',
      title: 'Adresses',
      subtitle: 'Gérer vos adresses de livraison',
      screen: 'Addresses',
    },
    {
      id: '3',
      icon: '🔒',
      title: 'Sécurité',
      subtitle: 'Mot de passe et authentification',
      screen: 'Security',
    },
  ];

  const orderMenuItems: MenuItem[] = [
    {
      id: '4',
      icon: '📦',
      title: 'Mes commandes',
      subtitle: 'Historique et suivi',
      screen: 'Orders',
    },
    {
      id: '5',
      icon: '❤️',
      title: 'Favoris',
      subtitle: 'Produits sauvegardés',
      screen: 'Favorites',
    },
  ];

  const appMenuItems: MenuItem[] = [
    {
      id: '6',
      icon: '⚙️',
      title: 'Paramètres',
      subtitle: 'Notifications et préférences',
      screen: 'Settings',
    },
    {
      id: '7',
      icon: '❓',
      title: "Centre d'aide",
      subtitle: 'FAQ et support',
      screen: 'Help',
    },
    {
      id: '8',
      icon: '📄',
      title: 'Conditions et confidentialité',
      screen: 'Terms',
    },
  ];

  const handleMenuPress = useCallback((item: MenuItem) => {
    if (item.action) {
      item.action();
    } else if (item.screen) {
      navigation.navigate(item.screen, undefined as any);
    }
  }, [navigation]);

  const renderMenuItem = useCallback((item: MenuItem) => (
    <TouchableOpacity
      key={item.id}
      style={[styles.menuItem, item.danger && styles.menuItemDanger]}
      onPress={() => handleMenuPress(item)}
      activeOpacity={0.7}>
      <View style={styles.menuItemContent}>
        <Text style={styles.menuIcon}>{item.icon}</Text>
        <View style={styles.menuTextContainer}>
          <Text
            style={[
              styles.menuTitle,
              item.danger && styles.menuTitleDanger,
            ]}>
            {item.title}
          </Text>
          {item.subtitle && (
            <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
          )}
        </View>
      </View>
      <Text style={styles.menuArrow}>›</Text>
    </TouchableOpacity>
  ), [handleMenuPress]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Mon Profil</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* User Info Card */}
        <Card variant="elevated" padding="medium" style={styles.userCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
          </View>

          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.name || 'Utilisateur'}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>
                {user?.role === 'seller' ? '🏪 Vendeur' : '🛍️ Acheteur'}
              </Text>
            </View>
          </View>
        </Card>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mon Compte</Text>
          <Card variant="outlined" padding="none" style={styles.menuCard}>
            {accountMenuItems.map(renderMenuItem)}
          </Card>
        </View>

        {/* Orders Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mes Achats</Text>
          <Card variant="outlined" padding="none" style={styles.menuCard}>
            {orderMenuItems.map(renderMenuItem)}
          </Card>
        </View>

        {/* App Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Application</Text>
          <Card variant="outlined" padding="none" style={styles.menuCard}>
            {appMenuItems.map(renderMenuItem)}
          </Card>
        </View>

        {/* Seller Section (if user is seller) */}
        {user?.role === 'seller' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Espace Vendeur</Text>
            <Card variant="outlined" padding="none" style={styles.menuCard}>
              {renderMenuItem({
                id: 'seller-1',
                icon: '📊',
                title: 'Tableau de bord',
                subtitle: 'Ventes et statistiques',
                screen: 'SellerDashboard',
              })}
              {renderMenuItem({
                id: 'seller-2',
                icon: '📦',
                title: 'Mes produits',
                subtitle: 'Gérer mon catalogue',
                screen: 'SellerProducts',
              })}
              {renderMenuItem({
                id: 'seller-3',
                icon: '💰',
                title: 'Paiements',
                subtitle: 'Revenus et virements',
                screen: 'SellerPayments',
              })}
            </Card>
          </View>
        )}

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.7}>
          <Text style={styles.logoutIcon}>🚪</Text>
          <Text style={styles.logoutText}>Se déconnecter</Text>
        </TouchableOpacity>

        {/* App Version */}
        <Text style={styles.version}>Version 0.2.0</Text>

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
    padding: SPACING.lg,
    paddingTop: SPACING.xl,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text.primary,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
  },
  userCard: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  avatarContainer: {
    marginBottom: SPACING.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text.white,
  },
  userInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  userEmail: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text.secondary,
    marginBottom: SPACING.sm,
  },
  roleB <bge: {
    backgroundColor: `${COLORS.primary}15`,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
  },
  roleText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text.secondary,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  menuCard: {
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  menuItemDanger: {
    backgroundColor: `${COLORS.error}05`,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    fontSize: 24,
    marginRight: SPACING.md,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  menuTitleDanger: {
    color: COLORS.error,
  },
  menuSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
  },
  menuArrow: {
    fontSize: 24,
    color: COLORS.text.secondary,
    marginLeft: SPACING.sm,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${COLORS.error}15`,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: `${COLORS.error}30`,
  },
  logoutIcon: {
    fontSize: 20,
    marginRight: SPACING.sm,
  },
  logoutText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.error,
  },
  version: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  bottomSpacer: {
    height: SPACING.xl,
  },
});

export default ProfileScreen;
