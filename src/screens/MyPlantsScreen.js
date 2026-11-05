import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import PlantCard from '../components/PlantCard';
import ScreenContainer from '../components/ScreenContainer';

const plants = [
  { id: '1', name: 'Jiboia', species: 'Epipremnum aureum', nextCare: 'Hoje' },
  { id: '2', name: 'Costela-de-adão', species: 'Monstera deliciosa', nextCare: 'Amanhã' },
];

export default function MyPlantsScreen({ navigation }) {
  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heading}>
          <View>
            <Text style={styles.title}>Minhas plantas</Text>
            <Text style={styles.subtitle}>2 plantas cadastradas</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Adicionar planta"
            onPress={() => navigation.navigate('Adicionar planta')}
            style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}
          >
            <MaterialCommunityIcons name="plus" size={26} color="#FFFFFF" />
          </Pressable>
        </View>

        <Text style={styles.sectionTitle}>Sua coleção</Text>
        {plants.map((plant) => (
          <PlantCard
            key={plant.id}
            plant={plant}
            onPress={() => navigation.navigate('Detalhes da planta', { plant })}
          />
        ))}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { padding: 24 },
  heading: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  title: { color: '#183B25', fontSize: 28, fontWeight: '700' },
  subtitle: { color: '#6E7D70', fontSize: 14, marginTop: 6 },
  addButton: {
    alignItems: 'center',
    backgroundColor: '#2F6B45',
    borderRadius: 14,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  pressed: { opacity: 0.75 },
  sectionTitle: { color: '#183B25', fontSize: 18, fontWeight: '700', marginBottom: 12, marginTop: 30 },
});