import { useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSweep } from '../lib/motion';
import { colors, gradients, radius, spacing } from '../lib/theme';

export function SkeletonCard() {
  const [width, setWidth] = useState(0);
  const sweep = useSweep(1500, 380, 0);
  const translateX = sweep.interpolate({
    inputRange: [0, 1],
    outputRange: [-width * 0.75 || -240, width || 320],
  });

  return (
    <View style={styles.card} onLayout={(event) => setWidth(event.nativeEvent.layout.width)}>
      <View style={[styles.bar, styles.barChip]} />
      <View style={[styles.bar, styles.barTitle]} />
      <View style={[styles.bar, styles.barMeta]} />

      <Animated.View pointerEvents="none" style={[styles.shimmer, { transform: [{ translateX }] }]}>
        <LinearGradient
          colors={gradients.shimmer}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <View>
      {Array.from({ length: count }, (_, index) => (
        <SkeletonCard key={index} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  bar: { backgroundColor: colors.surfaceMuted, borderRadius: 6 },
  barChip: { width: 74, height: 12, marginBottom: 12 },
  barTitle: { width: '68%', height: 16, marginBottom: 10 },
  barMeta: { width: '45%', height: 11 },
  shimmer: { position: 'absolute', top: 0, bottom: 0, width: '55%' },
});
