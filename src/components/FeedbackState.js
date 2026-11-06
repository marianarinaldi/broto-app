import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function FeedbackState({ onRetry }) {
  return (
    <View accessibilityLiveRegion="assertive" accessibilityRole="alert" style={styles.container}>
      <View style={styles.icon}>
        <MaterialCommunityIcons accessible={false} name="cloud-alert-outline" size={38} color="#A34C45" />
      </View>
      <Text style={styles.title}>Não conseguimos carregar suas plantas</Text>
      <Text style={styles.description}>
        Verifique sua conexão e tente novamente. Seus dados continuam seguros.
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Tentar carregar as plantas novamente"
        onPress={onRetry}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      >
        <MaterialCommunityIcons accessible={false} name="refresh" size={22} color="#FFFFFF" />
        <Text style={styles.buttonText}>Tentar novamente</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingHorizontal: 20, paddingVertical: 40 },
  icon: { alignItems: 'center', backgroundColor: '#FCEBE8', borderRadius: 32, height: 64, justifyContent: 'center', width: 64 },
  title: { color: '#3B2927', fontSize: 19, fontWeight: '700', marginTop: 18, textAlign: 'center' },
  description: { color: '#6E625F', fontSize: 15, lineHeight: 22, marginTop: 8, maxWidth: 320, textAlign: 'center' },
  button: { alignItems: 'center', backgroundColor: '#2F6B45', borderRadius: 14, flexDirection: 'row', justifyContent: 'center', marginTop: 24, minHeight: 56, paddingHorizontal: 22 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', marginLeft: 8 },
  pressed: { opacity: 0.78 },
});
