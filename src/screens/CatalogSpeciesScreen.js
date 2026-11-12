import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import ScreenContainer from '../components/ScreenContainer';
import { createCatalogPlant, updateCatalogPlant } from '../services/catalogService';

export default function CatalogSpeciesScreen({ navigation, route }) {
  const existingPlant = route.params?.catalogPlant;
  const [name, setName] = useState(existingPlant?.name ?? '');
  const [scientificName, setScientificName] = useState(existingPlant?.scientificName ?? '');
  const [category, setCategory] = useState(existingPlant?.category ?? 'folhagens');
  const [environment, setEnvironment] = useState(existingPlant?.environment ?? 'interno');
  const [lightType, setLightType] = useState(existingPlant?.lightType ?? 'indireta');
  const [wateringIntervalDays, setWateringIntervalDays] = useState(existingPlant?.wateringIntervalDays ? String(existingPlant.wateringIntervalDays) : '');
  const [wateringNotes, setWateringNotes] = useState(existingPlant?.wateringNotes ?? '');
  const [fertilizationNotes, setFertilizationNotes] = useState(existingPlant?.fertilizationNotes ?? '');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!name.trim() || !wateringIntervalDays.trim()) {
      Alert.alert('Dados incompletos', 'Informe o nome e o intervalo de rega.');
      return;
    }

    setSaving(true);
    try {
      const data = {
        name: name.trim(),
        scientificName: scientificName.trim() || 'Espécie não informada',
        category: category.trim().toLowerCase(),
        environment,
        environmentLabel: environment === 'interno' ? 'Ambiente Interno' : 'Ambiente Externo',
        lightType,
        lightRequirement: lightType,
        wateringIntervalDays: Number(wateringIntervalDays),
        wateringNotes: wateringNotes.trim() || 'Observe o substrato antes de regar.',
        fertilizationNotes: fertilizationNotes.trim() || 'Consulte um especialista para escolher o adubo.',
        recommendedProducts: [],
        icon: 'sprout',
        ...(existingPlant ? {} : { source: 'user' }),
      };
      const savedPlant = existingPlant
        ? await updateCatalogPlant(existingPlant.id, data)
        : await createCatalogPlant(data);
      Alert.alert('Catálogo atualizado', `${data.name} foi salva com sucesso.`, [
        {
          text: 'Continuar',
          onPress: () => {
            if (route.params?.returnToPlantForm) {
              navigation.navigate('Adicionar planta', {
                createdCatalogPlant: savedPlant,
                returnToMyPlants: true,
              });
            } else {
              navigation.goBack();
            }
          },
        },
      ]);
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar a espécie. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Voltar para o cadastro da planta"
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <MaterialCommunityIcons name="arrow-left" size={20} color="#2F6B45" />
          <Text style={styles.backText}>Voltar</Text>
        </Pressable>
        <MaterialCommunityIcons name="sprout" size={48} color="#2F6B45" />
        <Text accessibilityRole="header" style={styles.title}>{existingPlant ? 'Editar espécie' : 'Cadastrar espécie'}</Text>
        <Text style={styles.description}>Crie uma recomendação para reutilizar no cadastro de plantas.</Text>
        {[
          ['Nome da espécie *', name, setName, 'Ex.: Calathea'],
          ['Nome científico', scientificName, setScientificName, 'Ex.: Calathea orbifolia'],
          ['Categoria', category, setCategory, 'Ex.: folhagens'],
          ['Observações de rega', wateringNotes, setWateringNotes, 'Ex.: manter o substrato úmido'],
          ['Dicas de adubação', fertilizationNotes, setFertilizationNotes, 'Ex.: adubar mensalmente'],
        ].map(([label, value, setter, placeholder]) => (
          <TextInput
            accessibilityLabel={label}
            key={label}
            onChangeText={setter}
            placeholder={placeholder}
            placeholderTextColor="#9AA99C"
            style={styles.input}
            value={value}
          />
        ))}
        <TextInput
          accessibilityLabel="Intervalo de rega em dias"
          keyboardType="number-pad"
          onChangeText={(value) => setWateringIntervalDays(value.replace(/[^0-9]/g, ''))}
          placeholder="Intervalo de rega em dias *"
          placeholderTextColor="#9AA99C"
          style={styles.input}
          value={wateringIntervalDays}
        />
        <Text style={styles.section}>Ambiente</Text>
        <View style={styles.options}>
          {['interno', 'externo'].map((value) => (
            <Pressable key={value} onPress={() => setEnvironment(value)} style={[styles.option, environment === value && styles.optionActive]}>
              <Text style={[styles.optionText, environment === value && styles.optionTextActive]}>{value}</Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.section}>Luz</Text>
        <View style={styles.options}>
          {['direta', 'indireta', 'meia_sombra'].map((value) => (
            <Pressable key={value} onPress={() => setLightType(value)} style={[styles.option, lightType === value && styles.optionActive]}>
              <Text style={[styles.optionText, lightType === value && styles.optionTextActive]}>{value.replace('_', ' ')}</Text>
            </Pressable>
          ))}
        </View>
        <Pressable accessibilityRole="button" disabled={saving} onPress={save} style={styles.button}>
          {saving ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>{existingPlant ? 'Salvar alterações' : 'Cadastrar espécie'}</Text>}
        </Pressable>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { padding: 24, paddingBottom: 48 },
  backButton: { alignItems: 'center', alignSelf: 'flex-start', flexDirection: 'row', marginBottom: 10, paddingVertical: 8 },
  backText: { color: '#2F6B45', fontSize: 14, fontWeight: '700', marginLeft: 6 },
  title: { color: '#183B25', fontSize: 28, fontWeight: '800', marginTop: 14 },
  description: { color: '#718378', fontSize: 15, lineHeight: 21, marginBottom: 14, marginTop: 6 },
  input: { backgroundColor: '#FFFFFF', borderColor: '#D8E5D9', borderRadius: 12, borderWidth: 1, color: '#183B25', fontSize: 15, marginTop: 10, padding: 14 },
  section: { color: '#183B25', fontSize: 14, fontWeight: '700', marginTop: 18 },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  option: { borderColor: '#D8E5D9', borderRadius: 18, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 10 },
  optionActive: { backgroundColor: '#2F6B45', borderColor: '#2F6B45' },
  optionText: { color: '#52665A', textTransform: 'capitalize' },
  optionTextActive: { color: '#FFFFFF', fontWeight: '700' },
  button: { alignItems: 'center', backgroundColor: '#2F6B45', borderRadius: 14, marginTop: 28, minHeight: 56, justifyContent: 'center' },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
});
