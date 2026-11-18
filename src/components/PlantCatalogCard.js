import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radii, spacing } from '../constants/theme';
import { formatDisplayValue } from '../utils/display';

export default function PlantCatalogCard({ plant, onPress }) {
  return (
    <Pressable
      accessibilityHint="Abre os cuidados desta espécie"
      accessibilityLabel={`Abrir cuidados de ${plant.name}`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.illustration}>
        <MaterialCommunityIcons
          accessible={false}
          name={plant.icon || 'sprout'}
          size={42}
          color={colors.primary}
        />
      </View>
      <Text numberOfLines={2} style={styles.name}>{plant.name}</Text>
      <Text numberOfLines={1} style={styles.category}>{formatDisplayValue(plant.category)}</Text>
      <View style={styles.divider} />
      <View style={styles.detail}>
        <MaterialCommunityIcons accessible={false} name="home-outline" size={15} color={colors.muted} />
        <Text numberOfLines={1} style={styles.detailText}>
          {plant.environmentLabel || formatDisplayValue(plant.environment)}
        </Text>
      </View>
      <View style={styles.detail}>
        <MaterialCommunityIcons accessible={false} name="water-outline" size={15} color={colors.muted} />
        <Text numberOfLines={1} style={styles.detailText}>A cada {plant.wateringIntervalDays} dias</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.lg,
    borderWidth: 1,
    flex: 1,
    margin: spacing.xs,
    minHeight: 220,
    padding: spacing.md,
  },
  pressed: { opacity: 0.78 },
  illustration: {
    alignItems: 'center',
    alignSelf: 'stretch',
    backgroundColor: colors.primaryLight,
    borderRadius: radii.md,
    height: 86,
    justifyContent: 'center',
  },
  name: { color: colors.text, fontSize: 16, fontWeight: '800', lineHeight: 20, marginTop: 12, minHeight: 40 },
  category: { color: colors.muted, fontSize: 12, marginTop: 2, textTransform: 'capitalize' },
  divider: { backgroundColor: colors.border, height: 1, marginVertical: 10 },
  detail: { alignItems: 'center', flexDirection: 'row', marginTop: 4 },
  detailText: { color: colors.text, flex: 1, fontSize: 11, marginLeft: 5 },
});
