import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, TextInput, View } from 'react-native';

import { colors, radii, spacing } from '../constants/theme';

export default function SearchBar({ value, onChangeText, placeholder, accessibilityLabel }) {
  return (
    <View style={styles.container}>
      <MaterialCommunityIcons
        accessible={false}
        name="magnify"
        size={22}
        color={colors.muted}
      />
      <TextInput
        accessibilityLabel={accessibilityLabel}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        style={styles.input}
        value={value}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 52,
    paddingHorizontal: spacing.md,
  },
  input: {
    color: colors.text,
    flex: 1,
    fontSize: 15,
    marginLeft: spacing.xsm,
    paddingVertical: spacing.xsm,
  },
});
