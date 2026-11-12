import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

export default function PlantCareCard({
  lightType,
  lightRequirement,
  wateringIntervalDays,
  environment,
  fertilizationTips,
  fertilizationNotes,
}) {
  const environmentLabel = environment === 'interno' ? 'Ambiente interno' : environment === 'externo' ? 'Ambiente externo' : 'Interno ou externo';
  const environmentIcon = environment === 'interno' ? 'home-outline' : 'tree-outline';
  const readableLight = lightRequirement || lightType;
  const fertilization = fertilizationTips || fertilizationNotes;

  return (
    <View accessibilityLabel={`Dicas: ${lightType}, rega a cada ${wateringIntervalDays} dias, ${environmentLabel}`} style={styles.card}>
      <View style={styles.row}>
        <View style={styles.item}>
          <Feather name="sun" size={21} color="#C78320" testID="plant-care-light-icon" />
          <Text style={styles.label}>Luz</Text>
          <Text style={styles.value}>{readableLight}</Text>
        </View>
        <View style={styles.item}>
          <Ionicons name="water-outline" size={23} color="#2D86A2" testID="plant-care-water-icon" />
          <Text style={styles.label}>Rega</Text>
          <Text style={styles.value}>A cada {wateringIntervalDays} dias</Text>
        </View>
        <View style={styles.item}>
          <MaterialCommunityIcons name={environmentIcon} size={23} color="#2F6B45" testID="plant-care-environment-icon" />
          <Text style={styles.label}>Ambiente</Text>
          <Text style={styles.value}>{environmentLabel}</Text>
        </View>
      </View>
      <View style={styles.fertilization}>
        <MaterialCommunityIcons name="sprout-outline" size={22} color="#2F6B45" testID="plant-care-fertilizer-icon" />
        <View style={styles.fertilizationCopy}>
          <Text style={styles.label}>Adubação sugerida</Text>
          <Text style={styles.tip}>{fertilization}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#FFFFFF', borderRadius: 18, marginTop: 16, padding: 16 },
  row: { flexDirection: 'row', gap: 8 },
  item: { flex: 1, minHeight: 92 },
  label: { color: '#718378', fontSize: 12, marginTop: 7 },
  value: { color: '#183B25', fontSize: 13, fontWeight: '700', lineHeight: 18, marginTop: 3, textTransform: 'capitalize' },
  fertilization: { alignItems: 'flex-start', borderTopColor: '#E4F1E5', borderTopWidth: 1, flexDirection: 'row', marginTop: 12, paddingTop: 13 },
  fertilizationCopy: { flex: 1, marginLeft: 9 },
  tip: { color: '#52665A', fontSize: 13, lineHeight: 19, marginTop: 3 },
});
