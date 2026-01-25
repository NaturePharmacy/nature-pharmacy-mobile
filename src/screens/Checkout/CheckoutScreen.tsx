/**
 * Checkout Screen
 * Processus de commande: Panier → Adresse → Paiement
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppSelector } from '@store/store';
import { Button, Card } from '@components';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '@utils/constants';
import type { Address, CheckoutScreenNavigationProp } from '@types';

type CheckoutStep = 'cart' | 'address' | 'payment';

const CheckoutScreen: React.FC = () => {
  const navigation = useNavigation<CheckoutScreenNavigationProp>();
  const { user } = useAppSelector(state => state.auth);
  const { items, subtotal, tax, shipping, total } = useAppSelector(
    state => state.cart
  );

  const [currentStep, setCurrentStep] = useState<CheckoutStep>('cart');
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal' | null>(
    null
  );

  useEffect(() => {
    // Load user's default address if exists
    if (user?.addresses && user.addresses.length > 0) {
      const defaultAddr = user.addresses.find(addr => addr.isDefault);
      setSelectedAddress(defaultAddr || user.addresses[0]);
    }
  }, [user]);

  const handleContinueToAddress = useCallback(() => {
    if (items.length === 0) {
      Alert.alert('Panier vide', 'Ajoutez des produits avant de continuer');
      return;
    }
    setCurrentStep('address');
  }, [items.length]);

  const handleContinueToPayment = useCallback(() => {
    if (!selectedAddress) {
      Alert.alert(
        'Adresse requise',
        'Veuillez sélectionner une adresse de livraison'
      );
      return;
    }
    setCurrentStep('payment');
  }, [selectedAddress]);

  const handleSelectAddress = useCallback(() => {
    // Navigate to Address screen in edit mode to select existing address
    navigation.navigate('Address', { isEdit: true });
  }, [navigation]);

  const handleAddNewAddress = useCallback(() => {
    // Navigate to Address screen to create new address
    navigation.navigate('Address', { isEdit: false });
  }, [navigation]);

  const handleProceedToPayment = useCallback(() => {
    if (!paymentMethod) {
      Alert.alert(
        'Méthode de paiement requise',
        'Veuillez sélectionner un mode de paiement'
      );
      return;
    }

    // For now, create a mock order ID (this should come from backend)
    const orderId = `order_${Date.now()}`;
    navigation.navigate('Payment', {
      orderId,
      amount: total,
    });
  }, [paymentMethod, total, navigation]);

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      <View style={styles.stepItem}>
        <View
          style={[
            styles.stepCircle,
            currentStep === 'cart' && styles.stepCircleActive,
            (currentStep === 'address' || currentStep === 'payment') &&
              styles.stepCircleCompleted,
          ]}>
          <Text
            style={[
              styles.stepNumber,
              (currentStep === 'cart' ||
                currentStep === 'address' ||
                currentStep === 'payment') &&
                styles.stepNumberActive,
            ]}>
            {currentStep === 'address' || currentStep === 'payment' ? '✓' : '1'}
          </Text>
        </View>
        <Text style={styles.stepLabel}>Panier</Text>
      </View>

      <View style={styles.stepLine} />

      <View style={styles.stepItem}>
        <View
          style={[
            styles.stepCircle,
            currentStep === 'address' && styles.stepCircleActive,
            currentStep === 'payment' && styles.stepCircleCompleted,
          ]}>
          <Text
            style={[
              styles.stepNumber,
              (currentStep === 'address' || currentStep === 'payment') &&
                styles.stepNumberActive,
            ]}>
            {currentStep === 'payment' ? '✓' : '2'}
          </Text>
        </View>
        <Text style={styles.stepLabel}>Livraison</Text>
      </View>

      <View style={styles.stepLine} />

      <View style={styles.stepItem}>
        <View
          style={[
            styles.stepCircle,
            currentStep === 'payment' && styles.stepCircleActive,
          ]}>
          <Text
            style={[
              styles.stepNumber,
              currentStep === 'payment' && styles.stepNumberActive,
            ]}>
            3
          </Text>
        </View>
        <Text style={styles.stepLabel}>Paiement</Text>
      </View>
    </View>
  );

  const renderCartStep = () => (
    <View>
      {/* Cart Items Summary */}
      <Card variant="outlined" padding="medium" style={styles.section}>
        <Text style={styles.sectionTitle}>Récapitulatif ({items.length} articles)</Text>

        {items.map(item => (
          <View key={item.product._id} style={styles.cartItem}>
            <View style={styles.cartItemInfo}>
              <Text style={styles.cartItemName} numberOfLines={1}>
                {item.product.name}
              </Text>
              <Text style={styles.cartItemQuantity}>Qté: {item.quantity}</Text>
            </View>
            <Text style={styles.cartItemPrice}>
              {(item.product.price * item.quantity).toFixed(2)} €
            </Text>
          </View>
        ))}
      </Card>

      {/* Order Summary */}
      <Card variant="outlined" padding="medium" style={styles.section}>
        <Text style={styles.sectionTitle}>Total</Text>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Sous-total</Text>
          <Text style={styles.summaryValue}>{subtotal.toFixed(2)} €</Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>TVA (10%)</Text>
          <Text style={styles.summaryValue}>{tax.toFixed(2)} €</Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Livraison</Text>
          <Text
            style={[styles.summaryValue, shipping === 0 && styles.freeShipping]}>
            {shipping === 0 ? 'GRATUIT' : `${shipping.toFixed(2)} €`}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.summaryRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{total.toFixed(2)} €</Text>
        </View>
      </Card>

      <Button
        title="Continuer vers la livraison"
        onPress={handleContinueToAddress}
        fullWidth
        size="large"
        style={styles.actionButton}
      />
    </View>
  );

  const renderAddressStep = () => (
    <View>
      {/* Selected Address */}
      <Card variant="outlined" padding="medium" style={styles.section}>
        <Text style={styles.sectionTitle}>Adresse de livraison</Text>

        {selectedAddress ? (
          <View style={styles.addressCard}>
            <View style={styles.addressHeader}>
              <View>
                <Text style={styles.addressName}>{selectedAddress.fullName}</Text>
                <Text style={styles.addressPhone}>{selectedAddress.phone}</Text>
              </View>
              {selectedAddress.isDefault && (
                <View style={styles.defaultBadge}>
                  <Text style={styles.defaultBadgeText}>Par défaut</Text>
                </View>
              )}
            </View>

            <Text style={styles.addressText}>
              {selectedAddress.street}
              {'\n'}
              {selectedAddress.city}, {selectedAddress.postalCode}
              {'\n'}
              {selectedAddress.country}
            </Text>

            <TouchableOpacity
              style={styles.changeButton}
              onPress={handleSelectAddress}>
              <Text style={styles.changeButtonText}>Changer d'adresse</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.noAddress}>
            <Text style={styles.noAddressText}>
              Aucune adresse de livraison
            </Text>
            <Button
              title="Ajouter une adresse"
              onPress={handleAddNewAddress}
              variant="outline"
              style={styles.addAddressButton}
            />
          </View>
        )}
      </Card>

      {/* Delivery Options */}
      <Card variant="outlined" padding="medium" style={styles.section}>
        <Text style={styles.sectionTitle}>Options de livraison</Text>

        <TouchableOpacity style={styles.deliveryOption}>
          <View style={styles.radioButton}>
            <View style={styles.radioButtonSelected} />
          </View>
          <View style={styles.deliveryInfo}>
            <Text style={styles.deliveryTitle}>Livraison standard</Text>
            <Text style={styles.deliveryDesc}>3-5 jours ouvrés</Text>
          </View>
          <Text style={styles.deliveryPrice}>
            {shipping === 0 ? 'Gratuit' : `${shipping.toFixed(2)} €`}
          </Text>
        </TouchableOpacity>
      </Card>

      <View style={styles.buttonRow}>
        <Button
          title="Retour"
          onPress={() => setCurrentStep('cart')}
          variant="outline"
          style={styles.backButton}
        />
        <Button
          title="Continuer vers le paiement"
          onPress={handleContinueToPayment}
          style={styles.continueButton}
        />
      </View>
    </View>
  );

  const renderPaymentStep = () => (
    <View>
      {/* Payment Methods */}
      <Card variant="outlined" padding="medium" style={styles.section}>
        <Text style={styles.sectionTitle}>Méthode de paiement</Text>

        <TouchableOpacity
          style={[
            styles.paymentOption,
            paymentMethod === 'card' && styles.paymentOptionSelected,
          ]}
          onPress={() => setPaymentMethod('card')}>
          <View style={styles.radioButton}>
            {paymentMethod === 'card' && (
              <View style={styles.radioButtonSelected} />
            )}
          </View>
          <Text style={styles.paymentIcon}>💳</Text>
          <View style={styles.paymentInfo}>
            <Text style={styles.paymentTitle}>Carte bancaire</Text>
            <Text style={styles.paymentDesc}>Visa, Mastercard, Amex</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.paymentOption,
            paymentMethod === 'paypal' && styles.paymentOptionSelected,
          ]}
          onPress={() => setPaymentMethod('paypal')}>
          <View style={styles.radioButton}>
            {paymentMethod === 'paypal' && (
              <View style={styles.radioButtonSelected} />
            )}
          </View>
          <Text style={styles.paymentIcon}>💰</Text>
          <View style={styles.paymentInfo}>
            <Text style={styles.paymentTitle}>PayPal</Text>
            <Text style={styles.paymentDesc}>Paiement sécurisé PayPal</Text>
          </View>
        </TouchableOpacity>
      </Card>

      {/* Order Summary */}
      <Card variant="outlined" padding="medium" style={styles.section}>
        <Text style={styles.sectionTitle}>Récapitulatif final</Text>

        <View style={styles.finalSummary}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Articles ({items.length})</Text>
            <Text style={styles.summaryValue}>{subtotal.toFixed(2)} €</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Livraison</Text>
            <Text style={styles.summaryValue}>
              {shipping === 0 ? 'Gratuit' : `${shipping.toFixed(2)} €`}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>TVA</Text>
            <Text style={styles.summaryValue}>{tax.toFixed(2)} €</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total à payer</Text>
            <Text style={styles.totalValue}>{total.toFixed(2)} €</Text>
          </View>
        </View>
      </Card>

      <View style={styles.buttonRow}>
        <Button
          title="Retour"
          onPress={() => setCurrentStep('address')}
          variant="outline"
          style={styles.backButton}
        />
        <Button
          title="Payer maintenant"
          onPress={handleProceedToPayment}
          style={styles.continueButton}
        />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBackButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.headerBackIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Commande</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Step Indicator */}
      {renderStepIndicator()}

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {currentStep === 'cart' && renderCartStep()}
        {currentStep === 'address' && renderAddressStep()}
        {currentStep === 'payment' && renderPaymentStep()}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Security Badge */}
      <View style={styles.securityBadge}>
        <Text style={styles.securityIcon}>🔒</Text>
        <Text style={styles.securityText}>Paiement 100% sécurisé</Text>
      </View>
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
  headerBackButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerBackIcon: {
    fontSize: 24,
    color: COLORS.text.primary,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text.primary,
  },
  headerRight: {
    width: 40,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  stepItem: {
    alignItems: 'center',
  },
  stepCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.background,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  stepCircleActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  stepCircleCompleted: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },
  stepNumber: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text.secondary,
  },
  stepNumberActive: {
    color: COLORS.text.white,
  },
  stepLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.text.secondary,
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: COLORS.border,
    marginHorizontal: SPACING.xs,
    marginBottom: 20,
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
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  cartItemInfo: {
    flex: 1,
  },
  cartItemName: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  cartItemQuantity: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
  },
  cartItemPrice: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text.primary,
    marginLeft: SPACING.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  summaryLabel: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text.secondary,
  },
  summaryValue: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text.primary,
  },
  freeShipping: {
    color: COLORS.success,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.md,
  },
  totalLabel: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text.primary,
  },
  totalValue: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.primary,
  },
  addressCard: {
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  addressName: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  addressPhone: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
  },
  defaultBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  defaultBadgeText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text.white,
  },
  addressText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  changeButton: {
    alignSelf: 'flex-start',
  },
  changeButtonText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  noAddress: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
  },
  noAddressText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text.secondary,
    marginBottom: SPACING.md,
  },
  addAddressButton: {
    marginTop: SPACING.sm,
  },
  deliveryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.primary,
    marginRight: SPACING.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  deliveryInfo: {
    flex: 1,
  },
  deliveryTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  deliveryDesc: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
  },
  deliveryPrice: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.primary,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  paymentOptionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: `${COLORS.primary}05`,
  },
  paymentIcon: {
    fontSize: 24,
    marginRight: SPACING.md,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  paymentDesc: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
  },
  finalSummary: {
    marginTop: SPACING.sm,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.lg,
  },
  backButton: {
    flex: 1,
  },
  continueButton: {
    flex: 2,
  },
  actionButton: {
    marginTop: SPACING.lg,
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  securityIcon: {
    fontSize: 16,
    marginRight: SPACING.xs,
  },
  securityText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
  },
  bottomSpacer: {
    height: SPACING.xl,
  },
});

export default CheckoutScreen;
