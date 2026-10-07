import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { api } from '../../services/api';
import { ProductCard } from '../../components/ProductCard';
import { Loading } from '../../components/Loading';
import { EmptyState } from '../../components/EmptyState';
import { ErrorState } from '../../components/ErrorState';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing } from '../../theme';
import { Category, Product } from '../../types';

export function ProductsScreen(): React.JSX.Element {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [restaurantId, setRestaurantId] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const loadProducts = async () => {
    setLoading(true);
    setError('');
    try {
      if (!user?._id) throw new Error('No se pudo identificar al usuario');
      const restaurantsResponse: any = await api.getRestaurants({ owner: user._id });
      const restaurant = restaurantsResponse.data?.[0];
      if (!restaurant?._id) throw new Error('No se encontró el restaurante asociado');
      setRestaurantId(restaurant._id);

      const [productsResponse, categoriesResponse]: any[] = await Promise.all([
        api.getProducts({ restaurant: restaurant._id }),
        api.getCategories(restaurant._id),
      ]);
      setProducts(productsResponse.data);
      setCategories(categoriesResponse.data);
    } catch (err: any) {
      setError(err.message || 'No pudimos cargar los productos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleCreateProduct = async () => {
    const trimmedName = name.trim();
    const numericPrice = Number(price);
    setFormError('');

    if (!trimmedName) {
      setFormError('El nombre es obligatorio');
      return;
    }
    if (price.trim() === '' || !Number.isFinite(numericPrice) || numericPrice < 0) {
      setFormError('Ingresa un precio válido');
      return;
    }
    if (!categoryId) {
      setFormError('Selecciona una categoría');
      return;
    }
    if (!restaurantId) {
      setFormError('No se pudo identificar el restaurante');
      return;
    }

    setSaving(true);
    try {
      await api.createProduct({
        restaurant: restaurantId,
        category: categoryId,
        name: trimmedName,
        description: description.trim(),
        price: numericPrice,
      });
      setName('');
      setDescription('');
      setPrice('');
      setCategoryId('');
      setShowForm(false);
      await loadProducts();
    } catch (err: any) {
      setFormError(err.message || 'No pudimos crear el producto');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading fullScreen message="Cargando productos..." />;
  if (error) return <ErrorState message={error} onRetry={loadProducts} />;
  if (products.length === 0) return <EmptyState message="No hay productos" icon="🍕" />;

  return (
    <View style={styles.container}>
      <FlatList
        data={products}
        keyExtractor={(item) => item._id}
        numColumns={2}
        contentContainerStyle={styles.list}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => (
          <View style={styles.cardContainer}>
            <ProductCard
              product={item}
              onPress={() => navigation.navigate('ProductDetail', { productId: item._id })}
            />
          </View>
        )}
      />
      {showForm ? (
        <View style={styles.form}>
          <Input label="Nombre" value={name} onChangeText={setName} placeholder="Ej. Agua natural" maxLength={100} />
          <Input label="Descripción" value={description} onChangeText={setDescription} placeholder="Descripción opcional" maxLength={500} multiline />
          <Input label="Precio" value={price} onChangeText={setPrice} placeholder="0.00" keyboardType="decimal-pad" />
          <Text style={styles.categoryLabel}>Categoría</Text>
          <View style={styles.categoryOptions}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category._id}
                style={[styles.categoryOption, categoryId === category._id ? styles.categoryOptionSelected : null]}
                onPress={() => setCategoryId(category._id)}
              >
                <Text style={categoryId === category._id ? styles.categoryTextSelected : styles.categoryText}>{category.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {categories.length === 0 ? <Text style={styles.formError}>Primero crea una categoría</Text> : null}
          {formError ? <Text style={styles.formError}>{formError}</Text> : null}
          <Button title="Guardar producto" onPress={handleCreateProduct} loading={saving} disabled={categories.length === 0} />
          <Button title="Cancelar" onPress={() => { setShowForm(false); setFormError(''); }} variant="outline" style={styles.cancelButton} />
        </View>
      ) : (
        <Button title="Agregar producto" onPress={() => setShowForm(true)} style={styles.addButton} />
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
    padding: spacing.sm,
  },
  row: {
    justifyContent: 'space-between',
  },
  cardContainer: {
    width: '48%',
    marginBottom: spacing.md,
  },
  addButton: {
    margin: spacing.md,
  },
  form: {
    padding: spacing.md,
    backgroundColor: colors.white,
  },
  categoryLabel: {
    marginBottom: spacing.sm,
  },
  categoryOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.md,
  },
  categoryOption: {
    borderWidth: 1,
    borderColor: colors.gray300,
    borderRadius: 8,
    padding: spacing.sm,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  categoryOptionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryText: {
    color: colors.gray700,
  },
  categoryTextSelected: {
    color: colors.white,
  },
  formError: {
    color: colors.error,
    marginBottom: spacing.md,
  },
  cancelButton: {
    marginTop: spacing.sm,
  },
});
