import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';

import EmptyPlantsState from '../components/EmptyPlantsState';
import FeedbackState from '../components/FeedbackState';
import FilterChip from '../components/FilterChip';
import LoadingState from '../components/LoadingState';
import PlantCard from '../components/PlantCard';
import SearchBar from '../components/SearchBar';
import ScreenContainer from '../components/ScreenContainer';
import { useAuth } from '../context/AuthContext';
import { usePlants } from '../context/PlantsContext';
import { colors, radii, spacing } from '../constants/theme';
import { getWateringStatus } from '../utils/watering';

const plantFilters = [
  { id: 'all', label: 'Todas' },
  { id: 'overdue', label: 'Atrasadas' },
  { id: 'today', label: 'Regar hoje' },
  { id: 'upcoming', label: 'Próximas' },
];

export default function MyPlantsScreen({ navigation }) {
  const { plants, loading, error, loadPlants, operationPlantId, updateWateringDate } = usePlants();
  const { signOut } = useAuth();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');

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

  const filteredPlants = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return plants.filter((plant) => {
      const matchesQuery = !normalizedQuery
        || plant.name?.toLowerCase().includes(normalizedQuery)
        || plant.species?.toLowerCase().includes(normalizedQuery);
      const status = getWateringStatus(plant).label;
      const matchesFilter = filter === 'all'
        || (filter === 'overdue' && status === 'Atrasada')
        || (filter === 'today' && status === 'Regar hoje')
        || (filter === 'upcoming' && (status === 'Regar amanhã' || status.startsWith('Próxima rega')));
      return matchesQuery && matchesFilter;
    });
  }, [filter, plants, query]);

  const listHeader = (
    <View>
      <View style={styles.heading}>
        <View style={styles.headingCopy}>
          <Text accessibilityRole="header" style={styles.title}>Minhas plantas</Text>
          <Text style={styles.subtitle}>Sua coleção • {plants.length} plantas cadastradas</Text>
        </View>
        <View style={styles.headerActions}>
          <Pressable
            accessibilityLabel="Sair da conta"
            accessibilityRole="button"
            onPress={() => {
              Alert.alert('Sair da conta', 'Deseja encerrar sua sessão?', [
                { text: 'Cancelar', style: 'cancel' },
                {
                  text: 'Sair',
                  onPress: () => signOut().catch(() => {
                    Alert.alert('Erro', 'Não foi possível encerrar a sessão. Tente novamente.');
                  }),
                },
              ]);
            }}
            style={({ pressed }) => [styles.signOutButton, pressed && styles.pressed]}
          >
            <MaterialCommunityIcons accessible={false} name="logout" size={20} color={colors.primary} />
          </Pressable>
          <Pressable
            accessibilityHint="Abre o formulário para cadastrar uma nova planta"
            accessibilityLabel="Adicionar planta"
            accessibilityRole="button"
            onPress={() => navigation.navigate('Adicionar planta')}
            style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}
          >
            <MaterialCommunityIcons accessible={false} name="plus" size={26} color={colors.surface} />
          </Pressable>
        </View>
      </View>

      <View style={styles.searchWrap}>
        <SearchBar
          accessibilityLabel="Buscar uma planta"
          onChangeText={setQuery}
          placeholder="Buscar uma planta..."
          value={query}
        />
      </View>

      <FlatList
        contentContainerStyle={styles.filters}
        data={plantFilters}
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
    </View>
  );

  return (
    <ScreenContainer>
      {loading && plants.length === 0 ? (
        <LoadingState />
      ) : (
        <FlatList
          ListEmptyComponent={
            !!error ? (
              <FeedbackState onRetry={loadPlants} />
            ) : plants.length === 0 ? (
              <EmptyPlantsState
                onAdd={() => navigation.navigate('Adicionar planta')}
                onGuide={() => navigation.navigate('Guia de cuidados')}
              />
            ) : (
              <View style={styles.noResults}>
                <MaterialCommunityIcons accessible={false} name="magnify-close" size={44} color={colors.muted} />
                <Text style={styles.noResultsTitle}>Nenhuma planta encontrada</Text>
                <Text style={styles.noResultsText}>Experimente outro nome ou ajuste os filtros.</Text>
              </View>
            )
          }
          ListHeaderComponent={listHeader}
          contentContainerStyle={styles.content}
          data={filteredPlants}
          keyExtractor={(plant) => plant.id}
          refreshControl={
            <RefreshControl
              colors={[colors.primary]}
              onRefresh={() => loadPlants({ force: true })}
              refreshing={loading}
            />
          }
          renderItem={({ item }) => (
            <PlantCard
              loading={operationPlantId === item.id}
              onPress={() => navigation.navigate('Detalhes da planta', { plant: item })}
              onWatering={() => handleWatering(item.id)}
              plant={item}
            />
          )}
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 36, paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  heading: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  headingCopy: { flex: 1, paddingRight: spacing.md },
  headerActions: { alignItems: 'center', flexDirection: 'row', gap: spacing.xsm },
  signOutButton: { alignItems: 'center', borderColor: colors.primary, borderRadius: radii.md, borderWidth: 1, height: 48, justifyContent: 'center', width: 48 },
  title: { color: colors.primaryDark, fontSize: 28, fontWeight: '800' },
  subtitle: { color: colors.muted, fontSize: 14, marginTop: spacing.xxs },
  addButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    height: 52,
    justifyContent: 'center',
    width: 52,
  },
  searchWrap: { marginTop: spacing.lg },
  filters: { gap: spacing.xsm, paddingBottom: spacing.md, paddingTop: spacing.sm },
  pressed: { opacity: 0.75 },
  noResults: { alignItems: 'center', paddingHorizontal: spacing.lg, paddingVertical: 48 },
  noResultsTitle: { color: colors.text, fontSize: 17, fontWeight: '800', marginTop: 12 },
  noResultsText: { color: colors.muted, fontSize: 14, marginTop: 6, textAlign: 'center' },
});
