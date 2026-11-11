import { Ionicons } from '@expo/vector-icons';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useCountUp, usePopIn } from '../lib/motion';
import { colors } from '../lib/theme';

type Tone = 'primary' | 'accent' | 'neutral';

interface Props {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  label: string;
  tone?: Tone;
  /** Push the animation later so it lands after the card has faded in. */
  delay?: number;
}

const TONES: Record<Tone, { bg: string; icon: string }> = {
  primary: { bg: colors.primarySoft, icon: colors.primary },
  accent: { bg: colors.accentSoft, icon: colors.accentDark },
  neutral: { bg: colors.surfaceMuted, icon: colors.textSecondary },
};

export function StatTile({ icon, value, label, tone = 'primary', delay = 0 }: Props) {
  const palette = TONES[tone];
  const numeric = /^\d+$/.test(value.trim());
  const counted = useCountUp(numeric ? Number(value) : 0, 280 + delay, 780);
  const pop = usePopIn(0.5, 140 + delay);

  return (
    <View style={styles.tile}>
      <Animated.View style={[styles.iconWrap, { backgroundColor: palette.bg, transform: [{ scale: pop }] }]}>
        <Ionicons name={icon} size={15} color={palette.icon} />
      </Animated.View>
      <Text style={styles.value} numberOfLines={1}>
        {numeric ? String(counted) : value}
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
