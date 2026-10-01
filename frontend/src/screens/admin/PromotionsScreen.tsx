import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { api } from '../../services/api';
import { Loading } from '../../components/Loading';
import { EmptyState } from '../../components/EmptyState';
import { ErrorState } from '../../components/ErrorState';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { colors, spacing, fontSize, fontWeight } from '../../theme';

export function PromotionsScreen(): React.JSX.Element {
  const [promotions, setPromotions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadPromotions = async () => {
    setLoading(true);
    setError('');
    try {
      const response: any = await api.getPromotions();
      setPromotions(response.data);
    } catch (err: any) {
      setError(err.message || 'No pudimos cargar las promociones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPromotions();
  }, []);

  if (loading) return <Loading fullScreen message="Cargando promociones..." />;
  if (error) return <ErrorState message={error} onRetry={loadPromotions} />;
  if (promotions.length === 0) return <EmptyState message="No hay promociones" icon="🎉" />;

  return (
    <View style={styles.container}>
      <FlatList
        data={promotions}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.description}>{item.description}</Text>
            <Text style={styles.discount}>
              {item.type === 'PERCENTAGE' ? `${item.discount}%` : `$${item.discount}`}
            </Text>
          </Card>
        )}
      />
      <Button
        title="Crear promoción"
        onPress={() => {}}
        style={styles.addButton}
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
  name: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.gray900,
  },
  description: {
    fontSize: fontSize.sm,
    color: colors.gray600,
    marginTop: spacing.xs,
  },
  discount: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.primary,
    marginTop: spacing.sm,
  },
  addButton: {
    margin: spacing.md,
  },
});
