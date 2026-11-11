import { StyleSheet, Text, View } from 'react-native';
import { colors, shadow } from '../lib/theme';

export function BrandMark({ size = 56 }: { size?: number }) {
  return (
    <View style={[styles.wrap, { width: size, height: size, borderRadius: size * 0.3 }, shadow.raised]}>
      <View style={[styles.gloss, { borderRadius: size }]} />
      <Text style={[styles.letter, { fontSize: size * 0.42 }]}>A</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  gloss: {
    position: 'absolute',
    top: -28,
    right: -20,
    width: 64,
    height: 64,
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  letter: { color: colors.onPrimary, fontWeight: '800', letterSpacing: 0.5 },
});
