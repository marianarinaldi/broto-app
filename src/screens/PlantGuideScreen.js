import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import FilterChip from '../components/FilterChip';
import PlantCareCard from '../components/PlantCareCard';
import PlantCatalogCard from '../components/PlantCatalogCard';
import SearchBar from '../components/SearchBar';
import ScreenContainer from '../components/ScreenContainer';
import { PLANT_CATALOG_SEED } from '../constants/plantCatalogData';
import { useAuth } from '../context/AuthContext';
import { colors, radii, spacing } from '../constants/theme';
import { deleteCatalogPlant, getPlantCatalog, restorePlantCatalog } from '../services/catalogService';
import { formatDisplayValue } from '../utils/display';

const filters = [
  { id: 'all', label: 'Todas' },
  { id: 'interno', label: 'Internas' },
  { id: 'externo', label: 'Externas' },
  { id: 'horta', label: 'Hortas' },
];

export default function PlantGuideScreen({ navigation }) {
  const { user } = useAuth();
  const [catalog, setCatalog] = useState(PLANT_CATALOG_SEED);
  const [loading, setLoading] = useState(true);
  const [restoring, setRestoring] = useState(false);
  const [catalogError, setCatalogError] = useState('');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedPlant, setSelectedPlant] = useState(null);

  const loadCatalog = useCallback(async () => {
    setLoading(true);
    setCatalogError('');
    try {
      setCatalog(await getPlantCatalog(user.uid));
    } catch {
      setCatalogError('Não foi possível carregar o catálogo agora.');
    } finally {
      setLoading(false);
    }
  }, [user.uid]);

  useEffect(() => {
    // This effect synchronizes the screen with the remote Firestore catalog.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadCatalog();
  }, [loadCatalog]);

  const handleRestoreCatalog = () => {
    Alert.alert(
      'Restaurar catálogo padrão',
      'Os registros padrão serão reaplicados sem remover espécies personalizadas.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Restaurar',
          onPress: async () => {
            setRestoring(true);
            setCatalogError('');
            try {
              setCatalog(await restorePlantCatalog(user.uid));
            } catch {
              setCatalogError('Não foi possível restaurar o catálogo. Verifique sua conexão e tente novamente.');
            } finally {
              setRestoring(false);
            }
          },
        },
      ],
    );
  };

  const handleDelete = (plant) => {
    Alert.alert(
      'Excluir espécie',
      `Deseja excluir ${plant.name} do catálogo?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCatalogPlant(plant.id);
              setCatalog((items) => items.filter((item) => item.id !== plant.id));
              setSelectedPlant(null);
            } catch {
              setCatalogError('Não foi possível excluir esta espécie.');
            }
          },
        },
      ],
    );
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

  const listHeader = (
    <View>
      <View style={styles.header}>
        <Text accessibilityRole="header" style={styles.title}>Guia de cuidados</Text>
        <Text style={styles.subtitle}>Descubra como cuidar melhor de cada espécie.</Text>
      </View>

      <View style={styles.searchWrap}>
        <SearchBar
          accessibilityLabel="Pesquisar espécie no guia"
          onChangeText={setQuery}
          placeholder="Pesquisar espécie..."
          value={query}
        />
      </View>

      <FlatList
        contentContainerStyle={styles.filters}
        data={filters}
        horizontal
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <FilterChip
            label={item.label}
            onPress={() => setFilter(item.id)}
            selected={filter === item.id}
          />
        )}
        showsHorizontalScrollIndicator={false}
      />

      <View style={styles.actions}>
        <Pressable
          accessibilityHint="Abre o cadastro de uma espécie personalizada"
          accessibilityLabel="Cadastrar nova espécie"
          accessibilityRole="button"
          onPress={() => navigation.navigate('Cadastrar espécie')}
          style={({ pressed }) => [styles.addSpecies, pressed && styles.pressed]}
        >
          <MaterialCommunityIcons accessible={false} name="plus" size={20} color={colors.surface} />
          <Text style={styles.addSpeciesText}>Cadastrar nova espécie</Text>
        </Pressable>
        <Pressable
          accessibilityLabel="Restaurar catálogo padrão"
          accessibilityRole="button"
          disabled={restoring}
          onPress={handleRestoreCatalog}
          style={({ pressed }) => [styles.restoreButton, pressed && styles.pressed]}
        >
          <MaterialCommunityIcons accessible={false} name="backup-restore" size={17} color={colors.muted} />
          <Text style={styles.restoreText}>{restoring ? 'Restaurando...' : 'Restaurar padrão'}</Text>
        </Pressable>
      </View>
      {!!catalogError && <Text accessibilityRole="alert" style={styles.error}>{catalogError}</Text>}
    </View>
  );

  return (
    <ScreenContainer>
      {loading ? (
        <Text style={styles.loading}>Carregando catálogo...</Text>
      ) : (
        <FlatList
          ListHeaderComponent={listHeader}
          ListEmptyComponent={(
            <View style={styles.emptyState}>
              <MaterialCommunityIcons accessible={false} name="leaf-off" size={44} color={colors.muted} />
              <Text style={styles.emptyTitle}>Nenhuma espécie encontrada.</Text>
              <Text style={styles.emptyText}>Experimente outro nome ou ajuste os filtros.</Text>
              <Pressable
                accessibilityRole="button"
                onPress={() => navigation.navigate('Cadastrar espécie')}
                style={styles.emptyButton}
              >
                <Text style={styles.emptyButtonText}>Cadastrar espécie personalizada</Text>
              </Pressable>
            </View>
          )}
          columnWrapperStyle={styles.catalogRow}
          contentContainerStyle={styles.catalogList}
          data={filteredPlants}
          keyExtractor={(item) => item.id}
          numColumns={2}
          renderItem={({ item }) => (
            <PlantCatalogCard
              onPress={() => setSelectedPlant(item)}
              plant={item}
            />
          )}
        />
      )}

      <Modal animationType="slide" onRequestClose={() => setSelectedPlant(null)} visible={!!selectedPlant}>
        {selectedPlant && (
          <ScreenContainer>
            <ScrollView contentContainerStyle={styles.modalContent}>
              <Pressable
                accessibilityLabel="Fechar detalhes"
                accessibilityRole="button"
                onPress={() => setSelectedPlant(null)}
                style={styles.close}
              >
                <MaterialCommunityIcons accessible={false} name="close" size={24} color={colors.primaryDark} />
              </Pressable>
              <View style={styles.modalIcon}>
                <MaterialCommunityIcons accessible={false} name={selectedPlant.icon || 'sprout'} size={54} color={colors.primary} />
              </View>
              <Text accessibilityRole="header" style={styles.modalTitle}>{selectedPlant.name}</Text>
              <Text style={styles.modalCategory}>{formatDisplayValue(selectedPlant.category)}</Text>
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
                    onPress={() => handleDelete(selectedPlant)}
                    style={styles.deleteSpecies}
                  >
                    <Text style={styles.deleteSpeciesText}>Excluir</Text>
                  </Pressable>
                </View>
              )}
            </ScrollView>
          </ScreenContainer>
        )}
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  title: { color: colors.primaryDark, fontSize: 28, fontWeight: '800' },
  subtitle: { color: colors.muted, fontSize: 15, lineHeight: 21, marginTop: spacing.xxs },
  searchWrap: { marginHorizontal: spacing.lg, marginTop: spacing.lg },
  filters: { gap: spacing.xsm, paddingBottom: spacing.sm, paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
  actions: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  addSpecies: { alignItems: 'center', backgroundColor: colors.primary, borderRadius: radii.sm, flexDirection: 'row', minHeight: 48, paddingHorizontal: spacing.md },
  addSpeciesText: { color: colors.surface, fontSize: 13, fontWeight: '800', marginLeft: spacing.xsm },
  restoreButton: { alignItems: 'center', flexDirection: 'row', minHeight: 44, paddingHorizontal: spacing.xsm },
  restoreText: { color: colors.muted, fontSize: 12, fontWeight: '700', marginLeft: spacing.xxs },
  error: { color: colors.danger, fontSize: 13, marginHorizontal: spacing.lg, marginTop: spacing.xsm },
  catalogList: { paddingBottom: 36, paddingHorizontal: spacing.sm },
  catalogRow: { marginHorizontal: spacing.xsm },
  loading: { color: colors.muted, fontSize: 16, padding: 30, textAlign: 'center' },
  emptyState: { alignItems: 'center', padding: spacing.xl },
  emptyTitle: { color: colors.text, fontSize: 17, fontWeight: '800', marginTop: spacing.sm },
  emptyText: { color: colors.muted, fontSize: 14, marginTop: spacing.xxs, textAlign: 'center' },
  emptyButton: { borderColor: colors.primary, borderRadius: radii.sm, borderWidth: 1, marginTop: spacing.lg, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  emptyButtonText: { color: colors.primary, fontSize: 14, fontWeight: '800' },
  pressed: { opacity: 0.75 },
  modalContent: { flex: 1, padding: spacing.lg },
  close: { alignItems: 'center', alignSelf: 'flex-end', backgroundColor: colors.primaryLight, borderRadius: 24, height: 48, justifyContent: 'center', width: 48 },
  modalIcon: { alignItems: 'center', alignSelf: 'center', backgroundColor: colors.primaryLight, borderRadius: 45, height: 90, justifyContent: 'center', marginTop: spacing.xsm, width: 90 },
  modalTitle: { color: colors.text, fontSize: 28, fontWeight: '800', marginTop: spacing.md, textAlign: 'center' },
  modalCategory: { color: colors.muted, fontSize: 15, marginTop: spacing.xxs, textAlign: 'center', textTransform: 'capitalize' },
  tipTitle: { color: colors.text, fontSize: 18, fontWeight: '800', marginTop: spacing.lg },
  tipText: { color: '#52665A', fontSize: 15, lineHeight: 22, marginTop: spacing.xsm },
  useButton: { backgroundColor: colors.primary, borderRadius: radii.md, marginTop: spacing.lg, minHeight: 56, justifyContent: 'center', padding: spacing.md },
  useButtonText: { color: colors.surface, fontSize: 16, fontWeight: '800', textAlign: 'center' },
  manageActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  editSpecies: { borderColor: colors.primary, borderRadius: radii.sm, borderWidth: 1, flex: 1, padding: spacing.md },
  editSpeciesText: { color: colors.primary, fontWeight: '800', textAlign: 'center' },
  deleteSpecies: { borderColor: '#F0D4D0', borderRadius: radii.sm, borderWidth: 1, padding: spacing.md },
  deleteSpeciesText: { color: colors.danger, fontWeight: '800' },
});
