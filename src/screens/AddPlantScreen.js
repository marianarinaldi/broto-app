import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import ScreenContainer from '../components/ScreenContainer';
import { createPlant, updatePlant } from '../services/plantService';

export default function AddPlantScreen({ navigation, route }) {
  const plant = route.params?.plant;
  const [name, setName] = useState(plant?.name ?? '');
  const [species, setSpecies] = useState(plant?.species ?? '');
  const [nextCare, setNextCare] = useState(plant?.nextCare ?? '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim() || !species.trim()) {
      Alert.alert('Campos obrigatórios', 'Informe o nome e a espécie da planta.');
      return;
    }

    setSaving(true);
    try {
      const data = { name: name.trim(), species: species.trim(), nextCare: nextCare.trim() || 'Não definido' };
      if (plant?.id) {
        await updatePlant(plant.id, data);
      } else {
        await createPlant(data);
      }
      navigation.goBack();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar a planta. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.form}>
        <View style={styles.icon}><MaterialCommunityIcons name="potted-plant" size={44} color="#2F6B45" /></View>
        <Text style={styles.title}>{plant ? 'Editar planta' : 'Adicionar planta'}</Text>
        <Text style={styles.label}>Nome</Text>
        <TextInput value={name} onChangeText={setName} placeholder="Ex.: Jiboia" style={styles.input} />
        <Text style={styles.label}>Espécie</Text>
        <TextInput value={species} onChangeText={setSpecies} placeholder="Ex.: Epipremnum aureum" style={styles.input} />
        <Text style={styles.label}>Próximo cuidado</Text>
        <TextInput value={nextCare} onChangeText={setNextCare} placeholder="Ex.: Amanhã" style={styles.input} />
        <Pressable disabled={saving} onPress={handleSave} style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
          {saving ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>Salvar planta</Text>}
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  form: { padding: 24 },
  icon: { alignItems: 'center', alignSelf: 'center', backgroundColor: '#E4F1E5', borderRadius: 24, height: 80, justifyContent: 'center', width: 80 },
  title: { color: '#183B25', fontSize: 26, fontWeight: '700', marginBottom: 28, marginTop: 16, textAlign: 'center' },
  label: { color: '#183B25', fontSize: 14, fontWeight: '600', marginBottom: 8, marginTop: 14 },
  input: { backgroundColor: '#FFFFFF', borderColor: '#D8E5D9', borderRadius: 12, borderWidth: 1, color: '#183B25', fontSize: 15, padding: 14 },
  button: { backgroundColor: '#2F6B45', borderRadius: 14, marginTop: 28, paddingHorizontal: 20, paddingVertical: 14 },
  buttonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  pressed: { opacity: 0.75 },
});