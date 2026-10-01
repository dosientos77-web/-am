import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { api } from '../../services/api';
import { OrderCard } from '../../components/OrderCard';
import { Loading } from '../../components/Loading';
import { EmptyState } from '../../components/EmptyState';
import { ErrorState } from '../../components/ErrorState';
import { colors, spacing } from '../../theme';
import { Order } from '../../types';

export function DeliveriesScreen(): React.JSX.Element {
  const navigation = useNavigation<any>();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDeliveries = async () => {
    setLoading(true);
    setError('');
    try {
      const response: any = await api.getOrders();
      const allOrders = response.data;
      // Filter for delivery orders that are ready or out for delivery
      const deliveries = allOrders.filter((o: any) =>
        o.deliveryType === 'DELIVERY' && (o.status === 'READY' || o.status === 'OUT_FOR_DELIVERY')
      );
      setOrders(deliveries);
    } catch (err: any) {
      setError(err.message || 'No pudimos cargar las entregas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDeliveries();
  }, []);

  if (loading) return <Loading fullScreen message="Cargando entregas..." />;
  if (error) return <ErrorState message={error} onRetry={loadDeliveries} />;
  if (orders.length === 0) return <EmptyState message="No hay entregas disponibles" icon="🚴" />;

  return (
    <View style={styles.container}>
      <FlatList
        data={orders}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <OrderCard
            order={item}
            onPress={() => navigation.navigate('DeliveryDetail', { orderId: item._id })}
          />
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
});
