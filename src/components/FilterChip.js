import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, spacing } from '../constants/theme';

export default function FilterChip({ label, selected, onPress, accessibilityLabel }) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel || label}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        selected && styles.active,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.label, selected && styles.activeLabel]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderColor: colors.primaryLight,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: spacing.md,
  },
  active: {
    backgroundColor: colors.primaryDark,
    borderColor: colors.primaryDark,
  },
  pressed: { opacity: 0.75 },
  label: { color: colors.primary, fontSize: 14, fontWeight: '700' },
  activeLabel: { color: colors.surface },
});
