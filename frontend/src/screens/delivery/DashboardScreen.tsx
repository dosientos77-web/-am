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
  const [stats, setStats] = useState({ available: 0, active: 0, completed: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadStats = async () => {
    setLoading(true);
    setError('');
    try {
      const response: any = await api.getOrders();
      const orders = response.data;
      setStats({
        available: orders.filter((o: any) => o.status === 'READY' && o.deliveryType === 'DELIVERY').length,
        active: orders.filter((o: any) => o.status === 'OUT_FOR_DELIVERY').length,
        completed: orders.filter((o: any) => o.status === 'DELIVERED').length,
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
          <Text style={styles.statValue}>{stats.available}</Text>
          <Text style={styles.statLabel}>Disponibles</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statValue}>{stats.active}</Text>
          <Text style={styles.statLabel}>En curso</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statValue}>{stats.completed}</Text>
          <Text style={styles.statLabel}>Completadas</Text>
        </Card>
      </View>

      <Text style={styles.sectionTitle}>Acciones rápidas</Text>
      <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Deliveries')}>
        <Text style={styles.menuText}>🚴 Ver entregas disponibles</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('History')}>
        <Text style={styles.menuText}>📋 Historial de entregas</Text>
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
    width: '30%',
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  statValue: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.primary,
  },
  statLabel: {
    fontSize: fontSize.xs,
    color: colors.gray600,
    marginTop: spacing.xs,
    textAlign: 'center',
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
