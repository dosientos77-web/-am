import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { ModalComponent } from './Modal';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../theme';

interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps {
  label?: string;
  value?: string;
  options: SelectOption[];
  onSelect: (value: string) => void;
  placeholder?: string;
  error?: string;
}

export function Select({
  label,
  value,
  options,
  onSelect,
  placeholder = 'Seleccionar...',
  error,
}: SelectProps): React.JSX.Element {
  const [visible, setVisible] = useState(false);
  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity
        style={[styles.select, error ? styles.selectError : null]}
        onPress={() => setVisible(true)}
      >
        <Text style={[styles.value, !selectedOption && styles.placeholder]}>
          {selectedOption?.label || placeholder}
        </Text>
      </TouchableOpacity>
      {error && <Text style={styles.errorText}>{error}</Text>}

      <ModalComponent visible={visible} onClose={() => setVisible(false)}>
        <Text style={styles.modalTitle}>{label || 'Seleccionar'}</Text>
        <ScrollView style={styles.optionsList}>
          {options.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={styles.option}
              onPress={() => {
                onSelect(option.value);
                setVisible(false);
              }}
            >
              <Text style={styles.optionText}>{option.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </ModalComponent>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    color: colors.gray700,
    marginBottom: spacing.xs,
  },
  select: {
    borderWidth: 1,
    borderColor: colors.gray300,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
  },
  selectError: {
    borderColor: colors.error,
  },
  value: {
    fontSize: fontSize.md,
    color: colors.gray900,
  },
  placeholder: {
    color: colors.gray500,
  },
  errorText: {
    fontSize: fontSize.xs,
    color: colors.error,
    marginTop: spacing.xs,
  },
  modalTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.gray900,
    marginBottom: spacing.md,
  },
  optionsList: {
    maxHeight: 300,
  },
  option: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  optionText: {
    fontSize: fontSize.md,
    color: colors.gray900,
  },
});
