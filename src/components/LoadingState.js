import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

export default function LoadingState({ label = 'Carregando suas plantas...' }) {
  return (
    <View
      accessibilityLabel={label}
      accessibilityLiveRegion="polite"
      accessibilityRole="progressbar"
      style={styles.container}
    >
      <ActivityIndicator accessible={false} color="#2F6B45" size="large" />
      <Text accessible={false} style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  label: {
    color: '#52665A',
    fontSize: 16,
    marginTop: 16,
  },
});
