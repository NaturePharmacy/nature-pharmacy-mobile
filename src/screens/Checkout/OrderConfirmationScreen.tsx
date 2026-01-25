/**
 * Order Confirmation Screen
 * Affichage de la confirmation de commande avec détails et tracking
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Button, Card, Badge, OrderStatusBadge, Loading } from '@components';
import { orderService } from '@services/order.service';
import { logError } from '@utils/logger';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '@utils/constants';
import type { Order, OrderConfirmationScreenNavigationProp, OrderConfirmationScreenRouteProp } from '@types';

const OrderConfirmationScreen: React.FC = () => {
  const navigation = useNavigation<OrderConfirmationScreenNavigationProp>();
  const route = useRoute<OrderConfirmationScreenRouteProp>();

  const { orderId } = route.params;

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  const loadOrder = async () => {
    try {
      setIsLoading(true);
      const orderData = await orderService.getOrderById(orderId);
      setOrder(orderData);
    } catch (error) {
      logError('Error loading order', error, 'OrderConfirmationScreen');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShareOrder = async () => {
    if (!order) return;

    try {
      await Share.share({
        message: `Commande Nature Pharmacy #${order.orderNumber}\nMontant: ${order.total.toFixed(2)} €\nStatut: ${getStatusLabel(order.status)}`,
        title: 'Ma commande Nature Pharmacy',
      });
    } catch (error) {
      logError('Error sharing order', error, 'OrderConfirmationScreen');
    }
  };

  const getStatusLabel = (status: string): string => {
    const statusLabels: { [key: string]: string } = {
      pending: 'En attente',
      processing: 'En cours',
      shipped: 'Expédié',
      delivered: 'Livré',
      cancelled: 'Annulé',
    };
    return statusLabels[status] || status;
  };

  const getEstimatedDelivery = (order: Order): string => {
    const deliveryDate = new Date(order.createdAt);
    deliveryDate.setDate(deliveryDate.getDate() + 5); // +5 days
    return deliveryDate.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  };

  if (isLoading || !order) {
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
        <View style={styles.headerContent}>
          <Text style={styles.successIcon}>✅</Text>
          <Text style={styles.headerTitle}>Commande confirmée !</Text>
          <Text style={styles.headerSubtitle}>
            Merci pour votre achat. Votre commande a bien été enregistrée.
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Order Number Card */}
        <Card variant="elevated" padding="medium" style={styles.orderNumberCard}>
          <Text style={styles.orderNumberLabel}>Numéro de commande</Text>
          <Text style={styles.orderNumber}>#{order.orderNumber}</Text>
          <Text style={styles.orderDate}>
            {new Date(order.createdAt).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </Card>

        {/* Status & Tracking */}
        <Card variant="outlined" padding="medium" style={styles.section}>
          <View style={styles.statusHeader}>
            <Text style={styles.sectionTitle}>Statut de la commande</Text>
            <OrderStatusBadge status={order.status as any} />
          </View>

          <View style={styles.trackingInfo}>
            <Text style={styles.trackingIcon}>📦</Text>
            <View style={styles.trackingTextContainer}>
              <Text style={styles.trackingTitle}>Livraison estimée</Text>
              <Text style={styles.trackingDate}>
                {getEstimatedDelivery(order)}
              </Text>
            </View>
          </View>

          {order.trackingNumber && (
            <View style={styles.trackingNumber}>
              <Text style={styles.trackingNumberLabel}>Numéro de suivi</Text>
              <Text style={styles.trackingNumberValue}>
                {order.trackingNumber}
              </Text>
            </View>
          )}

          <Button
            title="Suivre ma commande"
            onPress={() =>
              navigation.navigate('OrderDetail', { orderId: order._id })
            }
            variant="outline"
            style={styles.trackButton}
          />
        </Card>

        {/* Items */}
        <Card variant="outlined" padding="medium" style={styles.section}>
          <Text style={styles.sectionTitle}>
            Articles commandés ({order.items.length})
          </Text>

          {order.items.map((item, index) => (
            <View
              key={index}
              style={[
                styles.orderItem,
                index < order.items.length - 1 && styles.orderItemBorder,
              ]}>
              <View style={styles.orderItemInfo}>
                <Text style={styles.orderItemName}>{item.product.name}</Text>
                <Text style={styles.orderItemQuantity}>
                  Quantité: {item.quantity}
                </Text>
              </View>
              <Text style={styles.orderItemPrice}>
                {(item.price * item.quantity).toFixed(2)} €
              </Text>
            </View>
          ))}
        </Card>

        {/* Payment Summary */}
        <Card variant="outlined" padding="medium" style={styles.section}>
          <Text style={styles.sectionTitle}>Récapitulatif du paiement</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Sous-total</Text>
            <Text style={styles.summaryValue}>
              {(order.total - order.shippingCost - (order.total * 0.1) / 1.1).toFixed(2)} €
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Livraison</Text>
            <Text style={styles.summaryValue}>
              {order.shippingCost === 0
                ? 'Gratuit'
                : `${order.shippingCost.toFixed(2)} €`}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>TVA</Text>
            <Text style={styles.summaryValue}>
              {((order.total * 0.1) / 1.1).toFixed(2)} €
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total payé</Text>
            <Text style={styles.totalValue}>{order.total.toFixed(2)} €</Text>
          </View>

          <View style={styles.paymentMethodInfo}>
            <Text style={styles.paymentMethodIcon}>
              {order.paymentMethod === 'card' ? '💳' : '💰'}
            </Text>
            <Text style={styles.paymentMethodText}>
              {order.paymentMethod === 'card' ? 'Carte bancaire' : 'PayPal'}
            </Text>
          </View>
        </Card>

        {/* Shipping Address */}
        <Card variant="outlined" padding="medium" style={styles.section}>
          <Text style={styles.sectionTitle}>Adresse de livraison</Text>
          <Text style={styles.addressName}>{order.shippingAddress.fullName}</Text>
          <Text style={styles.addressText}>
            {order.shippingAddress.street}
            {'\n'}
            {order.shippingAddress.postalCode} {order.shippingAddress.city}
            {'\n'}
            {order.shippingAddress.country}
          </Text>
          <Text style={styles.addressPhone}>📱 {order.shippingAddress.phone}</Text>
        </Card>

        {/* Email Confirmation */}
        <View style={styles.emailInfo}>
          <Text style={styles.emailIcon}>✉️</Text>
          <Text style={styles.emailText}>
            Un email de confirmation a été envoyé à votre adresse. Vous y trouverez
            tous les détails de votre commande.
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Button
            title="Partager"
            onPress={handleShareOrder}
            variant="outline"
            leftIcon={<Text style={styles.buttonIcon}>↗️</Text>}
            style={styles.actionButton}
          />
          <Button
            title="Mes commandes"
            onPress={() =>
              navigation.reset({
                index: 1,
                routes: [
                  { name: 'Main', params: undefined },
                  { name: 'Orders', params: undefined },
                ],
              })
            }
            variant="outline"
            leftIcon={<Text style={styles.buttonIcon}>📦</Text>}
            style={styles.actionButton}
          />
        </View>

        {/* Support Info */}
        <View style={styles.supportInfo}>
          <Text style={styles.supportTitle}>Besoin d'aide ?</Text>
          <Text style={styles.supportText}>
            Notre service client est disponible du lundi au vendredi de 9h à 18h.
          </Text>
          <TouchableOpacity style={styles.supportButton}>
            <Text style={styles.supportButtonText}>Contacter le support</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Continue Shopping Button */}
      <View style={styles.footer}>
        <Button
          title="Continuer mes achats"
          onPress={() =>
            navigation.reset({
              index: 0,
              routes: [{ name: 'Main', params: undefined }],
            })
          }
          fullWidth
          size="large"
        />
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
    backgroundColor: COLORS.success,
    paddingTop: SPACING.xxxl,
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  headerContent: {
    alignItems: 'center',
  },
  successIcon: {
    fontSize: 64,
    marginBottom: SPACING.md,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text.white,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text.white,
    textAlign: 'center',
    opacity: 0.9,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  orderNumberCard: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
    marginTop: -SPACING.xl,
  },
  orderNumberLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs,
  },
  orderNumber: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  orderDate: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
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
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  trackingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
  },
  trackingIcon: {
    fontSize: 32,
    marginRight: SPACING.md,
  },
  trackingTextContainer: {
    flex: 1,
  },
  trackingTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
    marginBottom: 2,
  },
  trackingDate: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text.primary,
  },
  trackingNumber: {
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
  },
  trackingNumberLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs,
  },
  trackingNumberValue: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.primary,
  },
  trackButton: {
    marginTop: SPACING.sm,
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
  orderItemInfo: {
    flex: 1,
  },
  orderItemName: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  orderItemQuantity: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
  },
  orderItemPrice: {
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
    color: COLORS.success,
  },
  paymentMethodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.md,
    padding: SPACING.sm,
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.sm,
  },
  paymentMethodIcon: {
    fontSize: 20,
    marginRight: SPACING.sm,
  },
  paymentMethodText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
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
    marginBottom: SPACING.sm,
  },
  addressPhone: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
  },
  emailInfo: {
    flexDirection: 'row',
    backgroundColor: `${COLORS.info}15`,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: `${COLORS.info}30`,
  },
  emailIcon: {
    fontSize: 20,
    marginRight: SPACING.sm,
  },
  emailText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  actionButton: {
    flex: 1,
  },
  buttonIcon: {
    fontSize: 16,
    marginRight: SPACING.xs,
  },
  supportInfo: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  supportTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  supportText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  supportButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  supportButtonText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
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

export default OrderConfirmationScreen;
