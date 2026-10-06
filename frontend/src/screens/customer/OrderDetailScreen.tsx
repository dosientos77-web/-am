import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { api } from '../../services/api';
import { Loading } from '../../components/Loading';
import { ErrorState } from '../../components/ErrorState';
import { StatusBadge } from '../../components/StatusBadge';
import { Card } from '../../components/Card';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../../theme';
import { Order } from '../../types';

export function OrderDetailScreen(): React.JSX.Element {
  const route = useRoute<any>();
  const { orderId } = route.params;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadOrder = async () => {
    setLoading(true);
    setError('');
    try {
      const response: any = await api.getOrder(orderId);
      setOrder(response.data);
    } catch (err: any) {
      setError(err.message || 'No pudimos cargar el pedido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  if (loading) return <Loading fullScreen message="Cargando pedido..." />;
  if (error) return <ErrorState message={error} onRetry={loadOrder} />;
  if (!order) return <Loading fullScreen message="Cargando pedido..." />;

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.orderId}>Pedido #{order._id.slice(-6)}</Text>
          <StatusBadge status={order.status} />
        </View>
        <Text style={styles.date}>
          {new Date(order.createdAt).toLocaleString()}
        </Text>
      </Card>

      {order.deliveryType === 'DELIVERY' && order.deliveryCode && order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Código de entrega</Text>
          <Text style={styles.deliveryCode}>{order.deliveryCode}</Text>
          <Text style={styles.deliveryCodeHelp}>
            Proporciona este código al repartidor cuando recibas tu pedido.
          </Text>
        </Card>
      )}

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Artículos</Text>
        {order.items.map((item, index) => (
          <View key={index} style={styles.item}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemDetails}>
              {item.quantity} x ${item.price.toFixed(2)}
            </Text>
          </View>
        ))}
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Resumen</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text style={styles.summaryValue}>${order.subtotal.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Envío</Text>
          <Text style={styles.summaryValue}>${order.deliveryFee.toFixed(2)}</Text>
        </View>
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>${order.total.toFixed(2)}</Text>
        </View>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
  },
  card: {
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  orderId: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.gray900,
  },
  date: {
    fontSize: fontSize.sm,
    color: colors.gray600,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.gray900,
    marginBottom: spacing.sm,
  },
  deliveryCode: {
    fontSize: 32,
    fontWeight: fontWeight.bold,
    color: colors.primary,
    letterSpacing: 6,
    textAlign: 'center',
    marginVertical: spacing.sm,
  },
  deliveryCodeHelp: {
    fontSize: fontSize.sm,
    color: colors.gray600,
    textAlign: 'center',
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  itemName: {
    fontSize: fontSize.md,
    color: colors.gray900,
  },
  itemDetails: {
    fontSize: fontSize.sm,
    color: colors.gray600,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  summaryLabel: {
    fontSize: fontSize.md,
    color: colors.gray700,
  },
  summaryValue: {
    fontSize: fontSize.md,
    color: colors.gray900,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
    marginTop: spacing.sm,
    paddingTop: spacing.md,
  },
  totalLabel: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.gray900,
  },
  totalValue: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.primary,
  },
});
