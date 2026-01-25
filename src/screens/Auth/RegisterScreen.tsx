/**
 * Register Screen
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '@store/store';
import { register } from '@store/slices/authSlice';
import { Button, Input } from '@components';
import { COLORS, SPACING, TYPOGRAPHY, REGEX } from '@utils/constants';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { AuthStackParamList } from '@types';

type RegisterScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Register'>;

const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<RegisterScreenNavigationProp>();
  const dispatch = useAppDispatch();
  const { isLoading } = useAppSelector(state => state.auth);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [role, setRole] = useState<'buyer' | 'seller'>('buyer');
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const validateForm = useCallback((): boolean => {
    const newErrors: { name?: string; email?: string; password?: string; confirmPassword?: string } = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Nom requis';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Minimum 2 caractères';
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email requis';
    } else if (!REGEX.EMAIL.test(formData.email)) {
      newErrors.email = 'Email invalide';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Mot de passe requis';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Minimum 8 caractères';
    } else if (!REGEX.PASSWORD.test(formData.password)) {
      newErrors.password = 'Doit contenir: majuscule, minuscule, chiffre, caractère spécial';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirmation requise';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleRegister = useCallback(async () => {
    if (!validateForm()) return;

    try {
      await dispatch(
        register({
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          role,
        })
      ).unwrap();

      Alert.alert(
        'Inscription réussie !',
        'Un email de vérification a été envoyé à votre adresse.',
        [{ text: 'OK' }]
      );
      // Navigation handled automatically by AppNavigator
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      Alert.alert('Erreur', message || "Erreur lors de l'inscription");
    }
  }, [validateForm, dispatch, formData, role]);

  const updateField = useCallback((field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const toggleShowPassword = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  const toggleShowConfirmPassword = useCallback(() => {
    setShowConfirmPassword(prev => !prev);
  }, []);

  const selectBuyerRole = useCallback(() => {
    setRole('buyer');
  }, []);

  const selectSellerRole = useCallback(() => {
    setRole('seller');
  }, []);

  const navigateToLogin = useCallback(() => {
    navigation.navigate('Login');
  }, [navigation]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
            <Text style={styles.backButtonText}>← Retour</Text>
          </TouchableOpacity>

          <Text style={styles.logo}>🌿</Text>
          <Text style={styles.title}>Créer un compte</Text>
          <Text style={styles.subtitle}>Rejoignez Nature Pharmacy</Text>
        </View>

        {/* Role Selection */}
        <View style={styles.roleContainer}>
          <Text style={styles.roleLabel}>Je suis :</Text>
          <View style={styles.roleButtons}>
            <TouchableOpacity
              style={[styles.roleButton, role === 'buyer' && styles.roleButtonActive]}
              onPress={selectBuyerRole}>
              <Text style={styles.roleIcon}>🛍️</Text>
              <Text
                style={[styles.roleButtonText, role === 'buyer' && styles.roleButtonTextActive]}>
                Acheteur
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.roleButton, role === 'seller' && styles.roleButtonActive]}
              onPress={selectSellerRole}>
              <Text style={styles.roleIcon}>🏪</Text>
              <Text
                style={[styles.roleButtonText, role === 'seller' && styles.roleButtonTextActive]}>
                Vendeur
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Input
            label="Nom complet"
            value={formData.name}
            onChangeText={text => updateField('name', text)}
            placeholder="Jean Dupont"
            autoCapitalize="words"
            error={errors.name}
            leftIcon={<Text style={styles.inputIcon}>👤</Text>}
          />

          <Input
            label="Email"
            value={formData.email}
            onChangeText={text => updateField('email', text)}
            placeholder="votre@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            error={errors.email}
            leftIcon={<Text style={styles.inputIcon}>✉️</Text>}
          />

          <Input
            label="Mot de passe"
            value={formData.password}
            onChangeText={text => updateField('password', text)}
            placeholder="••••••••"
            secureTextEntry={!showPassword}
            error={errors.password}
            hint="Min 8 caractères, majuscule, minuscule, chiffre et caractère spécial"
            leftIcon={<Text style={styles.inputIcon}>🔒</Text>}
            rightIcon={<Text style={styles.inputIcon}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>}
            onRightIconPress={toggleShowPassword}
          />

          <Input
            label="Confirmer le mot de passe"
            value={formData.confirmPassword}
            onChangeText={text => updateField('confirmPassword', text)}
            placeholder="••••••••"
            secureTextEntry={!showConfirmPassword}
            error={errors.confirmPassword}
            leftIcon={<Text style={styles.inputIcon}>🔒</Text>}
            rightIcon={
              <Text style={styles.inputIcon}>{showConfirmPassword ? '👁️' : '👁️‍🗨️'}</Text>
            }
            onRightIconPress={toggleShowConfirmPassword}
          />

          {/* Register Button */}
          <Button
            title="Créer mon compte"
            onPress={handleRegister}
            loading={isLoading}
            fullWidth
            style={styles.registerButton}
          />

          {/* Login Link */}
          <TouchableOpacity
            style={styles.loginContainer}
            onPress={navigateToLogin}>
            <Text style={styles.loginText}>Déjà un compte ? </Text>
            <Text style={styles.loginLink}>Se connecter</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            En créant un compte, vous acceptez nos{'\n'}
            <Text style={styles.footerLink}>Conditions d'utilisation</Text> et notre{'\n'}
            <Text style={styles.footerLink}>Politique de confidentialité</Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: SPACING.lg,
  },
  header: {
    alignItems: 'center',
    marginTop: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: SPACING.md,
  },
  backButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  logo: {
    fontSize: 48,
    marginBottom: SPACING.sm,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  roleContainer: {
    marginBottom: SPACING.lg,
  },
  roleLabel: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  roleButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  roleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  roleButtonActive: {
    borderColor: COLORS.primary,
    backgroundColor: `${COLORS.primary}10`,
  },
  roleIcon: {
    fontSize: 24,
    marginRight: SPACING.xs,
  },
  roleButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.text.secondary,
  },
  roleButtonTextActive: {
    color: COLORS.primary,
  },
  form: {
    flex: 1,
  },
  inputIcon: {
    fontSize: 20,
  },
  registerButton: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text.secondary,
  },
  loginLink: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  footer: {
    marginTop: SPACING.xl,
    alignItems: 'center',
  },
  footerText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  footerLink: {
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
});

export default RegisterScreen;
