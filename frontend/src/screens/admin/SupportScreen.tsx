import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { api } from '../../services/api';
import { Loading } from '../../components/Loading';
import { EmptyState } from '../../components/EmptyState';
import { ErrorState } from '../../components/ErrorState';
import { Card } from '../../components/Card';
import { StatusBadge } from '../../components/StatusBadge';
import { colors, spacing, fontSize, fontWeight } from '../../theme';

export function SupportScreen(): React.JSX.Element {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadTickets = async () => {
    setLoading(true);
    setError('');
    try {
      const response: any = await api.getSupportTickets();
      setTickets(response.data);
    } catch (err: any) {
      setError(err.message || 'No pudimos cargar los tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  if (loading) return <Loading fullScreen message="Cargando tickets..." />;
  if (error) return <ErrorState message={error} onRetry={loadTickets} />;
  if (tickets.length === 0) return <EmptyState message="No hay tickets de soporte" icon="🎫" />;

  return (
    <View style={styles.container}>
      <FlatList
        data={tickets}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <View style={styles.header}>
              <Text style={styles.subject}>{item.subject}</Text>
              <StatusBadge status={item.status} />
            </View>
            <Text style={styles.message}>{item.message}</Text>
            <Text style={styles.priority}>Prioridad: {item.priority}</Text>
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
  subject: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.gray900,
    flex: 1,
  },
  message: {
    fontSize: fontSize.sm,
    color: colors.gray600,
  },
  priority: {
    fontSize: fontSize.xs,
    color: colors.primary,
    fontWeight: fontWeight.semibold,
    marginTop: spacing.sm,
  },
});
