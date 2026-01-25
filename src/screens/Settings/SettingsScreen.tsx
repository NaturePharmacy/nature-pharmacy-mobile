/**
 * Settings Screen
 * User preferences and app configuration
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth, useSettings } from '../../hooks';
import { Card, Button } from '../../components';
import { COLORS, SPACING } from '../../utils/constants';
import type { SettingsScreenNavigationProp } from '@types';

export default function SettingsScreen() {
  const navigation = useNavigation<SettingsScreenNavigationProp>();
  const { user, logout } = useAuth();
  const {
    settings,
    isLoading: settingsLoading,
    updateNotificationSetting,
    updatePrivacySetting,
    updateLanguage,
    updateCurrency,
    clearCache,
  } = useSettings();

  const [loading, setLoading] = useState(false);

  const handleClearCache = useCallback(() => {
    Alert.alert(
      'Vider le cache',
      'Êtes-vous sûr de vouloir vider le cache de l\'application ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Vider',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            await clearCache();
            setLoading(false);
            Alert.alert('Succès', 'Le cache a été vidé');
          },
        },
      ]
    );
  }, [clearCache]);

  const handleDeleteAccount = useCallback(() => {
    Alert.alert(
      'Supprimer le compte',
      'Cette action est irréversible. Toutes vos données seront définitivement supprimées.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            // TODO: Call API to delete account
            Alert.alert(
              'Confirmation requise',
              'Un email de confirmation a été envoyé. Veuillez cliquer sur le lien pour confirmer la suppression.'
            );
          },
        },
      ]
    );
  }, []);

  const handleLogout = useCallback(() => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnexion',
          style: 'destructive',
          onPress: () => {
            logout();
            navigation.navigate('Login');
          },
        },
      ]
    );
  }, [logout, navigation]);

  const openURL = useCallback((url: string) => {
    Linking.openURL(url).catch(() => {
      Alert.alert('Erreur', 'Impossible d\'ouvrir le lien');
    });
  }, []);

  const renderSettingItem = useCallback((
    icon: string,
    title: string,
    subtitle?: string,
    onPress?: () => void,
    rightComponent?: React.ReactNode
  ) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      disabled={!onPress && !rightComponent}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.settingLeft}>
        <Text style={styles.settingIcon}>{icon}</Text>
        <View style={styles.settingInfo}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {rightComponent || (onPress && <Text style={styles.chevron}>›</Text>)}
    </TouchableOpacity>
  ), []);

  const navigateToProfile = useCallback(() => {
    navigation.navigate('Profile');
  }, [navigation]);

  const navigateToSupport = useCallback(() => {
    navigation.navigate('Support');
  }, [navigation]);

  const handleChangePassword = useCallback(() => {
    Alert.alert('Info', 'Fonctionnalité à venir');
  }, []);

  const handleRateApp = useCallback(() => {
    Alert.alert('Info', 'Merci pour votre soutien !');
  }, []);

  const openTerms = useCallback(() => openURL('https://naturepharmacy.com/terms'), [openURL]);
  const openPrivacy = useCallback(() => openURL('https://naturepharmacy.com/privacy'), [openURL]);
  const openCookies = useCallback(() => openURL('https://naturepharmacy.com/cookies'), [openURL]);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Paramètres</Text>
        <Text style={styles.headerSubtitle}>
          {user?.name || 'Gérer votre compte'}
        </Text>
      </View>

      {/* Account Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Compte</Text>
        <Card variant="elevated" padding="none">
          {renderSettingItem(
            '👤',
            'Profil',
            'Modifier vos informations personnelles',
            navigateToProfile
          )}
          {renderSettingItem(
            '📧',
            'Email',
            user?.email || 'Non défini',
            undefined
          )}
          {renderSettingItem(
            '🔒',
            'Mot de passe',
            'Modifier votre mot de passe',
            handleChangePassword
          )}
        </Card>
      </View>

      {/* Notifications Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <Card variant="elevated" padding="none">
          {renderSettingItem(
            '🔔',
            'Notifications push',
            'Recevoir les notifications sur votre appareil',
            undefined,
            <Switch
              value={settings.notifications.push}
              onValueChange={() => updateNotificationSetting('push')}
              trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
            />
          )}
          {renderSettingItem(
            '📬',
            'Notifications email',
            'Recevoir les notifications par email',
            undefined,
            <Switch
              value={settings.notifications.email}
              onValueChange={() => updateNotificationSetting('email')}
              trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
            />
          )}
          {renderSettingItem(
            '📦',
            'Mises à jour de commande',
            'Notifications sur l\'état de vos commandes',
            undefined,
            <Switch
              value={settings.notifications.orderUpdates}
              onValueChange={() => updateNotificationSetting('orderUpdates')}
              trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
            />
          )}
          {renderSettingItem(
            '🎁',
            'Promotions',
            'Recevoir les offres et promotions',
            undefined,
            <Switch
              value={settings.notifications.promotions}
              onValueChange={() => updateNotificationSetting('promotions')}
              trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
            />
          )}
        </Card>
      </View>

      {/* Preferences Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Préférences</Text>
        <Card variant="elevated" padding="none">
          {renderSettingItem(
            '🌍',
            'Langue',
            settings.preferences.language.toUpperCase(),
            updateLanguage
          )}
          {renderSettingItem(
            '💰',
            'Devise',
            settings.preferences.currency,
            updateCurrency
          )}
        </Card>
      </View>

      {/* Privacy Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Confidentialité</Text>
        <Card variant="elevated" padding="none">
          {renderSettingItem(
            '📊',
            'Analytiques',
            'Aider à améliorer l\'application',
            undefined,
            <Switch
              value={settings.privacy.analytics}
              onValueChange={() => updatePrivacySetting('analytics')}
              trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
            />
          )}
          {renderSettingItem(
            '🔗',
            'Partage de données',
            'Partager les données avec nos partenaires',
            undefined,
            <Switch
              value={settings.privacy.shareData}
              onValueChange={() => updatePrivacySetting('shareData')}
              trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
            />
          )}
        </Card>
      </View>

      {/* Legal Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Légal</Text>
        <Card variant="elevated" padding="none">
          {renderSettingItem(
            '📄',
            'Conditions d\'utilisation',
            undefined,
            openTerms
          )}
          {renderSettingItem(
            '🔐',
            'Politique de confidentialité',
            undefined,
            openPrivacy
          )}
          {renderSettingItem(
            '🍪',
            'Politique des cookies',
            undefined,
            openCookies
          )}
        </Card>
      </View>

      {/* About Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>À propos</Text>
        <Card variant="elevated" padding="none">
          {renderSettingItem('ℹ️', 'Version', '1.0.0', undefined)}
          {renderSettingItem(
            '💬',
            'Support',
            'Contacter l\'assistance',
            navigateToSupport
          )}
          {renderSettingItem(
            '⭐',
            'Évaluer l\'application',
            'Donnez-nous votre avis',
            handleRateApp
          )}
        </Card>
      </View>

      {/* Danger Zone */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, styles.dangerTitle]}>Zone dangereuse</Text>
        <Card variant="elevated" padding="none">
          {renderSettingItem(
            '🗑️',
            'Vider le cache',
            'Libérer de l\'espace de stockage',
            handleClearCache
          )}
          {renderSettingItem(
            '❌',
            'Supprimer le compte',
            'Supprimer définitivement votre compte',
            handleDeleteAccount
          )}
        </Card>
      </View>

      {/* Logout Button */}
      <View style={styles.footer}>
        <Button
          title="Déconnexion"
          onPress={handleLogout}
          variant="outline"
          size="large"
          loading={loading}
        />
      </View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: SPACING.lg,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  section: {
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dangerTitle: {
    color: COLORS.error,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    fontSize: 24,
    marginRight: SPACING.md,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  chevron: {
    fontSize: 24,
    color: COLORS.textSecondary,
    marginLeft: SPACING.sm,
  },
  footer: {
    marginTop: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  bottomSpacer: {
    height: SPACING.xl,
  },
});
