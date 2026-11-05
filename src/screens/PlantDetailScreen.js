import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import ScreenContainer from '../components/ScreenContainer';
import { deletePlant, updateWateringDate } from '../services/plantService';

export default function PlantDetailScreen({ navigation, route }) {
  const plant = route.params?.plant ?? {
    name: 'Minha planta',
    species: 'Espécie não informada',
    nextCare: 'Não definido',
  };
  const [saving, setSaving] = useState(false);

  const handleWatering = async () => {
    setSaving(true);
    try {
      await updateWateringDate(plant.id);
      Alert.alert('Regada!', 'A data da rega foi atualizada.');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível registrar a rega.');
    } finally {
      setSaving(false);
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
          <MaterialCommunityIcons name="sprout" size={72} color="#2F6B45" />
        </View>
        <Text style={styles.name}>{plant.name}</Text>
        <Text style={styles.species}>{plant.species}</Text>

        <View style={styles.infoCard}>
          <Text style={styles.label}>Próximo cuidado</Text>
          <Text style={styles.value}>{plant.nextCare}</Text>
        </View>
        <Pressable onPress={handleWatering} disabled={saving} style={styles.primaryButton}>
          {saving ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>Registrar rega</Text>}
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
  name: { color: '#183B25', fontSize: 26, fontWeight: '700', marginTop: 24, textAlign: 'center' },
  species: { color: '#6E7D70', fontSize: 15, marginTop: 6, textAlign: 'center' },
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