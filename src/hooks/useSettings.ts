/**
 * useSettings Hook
 * Manages user settings persistence with AsyncStorage
 */

import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { logError } from '../utils/logger';

export interface SettingsState {
  notifications: {
    push: boolean;
    email: boolean;
    orderUpdates: boolean;
    promotions: boolean;
  };
  preferences: {
    language: 'fr' | 'en' | 'es';
    currency: 'EUR' | 'USD' | 'XOF';
    darkMode: boolean;
  };
  privacy: {
    shareData: boolean;
    analytics: boolean;
  };
}

const SETTINGS_KEY = '@settings';

const DEFAULT_SETTINGS: SettingsState = {
  notifications: {
    push: true,
    email: true,
    orderUpdates: true,
    promotions: false,
  },
  preferences: {
    language: 'fr',
    currency: 'EUR',
    darkMode: false,
  },
  privacy: {
    shareData: false,
    analytics: true,
  },
};

interface UseSettingsReturn {
  settings: SettingsState;
  loading: boolean;
  updateNotificationSetting: (key: keyof SettingsState['notifications']) => void;
  updatePrivacySetting: (key: keyof SettingsState['privacy']) => void;
  updateLanguage: (language: SettingsState['preferences']['language']) => void;
  updateCurrency: (currency: SettingsState['preferences']['currency']) => void;
  toggleDarkMode: () => void;
  clearCache: () => Promise<void>;
}

export function useSettings(): UseSettingsReturn {
  const [settings, setSettings] = useState<SettingsState>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(false);

  // Load settings from AsyncStorage
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const stored = await AsyncStorage.getItem(SETTINGS_KEY);
        if (stored) {
          setSettings(JSON.parse(stored));
        }
      } catch (error) {
        logError('Failed to load settings', error, 'useSettings');
      }
    };
    loadSettings();
  }, []);

  const saveSettings = useCallback(async (newSettings: SettingsState) => {
    try {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      logError('Failed to save settings', error, 'useSettings');
      Alert.alert('Erreur', 'Impossible de sauvegarder les paramètres');
    }
  }, []);

  const updateNotificationSetting = useCallback(
    (key: keyof SettingsState['notifications']) => {
      const newSettings = {
        ...settings,
        notifications: {
          ...settings.notifications,
          [key]: !settings.notifications[key],
        },
      };
      saveSettings(newSettings);
    },
    [settings, saveSettings]
  );

  const updatePrivacySetting = useCallback(
    (key: keyof SettingsState['privacy']) => {
      const newSettings = {
        ...settings,
        privacy: {
          ...settings.privacy,
          [key]: !settings.privacy[key],
        },
      };
      saveSettings(newSettings);
    },
    [settings, saveSettings]
  );

  const updateLanguage = useCallback(
    (language: SettingsState['preferences']['language']) => {
      const newSettings = {
        ...settings,
        preferences: { ...settings.preferences, language },
      };
      saveSettings(newSettings);
    },
    [settings, saveSettings]
  );

  const updateCurrency = useCallback(
    (currency: SettingsState['preferences']['currency']) => {
      const newSettings = {
        ...settings,
        preferences: { ...settings.preferences, currency },
      };
      saveSettings(newSettings);
    },
    [settings, saveSettings]
  );

  const toggleDarkMode = useCallback(() => {
    const newSettings = {
      ...settings,
      preferences: {
        ...settings.preferences,
        darkMode: !settings.preferences.darkMode,
      },
    };
    saveSettings(newSettings);
  }, [settings, saveSettings]);

  const clearCache = useCallback(async () => {
    try {
      setLoading(true);
      await AsyncStorage.multiRemove(['@search_history', '@recent_views']);
      Alert.alert('Succès', 'Le cache a été vidé');
    } catch (error) {
      logError('Failed to clear cache', error, 'useSettings');
      Alert.alert('Erreur', 'Impossible de vider le cache');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    settings,
    loading,
    updateNotificationSetting,
    updatePrivacySetting,
    updateLanguage,
    updateCurrency,
    toggleDarkMode,
    clearCache,
  };
}
