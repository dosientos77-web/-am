import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { api } from '../../services/api';
import { Loading } from '../../components/Loading';
import { EmptyState } from '../../components/EmptyState';
import { ErrorState } from '../../components/ErrorState';
import { StatusBadge } from '../../components/StatusBadge';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing, fontSize, fontWeight } from '../../theme';
import { Inventory, Product } from '../../types';

export function InventoryScreen(): React.JSX.Element {
  const { user } = useAuth();
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [restaurantId, setRestaurantId] = useState('');
  const [productsWithoutInventory, setProductsWithoutInventory] = useState<Product[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [productId, setProductId] = useState('');
  const [stock, setStock] = useState('');
  const [minimumStock, setMinimumStock] = useState('5');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [editingId, setEditingId] = useState('');
  const [editStock, setEditStock] = useState('');
  const [editMinimumStock, setEditMinimumStock] = useState('');
  const [editError, setEditError] = useState('');

  const loadInventory = async () => {
    setLoading(true);
    setError('');
    try {
      if (!user?._id) throw new Error('No se pudo identificar al usuario');
      const restaurantsResponse: any = await api.getRestaurants({ owner: user._id });
      const restaurant = restaurantsResponse.data?.[0];
      if (!restaurant?._id) throw new Error('No se encontró el restaurante asociado');
      setRestaurantId(restaurant._id);

      const [inventoryResponse, productsResponse]: any[] = await Promise.all([
        api.getInventory({ restaurant: restaurant._id }),
        api.getProducts({ restaurant: restaurant._id }),
      ]);
      setInventory(inventoryResponse.data);
      const inventoryProductIds = new Set(
        inventoryResponse.data.map((item: any) => typeof item.product === 'object' ? item.product._id : item.product)
      );
      setProductsWithoutInventory(productsResponse.data.filter((product: Product) => !inventoryProductIds.has(product._id)));
    } catch (err: any) {
      setError(err.message || 'No pudimos cargar el inventario');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const handleCreateInventory = async () => {
    const numericStock = Number(stock);
    const numericMinimum = Number(minimumStock);
    setFormError('');

    if (!productId) {
      setFormError('Selecciona un producto');
      return;
    }
    if (stock.trim() === '' || !Number.isInteger(numericStock) || numericStock < 0) {
      setFormError('Ingresa un stock válido');
      return;
    }
    if (minimumStock.trim() === '' || !Number.isInteger(numericMinimum) || numericMinimum < 0) {
      setFormError('Ingresa un stock mínimo válido');
      return;
    }
    if (!restaurantId) {
      setFormError('No se pudo identificar el restaurante');
      return;
    }

    setSaving(true);
    try {
      await api.createInventory({
        product: productId,
        restaurant: restaurantId,
        stock: numericStock,
        minimumStock: numericMinimum,
      });
      setProductId('');
      setStock('');
      setMinimumStock('5');
      setShowForm(false);
      await loadInventory();
    } catch (err: any) {
      setFormError(err.message || 'No pudimos crear el inventario');
    } finally {
      setSaving(false);
    }
  };

  const startEditing = (item: Inventory) => {
    setEditingId(item._id);
    setEditStock(String(item.stock));
    setEditMinimumStock(String(item.minimumStock));
    setEditError('');
  };

  const handleUpdateInventory = async () => {
    const numericStock = Number(editStock);
    const numericMinimum = Number(editMinimumStock);
    setEditError('');

    if (editStock.trim() === '' || !Number.isInteger(numericStock) || numericStock < 0) {
      setEditError('Ingresa un stock válido');
      return;
    }
    if (editMinimumStock.trim() === '' || !Number.isInteger(numericMinimum) || numericMinimum < 0) {
      setEditError('Ingresa un stock mínimo válido');
      return;
    }

    setSaving(true);
    try {
      await api.updateInventory(editingId, {
        stock: numericStock,
        minimumStock: numericMinimum,
      });
      setEditingId('');
      await loadInventory();
    } catch (err: any) {
      setEditError(err.message || 'No pudimos actualizar el inventario');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading fullScreen message="Cargando inventario..." />;
  if (error) return <ErrorState message={error} onRetry={loadInventory} />;
  return (
    <View style={styles.container}>
      {inventory.length === 0 ? (
        <EmptyState message="No hay inventario" icon="📦" />
      ) : (
      <FlatList
        data={inventory}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <View style={styles.header}>
              <Text style={styles.productName}>{typeof item.product === 'object' ? (item.product as any).name : 'Producto'}</Text>
              <StatusBadge status={item.status} />
            </View>
            <View style={styles.details}>
              <Text style={styles.detail}>Stock: {item.stock}</Text>
              <Text style={styles.detail}>Mínimo: {item.minimumStock}</Text>
            </View>
            {editingId === item._id ? (
              <View style={styles.editForm}>
                <Input label="Stock" value={editStock} onChangeText={setEditStock} keyboardType="number-pad" />
                <Input label="Stock mínimo" value={editMinimumStock} onChangeText={setEditMinimumStock} keyboardType="number-pad" />
                {editError ? <Text style={styles.formError}>{editError}</Text> : null}
                <Button title="Guardar cambios" onPress={handleUpdateInventory} loading={saving} />
                <Button title="Cancelar" onPress={() => { setEditingId(''); setEditError(''); }} variant="outline" style={styles.cancelButton} />
              </View>
            ) : (
              <Button title="Editar" onPress={() => startEditing(item)} variant="outline" style={styles.editButton} />
            )}
          </Card>
        )}
      />
      )}
      {showForm ? (
        <View style={styles.form}>
          <Text style={styles.formTitle}>Producto</Text>
          <View style={styles.productOptions}>
            {productsWithoutInventory.map((product) => (
              <TouchableOpacity
                key={product._id}
                style={[styles.productOption, productId === product._id ? styles.productOptionSelected : null]}
                onPress={() => setProductId(product._id)}
              >
                <Text style={productId === product._id ? styles.productTextSelected : styles.productText}>{product.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {productsWithoutInventory.length === 0 ? <Text style={styles.formError}>Todos los productos ya tienen inventario</Text> : null}
          <Input label="Stock inicial" value={stock} onChangeText={setStock} placeholder="0" keyboardType="number-pad" />
          <Input label="Stock mínimo" value={minimumStock} onChangeText={setMinimumStock} placeholder="5" keyboardType="number-pad" />
          {formError ? <Text style={styles.formError}>{formError}</Text> : null}
          <Button title="Guardar inventario" onPress={handleCreateInventory} loading={saving} disabled={productsWithoutInventory.length === 0} />
          <Button title="Cancelar" onPress={() => { setShowForm(false); setFormError(''); }} variant="outline" style={styles.cancelButton} />
        </View>
      ) : productsWithoutInventory.length > 0 ? (
        <Button title="Agregar inventario" onPress={() => setShowForm(true)} style={styles.addButton} />
      ) : null}
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
  productName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.gray900,
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detail: {
    fontSize: fontSize.sm,
    color: colors.gray600,
  },
  addButton: {
    margin: spacing.md,
  },
  form: {
    padding: spacing.md,
    backgroundColor: colors.white,
  },
  formTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.sm,
  },
  productOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.md,
  },
  productOption: {
    borderWidth: 1,
    borderColor: colors.gray300,
    borderRadius: 8,
    padding: spacing.sm,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  productOptionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  productText: {
    color: colors.gray700,
  },
  productTextSelected: {
    color: colors.white,
  },
  formError: {
    color: colors.error,
    marginBottom: spacing.md,
  },
  editForm: {
    marginTop: spacing.md,
  },
  editButton: {
    marginTop: spacing.md,
  },
  cancelButton: {
    marginTop: spacing.sm,
  },
});
