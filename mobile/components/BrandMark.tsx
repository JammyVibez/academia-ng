import { Animated, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { range, useBreathe, useReducedMotion, useSweep } from '../lib/motion';
import { colors, gradients, shadow } from '../lib/theme';

interface Props {
  size?: number;
  /** Gold ring pulse + gloss sweep. Turn off for tiny inline marks. */
  animated?: boolean;
}

export function BrandMark({ size = 56, animated = true }: Props) {
  const reduced = useReducedMotion();
  const pulse = useBreathe(2800, 0, 0, 1);
  const sheen = useSweep(2200, 1300, 500);
  const live = animated && !reduced;

  return (
    <View style={{ width: size, height: size }}>
      {live ? (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.ring,
            {
              width: size,
              height: size,
              borderRadius: size * 0.3,
              opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.7, 0] }),
              transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.18] }) }],
            },
          ]}
        />
      ) : null}

      <View style={[styles.wrap, { width: size, height: size, borderRadius: size * 0.3 }, shadow.raised]}>
        <LinearGradient
          pointerEvents="none"
          colors={gradients.heroDeep}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={[styles.gloss, { borderRadius: size }]} />

        {live ? (
          <Animated.View
            pointerEvents="none"
            style={{
              position: 'absolute',
              top: -size,
              height: size * 3,
              width: size * 0.42,
              transform: [{ translateX: range(sheen, -size, size) }, { rotate: '16deg' }],
            }}
          >
            <LinearGradient
              colors={gradients.sheen}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
        ) : null}

        <Text style={[styles.letter, { fontSize: size * 0.42 }]}>A</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  ring: {
    position: 'absolute',
    borderWidth: 1.5,
    borderColor: 'rgba(244,114,182,0.9)',
  },
  wrap: {
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
