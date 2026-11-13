import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { Alert, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import EmptyPlantsState from '../components/EmptyPlantsState';
import FeedbackState from '../components/FeedbackState';
import LoadingState from '../components/LoadingState';
import PlantCard from '../components/PlantCard';
import ScreenContainer from '../components/ScreenContainer';
import { usePlants } from '../context/PlantsContext';

export default function MyPlantsScreen({ navigation }) {
  const { plants, loading, error, loadPlants, operationPlantId, updateWateringDate } = usePlants();
  const handleWatering = async (plantId) => {
    try {
      await updateWateringDate(plantId);
    } catch (wateringError) {
      Alert.alert('Não foi possível registrar a rega', wateringError.message);
    }
  };

  useFocusEffect(useCallback(() => {
    loadPlants({ silent: true });
  }, [loadPlants]));

  return (
    <ScreenContainer>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={(
          <RefreshControl
            colors={['#2F6B45']}
            onRefresh={() => loadPlants({ force: true })}
            refreshing={loading}
          />
        )}
      >
        <View style={styles.heading}>
          <View accessible={false}>
            <Text accessibilityRole="header" style={styles.title}>Minhas plantas</Text>
            <Text style={styles.subtitle}>{plants.length} plantas cadastradas</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Adicionar planta"
            accessibilityHint="Abre o formulário para cadastrar uma nova planta"
            onPress={() => navigation.navigate('Adicionar planta')}
            style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}
          >
            <MaterialCommunityIcons accessible={false} name="plus" size={26} color="#FFFFFF" />
          </Pressable>
        </View>

        <Text style={styles.sectionTitle}>Sua coleção</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Abrir guia de cuidados"
          onPress={() => navigation.navigate('Guia de cuidados')}
          style={({ pressed }) => [styles.guideButton, pressed && styles.pressed]}
        >
          <MaterialCommunityIcons accessible={false} name="book-open-page-variant-outline" size={20} color="#2F6B45" />
          <Text style={styles.guideText}>Guia de cuidados por espécie</Text>
        </Pressable>
        {loading && <LoadingState />}
        {!!error && <FeedbackState onRetry={loadPlants} />}
        {!loading && !error && plants.length === 0 && (
          <EmptyPlantsState onAdd={() => navigation.navigate('Adicionar planta')} />
        )}
        {!loading && !error && plants.map((plant) => (
          <PlantCard
            key={plant.id}
            plant={plant}
            onPress={() => navigation.navigate('Detalhes da planta', { plant })}
            onWatering={() => handleWatering(plant.id)}
            loading={operationPlantId === plant.id}
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
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  pressed: { opacity: 0.75 },
  sectionTitle: { color: '#183B25', fontSize: 18, fontWeight: '700', marginBottom: 12, marginTop: 30 },
  guideButton: { alignItems: 'center', backgroundColor: '#FFF8E7', borderRadius: 14, flexDirection: 'row', marginBottom: 14, minHeight: 52, paddingHorizontal: 15 },
  guideText: { color: '#725C2A', fontSize: 14, fontWeight: '700', marginLeft: 8 },
});