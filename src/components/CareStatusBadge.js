import { StyleSheet, Text, View } from 'react-native';

const toneStyles = {
  danger: { backgroundColor: '#FCEBE8', color: '#A33A3A' },
  today: { backgroundColor: '#FFF0D6', color: '#8A5A10' },
  soon: { backgroundColor: '#EAF3FF', color: '#2F628A' },
  future: { backgroundColor: '#E4F1E5', color: '#21613B' },
  neutral: { backgroundColor: '#EEF2EF', color: '#52665A' },
};

export default function CareStatusBadge({ plant }) {
  const tone = toneStyles[plant.statusTone] || toneStyles.neutral;
  return (
    <View accessibilityLabel={`Status do cuidado: ${plant.statusLabel}`} style={[styles.badge, { backgroundColor: tone.backgroundColor }]}>
      <Text style={[styles.text, { color: tone.color }]}>{plant.statusLabel}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { alignSelf: 'flex-start', borderRadius: 10, paddingHorizontal: 9, paddingVertical: 5 },
  text: { fontSize: 12, fontWeight: '800' },
});
