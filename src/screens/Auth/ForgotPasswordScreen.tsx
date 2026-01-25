/**
 * Forgot Password Screen
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
import { Button, Input } from '@components';
import { COLORS, SPACING, TYPOGRAPHY, REGEX } from '@utils/constants';
import { authService } from '@services/auth.service';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { AuthStackParamList } from '@types';

type ForgotPasswordScreenNavigationProp = StackNavigationProp<
  AuthStackParamList,
  'ForgotPassword'
>;

const ForgotPasswordScreen: React.FC = () => {
  const navigation = useNavigation<ForgotPasswordScreenNavigationProp>();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const validateEmail = useCallback((): boolean => {
    if (!email) {
      setEmailError('Email requis');
      return false;
    }
    if (!REGEX.EMAIL.test(email)) {
      setEmailError('Email invalide');
      return false;
    }
    setEmailError('');
    return true;
  }, [email]);

  const handleSubmit = useCallback(async () => {
    if (!validateEmail()) return;

    setIsLoading(true);
    try {
      await authService.forgotPassword(email.trim().toLowerCase());
      setEmailSent(true);
      Alert.alert(
        'Email envoyé !',
        'Vérifiez votre boîte mail pour réinitialiser votre mot de passe.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Login'),
          },
        ]
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erreur lors de l'envoi de l'email";
      Alert.alert('Erreur', message);
    } finally {
      setIsLoading(false);
    }
  }, [validateEmail, email, navigation]);

  const handleEmailChange = useCallback((text: string) => {
    setEmail(text);
    if (emailError) setEmailError('');
  }, [emailError]);

  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const navigateToLogin = useCallback(() => {
    navigation.navigate('Login');
  }, [navigation]);

  const handleResend = useCallback(() => {
    setEmailSent(false);
    setEmail('');
  }, []);

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
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleGoBack}>
            <Text style={styles.backButtonText}>← Retour</Text>
          </TouchableOpacity>

          <Text style={styles.logo}>🔐</Text>
          <Text style={styles.title}>Mot de passe oublié ?</Text>
          <Text style={styles.subtitle}>
            Entrez votre email pour recevoir un lien de réinitialisation
          </Text>
        </View>

        {/* Form */}
        {!emailSent ? (
          <View style={styles.form}>
            <Input
              label="Email"
              value={email}
              onChangeText={handleEmailChange}
              placeholder="votre@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              error={emailError}
              leftIcon={<Text style={styles.inputIcon}>✉️</Text>}
              editable={!isLoading}
            />

            <Button
              title="Envoyer le lien"
              onPress={handleSubmit}
              loading={isLoading}
              fullWidth
              style={styles.submitButton}
            />

            {/* Back to Login */}
            <TouchableOpacity
              style={styles.loginContainer}
              onPress={navigateToLogin}>
              <Text style={styles.loginText}>Vous vous souvenez ? </Text>
              <Text style={styles.loginLink}>Se connecter</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.successContainer}>
            <Text style={styles.successIcon}>✅</Text>
            <Text style={styles.successTitle}>Email envoyé !</Text>
            <Text style={styles.successText}>
              Nous avons envoyé un lien de réinitialisation à{'\n'}
              <Text style={styles.emailText}>{email}</Text>
            </Text>
            <Text style={styles.instructionsText}>
              Cliquez sur le lien dans l'email pour créer un nouveau mot de
              passe.
            </Text>

            <Button
              title="Retour à la connexion"
              onPress={navigateToLogin}
              fullWidth
              style={styles.backToLoginButton}
            />

            {/* Resend Link */}
            <TouchableOpacity
              style={styles.resendContainer}
              onPress={handleResend}>
              <Text style={styles.resendText}>
                Vous n'avez pas reçu l'email ?{' '}
              </Text>
              <Text style={styles.resendLink}>Renvoyer</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoIcon}>💡</Text>
          <Text style={styles.infoText}>
            Le lien de réinitialisation expire après 1 heure. Si vous ne
            recevez pas l'email, vérifiez votre dossier spam.
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
    marginBottom: SPACING.xl,
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
    fontSize: 64,
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: SPACING.md,
  },
  form: {
    flex: 1,
  },
  inputIcon: {
    fontSize: 20,
  },
  submitButton: {
    marginTop: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.md,
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
  successContainer: {
    flex: 1,
    alignItems: 'center',
    paddingTop: SPACING.xl,
  },
  successIcon: {
    fontSize: 72,
    marginBottom: SPACING.lg,
  },
  successTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  successText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: SPACING.md,
    lineHeight: 22,
  },
  emailText: {
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  instructionsText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: 20,
    paddingHorizontal: SPACING.lg,
  },
  backToLoginButton: {
    marginBottom: SPACING.lg,
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  resendText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
  },
  resendLink: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: `${COLORS.info}15`,
    padding: SPACING.md,
    borderRadius: 12,
    marginTop: SPACING.xl,
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
});

export default ForgotPasswordScreen;
