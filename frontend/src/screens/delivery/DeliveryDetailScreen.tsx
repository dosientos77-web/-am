import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { api } from '../../services/api';
import { Loading } from '../../components/Loading';
import { ErrorState } from '../../components/ErrorState';
import { StatusBadge } from '../../components/StatusBadge';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { colors, spacing, fontSize, fontWeight } from '../../theme';
import { Order } from '../../types';

export function DeliveryDetailScreen(): React.JSX.Element {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { orderId } = route.params;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadOrder = async () => {
    setLoading(true);
    setError('');
    try {
      const response: any = await api.getOrder(orderId);
      setOrder(response.data);
    } catch (err: any) {
      setError(err.message || 'No pudimos cargar la entrega');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  const updateStatus = async (status: string) => {
    try {
      await api.updateOrderStatus(orderId, status);
      loadOrder();
    } catch (err: any) {
      setError(err.message || 'No pudimos actualizar el estado');
    }
  };

  if (loading) return <Loading fullScreen message="Cargando entrega..." />;
  if (error) return <ErrorState message={error} onRetry={loadOrder} />;
  if (!order) return <Loading fullScreen message="Cargando entrega..." />;

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.orderId}>Entrega #{order._id.slice(-6)}</Text>
          <StatusBadge status={order.status} />
        </View>
        <Text style={styles.date}>{new Date(order.createdAt).toLocaleString()}</Text>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Dirección de entrega</Text>
        <Text style={styles.address}>{order.deliveryAddress || 'Sin dirección'}</Text>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Artículos</Text>
        {order.items.map((item, index) => (
          <View key={index} style={styles.item}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemDetails}>{item.quantity} x ${item.price.toFixed(2)}</Text>
          </View>
        ))}
      </Card>

      {order.status === 'READY' && (
        <Button
          title="Recoger pedido"
          onPress={() => updateStatus('OUT_FOR_DELIVERY')}
          style={styles.actionButton}
        />
      )}
      {order.status === 'OUT_FOR_DELIVERY' && (
        <Button
          title="Confirmar entrega"
          onPress={() => navigation.navigate('ConfirmDelivery', { orderId })}
          style={styles.actionButton}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.md },
  card: { marginBottom: spacing.md },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  orderId: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.gray900 },
  date: { fontSize: fontSize.sm, color: colors.gray600 },
  sectionTitle: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.gray900, marginBottom: spacing.sm },
  address: { fontSize: fontSize.md, color: colors.gray700 },
  item: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.gray200 },
  itemName: { fontSize: fontSize.md, color: colors.gray900 },
  itemDetails: { fontSize: fontSize.sm, color: colors.gray600 },
  actionButton: { marginTop: spacing.md },
});
