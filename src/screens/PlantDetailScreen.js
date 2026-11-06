import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { ActivityIndicator, Alert, Animated, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRef } from 'react';

import ScreenContainer from '../components/ScreenContainer';
import { usePlants } from '../context/PlantsContext';
import { getPlantMood } from '../utils/plantMood';

export default function PlantDetailScreen({ navigation, route }) {
  const plant = route.params?.plant ?? {
    name: 'Minha planta',
    species: 'Espécie não informada',
    nextCare: 'Não definido',
  };
  const { deletePlant, updateWateringDate, operationLoading } = usePlants();
  const mood = getPlantMood(plant);
  const scale = useRef(new Animated.Value(1)).current;

  const handleWatering = async () => {
    try {
      await updateWateringDate(plant.id);
      Animated.sequence([
        Animated.spring(scale, { toValue: 1.18, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
      ]).start();
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Regada!', 'A data da rega foi atualizada.');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível registrar a rega.');
    }
  };

  const handleDelete = () => {
    Alert.alert('Excluir planta', `Deseja excluir ${plant.name}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await deletePlant(plant.id);
            navigation.goBack();
          } catch (error) {
            Alert.alert('Erro', 'Não foi possível excluir a planta.');
          }
        },
      },
    ]);
  };

  return (
    <ScreenContainer>
      <View style={styles.content}>
        <View style={styles.hero}>
          {plant.imageUri ? (
            <Image source={{ uri: plant.imageUri }} style={styles.heroImage} />
          ) : (
            <Animated.View style={{ transform: [{ scale }] }}>
              <MaterialCommunityIcons name="sprout" size={72} color="#2F6B45" />
            </Animated.View>
          )}
        </View>
        <Text style={styles.name}>{plant.name}</Text>
        <Text style={styles.species}>{plant.species}</Text>
        <View style={styles.mood}>
          <MaterialCommunityIcons name={mood.icon} size={22} color="#2F6B45" />
          <View style={styles.moodInfo}>
            <Text style={styles.moodLabel}>{mood.label}</Text>
            <Text style={styles.moodMessage}>{mood.message}</Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.label}>Próximo cuidado</Text>
          <Text style={styles.value}>{plant.nextCare}</Text>
        </View>
        <Pressable onPress={handleWatering} disabled={operationLoading} style={styles.primaryButton}>
          {operationLoading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>Registrar rega</Text>}
        </Pressable>
        <Pressable onPress={() => navigation.navigate('Adicionar planta', { plant })} style={styles.secondaryButton}>
          <Text style={styles.secondaryText}>Editar planta</Text>
        </Pressable>
        <Pressable onPress={handleDelete} style={styles.deleteButton}>
          <Text style={styles.deleteText}>Excluir planta</Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { padding: 24 },
  hero: { alignItems: 'center', backgroundColor: '#E4F1E5', borderRadius: 24, height: 190, justifyContent: 'center' },
  heroImage: { borderRadius: 24, height: '100%', width: '100%' },
  name: { color: '#183B25', fontSize: 26, fontWeight: '700', marginTop: 24, textAlign: 'center' },
  species: { color: '#6E7D70', fontSize: 15, marginTop: 6, textAlign: 'center' },
  mood: { alignItems: 'center', backgroundColor: '#E4F1E5', borderRadius: 16, flexDirection: 'row', marginTop: 18, padding: 14 },
  moodInfo: { flex: 1, marginLeft: 10 },
  moodLabel: { color: '#183B25', fontSize: 15, fontWeight: '700' },
  moodMessage: { color: '#52705A', fontSize: 13, lineHeight: 18, marginTop: 3 },
  infoCard: { backgroundColor: '#FFFFFF', borderRadius: 16, marginTop: 28, padding: 18 },
  label: { color: '#6E7D70', fontSize: 13 },
  value: { color: '#2F6B45', fontSize: 18, fontWeight: '700', marginTop: 6 },
  primaryButton: { alignItems: 'center', backgroundColor: '#2F6B45', borderRadius: 14, marginTop: 24, padding: 15 },
  buttonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  secondaryButton: { alignItems: 'center', borderColor: '#2F6B45', borderRadius: 14, borderWidth: 1, marginTop: 12, padding: 14 },
  secondaryText: { color: '#2F6B45', fontSize: 15, fontWeight: '700' },
  deleteButton: { alignItems: 'center', marginTop: 22, padding: 10 },
  deleteText: { color: '#A33A3A', fontSize: 14, fontWeight: '600' },
});