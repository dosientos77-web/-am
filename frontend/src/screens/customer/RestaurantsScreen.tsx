import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { api } from '../../services/api';
import { RestaurantCard } from '../../components/RestaurantCard';
import { Loading } from '../../components/Loading';
import { EmptyState } from '../../components/EmptyState';
import { ErrorState } from '../../components/ErrorState';
import { colors, spacing, fontSize } from '../../theme';
import { Restaurant } from '../../types';

export function RestaurantsScreen(): React.JSX.Element {
  const navigation = useNavigation<any>();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadRestaurants = async () => {
    setLoading(true);
    setError('');
    try {
      const response: any = await api.getRestaurants({ status: 'ACTIVE' });
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

  if (loading) return <Loading fullScreen message="Cargando restaurantes..." />;
  if (error) return <ErrorState message={error} onRetry={loadRestaurants} />;
  if (restaurants.length === 0) return <EmptyState message="No hay establecimientos disponibles" icon="🍽️" />;

  return (
    <View style={styles.container}>
      <FlatList
        data={restaurants}
        keyExtractor={(item) => item._id}
        numColumns={2}
        contentContainerStyle={styles.list}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => (
          <View style={styles.cardContainer}>
            <RestaurantCard
              restaurant={item}
              onPress={() => navigation.navigate('RestaurantMenu', { restaurantId: item._id })}
            />
          </View>
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
    padding: spacing.sm,
  },
  row: {
    justifyContent: 'space-between',
  },
  cardContainer: {
    width: '48%',
    marginBottom: spacing.md,
  },
});
