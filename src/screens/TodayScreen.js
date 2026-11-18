import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import ScreenContainer from '../components/ScreenContainer';
import CareStatusBadge from '../components/CareStatusBadge';
import CareSummaryCard from '../components/CareSummaryCard';
import EmptyPlantsState from '../components/EmptyPlantsState';
import WateringButton from '../components/WateringButton';
import { usePlants } from '../context/PlantsContext';
import { getWateringStatus } from '../utils/watering';
import { colors, radii, spacing } from '../constants/theme';

export default function TodayScreen({ navigation }) {
  const { plants, operationPlantId, updateWateringDate } = usePlants();
  const priorityPlants = useMemo(
    () => plants
      .slice()
      .sort((a, b) => {
        const priority = (plant) => {
          const status = getWateringStatus(plant);
          if (status.label === 'Atrasada') return 3;
          if (status.label === 'Regar hoje') return 2;
          if (status.label === 'Regar amanhã') return 1;
          return 0;
        };
        return priority(b) - priority(a);
      })
      .slice(0, 3),
    [plants],
  );
  const careSummary = useMemo(() => ({
    overdue: plants.filter((plant) => getWateringStatus(plant).label === 'Atrasada').length,
    today: plants.filter((plant) => getWateringStatus(plant).label === 'Regar hoje').length,
    upcoming: plants.filter((plant) => {
      const label = getWateringStatus(plant).label;
      return label === 'Regar amanhã' || label.startsWith('Próxima rega');
    }).length,
  }), [plants]);
  const firstName = 'jardineiro';
  const today = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date());
  const handleWatering = async (plantId) => {
    try {
      await updateWateringDate(plantId);
    } catch (error) {
      Alert.alert('Não foi possível registrar a rega', error.message);
    }
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <View>
            <Text style={styles.eyebrow}>SEU JARDIM, SEU MOMENTO</Text>
            <Text accessibilityRole="header" style={styles.greeting}>Bom dia, {firstName}! 🌱</Text>
            <Text style={styles.date}>{today}</Text>
          </View>
          <View accessibilityLabel="Seu perfil" style={styles.avatar}>
            <MaterialCommunityIcons accessible={false} name="leaf" size={25} color="#FFFFFF" />
          </View>
        </View>

        <View style={styles.summary}>
          <CareSummaryCard count={careSummary.overdue} label="Atrasadas" tone="overdue" />
          <CareSummaryCard count={careSummary.today} label="Regar hoje" tone="today" />
          <CareSummaryCard count={careSummary.upcoming} label="Próximos cuidados" tone="upcoming" />
        </View>

        <View style={styles.quickActions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Adicionar nova planta"
            accessibilityHint="Abre o formulário de cadastro"
            onPress={() => navigation.navigate('Adicionar planta')}
            style={({ pressed }) => [styles.quickAction, pressed && styles.pressed]}
          >
            <View style={styles.quickIcon}>
              <MaterialCommunityIcons accessible={false} name="plus" size={22} color={colors.surface} />
            </View>
            <Text style={styles.quickText}>Adicionar{'\n'}planta</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Abrir guia de cuidados"
            onPress={() => navigation.navigate('Guia de cuidados')}
            style={({ pressed }) => [styles.quickAction, styles.guideAction, pressed && styles.pressed]}
          >
            <View style={[styles.quickIcon, styles.guideIcon]}>
              <MaterialCommunityIcons accessible={false} name="book-open-page-variant-outline" size={21} color={colors.primary} />
            </View>
            <Text style={[styles.quickText, styles.guideText]}>Consultar{'\n'}guia</Text>
          </Pressable>
        </View>

        {plants.length === 0 && (
          <EmptyPlantsState
            onAdd={() => navigation.navigate('Adicionar planta')}
            onGuide={() => navigation.navigate('Guia de cuidados')}
          />
        )}
        {plants.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Precisam de atenção</Text>
              <Pressable accessibilityRole="button" accessibilityLabel="Ver todas as plantas" onPress={() => navigation.navigate('Minhas plantas')}>
                <Text style={styles.seeAll}>Ver todas</Text>
              </Pressable>
            </View>
            {priorityPlants.filter((plant) => getWateringStatus(plant).isDue || getWateringStatus(plant).label === 'Regar amanhã').map((plant) => {
              const status = getWateringStatus(plant);
              const overdue = status.label === 'Atrasada';
              return (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Abrir detalhes de ${plant.name}`}
                  key={plant.id}
                  onPress={() => navigation.navigate('Detalhes da planta', { plant })}
                  style={({ pressed }) => [styles.plantRow, overdue && styles.overdueRow, pressed && styles.pressed]}
                >
                  {plant.imageUri ? (
                    <Image accessible={false} source={{ uri: plant.imageUri }} style={styles.plantImage} />
                  ) : (
                    <View style={styles.plantIcon}>
                      <MaterialCommunityIcons accessible={false} name="sprout" size={25} color={colors.primary} />
                    </View>
                  )}
                  <View style={styles.plantCopy}>
                    <Text style={styles.plantName}>{plant.name}</Text>
                    <CareStatusBadge plant={{ ...plant, statusLabel: status.label, statusTone: status.tone }} />
                  </View>
                  <WateringButton
                    compact
                    loading={operationPlantId === plant.id}
                    onPress={() => handleWatering(plant.id)}
                    plantName={plant.name}
                  />
                </Pressable>
              );
            })}
          </>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl, paddingTop: spacing.md },
  topBar: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  eyebrow: { color: '#679176', fontSize: 11, fontWeight: '800', letterSpacing: 1.2 },
  greeting: { color: colors.primaryDark, fontSize: 27, fontWeight: '800', marginTop: spacing.xs, maxWidth: 280 },
  date: { color: colors.muted, fontSize: 13, marginTop: spacing.xxs, textTransform: 'capitalize' },
  avatar: { alignItems: 'center', backgroundColor: colors.primary, borderRadius: 24, height: 48, justifyContent: 'center', width: 48 },
  summary: { flexDirection: 'row', gap: spacing.xsm, marginTop: spacing.lg },
  quickActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  quickAction: { alignItems: 'center', backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radii.md, borderWidth: 1, flex: 1, flexDirection: 'row', minHeight: 68, paddingHorizontal: spacing.sm },
  guideAction: { backgroundColor: '#FAF6E8' },
  quickIcon: { alignItems: 'center', backgroundColor: colors.primary, borderRadius: 12, height: 42, justifyContent: 'center', width: 42 },
  guideIcon: { backgroundColor: colors.accent },
  quickText: { color: colors.text, flex: 1, fontSize: 13, fontWeight: '800', lineHeight: 17, marginLeft: spacing.xsm },
  guideText: { color: colors.accentText },
  sectionHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm, marginTop: spacing.lg },
  sectionTitle: { color: colors.primaryDark, fontSize: 19, fontWeight: '800' },
  seeAll: { color: colors.primary, fontSize: 14, fontWeight: '700' },
  plantRow: { alignItems: 'center', backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radii.lg, borderWidth: 1, flexDirection: 'row', marginBottom: spacing.sm, minHeight: 78, padding: spacing.sm },
  overdueRow: { borderColor: '#E8C2BC', borderWidth: 1 },
  plantImage: { borderRadius: radii.sm, height: 52, width: 52 },
  plantIcon: { alignItems: 'center', backgroundColor: colors.primaryLight, borderRadius: radii.sm, height: 52, justifyContent: 'center', width: 52 },
  plantCopy: { flex: 1, marginHorizontal: spacing.sm },
  plantName: { color: colors.text, fontSize: 16, fontWeight: '800', marginBottom: 5 },
  pressed: { opacity: 0.78 },
});
