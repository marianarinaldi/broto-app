import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { ActivityIndicator, Alert, Animated, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRef, useState } from 'react';

import ScreenContainer from '../components/ScreenContainer';
import { usePlants } from '../context/PlantsContext';
import { getPlantCareStatus } from '../utils/plantCare';
import { getPlantMood } from '../utils/plantMood';

export default function PlantDetailScreen({ navigation, route }) {
  const plant = route.params?.plant ?? {
    name: 'Minha planta',
    species: 'Espécie não informada',
    nextCare: 'Não definido',
  };
  const { plants, deletePlant, updateWateringDate, operationLoading } = usePlants();
  const currentPlant = plants.find((item) => item.id === plant.id) ?? plant;
  const mood = getPlantMood(currentPlant);
  const care = getPlantCareStatus(currentPlant);
  const scale = useRef(new Animated.Value(1)).current;
  const [successMessage, setSuccessMessage] = useState('');
  const formatDate = (value) => value ? new Date(value).toLocaleDateString('pt-BR') : 'Ainda não registrada';

  const handleWatering = async () => {
    try {
      await updateWateringDate(currentPlant.id);
      Animated.sequence([
        Animated.spring(scale, { toValue: 1.18, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
      ]).start();
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setSuccessMessage('Rega registrada! O próximo cuidado já foi atualizado. 🌿');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível registrar a rega.');
    }
  };

  const handleDelete = () => {
    Alert.alert('Excluir planta', `Deseja excluir ${currentPlant.name}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await deletePlant(currentPlant.id);
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
        <View
          accessibilityLabel={`Imagem de ${currentPlant.name}`}
          accessibilityRole="image"
          style={styles.hero}
        >
          {currentPlant.imageUri ? (
            <Image
              accessible={false}
              source={{ uri: currentPlant.imageUri }}
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
        <Text accessibilityRole="header" style={styles.name}>{currentPlant.name}</Text>
        <Text accessibilityLabel={`Espécie: ${currentPlant.species}`} style={styles.species}>{currentPlant.species}</Text>
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

        <View style={styles.infoGrid}>
          <View accessibilityLabel={`Próximo cuidado: ${currentPlant.nextCare}`} style={styles.infoCard}>
            <MaterialCommunityIcons accessible={false} name={care.icon} size={22} color="#2F6B45" />
            <Text accessible={false} style={styles.label}>Próximo cuidado</Text>
            <Text accessible={false} style={[styles.value, styles[care.tone]]}>{care.label}</Text>
          </View>
          <View accessibilityLabel={`Última rega: ${formatDate(currentPlant.lastWateredDate)}`} style={styles.infoCard}>
            <MaterialCommunityIcons accessible={false} name="water-check-outline" size={22} color="#2D86A2" />
            <Text accessible={false} style={styles.label}>Última rega</Text>
            <Text accessible={false} style={styles.value}>{formatDate(currentPlant.lastWateredDate)}</Text>
          </View>
        </View>
        <View accessibilityLabel={`Frequência de rega: a cada ${currentPlant.wateringFrequency || 'não informada'} dias`} style={styles.frequencyCard}>
          <MaterialCommunityIcons accessible={false} name="calendar-refresh-outline" size={22} color="#C78320" />
          <View style={styles.frequencyCopy}>
            <Text style={styles.label}>Rotina de cuidados</Text>
            <Text style={styles.frequencyText}>
              Regar a cada {currentPlant.wateringFrequency || 'não informada'} dias
            </Text>
          </View>
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
          accessibilityLabel={`Registrar rega de ${currentPlant.name}`}
          accessibilityHint="Atualiza a data da última rega e sua pontuação"
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
          accessibilityLabel={`Editar ${currentPlant.name}`}
          accessibilityHint="Abre o formulário para alterar os dados da planta"
          onPress={() => navigation.navigate('Adicionar planta', { plant: currentPlant })}
          style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
        >
          <Text accessible={false} style={styles.secondaryText}>Editar planta</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Excluir ${currentPlant.name}`}
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
  infoGrid: { flexDirection: 'row', gap: 10, marginTop: 22 },
  infoCard: { backgroundColor: '#FFFFFF', borderRadius: 16, flex: 1, minHeight: 125, padding: 15 },
  label: { color: '#6E7D70', fontSize: 13 },
  value: { color: '#2F6B45', fontSize: 16, fontWeight: '700', marginTop: 8 },
  healthy: { color: '#2F6B45' },
  soon: { color: '#C78320' },
  warning: { color: '#C26A27' },
  danger: { color: '#B14C46' },
  neutral: { color: '#718378' },
  frequencyCard: { alignItems: 'center', backgroundColor: '#FFF8E7', borderRadius: 16, flexDirection: 'row', marginTop: 10, padding: 15 },
  frequencyCopy: { flex: 1, marginLeft: 10 },
  frequencyText: { color: '#725C2A', fontSize: 15, fontWeight: '700', marginTop: 5 },
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