import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Loading } from '../../components/Loading';
import { EmptyState } from '../../components/EmptyState';
import { ErrorState } from '../../components/ErrorState';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { colors, spacing, fontSize, fontWeight } from '../../theme';
import { Category } from '../../types';

export function CategoriesScreen(): React.JSX.Element {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [restaurantId, setRestaurantId] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const loadCategories = async () => {
    setLoading(true);
    setError('');
    try {
      if (!user?._id) throw new Error('No se pudo identificar al usuario');
      const restaurantsResponse: any = await api.getRestaurants({ owner: user._id });
      const restaurant = restaurantsResponse.data?.[0];
      if (!restaurant?._id) throw new Error('No se encontró el restaurante asociado');
      setRestaurantId(restaurant._id);
      const response: any = await api.getCategories(restaurant._id);
      setCategories(response.data);
    } catch (err: any) {
      setError(err.message || 'No pudimos cargar las categorías');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleCreateCategory = async () => {
    const trimmedName = name.trim();
    setFormError('');
    if (!trimmedName) {
      setFormError('El nombre es obligatorio');
      return;
    }
    if (!restaurantId) {
      setFormError('No se pudo identificar el restaurante');
      return;
    }

    setSaving(true);
    try {
      await api.createCategory({
        name: trimmedName,
        description: description.trim(),
        restaurant: restaurantId,
      });
      setName('');
      setDescription('');
      setShowForm(false);
      await loadCategories();
    } catch (err: any) {
      setFormError(err.message || 'No pudimos crear la categoría');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading fullScreen message="Cargando categorías..." />;
  if (error) return <ErrorState message={error} onRetry={loadCategories} />;
  if (categories.length === 0) return <EmptyState message="No hay categorías" icon="📂" />;

  return (
    <View style={styles.container}>
      <FlatList
        data={categories}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Text style={styles.name}>{item.name}</Text>
            {item.description ? <Text style={styles.description}>{item.description}</Text> : null}
          </Card>
        )}
      />
      {showForm ? (
        <View style={styles.form}>
          <Input label="Nombre" value={name} onChangeText={setName} placeholder="Ej. Bebidas" maxLength={100} />
          <Input label="Descripción" value={description} onChangeText={setDescription} placeholder="Descripción opcional" maxLength={500} multiline />
          {formError ? <Text style={styles.formError}>{formError}</Text> : null}
          <Button title="Guardar categoría" onPress={handleCreateCategory} loading={saving} />
          <Button title="Cancelar" onPress={() => { setShowForm(false); setFormError(''); }} variant="outline" style={styles.cancelButton} />
        </View>
      ) : (
        <Button title="Agregar categoría" onPress={() => setShowForm(true)} style={styles.addButton} />
      )}
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
  addButton: {
    margin: spacing.md,
  },
  form: {
    padding: spacing.md,
    backgroundColor: colors.white,
  },
  formError: {
    color: colors.error,
    fontSize: fontSize.sm,
    marginBottom: spacing.md,
  },
  cancelButton: {
    marginTop: spacing.sm,
  },
});
