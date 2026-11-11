import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../lib/theme';

type Tone = 'primary' | 'accent' | 'neutral';

interface Props {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  label: string;
  tone?: Tone;
}

const TONES: Record<Tone, { bg: string; icon: string }> = {
  primary: { bg: colors.primarySoft, icon: colors.primary },
  accent: { bg: colors.accentSoft, icon: colors.accentDark },
  neutral: { bg: colors.surfaceMuted, icon: colors.textSecondary },
};

export function StatTile({ icon, value, label, tone = 'primary' }: Props) {
  const palette = TONES[tone];

  return (
    <View style={styles.tile}>
      <View style={[styles.iconWrap, { backgroundColor: palette.bg }]}>
        <Ionicons name={icon} size={15} color={palette.icon} />
      </View>
      <Text style={styles.value} numberOfLines={1}>
        {value}
      </Text>
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: { flex: 1, alignItems: 'center', paddingHorizontal: 4 },
  iconWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  value: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.4,
    lineHeight: 24,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.muted,
    marginTop: 2,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
});
