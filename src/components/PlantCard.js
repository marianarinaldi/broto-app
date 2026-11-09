import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { getPlantCareStatus } from '../utils/plantCare';

const careColors = {
  healthy: '#2F6B45',
  soon: '#C78320',
  warning: '#C26A27',
  danger: '#B14C46',
  neutral: '#718378',
};

export default function PlantCard({ plant, onPress, onWater }) {
  const care = getPlantCareStatus(plant);

  return (
    <View style={styles.card}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Abrir detalhes de ${plant.name}. ${care.label}`}
        onPress={onPress}
        style={({ pressed }) => [styles.main, pressed && styles.pressed]}
      >
        {plant.imageUri ? (
          <Image accessible={false} source={{ uri: plant.imageUri }} style={styles.image} />
        ) : (
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons accessible={false} name="sprout" size={28} color="#2F6B45" />
          </View>
        )}
        <View accessible={false} style={styles.info}>
          <Text style={styles.name}>{plant.name}</Text>
          <Text style={styles.meta}>{plant.species}</Text>
          <View style={styles.statusRow}>
            <MaterialCommunityIcons accessible={false} name={care.icon} size={16} color={careColors[care.tone]} />
            <Text style={[styles.status, styles[care.tone]]}>{care.label}</Text>
          </View>
        </View>
        <MaterialCommunityIcons accessible={false} name="chevron-right" size={24} color="#7B8D7D" />
      </Pressable>
      {onWater && (care.tone === 'warning' || care.tone === 'danger') && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Regar ${plant.name} agora`}
          onPress={onWater}
          style={({ pressed }) => [styles.waterButton, pressed && styles.pressed]}
        >
          <MaterialCommunityIcons accessible={false} name="water" size={18} color="#FFFFFF" />
          <Text style={styles.waterText}>Regar</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
  },
  main: { alignItems: 'center', flexDirection: 'row', minHeight: 88, padding: 14 },
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
  statusRow: { alignItems: 'center', flexDirection: 'row', marginTop: 7 },
  status: { fontSize: 13, fontWeight: '700', marginLeft: 4 },
  healthy: { color: '#2F6B45' },
  soon: { color: '#C78320' },
  warning: { color: '#C26A27' },
  danger: { color: '#B14C46' },
  neutral: { color: '#718378' },
  waterButton: { alignItems: 'center', backgroundColor: '#2D86A2', flexDirection: 'row', justifyContent: 'center', minHeight: 44 },
  waterText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800', marginLeft: 6 },
});
