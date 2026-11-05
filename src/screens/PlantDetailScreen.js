import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import ScreenContainer from '../components/ScreenContainer';

export default function PlantDetailScreen({ route }) {
  const plant = route.params?.plant ?? {
    name: 'Minha planta',
    species: 'Espécie não informada',
    nextCare: 'Não definido',
  };

  return (
    <ScreenContainer>
      <View style={styles.content}>
        <View style={styles.hero}>
          <MaterialCommunityIcons name="sprout" size={72} color="#2F6B45" />
        </View>
        <Text style={styles.name}>{plant.name}</Text>
        <Text style={styles.species}>{plant.species}</Text>

        <View style={styles.infoCard}>
          <Text style={styles.label}>Próximo cuidado</Text>
          <Text style={styles.value}>{plant.nextCare}</Text>
        </View>
        <Text style={styles.placeholder}>Em breve você poderá registrar regas, luminosidade e observações.</Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { padding: 24 },
  hero: { alignItems: 'center', backgroundColor: '#E4F1E5', borderRadius: 24, height: 190, justifyContent: 'center' },
  name: { color: '#183B25', fontSize: 26, fontWeight: '700', marginTop: 24, textAlign: 'center' },
  species: { color: '#6E7D70', fontSize: 15, marginTop: 6, textAlign: 'center' },
  infoCard: { backgroundColor: '#FFFFFF', borderRadius: 16, marginTop: 28, padding: 18 },
  label: { color: '#6E7D70', fontSize: 13 },
  value: { color: '#2F6B45', fontSize: 18, fontWeight: '700', marginTop: 6 },
  placeholder: { color: '#6E7D70', fontSize: 14, lineHeight: 21, marginTop: 24, textAlign: 'center' },
});