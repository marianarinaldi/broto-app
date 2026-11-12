import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import ScreenContainer from '../components/ScreenContainer';
import CareStatusBadge from '../components/CareStatusBadge';
import EmptyPlantsState from '../components/EmptyPlantsState';
import WateringButton from '../components/WateringButton';
import { usePlants } from '../context/PlantsContext';
import { getWateringStatus } from '../utils/watering';

export default function TodayScreen({ navigation }) {
  const { plants, operationPlantId, updateWateringDate } = usePlants();
  const plantsToCare = plants.filter((plant) => getWateringStatus(plant).isDue);
  const firstName = 'jardineiro';
  const today = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date());

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <View>
            <Text style={styles.eyebrow}>SEU JARDIM, SEU MOMENTO</Text>
            <Text accessibilityRole="header" style={styles.greeting}>Olá, {firstName} 🌿</Text>
            <Text style={styles.date}>{today}</Text>
          </View>
          <View accessibilityLabel="Seu perfil" style={styles.avatar}>
            <MaterialCommunityIcons accessible={false} name="leaf" size={25} color="#FFFFFF" />
          </View>
        </View>

        <View style={styles.hero}>
          <View style={styles.heroCopy}>
            <Text style={styles.heroKicker}>ROTINA DE CUIDADOS</Text>
            <Text style={styles.heroTitle}>
              {plantsToCare.length > 0 ? 'Suas plantinhas estão chamando.' : 'Seu jardim está em dia!'}
            </Text>
            <Text style={styles.heroText}>
              {plantsToCare.length > 0
                ? `${plantsToCare.length} cuidado${plantsToCare.length > 1 ? 's' : ''} esperando por você.`
                : 'Continue cuidando do seu jardim com carinho.'}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={plantsToCare.length > 0 ? 'Ver plantas que precisam de cuidado' : 'Adicionar uma nova planta'}
              accessibilityHint={plantsToCare.length > 0 ? 'Abre a lista de plantas' : 'Abre o cadastro de planta'}
              onPress={() => navigation.navigate(plantsToCare.length > 0 ? 'Minhas plantas' : 'Adicionar planta')}
              style={({ pressed }) => [styles.heroButton, pressed && styles.pressed]}
            >
              <Text style={styles.heroButtonText}>{plantsToCare.length > 0 ? 'Ver cuidados' : 'Começar meu jardim'}</Text>
              <MaterialCommunityIcons accessible={false} name="arrow-right" size={20} color="#174A32" />
            </Pressable>
          </View>
          <View style={styles.heroIllustration}>
            <MaterialCommunityIcons accessible={false} name="sprout" size={82} color="#D9F5D7" />
            <MaterialCommunityIcons accessible={false} name="water" size={27} color="#8BD8D1" style={styles.waterIcon} />
          </View>
        </View>

        <View style={styles.quickActions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Adicionar nova planta"
            accessibilityHint="Abre o formulário de cadastro"
            onPress={() => navigation.navigate('Adicionar planta')}
            style={({ pressed }) => [styles.addAction, pressed && styles.pressed]}
          >
            <View style={styles.actionIcon}><MaterialCommunityIcons accessible={false} name="plus" size={24} color="#FFFFFF" /></View>
            <View style={styles.actionCopy}>
              <Text style={styles.actionTitle}>Adicionar planta</Text>
              <Text style={styles.actionText}>Crie um novo cuidado</Text>
            </View>
            <MaterialCommunityIcons accessible={false} name="chevron-right" size={23} color="#2F6B45" />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Abrir guia de cuidados"
            onPress={() => navigation.navigate('Guia de cuidados')}
            style={({ pressed }) => [styles.guideAction, pressed && styles.pressed]}
          >
            <MaterialCommunityIcons accessible={false} name="book-open-page-variant-outline" size={23} color="#2F6B45" />
            <Text style={styles.guideText}>Consultar guia de cuidados</Text>
            <MaterialCommunityIcons accessible={false} name="chevron-right" size={23} color="#7B8D7D" />
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
            {plants.slice().sort((a, b) => Number(getWateringStatus(b).isDue) - Number(getWateringStatus(a).isDue)).slice(0, 3).map((plant) => {
              const status = getWateringStatus(plant);
              return (
                <View key={plant.id} style={styles.plantRow}>
                  <View style={styles.plantIcon}><MaterialCommunityIcons accessible={false} name="sprout" size={25} color="#2F6B45" /></View>
                  <View style={styles.plantCopy}>
                    <Text style={styles.plantName}>{plant.name}</Text>
                    <CareStatusBadge plant={{ ...plant, statusLabel: status.label, statusTone: status.tone }} />
                  </View>
                  <WateringButton
                    compact
                    loading={operationPlantId === plant.id}
                    onPress={() => updateWateringDate(plant.id)}
                    plantName={plant.name}
                  />
                </View>
              );
            })}
          </>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { padding: 22, paddingBottom: 36 },
  topBar: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  eyebrow: { color: '#679176', fontSize: 11, fontWeight: '800', letterSpacing: 1.2 },
  greeting: { color: '#173A28', fontSize: 29, fontWeight: '800', marginTop: 6 },
  date: { color: '#718378', fontSize: 14, marginTop: 5, textTransform: 'capitalize' },
  avatar: { alignItems: 'center', backgroundColor: '#2F6B45', borderRadius: 24, height: 48, justifyContent: 'center', width: 48 },
  hero: { backgroundColor: '#195238', borderRadius: 26, flexDirection: 'row', marginTop: 24, minHeight: 208, overflow: 'hidden', padding: 22 },
  heroCopy: { flex: 1, zIndex: 1 },
  heroKicker: { color: '#A8D9A5', fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  heroTitle: { color: '#FFFFFF', fontSize: 25, fontWeight: '800', lineHeight: 31, marginTop: 10 },
  heroText: { color: '#D5E9D7', fontSize: 14, lineHeight: 20, marginTop: 9 },
  heroButton: { alignItems: 'center', alignSelf: 'flex-start', backgroundColor: '#D9F5D7', borderRadius: 13, flexDirection: 'row', marginTop: 18, minHeight: 46, paddingHorizontal: 15 },
  heroButtonText: { color: '#174A32', fontSize: 14, fontWeight: '800', marginRight: 9 },
  heroIllustration: { alignItems: 'center', justifyContent: 'center', width: 96 },
  waterIcon: { bottom: 40, position: 'absolute', right: 3 },
  quickActions: { marginTop: 16 },
  addAction: { alignItems: 'center', backgroundColor: '#FFFFFF', borderColor: '#DDEBE0', borderRadius: 18, borderWidth: 1, flexDirection: 'row', minHeight: 76, padding: 12 },
  guideAction: { alignItems: 'center', backgroundColor: '#FFF8E7', borderRadius: 18, flexDirection: 'row', marginTop: 10, minHeight: 60, paddingHorizontal: 16 },
  guideText: { color: '#725C2A', flex: 1, fontSize: 15, fontWeight: '700', marginLeft: 10 },
  actionIcon: { alignItems: 'center', backgroundColor: '#2F6B45', borderRadius: 14, height: 50, justifyContent: 'center', width: 50 },
  actionCopy: { flex: 1, marginLeft: 13 },
  actionTitle: { color: '#173A28', fontSize: 16, fontWeight: '800' },
  actionText: { color: '#718378', fontSize: 13, marginTop: 4 },
  sectionHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 11, marginTop: 28 },
  sectionTitle: { color: '#173A28', fontSize: 19, fontWeight: '800' },
  sectionCount: { color: '#789080', fontSize: 13 },
  seeAll: { color: '#2F6B45', fontSize: 14, fontWeight: '700' },
  plantRow: { alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 17, flexDirection: 'row', marginBottom: 10, minHeight: 72, padding: 12 },
  plantIcon: { alignItems: 'center', backgroundColor: '#E4F1E5', borderRadius: 13, height: 48, justifyContent: 'center', width: 48 },
  plantCopy: { flex: 1, marginLeft: 12 },
  plantName: { color: '#173A28', fontSize: 16, fontWeight: '800' },
  plantStatus: { color: '#718378', fontSize: 13, marginTop: 4 },
  pressed: { opacity: 0.78 },
});
