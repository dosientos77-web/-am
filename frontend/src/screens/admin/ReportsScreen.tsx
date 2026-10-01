import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { api } from '../../services/api';
import { Card } from '../../components/Card';
import { Loading } from '../../components/Loading';
import { ErrorState } from '../../components/ErrorState';
import { colors, spacing, fontSize, fontWeight } from '../../theme';

export function ReportsScreen(): React.JSX.Element {
  const [reports, setReports] = useState({ totalOrders: 0, totalRevenue: 0, averageOrder: 0, topRestaurant: 'N/A' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadReports = async () => {
    setLoading(true);
    setError('');
    try {
      const response: any = await api.getOrders();
      const orders = response.data;
      const totalOrders = orders.length;
      const totalRevenue = orders.reduce((sum: number, o: any) => sum + o.total, 0);
      const averageOrder = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      setReports({ totalOrders, totalRevenue, averageOrder, topRestaurant: 'N/A' });
    } catch (err: any) {
      setError(err.message || 'No pudimos cargar los reportes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  if (loading) return <Loading fullScreen message="Cargando reportes..." />;
  if (error) return <ErrorState message={error} onRetry={loadReports} />;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Reportes</Text>

      <Card style={styles.card}>
        <Text style={styles.label}>Pedidos totales</Text>
        <Text style={styles.value}>{reports.totalOrders}</Text>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.label}>Ingresos totales</Text>
        <Text style={styles.value}>${reports.totalRevenue.toFixed(2)}</Text>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.label}>Promedio por pedido</Text>
        <Text style={styles.value}>${reports.averageOrder.toFixed(2)}</Text>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.label}>Restaurante top</Text>
        <Text style={styles.value}>{reports.topRestaurant}</Text>
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
