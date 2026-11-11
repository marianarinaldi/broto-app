import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { ActivityIndicator, Alert, Animated, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useState } from 'react';

import ScreenContainer from '../components/ScreenContainer';
import { usePlants } from '../context/PlantsContext';
import { getPlantMood } from '../utils/plantMood';

export default function PlantDetailScreen({ navigation, route }) {
  const routePlant = route.params?.plant ?? {
    name: 'Minha planta',
    species: 'Espécie não informada',
    nextCare: 'Não definido',
  };
  const { plants, deletePlant, updateWateringDate, operationLoading } = usePlants();
  const plant = plants.find((item) => item.id === routePlant.id) ?? routePlant;
  const mood = getPlantMood(plant);
  const [scale] = useState(() => new Animated.Value(1));
  const [successMessage, setSuccessMessage] = useState('');

  const handleWatering = async () => {
    try {
      await updateWateringDate(plant.id);
      Animated.sequence([
        Animated.spring(scale, { toValue: 1.18, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
      ]).start();
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setSuccessMessage('Rega registrada! Sua planta agradece. 🌿');
    } catch {
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
          } catch {
            Alert.alert('Erro', 'Não foi possível excluir a planta.');
          }
        },
      },
    ]);
  };

  return (
    <ScreenContainer>
      <View style={styles.content}>
        <View
          accessibilityLabel={`Imagem de ${plant.name}`}
          accessibilityRole="image"
          style={styles.hero}
        >
          {plant.imageUri ? (
            <Image
              accessible={false}
              source={{ uri: plant.imageUri }}
              style={styles.heroImage}
            />
          ) : (
            <Animated.View style={{ transform: [{ scale }] }}>
              <MaterialCommunityIcons
                accessible={false}
                name="sprout"
                size={72}
                color="#2F6B45"
              />
            </Animated.View>
          )}
        </View>
        <Text accessibilityRole="header" style={styles.name}>{plant.name}</Text>
        <Text accessibilityLabel={`Espécie: ${plant.species}`} style={styles.species}>{plant.species}</Text>
        <View
          accessibilityLabel={`Humor da planta: ${mood.label}. ${mood.message}`}
          style={styles.mood}
        >
          <MaterialCommunityIcons accessible={false} name={mood.icon} size={22} color="#2F6B45" />
          <View style={styles.moodInfo}>
            <Text accessible={false} style={styles.moodLabel}>{mood.label}</Text>
            <Text accessible={false} style={styles.moodMessage}>{mood.message}</Text>
          </View>
        </View>

        <View
          accessibilityLabel={`Próximo cuidado: ${plant.nextCare}`}
          style={styles.infoCard}
        >
          <Text accessible={false} style={styles.label}>Próximo cuidado</Text>
          <Text accessible={false} style={styles.value}>{plant.nextCare}</Text>
        </View>
        {!!successMessage && (
          <View
            accessibilityLiveRegion="polite"
            accessibilityRole="alert"
            style={styles.successBanner}
          >
            <MaterialCommunityIcons accessible={false} name="check-circle-outline" size={24} color="#21613B" />
            <Text accessible={false} style={styles.successText}>{successMessage}</Text>
          </View>
        )}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Registrar rega de ${plant.name}`}
          accessibilityHint="Atualiza a data da última rega e calcula o próximo cuidado"
          accessibilityState={{ busy: operationLoading, disabled: operationLoading }}
          onPress={handleWatering}
          disabled={operationLoading}
          style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
        >
          {operationLoading ? (
            <ActivityIndicator
              accessibilityLabel="Registrando a rega"
              color="#FFFFFF"
            />
          ) : (
            <Text accessible={false} style={styles.buttonText}>Registrar rega</Text>
          )}
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Editar ${plant.name}`}
          accessibilityHint="Abre o formulário para alterar os dados da planta"
          onPress={() => navigation.navigate('Adicionar planta', { plant })}
          style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
        >
          <Text accessible={false} style={styles.secondaryText}>Editar planta</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Excluir ${plant.name}`}
          accessibilityHint="Solicita confirmação antes de excluir esta planta"
          disabled={operationLoading}
          onPress={handleDelete}
          style={({ pressed }) => [styles.deleteButton, pressed && styles.pressed]}
        >
          <Text accessible={false} style={styles.deleteText}>Excluir planta</Text>
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
  successBanner: { alignItems: 'center', backgroundColor: '#E4F1E5', borderRadius: 14, flexDirection: 'row', marginTop: 20, padding: 14 },
  successText: { color: '#21613B', flex: 1, fontSize: 14, fontWeight: '700', marginLeft: 10 },
  primaryButton: { alignItems: 'center', backgroundColor: '#2F6B45', borderRadius: 14, justifyContent: 'center', marginTop: 16, minHeight: 56, padding: 15 },
  buttonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  secondaryButton: { alignItems: 'center', borderColor: '#2F6B45', borderRadius: 14, borderWidth: 1, justifyContent: 'center', marginTop: 12, minHeight: 56, padding: 14 },
  secondaryText: { color: '#2F6B45', fontSize: 15, fontWeight: '700' },
  deleteButton: { alignItems: 'center', justifyContent: 'center', marginTop: 18, minHeight: 52, padding: 10 },
  deleteText: { color: '#A33A3A', fontSize: 14, fontWeight: '600' },
  pressed: { opacity: 0.78 },
});