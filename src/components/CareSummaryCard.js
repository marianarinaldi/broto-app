import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radii, spacing } from '../constants/theme';

const toneStyles = {
  overdue: { backgroundColor: '#F7E5E2', color: '#A33A3A', icon: 'alert-circle-outline' },
  today: { backgroundColor: colors.warning, color: '#725C2A', icon: 'water-outline' },
  upcoming: { backgroundColor: colors.info, color: '#3A7182', icon: 'calendar-clock' },
};

export default function CareSummaryCard({ count, label, tone }) {
  const toneStyle = toneStyles[tone];

  return (
    <View style={[styles.card, { backgroundColor: toneStyle.backgroundColor }]}>
      <MaterialCommunityIcons
        accessible={false}
        name={toneStyle.icon}
        size={22}
        color={toneStyle.color}
      />
      <Text style={[styles.count, { color: toneStyle.color }]}>{count}</Text>
      <Text style={[styles.label, { color: toneStyle.color }]} numberOfLines={2}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'flex-start',
    borderRadius: radii.md,
    flex: 1,
    minHeight: 116,
    padding: spacing.md,
  },
  count: { fontSize: 24, fontWeight: '800', marginTop: 8 },
  label: { fontSize: 12, fontWeight: '700', lineHeight: 16, marginTop: 2 },
});
