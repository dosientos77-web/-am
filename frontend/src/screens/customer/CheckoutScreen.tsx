import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useCart } from '../../context/CartContext';
import { api } from '../../services/api';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../../theme';

type DeliveryOption = 'PICKUP' | 'DELIVERY';
type PaymentMethod = 'CASH' | 'CARD' | 'TRANSFER';

export function CheckoutScreen(): React.JSX.Element {
  const navigation = useNavigation<any>();
  const { state, totalPrice, clearCart } = useCart();
  const [deliveryType, setDeliveryType] = useState<DeliveryOption>('PICKUP');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [address, setAddress] = useState('');
  const [pickupTime, setPickupTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const deliveryFee = deliveryType === 'DELIVERY' ? 2.99 : 0;
  const total = useMemo(() => totalPrice + deliveryFee, [totalPrice, deliveryFee]);

  const submitOrder = async () => {
    setError('');
    if (!state.items.length || !state.restaurantId) {
      setError('Tu carrito está vacío.');
      return;
    }
    if (deliveryType === 'DELIVERY' && !address.trim()) {
      setError('Escribe la dirección de entrega.');
      return;
    }

    setLoading(true);
    try {
      const response: any = await api.createOrder({
        restaurant: state.restaurantId,
        items: state.items.map((item) => ({ product: item.product._id, quantity: item.quantity })),
        deliveryType,
        deliveryAddress: deliveryType === 'DELIVERY' ? address.trim() : undefined,
        pickupTime: deliveryType === 'PICKUP' ? pickupTime.trim() : undefined,
        paymentMethod,
      });

      const orderId = response.data?._id;
      clearCart();
      navigation.replace(orderId ? 'OrderDetail' : 'Orders', orderId ? { orderId } : undefined);
    } catch (err: any) {
      setError(err.message || 'No pudimos crear tu pedido.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Finalizar pedido</Text>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Tipo de entrega</Text>
        <TouchableOpacity style={[styles.option, deliveryType === 'PICKUP' && styles.optionSelected]} onPress={() => setDeliveryType('PICKUP')}>
          <Text style={styles.optionTitle}>Recoger</Text>
          <Text style={styles.optionText}>Recoge tu pedido en el establecimiento</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.option, deliveryType === 'DELIVERY' && styles.optionSelected]} onPress={() => setDeliveryType('DELIVERY')}>
          <Text style={styles.optionTitle}>Entrega</Text>
          <Text style={styles.optionText}>Recibe el pedido en la dirección indicada</Text>
        </TouchableOpacity>

        <Text style={styles.label}>{deliveryType === 'DELIVERY' ? 'Dirección de entrega' : 'Hora de recogida (opcional)'}</Text>
        <TextInput
          style={styles.input}
          value={deliveryType === 'DELIVERY' ? address : pickupTime}
          onChangeText={deliveryType === 'DELIVERY' ? setAddress : setPickupTime}
          placeholder={deliveryType === 'DELIVERY' ? 'Ej. Edificio B, salón 204' : 'Ej. 13:30'}
          multiline={deliveryType === 'DELIVERY'}
        />
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Método de pago</Text>
        {(['CASH', 'CARD', 'TRANSFER'] as PaymentMethod[]).map((method) => (
          <TouchableOpacity key={method} style={[styles.option, paymentMethod === method && styles.optionSelected]} onPress={() => setPaymentMethod(method)}>
            <Text style={styles.optionTitle}>{method === 'CASH' ? 'Efectivo' : method === 'CARD' ? 'Tarjeta' : 'Transferencia'}</Text>
            <Text style={styles.optionText}>
              {method === 'CASH' ? 'Pago al recoger o recibir' : 'Modo simulado para el proyecto escolar'}
            </Text>
          </TouchableOpacity>
        ))}
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Resumen</Text>
        <View style={styles.row}><Text>Subtotal</Text><Text>{'$'}{totalPrice.toFixed(2)}</Text></View>
        <View style={styles.row}><Text>Envío</Text><Text>{'$'}{deliveryFee.toFixed(2)}</Text></View>
        <View style={[styles.row, styles.totalRow]}><Text style={styles.totalLabel}>Total</Text><Text style={styles.totalValue}>{'$'}{total.toFixed(2)}</Text></View>
      </Card>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button title="Confirmar pedido" onPress={submitOrder} loading={loading} disabled={!state.items.length} style={styles.button} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: spacing.xl },
  title: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.gray900, marginBottom: spacing.md },
  card: { marginBottom: spacing.md },
  sectionTitle: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.gray900, marginBottom: spacing.md },
  option: { borderWidth: 1, borderColor: colors.gray300, borderRadius: borderRadius.md, padding: spacing.md, marginBottom: spacing.sm },
  optionSelected: { borderColor: colors.primary, backgroundColor: colors.gray100 },
  optionTitle: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.gray900 },
  optionText: { fontSize: fontSize.sm, color: colors.gray600, marginTop: spacing.xs },
  label: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.gray700, marginTop: spacing.sm, marginBottom: spacing.xs },
  input: { borderWidth: 1, borderColor: colors.gray300, borderRadius: borderRadius.md, padding: spacing.md, fontSize: fontSize.md, color: colors.gray900, minHeight: 48 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm },
  totalRow: { borderTopWidth: 1, borderTopColor: colors.gray200, marginTop: spacing.sm, paddingTop: spacing.md },
  totalLabel: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.gray900 },
  totalValue: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.primary },
  error: { color: colors.error, textAlign: 'center', marginBottom: spacing.md },
  button: { marginTop: spacing.sm },
});