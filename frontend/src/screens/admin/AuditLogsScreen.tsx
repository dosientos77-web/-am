import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { api } from '../../services/api';
import { Loading } from '../../components/Loading';
import { EmptyState } from '../../components/EmptyState';
import { ErrorState } from '../../components/ErrorState';
import { Card } from '../../components/Card';
import { colors, spacing, fontSize, fontWeight } from '../../theme';

export function AuditLogsScreen(): React.JSX.Element {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadLogs = async () => {
    setLoading(true);
    setError('');
    try {
      const response: any = await api.getAuditLogs();
      setLogs(response.data);
    } catch (err: any) {
      setError(err.message || 'No pudimos cargar los logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  if (loading) return <Loading fullScreen message="Cargando logs..." />;
  if (error) return <ErrorState message={error} onRetry={loadLogs} />;
  if (logs.length === 0) return <EmptyState message="No hay logs de auditoría" icon="📝" />;

  return (
    <View style={styles.container}>
      <FlatList
        data={logs}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <View style={styles.header}>
              <Text style={styles.action}>{item.action}</Text>
              <Text style={styles.date}>{new Date(item.createdAt).toLocaleString()}</Text>
            </View>
            <Text style={styles.entity}>{item.entity}</Text>
            {item.user && (
              <Text style={styles.user}>
                Usuario: {typeof item.user === 'object' ? item.user.name : 'N/A'}
              </Text>
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
  action: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.primary,
  },
  date: {
    fontSize: fontSize.xs,
    color: colors.gray500,
  },
  entity: {
    fontSize: fontSize.sm,
    color: colors.gray700,
  },
  user: {
    fontSize: fontSize.xs,
    color: colors.gray600,
    marginTop: spacing.xs,
  },
});
