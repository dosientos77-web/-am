import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { api } from '../../services/api';
import { Card } from '../../components/Card';
import { Loading } from '../../components/Loading';
import { ErrorState } from '../../components/ErrorState';
import { colors, spacing, fontSize, fontWeight } from '../../theme';

export function DashboardScreen(): React.JSX.Element {
  const navigation = useNavigation<any>();
  const [stats, setStats] = useState({ totalOrders: 0, pendingOrders: 0, totalProducts: 0, totalSales: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadStats = async () => {
    setLoading(true);
    setError('');
    try {
      const [ordersRes, productsRes] = await Promise.all([
        api.getOrders(),
        api.getProducts({ available: true }),
      ]);
      const orders = (ordersRes as any).data;
      setStats({
        totalOrders: orders.length,
        pendingOrders: orders.filter((o: any) => o.status === 'PENDING' || o.status === 'CONFIRMED').length,
        totalProducts: (productsRes as any).data.length,
        totalSales: orders.reduce((sum: number, o: any) => sum + o.total, 0),
      });
    } catch (err: any) {
      setError(err.message || 'No pudimos cargar el dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  if (loading) return <Loading fullScreen message="Cargando dashboard..." />;
  if (error) return <ErrorState message={error} onRetry={loadStats} />;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>

      <View style={styles.statsGrid}>
        <Card style={styles.statCard}>
          <Text style={styles.statValue}>{stats.totalOrders}</Text>
          <Text style={styles.statLabel}>Pedidos totales</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statValue}>{stats.pendingOrders}</Text>
          <Text style={styles.statLabel}>Pendientes</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statValue}>{stats.totalProducts}</Text>
          <Text style={styles.statLabel}>Productos</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statValue}>${stats.totalSales.toFixed(2)}</Text>
          <Text style={styles.statLabel}>Ventas</Text>
        </Card>
      </View>

      <Text style={styles.sectionTitle}>Acciones rápidas</Text>
      <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('RestaurantOrders')}>
        <Text style={styles.menuText}>📋 Gestionar pedidos</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('RestaurantProducts')}>
        <Text style={styles.menuText}>🍕 Gestionar productos</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('RestaurantInventory')}>
        <Text style={styles.menuText}>📦 Gestionar inventario</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('RestaurantSales')}>
        <Text style={styles.menuText}>📊 Ver ventas</Text>
      </TouchableOpacity>
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  statCard: {
    width: '48%',
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  statValue: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.primary,
  },
  statLabel: {
    fontSize: fontSize.sm,
    color: colors.gray600,
    marginTop: spacing.xs,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.gray900,
    marginBottom: spacing.md,
  },
  menuItem: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuText: {
    fontSize: fontSize.md,
    color: colors.gray700,
  },
});
