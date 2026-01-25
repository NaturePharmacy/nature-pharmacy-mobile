/**
 * Order Detail Screen
 * Détails complets d'une commande avec tracking
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  Share,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Card, OrderStatusBadge, PaymentStatusBadge, Button, Loading } from '@components';
import { useAppDispatch } from '@store/store';
import { addToCart } from '@store/slices/cartSlice';
import { orderService } from '@services/order.service';
import { logError } from '@utils/logger';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '@utils/constants';
import type { Order, OrderDetailScreenNavigationProp, OrderDetailScreenRouteProp } from '@types';

interface TrackingStep {
  status: string;
  label: string;
  date?: string;
  isCompleted: boolean;
  isCurrent: boolean;
}

const OrderDetailScreen: React.FC = () => {
  const navigation = useNavigation<OrderDetailScreenNavigationProp>();
  const route = useRoute<OrderDetailScreenRouteProp>();
  const dispatch = useAppDispatch();

  const { orderId } = route.params;

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  const loadOrder = async () => {
    try {
      setIsLoading(true);
      const orderData = await orderService.getOrderById(orderId);
      setOrder(orderData);
    } catch (error) {
      logError('Error loading order', error, 'OrderDetailScreen');
      Alert.alert('Erreur', 'Impossible de charger la commande');
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelOrder = () => {
    if (!order) return;

    Alert.alert(
      'Annuler la commande',
      'Êtes-vous sûr de vouloir annuler cette commande ?',
      [
        { text: 'Non', style: 'cancel' },
        {
          text: 'Oui, annuler',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsCancelling(true);
              await orderService.cancelOrder(order._id);
              Alert.alert('Succès', 'Commande annulée avec succès');
              loadOrder();
            } catch (error) {
              const message = error instanceof Error ? error.message : "Impossible d'annuler la commande";
              Alert.alert('Erreur', message);
            } finally {
              setIsCancelling(false);
            }
          },
        },
      ]
    );
  };

  const handleContactSupport = () => {
    Alert.alert(
      'Contacter le support',
      'Comment souhaitez-vous nous contacter ?',
      [
        {
          text: 'Email',
          onPress: () => Linking.openURL('mailto:support@naturepharmacy.com'),
        },
        {
          text: 'Téléphone',
          onPress: () => Linking.openURL('tel:+33123456789'),
        },
        { text: 'Annuler', style: 'cancel' },
      ]
    );
  };

  const handleShareOrder = async () => {
    if (!order) return;

    try {
      await Share.share({
        message: `Commande Nature Pharmacy #${order.orderNumber}\nStatut: ${getStatusLabel(order.status)}\nTotal: ${order.total.toFixed(2)} €`,
        title: 'Ma commande',
      });
    } catch (error) {
      logError('Error sharing order', error, 'OrderDetailScreen');
    }
  };

  const handleTrackPackage = () => {
    if (!order?.trackingNumber) return;

    // Open tracking URL (example with generic tracker)
    const trackingUrl = `https://www.trackyourparcel.com/${order.trackingNumber}`;
    Linking.openURL(trackingUrl);
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

  const getTrackingSteps = (order: Order): TrackingStep[] => {
    const steps: TrackingStep[] = [
      {
        status: 'pending',
        label: 'Commande passée',
        date: order.createdAt,
        isCompleted: true,
        isCurrent: order.status === 'pending',
      },
      {
        status: 'processing',
        label: 'En préparation',
        date: order.status !== 'pending' ? order.updatedAt : undefined,
        isCompleted: ['processing', 'shipped', 'delivered'].includes(order.status),
        isCurrent: order.status === 'processing',
      },
      {
        status: 'shipped',
        label: 'Expédié',
        date: order.status === 'shipped' || order.status === 'delivered' ? order.updatedAt : undefined,
        isCompleted: ['shipped', 'delivered'].includes(order.status),
        isCurrent: order.status === 'shipped',
      },
      {
        status: 'delivered',
        label: 'Livré',
        date: order.status === 'delivered' ? order.updatedAt : undefined,
        isCompleted: order.status === 'delivered',
        isCurrent: false,
      },
    ];

    return steps;
  };

  const formatDate = (date: string): string => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatShortDate = (date: string): string => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading || !order) {
    return (
      <View style={styles.container}>
        <Loading fullScreen />
      </View>
    );
  }

  const trackingSteps = getTrackingSteps(order);
  const canBeCancelled = order.status === 'pending' || order.status === 'processing';

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Commande</Text>
          <Text style={styles.headerSubtitle}>#{order.orderNumber}</Text>
        </View>
        <TouchableOpacity style={styles.shareButton} onPress={handleShareOrder}>
          <Text style={styles.shareIcon}>↗️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Status Card */}
        <Card variant="elevated" padding="medium" style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <OrderStatusBadge status={order.status as any} />
            <Text style={styles.statusDate}>{formatDate(order.createdAt)}</Text>
          </View>

          {order.status === 'cancelled' ? (
            <View style={styles.cancelledInfo}>
              <Text style={styles.cancelledIcon}>❌</Text>
              <View style={styles.cancelledTextContainer}>
                <Text style={styles.cancelledTitle}>Commande annulée</Text>
                <Text style={styles.cancelledText}>
                  Cette commande a été annulée. Vous serez remboursé sous 5-7 jours
                  ouvrés.
                </Text>
              </View>
            </View>
          ) : (
            <>
              {/* Tracking Timeline */}
              <View style={styles.timeline}>
                {trackingSteps.map((step, index) => (
                  <View key={step.status} style={styles.timelineStep}>
                    <View style={styles.timelineLeft}>
                      <View
                        style={[
                          styles.timelineCircle,
                          step.isCompleted && styles.timelineCircleCompleted,
                          step.isCurrent && styles.timelineCircleCurrent,
                        ]}>
                        {step.isCompleted && (
                          <Text style={styles.timelineCheckmark}>✓</Text>
                        )}
                      </View>
                      {index < trackingSteps.length - 1 && (
                        <View
                          style={[
                            styles.timelineLine,
                            step.isCompleted && styles.timelineLineCompleted,
                          ]}
                        />
                      )}
                    </View>

                    <View style={styles.timelineRight}>
                      <Text
                        style={[
                          styles.timelineLabel,
                          (step.isCompleted || step.isCurrent) &&
                            styles.timelineLabelActive,
                        ]}>
                        {step.label}
                      </Text>
                      {step.date && (
                        <Text style={styles.timelineDate}>
                          {formatShortDate(step.date)}
                        </Text>
                      )}
                    </View>
                  </View>
                ))}
              </View>

              {/* Tracking Number */}
              {order.trackingNumber && (
                <TouchableOpacity
                  style={styles.trackingCard}
                  onPress={handleTrackPackage}>
                  <View style={styles.trackingInfo}>
                    <Text style={styles.trackingIcon}>📦</Text>
                    <View style={styles.trackingTextContainer}>
                      <Text style={styles.trackingLabel}>Numéro de suivi</Text>
                      <Text style={styles.trackingNumber}>
                        {order.trackingNumber}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.trackingArrow}>›</Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </Card>

        {/* Items */}
        <Card variant="outlined" padding="medium" style={styles.section}>
          <Text style={styles.sectionTitle}>
            Articles ({order.items.length})
          </Text>

          {order.items.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.orderItem,
                index < order.items.length - 1 && styles.orderItemBorder,
              ]}
              onPress={() =>
                navigation.navigate('ProductDetail', {
                  productId: item.product._id,
                })
              }>
              <View style={styles.orderItemInfo}>
                <Text style={styles.orderItemName}>{item.product.name}</Text>
                <Text style={styles.orderItemQuantity}>
                  Quantité: {item.quantity}
                </Text>
                <Text style={styles.orderItemPrice}>
                  {item.price.toFixed(2)} € / unité
                </Text>
              </View>
              <Text style={styles.orderItemTotal}>
                {(item.price * item.quantity).toFixed(2)} €
              </Text>
            </TouchableOpacity>
          ))}
        </Card>

        {/* Payment Summary */}
        <Card variant="outlined" padding="medium" style={styles.section}>
          <Text style={styles.sectionTitle}>Détails du paiement</Text>

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
            <Text style={styles.summaryLabel}>TVA (10%)</Text>
            <Text style={styles.summaryValue}>
              {((order.total * 0.1) / 1.1).toFixed(2)} €
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{order.total.toFixed(2)} €</Text>
          </View>

          <View style={styles.paymentMethodRow}>
            <Text style={styles.paymentMethodIcon}>
              {order.paymentMethod === 'card' ? '💳' : '💰'}
            </Text>
            <View style={styles.paymentMethodInfo}>
              <Text style={styles.paymentMethodLabel}>
                {order.paymentMethod === 'card' ? 'Carte bancaire' : 'PayPal'}
              </Text>
              <PaymentStatusBadge status={order.paymentStatus as any} />
            </View>
          </View>
        </Card>

        {/* Shipping Address */}
        <Card variant="outlined" padding="medium" style={styles.section}>
          <Text style={styles.sectionTitle}>Adresse de livraison</Text>
          <View style={styles.addressCard}>
            <Text style={styles.addressName}>{order.shippingAddress.fullName}</Text>
            <Text style={styles.addressText}>
              {order.shippingAddress.street}
              {'\n'}
              {order.shippingAddress.postalCode} {order.shippingAddress.city}
              {'\n'}
              {order.shippingAddress.country}
            </Text>
            <Text style={styles.addressPhone}>📱 {order.shippingAddress.phone}</Text>
          </View>
        </Card>

        {/* Action Buttons */}
        {canBeCancelled && (
          <Button
            title="Annuler la commande"
            onPress={handleCancelOrder}
            loading={isCancelling}
            variant="outline"
            style={[styles.actionButton, styles.cancelButton]}
          />
        )}

        <Button
          title="Contacter le support"
          onPress={handleContactSupport}
          variant="outline"
          leftIcon={<Text style={styles.buttonIcon}>💬</Text>}
          style={styles.actionButton}
        />

        {order.status === 'delivered' && (
          <Button
            title="Commander à nouveau"
            onPress={() => {
              Alert.alert(
                'Commander à nouveau',
                'Voulez-vous ajouter tous les articles de cette commande à votre panier ?',
                [
                  { text: 'Annuler', style: 'cancel' },
                  {
                    text: 'Ajouter au panier',
                    onPress: () => {
                      order.items.forEach(item => {
                        dispatch(addToCart({
                          product: item.product,
                          quantity: item.quantity,
                        }));
                      });
                      Alert.alert(
                        'Succès',
                        'Les articles ont été ajoutés à votre panier',
                        [
                          { text: 'Continuer', style: 'cancel' },
                          {
                            text: 'Voir le panier',
                            onPress: () => navigation.navigate('Cart' as never),
                          },
                        ]
                      );
                    },
                  },
                ]
              );
            }}
            leftIcon={<Text style={styles.buttonIcon}>🔄</Text>}
            style={styles.actionButton}
          />
        )}

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
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text.primary,
  },
  headerSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  shareButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  shareIcon: {
    fontSize: 20,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  statusCard: {
    marginBottom: SPACING.lg,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  statusDate: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
  },
  cancelledInfo: {
    flexDirection: 'row',
    backgroundColor: `${COLORS.error}15`,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: `${COLORS.error}30`,
  },
  cancelledIcon: {
    fontSize: 24,
    marginRight: SPACING.sm,
  },
  cancelledTextContainer: {
    flex: 1,
  },
  cancelledTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.error,
    marginBottom: SPACING.xs,
  },
  cancelledText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
    lineHeight: 20,
  },
  timeline: {
    marginBottom: SPACING.md,
  },
  timelineStep: {
    flexDirection: 'row',
    marginBottom: SPACING.xs,
  },
  timelineLeft: {
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  timelineCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineCircleCompleted: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },
  timelineCircleCurrent: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  timelineCheckmark: {
    fontSize: 14,
    color: COLORS.text.white,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: COLORS.border,
    marginVertical: 4,
  },
  timelineLineCompleted: {
    backgroundColor: COLORS.success,
  },
  timelineRight: {
    flex: 1,
    paddingVertical: 2,
  },
  timelineLabel: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text.secondary,
    marginBottom: 2,
  },
  timelineLabelActive: {
    color: COLORS.text.primary,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  timelineDate: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.text.secondary,
  },
  trackingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: SPACING.md,
  },
  trackingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  trackingIcon: {
    fontSize: 24,
    marginRight: SPACING.md,
  },
  trackingTextContainer: {
    flex: 1,
  },
  trackingLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.text.secondary,
    marginBottom: 2,
  },
  trackingNumber: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.primary,
  },
  trackingArrow: {
    fontSize: 24,
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
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: SPACING.md,
  },
  orderItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  orderItemInfo: {
    flex: 1,
    marginRight: SPACING.md,
  },
  orderItemName: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  orderItemQuantity: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
    marginBottom: 2,
  },
  orderItemPrice: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
  },
  orderItemTotal: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
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
  paymentMethodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  paymentMethodIcon: {
    fontSize: 24,
    marginRight: SPACING.md,
  },
  paymentMethodInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentMethodLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
  },
  addressCard: {
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
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
  actionButton: {
    marginBottom: SPACING.md,
  },
  cancelButton: {
    borderColor: COLORS.error,
  },
  buttonIcon: {
    fontSize: 16,
    marginRight: SPACING.xs,
  },
  bottomSpacer: {
    height: SPACING.xl,
  },
});

export default OrderDetailScreen;
