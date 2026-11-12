import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

export default function WateringButton({ plantName, loading, onPress, compact = false }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Registrar rega de ${plantName}`}
      accessibilityHint="Atualiza a última rega e calcula o próximo cuidado"
      accessibilityState={{ busy: loading, disabled: loading }}
      disabled={loading}
      onPress={onPress}
      style={({ pressed }) => [styles.button, compact && styles.compact, pressed && styles.pressed]}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <>
          <MaterialCommunityIcons accessible={false} name="water-outline" size={compact ? 18 : 21} color="#FFFFFF" />
          <Text style={styles.text}>Regar</Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { alignItems: 'center', backgroundColor: '#2F6B45', borderRadius: 13, flexDirection: 'row', justifyContent: 'center', minHeight: 52, paddingHorizontal: 18 },
  compact: { minHeight: 42, paddingHorizontal: 14 },
  text: { color: '#FFFFFF', fontSize: 15, fontWeight: '800', marginLeft: 7 },
  pressed: { opacity: 0.78 },
});
