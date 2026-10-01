import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Restaurant } from '../types';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../theme';

interface RestaurantCardProps {
  restaurant: Restaurant;
  onPress?: () => void;
}

export function RestaurantCard({ restaurant, onPress }: RestaurantCardProps): React.JSX.Element {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      {restaurant.logo ? (
        <Image source={{ uri: restaurant.logo }} style={styles.logo} />
      ) : (
        <View style={styles.logoPlaceholder}>
          <Text style={styles.placeholderText}>🍴</Text>
        </View>
      )}
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>{restaurant.name}</Text>
        <Text style={styles.category}>{restaurant.category}</Text>
        {restaurant.description ? (
          <Text style={styles.description} numberOfLines={2}>{restaurant.description}</Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    marginRight: spacing.md,
    width: 200,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logo: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
  },
  logoPlaceholder: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
    backgroundColor: colors.gray100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 32,
  },
  content: {
    padding: spacing.sm,
  },
  name: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.gray900,
  },
  category: {
    fontSize: fontSize.xs,
    color: colors.primary,
    fontWeight: fontWeight.medium,
    marginTop: spacing.xs,
  },
  description: {
    fontSize: fontSize.xs,
    color: colors.gray600,
    marginTop: spacing.xs,
  },
});
