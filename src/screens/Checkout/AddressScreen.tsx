/**
 * Address Management Screen
 * Création et modification d'adresses de livraison
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Button, Input, Card } from '@components';
import { logError } from '@utils/logger';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '@utils/constants';
import type { Address, AddressScreenNavigationProp, AddressScreenRouteProp } from '@types';

const AddressScreen: React.FC = () => {
  const navigation = useNavigation<AddressScreenNavigationProp>();
  const route = useRoute<AddressScreenRouteProp>();

  const existingAddress = route.params?.address;
  const onSave = route.params?.onSave;

  const [formData, setFormData] = useState<Omit<Address, '_id'>>({
    fullName: existingAddress?.fullName || '',
    phone: existingAddress?.phone || '',
    street: existingAddress?.street || '',
    city: existingAddress?.city || '',
    state: existingAddress?.state || '',
    postalCode: existingAddress?.postalCode || '',
    country: existingAddress?.country || 'France',
    isDefault: existingAddress?.isDefault || false,
  });

  const [errors, setErrors] = useState<{
    fullName?: string;
    phone?: string;
    street?: string;
    city?: string;
    postalCode?: string;
  }>({});

  const validateForm = useCallback((): boolean => {
    const newErrors: { fullName?: string; phone?: string; street?: string; city?: string; postalCode?: string } = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Nom complet requis';
    } else if (formData.fullName.trim().length < 3) {
      newErrors.fullName = 'Minimum 3 caractères';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Téléphone requis';
    } else if (!/^[0-9]{10}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Numéro invalide (10 chiffres)';
    }

    if (!formData.street.trim()) {
      newErrors.street = 'Adresse requise';
    } else if (formData.street.trim().length < 5) {
      newErrors.street = 'Adresse trop courte';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'Ville requise';
    }

    if (!formData.postalCode.trim()) {
      newErrors.postalCode = 'Code postal requis';
    } else if (!/^[0-9]{5}$/.test(formData.postalCode)) {
      newErrors.postalCode = 'Code postal invalide (5 chiffres)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSave = useCallback(async () => {
    if (!validateForm()) return;

    try {
      // TODO: Call API to save address
      const savedAddress: Address = {
        _id: existingAddress?._id || Date.now().toString(),
        ...formData,
      };

      Alert.alert(
        'Succès',
        existingAddress
          ? 'Adresse modifiée avec succès'
          : 'Adresse ajoutée avec succès',
        [
          {
            text: 'OK',
            onPress: () => {
              if (onSave) {
                onSave(savedAddress);
              }
              navigation.goBack();
            },
          },
        ]
      );
    } catch (error) {
      logError('Error saving address', error, 'AddressScreen');
      Alert.alert('Erreur', "Impossible d'enregistrer l'adresse");
    }
  }, [validateForm, existingAddress, formData, onSave, navigation]);

  const updateField = useCallback((field: keyof typeof formData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (typeof value === 'string' && errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const toggleDefault = useCallback(() => {
    updateField('isDefault', !formData.isDefault);
  }, [updateField, formData.isDefault]);

  const isEditing = useMemo(() => !!existingAddress, [existingAddress]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleGoBack}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>
          {existingAddress ? 'Modifier l\'adresse' : 'Nouvelle adresse'}
        </Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        {/* Contact Info */}
        <Card variant="outlined" padding="medium" style={styles.section}>
          <Text style={styles.sectionTitle}>Informations de contact</Text>

          <Input
            label="Nom complet *"
            value={formData.fullName}
            onChangeText={text => updateField('fullName', text)}
            placeholder="Jean Dupont"
            autoCapitalize="words"
            error={errors.fullName}
            leftIcon={<Text style={styles.inputIcon}>👤</Text>}
          />

          <Input
            label="Téléphone *"
            value={formData.phone}
            onChangeText={text => updateField('phone', text)}
            placeholder="06 12 34 56 78"
            keyboardType="phone-pad"
            error={errors.phone}
            leftIcon={<Text style={styles.inputIcon}>📱</Text>}
          />
        </Card>

        {/* Address Details */}
        <Card variant="outlined" padding="medium" style={styles.section}>
          <Text style={styles.sectionTitle}>Adresse</Text>

          <Input
            label="Rue et numéro *"
            value={formData.street}
            onChangeText={text => updateField('street', text)}
            placeholder="123 Rue de la Paix"
            autoCapitalize="words"
            error={errors.street}
            leftIcon={<Text style={styles.inputIcon}>🏠</Text>}
            multiline
          />

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Input
                label="Ville *"
                value={formData.city}
                onChangeText={text => updateField('city', text)}
                placeholder="Paris"
                autoCapitalize="words"
                error={errors.city}
                leftIcon={<Text style={styles.inputIcon}>🏙️</Text>}
              />
            </View>

            <View style={styles.halfInput}>
              <Input
                label="Code postal *"
                value={formData.postalCode}
                onChangeText={text => updateField('postalCode', text)}
                placeholder="75001"
                keyboardType="number-pad"
                maxLength={5}
                error={errors.postalCode}
                leftIcon={<Text style={styles.inputIcon}>📮</Text>}
              />
            </View>
          </View>

          <Input
            label="Région / État"
            value={formData.state}
            onChangeText={text => updateField('state', text)}
            placeholder="Île-de-France"
            autoCapitalize="words"
            leftIcon={<Text style={styles.inputIcon}>📍</Text>}
          />

          <Input
            label="Pays *"
            value={formData.country}
            onChangeText={text => updateField('country', text)}
            placeholder="France"
            autoCapitalize="words"
            leftIcon={<Text style={styles.inputIcon}>🌍</Text>}
          />
        </Card>

        {/* Default Address Option */}
        <Card variant="outlined" padding="medium" style={styles.section}>
          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={toggleDefault}>
            <View
              style={[
                styles.checkbox,
                formData.isDefault && styles.checkboxChecked,
              ]}>
              {formData.isDefault && (
                <Text style={styles.checkboxIcon}>✓</Text>
              )}
            </View>
            <View style={styles.checkboxTextContainer}>
              <Text style={styles.checkboxLabel}>
                Définir comme adresse par défaut
              </Text>
              <Text style={styles.checkboxDesc}>
                Cette adresse sera utilisée automatiquement pour vos futures
                commandes
              </Text>
            </View>
          </TouchableOpacity>
        </Card>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoIcon}>ℹ️</Text>
          <Text style={styles.infoText}>
            Les champs marqués d'un astérisque (*) sont obligatoires. Assurez-vous
            que toutes les informations sont correctes pour garantir une livraison
            rapide.
          </Text>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Save Button */}
      <View style={styles.footer}>
        <Button
          title={existingAddress ? 'Enregistrer les modifications' : 'Ajouter l\'adresse'}
          onPress={handleSave}
          fullWidth
          size="large"
        />
      </View>
    </KeyboardAvoidingView>
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
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  inputIcon: {
    fontSize: 20,
  },
  row: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  halfInput: {
    flex: 1,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.border,
    marginRight: SPACING.md,
    marginTop: 2,
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
  checkboxTextContainer: {
    flex: 1,
  },
  checkboxLabel: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  checkboxDesc: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
    lineHeight: 18,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: `${COLORS.info}15`,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: `${COLORS.info}30`,
  },
  infoIcon: {
    fontSize: 20,
    marginRight: SPACING.sm,
  },
  infoText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
    lineHeight: 20,
  },
  footer: {
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  bottomSpacer: {
    height: SPACING.xl,
  },
});

export default AddressScreen;
