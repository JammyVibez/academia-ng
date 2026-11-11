import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../lib/theme';

export function ErrorNotice({ message }: { message: string | null }) {
  if (!message) return null;

  return (
    <View style={styles.box} accessibilityLiveRegion="polite">
      <Ionicons name="alert-circle" size={17} color={colors.danger} />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.dangerBg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(179,38,30,0.14)',
    paddingVertical: 11,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  text: { flex: 1, color: colors.danger, fontSize: 13, lineHeight: 18 },
});
