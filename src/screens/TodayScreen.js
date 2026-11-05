import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import ScreenContainer from '../components/ScreenContainer';

export default function TodayScreen({ navigation }) {
  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.greeting}>Bom dia! 🌿</Text>
        <Text style={styles.title}>Cuidados de hoje</Text>
        <Text style={styles.subtitle}>Acompanhe suas plantas e mantenha tudo em dia.</Text>

        <View style={styles.summaryCard}>
          <View style={styles.summaryIcon}>
            <MaterialCommunityIcons name="water-outline" size={28} color="#2F6B45" />
          </View>
          <View style={styles.summaryInfo}>
            <Text style={styles.summaryTitle}>Tudo tranquilo por aqui</Text>
            <Text style={styles.summaryText}>Você não tem cuidados pendentes hoje.</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Acesso rápido</Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => navigation.navigate('Minhas plantas')}
          style={({ pressed }) => [styles.action, pressed && styles.pressed]}
        >
          <MaterialCommunityIcons name="sprout-outline" size={24} color="#2F6B45" />
          <Text style={styles.actionText}>Ver minhas plantas</Text>
          <MaterialCommunityIcons name="chevron-right" size={22} color="#7B8D7D" />
        </Pressable>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { padding: 24 },
  greeting: { color: '#2F6B45', fontSize: 16, fontWeight: '600' },
  title: { color: '#183B25', fontSize: 28, fontWeight: '700', marginTop: 8 },
  subtitle: { color: '#6E7D70', fontSize: 15, lineHeight: 22, marginTop: 8 },
  summaryCard: {
    alignItems: 'center',
    backgroundColor: '#E4F1E5',
    borderRadius: 18,
    flexDirection: 'row',
    marginTop: 28,
    padding: 18,
  },
  summaryIcon: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    height: 52,
    justifyContent: 'center',
    marginRight: 14,
    width: 52,
  },
  summaryInfo: { flex: 1 },
  summaryTitle: { color: '#183B25', fontSize: 16, fontWeight: '700' },
  summaryText: { color: '#52705A', fontSize: 13, lineHeight: 19, marginTop: 4 },
  sectionTitle: { color: '#183B25', fontSize: 18, fontWeight: '700', marginTop: 32, marginBottom: 12 },
  action: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    flexDirection: 'row',
    padding: 18,
  },
  actionText: { color: '#183B25', flex: 1, fontSize: 15, fontWeight: '600', marginLeft: 12 },
  pressed: { opacity: 0.75 },
});