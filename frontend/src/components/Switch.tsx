import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { colors, spacing } from '../theme';

interface SwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}

export function Switch({ value, onValueChange, disabled }: SwitchProps): React.JSX.Element {
  return (
    <TouchableOpacity
      style={[styles.container, value && styles.active, disabled && styles.disabled]}
      onPress={() => !disabled && onValueChange(!value)}
      disabled={disabled}
    >
      <View style={[styles.circle, value && styles.circleActive]} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.gray300,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  active: {
    backgroundColor: colors.primary,
  },
  disabled: {
    opacity: 0.5,
  },
  circle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.white,
  },
  circleActive: {
    alignSelf: 'flex-end',
  },
});
