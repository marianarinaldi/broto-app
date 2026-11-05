import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import ScreenContainer from '../components/ScreenContainer';

export default function AddPlantScreen({ navigation }) {
  return (
    <ScreenContainer>
      <View style={styles.content}>
        <View style={styles.icon}>
          <MaterialCommunityIcons name="potted-plant" size={56} color="#2F6B45" />
        </View>
        <Text style={styles.title}>Adicionar planta</Text>
        <Text style={styles.description}>
          Esta tela é um placeholder para o formulário de cadastro. Aqui entrarão os campos de
          nome, espécie, frequência de rega e foto.
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        >
          <Text style={styles.buttonText}>Voltar para minhas plantas</Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { alignItems: 'center', flex: 1, justifyContent: 'center', padding: 24 },
  icon: { alignItems: 'center', backgroundColor: '#E4F1E5', borderRadius: 28, height: 112, justifyContent: 'center', width: 112 },
  title: { color: '#183B25', fontSize: 26, fontWeight: '700', marginTop: 24 },
  description: { color: '#6E7D70', fontSize: 15, lineHeight: 22, marginTop: 12, textAlign: 'center' },
  button: { backgroundColor: '#2F6B45', borderRadius: 14, marginTop: 28, paddingHorizontal: 20, paddingVertical: 14 },
  buttonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  pressed: { opacity: 0.75 },
});