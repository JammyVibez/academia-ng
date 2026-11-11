import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius } from '../lib/theme';

type Tone = 'neutral' | 'primary' | 'accent' | 'success';

interface Props {
  label: string;
  tone?: Tone;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
}

const TONES: Record<Tone, { bg: string; text: string; border: string }> = {
  neutral: { bg: colors.surfaceMuted, text: colors.textSecondary, border: 'transparent' },
  primary: { bg: colors.primarySoft, text: colors.primary, border: 'transparent' },
  accent: { bg: colors.accentSoft, text: colors.accentDark, border: 'transparent' },
  success: { bg: colors.successSoft, text: colors.success, border: 'transparent' },
};

export function Chip({ label, tone = 'neutral', icon, onPress }: Props) {
  const palette = TONES[tone];
  const content = (
    <>
      {icon ? <Ionicons name={icon} size={12} color={palette.text} /> : null}
      <Text style={[styles.label, { color: palette.text }]}>{label}</Text>
    </>
  );

  const base = [styles.chip, { backgroundColor: palette.bg, borderColor: palette.border }];

  if (!onPress) return <View style={base}>{content}</View>;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [...base, pressed ? styles.pressed : null]}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  label: { fontSize: 11.5, fontWeight: '700', letterSpacing: 0.2 },
  pressed: { opacity: 0.7 },
});
