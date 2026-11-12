import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import PlantCareCard from '../components/PlantCareCard';
import ScreenContainer from '../components/ScreenContainer';
import { PLANT_CATALOG_SEED } from '../constants/plantCatalogData';
import { deleteCatalogPlant, getPlantCatalog, restorePlantCatalog } from '../services/catalogService';

const filters = [
  { id: 'all', label: 'Todas' },
  { id: 'interno', label: 'Internas' },
  { id: 'externo', label: 'Externas' },
  { id: 'horta', label: 'Hortas' },
];

export default function PlantGuideScreen({ navigation }) {
  const [catalog, setCatalog] = useState(PLANT_CATALOG_SEED);
  const [loading, setLoading] = useState(true);
  const [restoring, setRestoring] = useState(false);
  const [catalogError, setCatalogError] = useState('');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedPlant, setSelectedPlant] = useState(null);

  const loadCatalog = async () => {
    setLoading(true);
    setCatalogError('');
    try {
      setCatalog(await getPlantCatalog());
    } catch {
      setCatalogError('Não foi possível restaurar o catálogo agora.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // This effect synchronizes the screen with the remote Firestore catalog.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadCatalog();
  }, []);

  const handleRestoreCatalog = async () => {
    setRestoring(true);
    setCatalogError('');
    try {
      setCatalog(await restorePlantCatalog());
    } catch {
      setCatalogError('Não foi possível restaurar o catálogo. Verifique sua conexão e tente novamente.');
    } finally {
      setRestoring(false);
    }
  };

  const filteredPlants = useMemo(() => catalog.filter((plant) => {
    const normalizedQuery = query.trim().toLowerCase();
    const matchesQuery = [plant.name, plant.scientificName, plant.category]
      .some((value) => value?.toLowerCase().includes(normalizedQuery));
    const matchesFilter = filter === 'all'
      || plant.environment === filter
      || (filter === 'interno' && plant.environment === 'interno_ou_externo')
      || (filter === 'externo' && plant.environment === 'interno_ou_externo')
      || plant.category === filter;
    return matchesQuery && matchesFilter;
  }), [catalog, filter, query]);

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text accessibilityRole="header" style={styles.title}>Guia de cuidados</Text>
        <Text style={styles.subtitle}>Encontre dicas simples para cada planta.</Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Restaurar catálogo padrão"
        disabled={restoring}
        onPress={handleRestoreCatalog}
        style={({ pressed }) => [styles.restoreButton, pressed && styles.pressed]}
      >
        <MaterialCommunityIcons name="backup-restore" size={20} color="#2F6B45" />
        <Text style={styles.restoreText}>{restoring ? 'Restaurando...' : 'Restaurar catálogo padrão'}</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Cadastrar nova espécie"
        onPress={() => navigation.navigate('Cadastrar espécie')}
        style={({ pressed }) => [styles.addSpecies, pressed && styles.pressed]}
      >
        <MaterialCommunityIcons name="plus" size={20} color="#FFFFFF" />
        <Text style={styles.addSpeciesText}>Cadastrar nova espécie</Text>
      </Pressable>
      {!!catalogError && <Text accessibilityRole="alert" style={styles.error}>{catalogError}</Text>}
      <TextInput
        accessibilityLabel="Pesquisar espécie no guia"
        onChangeText={setQuery}
        placeholder="Pesquisar espécie..."
        placeholderTextColor="#8A9B90"
        style={styles.search}
        value={query}
      />
      <View accessibilityLabel="Filtros do catálogo" style={styles.filters}>
        {filters.map((item) => (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: filter === item.id }}
            key={item.id}
            onPress={() => setFilter(item.id)}
            style={[styles.chip, filter === item.id && styles.chipActive]}
          >
            <Text style={[styles.chipText, filter === item.id && styles.chipTextActive]}>{item.label}</Text>
          </Pressable>
        ))}
      </View>
      {loading ? (
        <Text style={styles.empty}>Carregando catálogo...</Text>
      ) : <FlatList
        contentContainerStyle={styles.list}
        data={filteredPlants}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.empty}>Nenhuma espécie encontrada.</Text>}
        renderItem={({ item }) => (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Abrir cuidados de ${item.name}`}
            onPress={() => setSelectedPlant(item)}
            style={({ pressed }) => [styles.plantRow, pressed && styles.pressed]}
          >
            <View style={styles.plantIcon}><MaterialCommunityIcons name={item.icon} size={28} color="#2F6B45" /></View>
            <View style={styles.plantCopy}>
              <Text style={styles.plantName}>{item.name}</Text>
              <Text style={styles.plantMeta}>{item.category} · {item.environmentLabel}</Text>
              <Text style={styles.plantMeta}>Rega a cada {item.wateringIntervalDays} dias</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={23} color="#8A9B90" />
          </Pressable>
        )}
      />}
      <Modal animationType="slide" onRequestClose={() => setSelectedPlant(null)} visible={!!selectedPlant}>
        {selectedPlant && (
          <ScreenContainer>
            <View style={styles.modalContent}>
              <Pressable accessibilityRole="button" accessibilityLabel="Fechar detalhes" onPress={() => setSelectedPlant(null)} style={styles.close}>
                <MaterialCommunityIcons name="close" size={24} color="#183B25" />
              </Pressable>
              <View style={styles.modalIcon}><MaterialCommunityIcons name={selectedPlant.icon} size={54} color="#2F6B45" /></View>
              <Text accessibilityRole="header" style={styles.modalTitle}>{selectedPlant.name}</Text>
              <Text style={styles.modalCategory}>{selectedPlant.category}</Text>
              <PlantCareCard {...selectedPlant} />
              <Text style={styles.tipTitle}>Dica de rega</Text>
              <Text style={styles.tipText}>{selectedPlant.wateringTips}</Text>
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  setSelectedPlant(null);
                  navigation.navigate('Adicionar planta', { catalogPlant: selectedPlant });
                }}
                style={styles.useButton}
              >
                <Text style={styles.useButtonText}>Usar esta espécie no cadastro</Text>
              </Pressable>
              {selectedPlant.source === 'user' && (
                <View style={styles.manageActions}>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => {
                      setSelectedPlant(null);
                      navigation.navigate('Cadastrar espécie', { catalogPlant: selectedPlant });
                    }}
                    style={styles.editSpecies}
                  >
                    <Text style={styles.editSpeciesText}>Editar espécie</Text>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    onPress={async () => {
                      try {
                        await deleteCatalogPlant(selectedPlant.id);
                        setCatalog((items) => items.filter((item) => item.id !== selectedPlant.id));
                        setSelectedPlant(null);
                      } catch {
                        setCatalogError('Não foi possível excluir esta espécie.');
                      }
                    }}
                    style={styles.deleteSpecies}
                  >
                    <Text style={styles.deleteSpeciesText}>Excluir</Text>
                  </Pressable>
                </View>
              )}
            </View>
          </ScreenContainer>
        )}
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 24, paddingTop: 20 },
  title: { color: '#183B25', fontSize: 28, fontWeight: '800' },
  subtitle: { color: '#718378', fontSize: 15, marginTop: 7 },
  restoreButton: { alignItems: 'center', alignSelf: 'flex-start', flexDirection: 'row', marginLeft: 20, marginTop: 14, padding: 5 },
  restoreText: { color: '#2F6B45', fontSize: 13, fontWeight: '700', marginLeft: 7 },
  addSpecies: { alignItems: 'center', alignSelf: 'flex-start', backgroundColor: '#2F6B45', borderRadius: 12, flexDirection: 'row', marginLeft: 20, marginTop: 10, paddingHorizontal: 13, paddingVertical: 10 },
  addSpeciesText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800', marginLeft: 6 },
  error: { color: '#A33A3A', fontSize: 13, marginHorizontal: 20, marginTop: 8 },
  search: { backgroundColor: '#FFFFFF', borderColor: '#D8E5D9', borderRadius: 14, borderWidth: 1, color: '#183B25', fontSize: 16, margin: 20, marginBottom: 12, padding: 15 },
  filters: { flexDirection: 'row', gap: 8, paddingHorizontal: 20 },
  chip: { borderColor: '#D8E5D9', borderRadius: 20, borderWidth: 1, paddingHorizontal: 15, paddingVertical: 10 },
  chipActive: { backgroundColor: '#2F6B45', borderColor: '#2F6B45' },
  chipText: { color: '#52665A', fontSize: 14, fontWeight: '600' },
  chipTextActive: { color: '#FFFFFF' },
  list: { padding: 20, paddingTop: 16 },
  plantRow: { alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 17, flexDirection: 'row', marginBottom: 10, minHeight: 82, padding: 14 },
  plantIcon: { alignItems: 'center', backgroundColor: '#E4F1E5', borderRadius: 14, height: 54, justifyContent: 'center', width: 54 },
  plantCopy: { flex: 1, marginLeft: 13 },
  plantName: { color: '#183B25', fontSize: 17, fontWeight: '800' },
  plantMeta: { color: '#718378', fontSize: 13, marginTop: 4, textTransform: 'capitalize' },
  empty: { color: '#718378', fontSize: 16, padding: 30, textAlign: 'center' },
  pressed: { opacity: 0.75 },
  modalContent: { flex: 1, padding: 24 },
  close: { alignItems: 'center', alignSelf: 'flex-end', backgroundColor: '#E4F1E5', borderRadius: 24, height: 48, justifyContent: 'center', width: 48 },
  modalIcon: { alignItems: 'center', alignSelf: 'center', backgroundColor: '#E4F1E5', borderRadius: 45, height: 90, justifyContent: 'center', marginTop: 15, width: 90 },
  modalTitle: { color: '#183B25', fontSize: 28, fontWeight: '800', marginTop: 18, textAlign: 'center' },
  modalCategory: { color: '#718378', fontSize: 15, marginTop: 5, textAlign: 'center' },
  tipTitle: { color: '#183B25', fontSize: 18, fontWeight: '800', marginTop: 24 },
  tipText: { color: '#52665A', fontSize: 15, lineHeight: 22, marginTop: 8 },
  useButton: { backgroundColor: '#2F6B45', borderRadius: 14, marginTop: 24, minHeight: 56, padding: 17 },
  useButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800', textAlign: 'center' },
  manageActions: { flexDirection: 'row', gap: 10, marginTop: 12 },
  editSpecies: { borderColor: '#2F6B45', borderRadius: 12, borderWidth: 1, flex: 1, padding: 14 },
  editSpeciesText: { color: '#2F6B45', fontWeight: '800', textAlign: 'center' },
  deleteSpecies: { borderColor: '#F0D4D0', borderRadius: 12, borderWidth: 1, padding: 14 },
  deleteSpeciesText: { color: '#A33A3A', fontWeight: '800' },
});
