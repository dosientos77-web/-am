import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../theme';
import { OrderStatus, RestaurantStatus, InventoryStatus } from '../types';

type StatusType = OrderStatus | RestaurantStatus | InventoryStatus;

interface StatusBadgeProps {
  status: StatusType;
}

const statusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  // Order statuses
  PENDING: { label: 'Pendiente', color: colors.warning, bgColor: '#FFF3CD' },
  CONFIRMED: { label: 'Confirmado', color: colors.info, bgColor: '#D1ECF1' },
  PREPARING: { label: 'Preparando', color: colors.info, bgColor: '#D1ECF1' },
  READY: { label: 'Listo', color: colors.success, bgColor: '#D4EDDA' },
  OUT_FOR_DELIVERY: { label: 'En camino', color: colors.info, bgColor: '#D1ECF1' },
  DELIVERED: { label: 'Entregado', color: colors.success, bgColor: '#D4EDDA' },
  CANCELLED: { label: 'Cancelado', color: colors.error, bgColor: '#F8D7DA' },
  // Restaurant statuses
  PENDING_APPROVAL: { label: 'Pendiente de aprobación', color: colors.warning, bgColor: '#FFF3CD' },
  ACTIVE: { label: 'Activo', color: colors.success, bgColor: '#D4EDDA' },
  INACTIVE: { label: 'Inactivo', color: colors.gray600, bgColor: colors.gray200 },
  SUSPENDED: { label: 'Suspendido', color: colors.error, bgColor: '#F8D7DA' },
  // Inventory statuses
  AVAILABLE: { label: 'Disponible', color: colors.success, bgColor: '#D4EDDA' },
  LOW_STOCK: { label: 'Stock bajo', color: colors.warning, bgColor: '#FFF3CD' },
  OUT_OF_STOCK: { label: 'Agotado', color: colors.error, bgColor: '#F8D7DA' },
};

export function StatusBadge({ status }: StatusBadgeProps): React.JSX.Element {
  const config = statusConfig[status] || { label: status, color: colors.gray600, bgColor: colors.gray200 };

  return (
    <View style={[styles.badge, { backgroundColor: config.bgColor }]}>
      <Text style={[styles.text, { color: config.color }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },
});
