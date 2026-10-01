import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { api } from '../../services/api';
import { useCart } from '../../context/CartContext';
import { ProductCard } from '../../components/ProductCard';
import { Loading } from '../../components/Loading';
import { EmptyState } from '../../components/EmptyState';
import { ErrorState } from '../../components/ErrorState';
import { colors, spacing, fontSize, fontWeight } from '../../theme';
import { Product, Category } from '../../types';

export function RestaurantMenuScreen(): React.JSX.Element {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { addItem } = useCart();
  const { restaurantId } = route.params;

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        api.getProducts({ restaurant: restaurantId, available: true }),
        api.getCategories(restaurantId),
      ]);
      setProducts((productsRes as any).data);
      setCategories((categoriesRes as any).data);
    } catch (err: any) {
      setError(err.message || 'No pudimos cargar el menú');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [restaurantId]);

  const filteredProducts = selectedCategory
    ? products.filter((p) => p.category === selectedCategory)
    : products;

  if (loading) return <Loading fullScreen message="Cargando menú..." />;
  if (error) return <ErrorState message={error} onRetry={loadData} />;

  return (
    <View style={styles.container}>
      {/* Category filter */}
      {categories.length > 0 && (
        <View style={styles.categoryContainer}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={[{ _id: '', name: 'Todos' }, ...categories]}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.categoryList}
            renderItem={({ item }) => (
              <Text
                style={[
                  styles.categoryButton,
                  selectedCategory === item._id && styles.categoryButtonActive,
                ]}
                onPress={() => setSelectedCategory(item._id)}
              >
                {item.name}
              </Text>
            )}
          />
        </View>
      )}

      {filteredProducts.length === 0 ? (
        <EmptyState message="No hay productos disponibles" icon="🍽️" />
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item._id}
          numColumns={2}
          contentContainerStyle={styles.list}
          columnWrapperStyle={styles.row}
          renderItem={({ item }) => (
            <View style={styles.cardContainer}>
              <ProductCard
                product={item}
                onPress={() => navigation.navigate('ProductDetail', { productId: item._id })}
                onAddToCart={() => addItem(item)}
              />
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  categoryContainer: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  categoryList: {
    padding: spacing.sm,
  },
  categoryButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.gray100,
    fontSize: fontSize.sm,
    color: colors.gray700,
  },
  categoryButtonActive: {
    backgroundColor: colors.primary,
    color: colors.white,
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
});
