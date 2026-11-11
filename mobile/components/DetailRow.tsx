import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../lib/theme';

interface Props {
  label: string;
  value?: string | null;
  icon?: keyof typeof Ionicons.glyphMap;
  last?: boolean;
}

export function DetailRow({ label, value, icon, last = false }: Props) {
  return (
    <View style={[styles.row, last ? styles.lastRow : null]}>
      {icon ? (
        <View style={styles.iconWrap}>
          <Ionicons name={icon} size={14} color={colors.primary} />
        </View>
      ) : null}
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value} numberOfLines={2}>
        {value || 'Not set'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  lastRow: { borderBottomWidth: 0, paddingBottom: 0 },
  iconWrap: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { color: colors.muted, fontSize: 13.5 },
  value: { flex: 1, color: colors.text, fontWeight: '600', fontSize: 13.5, textAlign: 'right' },
});
