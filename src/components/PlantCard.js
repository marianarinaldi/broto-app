import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import CareStatusBadge from './CareStatusBadge';
import WateringButton from './WateringButton';
import { getWateringStatus } from '../utils/watering';

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
        <Text style={styles.meta}>{plant.species}</Text>
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
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    flexDirection: 'row',
    marginBottom: 12,
    padding: 16,
  },
  main: { alignItems: 'center', flex: 1, flexDirection: 'row' },
  pressed: {
    opacity: 0.75,
  },
  iconContainer: {
    alignItems: 'center',
    backgroundColor: '#E4F1E5',
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    marginRight: 12,
    width: 56,
  },
  image: {
    borderRadius: 12,
    height: 56,
    marginRight: 12,
    width: 56,
  },
  info: {
    flex: 1,
  },
  name: {
    color: '#183B25',
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 4,
  },
  meta: {
    color: '#6E7D70',
    fontSize: 13,
    marginTop: 2,
  },
});
