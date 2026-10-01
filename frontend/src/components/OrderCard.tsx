import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Order } from '../types';
import { StatusBadge } from './StatusBadge';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../theme';

interface OrderCardProps {
  order: Order;
  onPress?: () => void;
}

export function OrderCard({ order, onPress }: OrderCardProps): React.JSX.Element {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <Text style={styles.orderId}>Pedido #{order._id.slice(-6)}</Text>
        <StatusBadge status={order.status} />
      </View>
      <Text style={styles.restaurant}>Restaurante: {order.restaurant}</Text>
      <Text style={styles.items}>{order.items.length} artículo(s)</Text>
      <View style={styles.footer}>
        <Text style={styles.total}>${order.total.toFixed(2)}</Text>
        <Text style={styles.date}>{new Date(order.createdAt).toLocaleDateString()}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  orderId: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.gray900,
  },
  restaurant: {
    fontSize: fontSize.sm,
    color: colors.gray700,
  },
  items: {
    fontSize: fontSize.sm,
    color: colors.gray600,
    marginTop: spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
  },
  total: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.primary,
  },
  date: {
    fontSize: fontSize.xs,
    color: colors.gray500,
  },
});
