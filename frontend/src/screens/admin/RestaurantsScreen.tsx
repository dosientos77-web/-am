import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { api } from '../../services/api';
import { Loading } from '../../components/Loading';
import { EmptyState } from '../../components/EmptyState';
import { ErrorState } from '../../components/ErrorState';
import { Card } from '../../components/Card';
import { StatusBadge } from '../../components/StatusBadge';
import { Button } from '../../components/Button';
import { colors, spacing, fontSize, fontWeight } from '../../theme';
import { Restaurant } from '../../types';

export function RestaurantsScreen(): React.JSX.Element {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadRestaurants = async () => {
    setLoading(true);
    setError('');
    try {
      const response: any = await api.getRestaurants();
      setRestaurants(response.data);
    } catch (err: any) {
      setError(err.message || 'No pudimos cargar los restaurantes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRestaurants();
  }, []);

  const approveRestaurant = async (id: string) => {
    try {
      await api.approveRestaurant(id);
      loadRestaurants();
    } catch (err: any) {
      setError(err.message || 'No pudimos aprobar el restaurante');
    }
  };

  if (loading) return <Loading fullScreen message="Cargando restaurantes..." />;
  if (error) return <ErrorState message={error} onRetry={loadRestaurants} />;
  if (restaurants.length === 0) return <EmptyState message="No hay restaurantes" icon="🍴" />;

  return (
    <View style={styles.container}>
      <FlatList
        data={restaurants}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <View style={styles.header}>
              <Text style={styles.name}>{item.name}</Text>
              <StatusBadge status={item.status} />
            </View>
            <Text style={styles.category}>{item.category}</Text>
            {item.status === 'PENDING_APPROVAL' && (
              <Button
                title="Aprobar"
                onPress={() => approveRestaurant(item._id)}
                style={styles.approveButton}
              />
            )}
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
  name: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.gray900,
  },
  category: {
    fontSize: fontSize.sm,
    color: colors.gray600,
  },
  approveButton: {
    marginTop: spacing.sm,
  },
});
