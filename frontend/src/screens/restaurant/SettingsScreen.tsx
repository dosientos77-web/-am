import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Loading } from '../../components/Loading';
import { ErrorState } from '../../components/ErrorState';
import { colors, spacing, fontSize, fontWeight } from '../../theme';

export function SettingsScreen(): React.JSX.Element {
  const { user, logout } = useAuth();
  const [restaurant, setRestaurant] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', description: '', category: '', phone: '' });

  const loadRestaurant = async () => {
    if (!user?._id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response: any = await api.getRestaurants({ owner: user._id });
      const currentRestaurant = response.data?.[0];
      setRestaurant(currentRestaurant || null);
    } catch (err: any) {
      setError(err.message || 'No pudimos cargar la información del restaurante');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRestaurant();
  }, [user?._id]);

  const startEditing = () => {
    if (!restaurant) return;
    setForm({
      name: restaurant.name || '',
      description: restaurant.description || '',
      category: restaurant.category || '',
      phone: restaurant.phone || '',
    });
    setEditing(true);
    setError('');
  };

  const saveInformation = async () => {
    if (!restaurant?._id) return;
    if (!form.name.trim() || !form.category.trim()) {
      setError('Nombre y categoría son obligatorios');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const response: any = await api.updateRestaurant(restaurant._id, {
        name: form.name.trim(),
        description: form.description.trim(),
        category: form.category.trim(),
        phone: form.phone.trim(),
      });
      setRestaurant(response.data);
      setEditing(false);
    } catch (err: any) {
      setError(err.message || 'No pudimos guardar la información');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading fullScreen message="Cargando configuración..." />;
  if (error && !restaurant) return <ErrorState message={error} onRetry={loadRestaurant} />;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Configuración</Text>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Perfil del restaurante</Text>

        {editing ? (
          <View>
            <Text style={styles.label}>Nombre</Text>
            <TextInput
              style={styles.input}
              value={form.name}
              onChangeText={(name) => setForm((current) => ({ ...current, name }))}
              placeholder="Nombre del restaurante"
            />

            <Text style={styles.label}>Descripción</Text>
            <TextInput
              style={[styles.input, styles.multiline]}
              value={form.description}
              onChangeText={(description) => setForm((current) => ({ ...current, description }))}
              placeholder="Descripción"
              multiline
            />

            <Text style={styles.label}>Categoría</Text>
            <TextInput
              style={styles.input}
              value={form.category}
              onChangeText={(category) => setForm((current) => ({ ...current, category }))}
              placeholder="Categoría"
            />

            <Text style={styles.label}>Teléfono</Text>
            <TextInput
              style={styles.input}
              value={form.phone}
              onChangeText={(phone) => setForm((current) => ({ ...current, phone }))}
              placeholder="Teléfono"
              keyboardType="phone-pad"
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Button
              title={saving ? 'Guardando...' : 'Guardar'}
              onPress={saveInformation}
              disabled={saving}
            />
            <Button
              title="Cancelar"
              onPress={() => {
                setEditing(false);
                setError('');
              }}
              variant="secondary"
              style={styles.cancelButton}
            />
          </View>
        ) : (
          <TouchableOpacity style={styles.menuItem} onPress={startEditing}>
            <Text style={styles.menuText}>Editar información</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>Horarios de atención</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>Ubicación</Text>
        </TouchableOpacity>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Cuenta</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>Cambiar contraseña</Text>
        </TouchableOpacity>
      </Card>

      <Button
        title="Cerrar Sesión"
        onPress={logout}
        variant="danger"
        style={styles.logoutButton}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.gray900,
    marginBottom: spacing.lg,
  },
  card: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.gray900,
    marginBottom: spacing.sm,
  },
  menuItem: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  menuText: {
    fontSize: fontSize.md,
    color: colors.gray700,
  },
  email: {
    fontSize: fontSize.sm,
    color: colors.gray600,
    marginBottom: spacing.sm,
  },
  label: {
    fontSize: fontSize.sm,
    color: colors.gray700,
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: 8,
    padding: spacing.sm,
    fontSize: fontSize.md,
    color: colors.gray900,
    marginBottom: spacing.md,
  },
  multiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  error: {
    color: colors.error,
    fontSize: fontSize.sm,
    marginBottom: spacing.sm,
  },
  cancelButton: {
    marginTop: spacing.sm,
  },
  logoutButton: {
    marginTop: spacing.lg,
  },
});
