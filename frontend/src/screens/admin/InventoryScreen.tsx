import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { api } from '../../services/api';
import { Loading } from '../../components/Loading';
import { EmptyState } from '../../components/EmptyState';
import { ErrorState } from '../../components/ErrorState';
import { StatusBadge } from '../../components/StatusBadge';
import { Card } from '../../components/Card';
import { colors, spacing, fontSize, fontWeight } from '../../theme';
import { Inventory } from '../../types';

export function InventoryScreen(): React.JSX.Element {
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadInventory = async () => {
    setLoading(true);
    setError('');
    try {
      const response: any = await api.getInventory();
      setInventory(response.data);
    } catch (err: any) {
      setError(err.message || 'No pudimos cargar el inventario');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  if (loading) return <Loading fullScreen message="Cargando inventario..." />;
  if (error) return <ErrorState message={error} onRetry={loadInventory} />;
  if (inventory.length === 0) return <EmptyState message="No hay inventario" icon="📦" />;

  return (
    <View style={styles.container}>
      <FlatList
        data={inventory}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <View style={styles.header}>
              <Text style={styles.productName}>{typeof item.product === 'object' ? (item.product as any).name : 'Producto'}</Text>
              <StatusBadge status={item.status} />
            </View>
            <View style={styles.details}>
              <Text style={styles.detail}>Stock: {item.stock}</Text>
              <Text style={styles.detail}>Mínimo: {item.minimumStock}</Text>
            </View>
          </Card>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  list: {
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
  productName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.gray900,
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detail: {
    fontSize: fontSize.sm,
    color: colors.gray600,
  },
});
