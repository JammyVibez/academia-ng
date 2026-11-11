import type { ReactNode } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { colors, radius, shadow } from '../lib/theme';

/**
 * Phone-width canvas. On tablets and the web build the content stays in a
 * centred frame instead of stretching edge to edge.
 */
export function Screen({ children }: { children: ReactNode }) {
  const { width } = useWindowDimensions();
  const wide = width >= 640;

  return (
    <View style={styles.root}>
      <View style={[styles.frame, wide ? styles.frameWide : null]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', overflow: 'hidden' },
  frame: { flex: 1, width: '100%', maxWidth: 520, backgroundColor: colors.bg },
  frameWide: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    ...shadow.raised,
  },
});
