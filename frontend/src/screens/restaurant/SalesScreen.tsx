import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { api } from '../../services/api';
import { Card } from '../../components/Card';
import { Loading } from '../../components/Loading';
import { ErrorState } from '../../components/ErrorState';
import { colors, spacing, fontSize, fontWeight } from '../../theme';

export function SalesScreen(): React.JSX.Element {
  const [sales, setSales] = useState({ totalSales: 0, totalOrders: 0, averageOrder: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadSales = async () => {
    setLoading(true);
    setError('');
    try {
      const response: any = await api.getOrders();
      const orders = response.data;
      const deliveredOrders = orders.filter((o: any) => o.status === 'DELIVERED');
      const totalSales = deliveredOrders.reduce((sum: number, o: any) => sum + o.total, 0);
      const totalOrders = deliveredOrders.length;
      const averageOrder = totalOrders > 0 ? totalSales / totalOrders : 0;

      setSales({ totalSales, totalOrders, averageOrder });
    } catch (err: any) {
      setError(err.message || 'No pudimos cargar las ventas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSales();
  }, []);

  if (loading) return <Loading fullScreen message="Cargando ventas..." />;
  if (error) return <ErrorState message={error} onRetry={loadSales} />;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Ventas</Text>

      <Card style={styles.card}>
        <Text style={styles.label}>Ventas totales</Text>
        <Text style={styles.value}>${sales.totalSales.toFixed(2)}</Text>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.label}>Pedidos totales</Text>
        <Text style={styles.value}>{sales.totalOrders}</Text>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.label}>Promedio por pedido</Text>
        <Text style={styles.value}>${sales.averageOrder.toFixed(2)}</Text>
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
  title: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.gray900,
    marginBottom: spacing.lg,
  },
  card: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: fontSize.sm,
    color: colors.gray600,
    marginBottom: spacing.xs,
  },
  value: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.primary,
  },
});
