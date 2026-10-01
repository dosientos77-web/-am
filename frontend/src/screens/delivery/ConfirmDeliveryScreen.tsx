import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { api } from '../../services/api';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../../theme';

export function ConfirmDeliveryScreen(): React.JSX.Element {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { orderId } = route.params;

  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setError('');
    if (!code.trim()) {
      setError('Por favor ingresa el código de entrega');
      return;
    }
    setLoading(true);
    try {
      await api.confirmDelivery(orderId, code.trim().toUpperCase());
      navigation.goBack();
    } catch (err: any) {
      setError(err.message || 'No pudimos confirmar la entrega');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Text style={styles.title}>Confirmar entrega</Text>
        <Text style={styles.subtitle}>Ingresa el código de entrega proporcionado por el cliente</Text>

        <TextInput
          style={styles.input}
          value={code}
          onChangeText={setCode}
          placeholder="Código de entrega"
          autoCapitalize="characters"
          maxLength={6}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button
          title="Confirmar entrega"
          onPress={handleConfirm}
          loading={loading}
          style={styles.confirmButton}
        />
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
    justifyContent: 'center',
  },
  card: {
    padding: spacing.lg,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.gray900,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.gray600,
    marginBottom: spacing.lg,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.gray300,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: fontSize.lg,
    textAlign: 'center',
    letterSpacing: 4,
    marginBottom: spacing.md,
  },
  error: {
    color: colors.error,
    fontSize: fontSize.sm,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  confirmButton: {
    marginTop: spacing.md,
  },
});
