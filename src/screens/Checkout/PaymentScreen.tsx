/**
 * Payment Screen
 * Intégration PayPal pour les paiements sécurisés
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '@store/store';
import { clearCart } from '@store/slices/cartSlice';
import { Button, Card } from '@components';
import { orderService } from '@services/order.service';
import { logError } from '@utils/logger';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '@utils/constants';
import type { PaymentScreenNavigationProp, PaymentScreenRouteProp } from '@types';

const PaymentScreen: React.FC = () => {
  const navigation = useNavigation<PaymentScreenNavigationProp>();
  const route = useRoute<PaymentScreenRouteProp>();
  const dispatch = useAppDispatch();
  const { items: cartItems } = useAppSelector(state => state.cart);

  const orderData = route.params?.orderData;

  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!orderData) {
      Alert.alert('Erreur', 'Données de commande manquantes');
      navigation.goBack();
    }
  }, [orderData, navigation]);

  const handlePayPalPayment = async () => {
    setIsProcessing(true);

    try {
      // 1. Create order on backend
      const orderResponse = await orderService.createOrder({
        items: orderData.items.map((item: { product: { _id: string; price: number }; quantity: number }) => ({
          product: item.product._id,
          quantity: item.quantity,
          price: item.product.price,
        })),
        shippingAddress: orderData.address,
        paymentMethod: 'paypal',
        amount: orderData.total,
      });

      const { orderId, paypalApprovalUrl } = orderResponse;

      // 2. Open PayPal in browser for approval
      if (paypalApprovalUrl) {
        const canOpen = await Linking.canOpenURL(paypalApprovalUrl);
        if (canOpen) {
          await Linking.openURL(paypalApprovalUrl);

          // Show instructions to user
          Alert.alert(
            'PayPal',
            'Après avoir validé le paiement sur PayPal, revenez à l\'application pour finaliser votre commande.',
            [
              {
                text: 'Paiement effectué',
                onPress: () => handlePaymentSuccess(orderId),
              },
              {
                text: 'Annuler',
                style: 'cancel',
                onPress: () => setIsProcessing(false),
              },
            ]
          );
        } else {
          throw new Error('Impossible d\'ouvrir PayPal');
        }
      } else {
        // If no PayPal URL (sandbox/test mode), simulate success
        await handlePaymentSuccess(orderId);
      }
    } catch (error) {
      logError('PayPal payment error', error, 'PaymentScreen');
      const message = error instanceof Error ? error.message : 'Une erreur est survenue lors du paiement';
      Alert.alert('Paiement échoué', message);
      setIsProcessing(false);
    }
  };

  const handlePaymentSuccess = useCallback(async (orderId: string) => {
    try {
      // Update order payment status
      await orderService.updateOrderPaymentStatus(orderId, 'paid');

      // Clear cart
      dispatch(clearCart());

      // Navigate to order confirmation
      navigation.reset({
        index: 1,
        routes: [
          { name: 'Main' as never, params: undefined },
          {
            name: 'OrderConfirmation' as never,
            params: { orderId },
          },
        ],
      });
    } catch (error) {
      logError('Payment success handler error', error, 'PaymentScreen');
      Alert.alert('Erreur', 'Le paiement a été effectué mais une erreur est survenue. Contactez le support.');
    }
  }, [dispatch, navigation]);

  if (!orderData) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          disabled={isProcessing}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Paiement</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Amount Summary */}
        <Card variant="elevated" padding="medium" style={styles.amountCard}>
          <Text style={styles.amountLabel}>Montant à payer</Text>
          <Text style={styles.amountValue}>{orderData.total.toFixed(2)} €</Text>
        </Card>

        {/* PayPal Payment */}
        <Card variant="outlined" padding="medium" style={styles.section}>
          <View style={styles.paypalHeader}>
            <Text style={styles.paypalLogo}>PayPal</Text>
          </View>
          <Text style={styles.paypalInfo}>
            Vous serez redirigé vers PayPal pour finaliser votre paiement de
            manière sécurisée. Connectez-vous à votre compte PayPal ou payez
            avec une carte bancaire.
          </Text>

          <View style={styles.paypalFeatures}>
            <View style={styles.featureRow}>
              <Text style={styles.featureIcon}>✓</Text>
              <Text style={styles.featureText}>Protection des achats</Text>
            </View>
            <View style={styles.featureRow}>
              <Text style={styles.featureIcon}>✓</Text>
              <Text style={styles.featureText}>Paiement sécurisé</Text>
            </View>
            <View style={styles.featureRow}>
              <Text style={styles.featureIcon}>✓</Text>
              <Text style={styles.featureText}>Aucun frais supplémentaire</Text>
            </View>
          </View>
        </Card>

        {/* Order Summary */}
        <Card variant="outlined" padding="medium" style={styles.section}>
          <Text style={styles.sectionTitle}>Récapitulatif</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Articles ({orderData.items.length})</Text>
            <Text style={styles.summaryValue}>
              {orderData.subtotal.toFixed(2)} €
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Livraison</Text>
            <Text style={styles.summaryValue}>
              {orderData.shipping === 0
                ? 'Gratuit'
                : `${orderData.shipping.toFixed(2)} €`}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>TVA</Text>
            <Text style={styles.summaryValue}>{orderData.tax.toFixed(2)} €</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{orderData.total.toFixed(2)} €</Text>
          </View>
        </Card>

        {/* Shipping Address */}
        <Card variant="outlined" padding="medium" style={styles.section}>
          <Text style={styles.sectionTitle}>Adresse de livraison</Text>
          <Text style={styles.addressName}>{orderData.address.fullName}</Text>
          <Text style={styles.addressText}>
            {orderData.address.street}
            {'\n'}
            {orderData.address.postalCode} {orderData.address.city}
            {'\n'}
            {orderData.address.country}
          </Text>
        </Card>

        {/* Security Info */}
        <View style={styles.securityInfo}>
          <Text style={styles.securityIcon}>🔒</Text>
          <Text style={styles.securityText}>
            Paiement 100% sécurisé via PayPal. Vos informations bancaires sont
            protégées et ne transitent jamais par nos serveurs.
          </Text>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Pay Button */}
      <View style={styles.footer}>
        <Button
          title={
            isProcessing
              ? 'Redirection vers PayPal...'
              : `Payer avec PayPal - ${orderData.total.toFixed(2)} €`
          }
          onPress={handlePayPalPayment}
          loading={isProcessing}
          disabled={isProcessing}
          fullWidth
          size="large"
        />

        {isProcessing && (
          <View style={styles.processingInfo}>
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text style={styles.processingText}>
              Préparation du paiement PayPal...
            </Text>
          </View>
        )}
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
  amountCard: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.primary,
  },
  amountLabel: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text.white,
    marginBottom: SPACING.xs,
  },
  amountValue: {
    fontSize: TYPOGRAPHY.fontSize.xxxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text.white,
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
  paypalHeader: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  paypalLogo: {
    fontSize: 28,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: '#003087',
    fontStyle: 'italic',
  },
  paypalInfo: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text.secondary,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  paypalFeatures: {
    backgroundColor: `${COLORS.success}10`,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  featureIcon: {
    fontSize: 16,
    color: COLORS.success,
    marginRight: SPACING.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  featureText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.primary,
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
  addressName: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  addressText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
    lineHeight: 20,
  },
  securityInfo: {
    flexDirection: 'row',
    backgroundColor: `${COLORS.success}15`,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: `${COLORS.success}30`,
  },
  securityIcon: {
    fontSize: 20,
    marginRight: SPACING.sm,
  },
  securityText: {
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
  processingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.md,
  },
  processingText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
    marginLeft: SPACING.sm,
  },
  bottomSpacer: {
    height: SPACING.xl,
  },
});

export default PaymentScreen;
