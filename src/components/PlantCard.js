import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import CareStatusBadge from './CareStatusBadge';
import WateringButton from './WateringButton';
import { getWateringStatus } from '../utils/watering';
import { colors, radii, spacing } from '../constants/theme';

export default function PlantCard({ plant, onPress, onWatering, loading }) {
  const status = getWateringStatus(plant);
  return (
    <View style={styles.card}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Abrir detalhes de ${plant.name}`}
        onPress={onPress}
        style={({ pressed }) => [styles.main, pressed && styles.pressed]}
      >
      {plant.imageUri ? (
        <Image
          accessible={false}
          source={{ uri: plant.imageUri }}
          style={styles.image}
        />
      ) : (
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons accessible={false} name="sprout" size={28} color="#2F6B45" />
        </View>
      )}
      <View accessible={false} style={styles.info}>
        <Text style={styles.name}>{plant.name}</Text>
        <Text style={styles.meta}>{plant.species || 'Espécie não informada'}</Text>
        <CareStatusBadge plant={{ ...plant, statusLabel: status.label, statusTone: status.tone }} />
      </View>
        <MaterialCommunityIcons accessible={false} name="chevron-right" size={24} color="#7B8D7D" />
      </Pressable>
      <WateringButton compact loading={loading} onPress={onWatering} plantName={plant.name} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.lg,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 12,
    padding: spacing.md,
  },
  main: { alignItems: 'center', flex: 1, flexDirection: 'row' },
  pressed: {
    opacity: 0.75,
  },
  iconContainer: {
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderRadius: radii.sm,
    height: 56,
    justifyContent: 'center',
    marginRight: 12,
    width: 56,
  },
  image: {
    borderRadius: radii.sm,
    height: 56,
    marginRight: 12,
    width: 56,
  },
  info: {
    flex: 1,
  },
  name: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 4,
  },
  meta: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 2,
  },
});
