import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function EmptyPlantsState({ onAdd, onGuide }) {
  return (
    <View style={styles.container}>
      <View style={styles.illustration}>
        <MaterialCommunityIcons accessible={false} name="sprout-outline" size={64} color="#2F6B45" />
      </View>
      <Text style={styles.title}>Seu jardim começa aqui</Text>
      <Text style={styles.description}>
        Cadastre sua primeira planta e receba lembretes para nunca esquecer de cuidar dela.
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Cadastrar minha primeira planta"
        onPress={onAdd}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      >
        <MaterialCommunityIcons accessible={false} name="plus" size={22} color="#FFFFFF" />
        <Text style={styles.buttonText}>Cadastrar primeira planta</Text>
      </Pressable>
      {onGuide && (
        <Pressable accessibilityRole="button" onPress={onGuide} style={styles.secondaryButton}>
          <Text style={styles.secondaryText}>Conhecer o guia de espécies</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingHorizontal: 20, paddingVertical: 42 },
  illustration: { alignItems: 'center', backgroundColor: '#E4F1E5', borderRadius: 52, height: 104, justifyContent: 'center', width: 104 },
  title: { color: '#183B25', fontSize: 21, fontWeight: '700', marginTop: 20, textAlign: 'center' },
  description: { color: '#52665A', fontSize: 15, lineHeight: 22, marginTop: 8, maxWidth: 330, textAlign: 'center' },
  button: { alignItems: 'center', backgroundColor: '#2F6B45', borderRadius: 14, flexDirection: 'row', justifyContent: 'center', marginTop: 24, minHeight: 56, paddingHorizontal: 20 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', marginLeft: 8 },
  pressed: { opacity: 0.78 },
  secondaryButton: { marginTop: 14, minHeight: 44, padding: 10 },
  secondaryText: { color: '#2F6B45', fontSize: 14, fontWeight: '700' },
});
