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
  const [stats, setStats] = useState({ users: 0, restaurants: 0, orders: 0, revenue: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadStats = async () => {
    setLoading(true);
    setError('');
    try {
      const [ordersRes, restaurantsRes] = await Promise.all([
        api.getOrders(),
        api.getRestaurants(),
      ]);
      const orders = (ordersRes as any).data;
      setStats({
        users: 0,
        restaurants: (restaurantsRes as any).data.length,
        orders: orders.length,
        revenue: orders.reduce((sum: number, o: any) => sum + o.total, 0),
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
      <Text style={styles.title}>Dashboard Admin</Text>

      <View style={styles.statsGrid}>
        <Card style={styles.statCard}>
          <Text style={styles.statValue}>{stats.users}</Text>
          <Text style={styles.statLabel}>Usuarios</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statValue}>{stats.restaurants}</Text>
          <Text style={styles.statLabel}>Restaurantes</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statValue}>{stats.orders}</Text>
          <Text style={styles.statLabel}>Pedidos</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statValue}>${stats.revenue.toFixed(2)}</Text>
          <Text style={styles.statLabel}>Ingresos</Text>
        </Card>
      </View>

      <Text style={styles.sectionTitle}>Módulos</Text>
      <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Users')}>
        <Text style={styles.menuText}>👥 Usuarios</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Restaurants')}>
        <Text style={styles.menuText}>🍴 Restaurantes</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Orders')}>
        <Text style={styles.menuText}>📋 Pedidos</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Inventory')}>
        <Text style={styles.menuText}>📦 Inventario</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Reports')}>
        <Text style={styles.menuText}>📊 Reportes</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Promotions')}>
        <Text style={styles.menuText}>🎉 Promociones</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Support')}>
        <Text style={styles.menuText}>🎫 Soporte</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('AuditLogs')}>
        <Text style={styles.menuText}>📝 Auditoría</Text>
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
