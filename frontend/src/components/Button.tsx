import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
}: ButtonProps): React.JSX.Element {
  const buttonStyles: ViewStyle[] = [styles.base];
  const textStyles: TextStyle[] = [styles.textBase];

  // Variant styles
  if (variant === 'primary') {
    buttonStyles.push(styles.primary);
    textStyles.push(styles.primaryText);
  } else if (variant === 'secondary') {
    buttonStyles.push(styles.secondary);
    textStyles.push(styles.secondaryText);
  } else if (variant === 'outline') {
    buttonStyles.push(styles.outline);
    textStyles.push(styles.outlineText);
  } else if (variant === 'danger') {
    buttonStyles.push(styles.danger);
    textStyles.push(styles.dangerText);
  }

  // Size styles
  if (size === 'small') {
    buttonStyles.push(styles.small);
    textStyles.push(styles.smallText);
  } else if (size === 'large') {
    buttonStyles.push(styles.large);
    textStyles.push(styles.largeText);
  }

  // Disabled state
  if (disabled || loading) {
    buttonStyles.push(styles.disabled);
  }

  return (
    <TouchableOpacity
      style={[...buttonStyles, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? colors.primary : colors.white} />
      ) : (
        <Text style={[...textStyles, textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  primary: {
    backgroundColor: colors.primary,
  },
  primaryText: {
    color: colors.white,
  },
  secondary: {
    backgroundColor: colors.secondary,
  },
  secondaryText: {
    color: colors.white,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  outlineText: {
    color: colors.primary,
  },
  danger: {
    backgroundColor: colors.error,
  },
  dangerText: {
    color: colors.white,
  },
  small: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  smallText: {
    fontSize: fontSize.sm,
  },
  large: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  largeText: {
    fontSize: fontSize.lg,
  },
  disabled: {
    opacity: 0.5,
  },
  textBase: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
});
