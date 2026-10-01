import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { api } from '../../services/api';
import { ProductCard } from '../../components/ProductCard';
import { Loading } from '../../components/Loading';
import { EmptyState } from '../../components/EmptyState';
import { ErrorState } from '../../components/ErrorState';
import { Button } from '../../components/Button';
import { colors, spacing } from '../../theme';
import { Product } from '../../types';

export function ProductsScreen(): React.JSX.Element {
  const navigation = useNavigation<any>();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const response: any = await api.getProducts();
      setProducts(response.data);
    } catch (err: any) {
      setError(err.message || 'No pudimos cargar los productos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

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
      <Button
        title="Agregar producto"
        onPress={() => navigation.navigate('AddProduct')}
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
});
