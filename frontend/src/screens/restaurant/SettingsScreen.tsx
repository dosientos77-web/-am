import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { colors, spacing, fontSize, fontWeight } from '../../theme';

export function SettingsScreen(): React.JSX.Element {
  const { user, logout } = useAuth();

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Configuración</Text>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Perfil del restaurante</Text>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>Editar información</Text>
        </TouchableOpacity>
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
  logoutButton: {
    marginTop: spacing.lg,
  },
});
