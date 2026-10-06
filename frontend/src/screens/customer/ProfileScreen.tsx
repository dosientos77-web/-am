import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../../theme';

export function ProfileScreen(): React.JSX.Element {
  const navigation = useNavigation<any>();
  const { user, logout } = useAuth();

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </Text>
        </View>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <Text style={styles.role}>{user?.role}</Text>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Configuración</Text>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>Editar perfil</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Orders')}>
          <Text style={styles.menuText}>Historial de pedidos</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>Notificaciones</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>Ayuda y soporte</Text>
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
  card: {
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  name: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.gray900,
  },
  email: {
    fontSize: fontSize.md,
    color: colors.gray600,
    marginTop: spacing.xs,
  },
  role: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: fontWeight.semibold,
    marginTop: spacing.xs,
    textTransform: 'uppercase',
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.gray900,
    marginBottom: spacing.sm,
    alignSelf: 'flex-start',
  },
  menuItem: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
    width: '100%',
  },
  menuText: {
    fontSize: fontSize.md,
    color: colors.gray700,
  },
  logoutButton: {
    marginTop: spacing.lg,
  },
});
