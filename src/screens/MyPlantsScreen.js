import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import PlantCard from '../components/PlantCard';
import ScreenContainer from '../components/ScreenContainer';
import { usePlants } from '../context/PlantsContext';

export default function MyPlantsScreen({ navigation }) {
  const { plants, loading, error, loadPlants } = usePlants();

  useFocusEffect(useCallback(() => {
    loadPlants();
  }, [loadPlants]));

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heading}>
          <View>
            <Text style={styles.title}>Minhas plantas</Text>
            <Text style={styles.subtitle}>{plants.length} plantas cadastradas</Text>
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
        {loading && <ActivityIndicator size="large" color="#2F6B45" style={styles.loader} />}
        {!!error && (
          <View style={styles.feedback}>
            <Text style={styles.error}>{error}</Text>
            <Pressable onPress={loadPlants}>
              <Text style={styles.retry}>Tentar novamente</Text>
            </Pressable>
          </View>
        )}
        {!loading && !error && plants.length === 0 && (
          <Text style={styles.empty}>Você ainda não cadastrou nenhuma planta.</Text>
        )}
        {!loading && !error && plants.map((plant) => (
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
  loader: { marginTop: 32 },
  feedback: { alignItems: 'center', paddingVertical: 24 },
  error: { color: '#A33A3A', textAlign: 'center' },
  retry: { color: '#2F6B45', fontWeight: '700', marginTop: 10 },
  empty: { color: '#6E7D70', fontSize: 15, paddingVertical: 24, textAlign: 'center' },
});