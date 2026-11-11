import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NATIVE_DRIVER, duration, range, useBreathe, useReducedMotion, useSweep } from '../lib/motion';
import { colors, gradients, spacing } from '../lib/theme';

interface Props {
  title: string;
  subtitle?: string | null;
  badge?: string;
}

/**
 * Gradient hero header: drifting light orbs, a slow sheen sweep, a gold ring
 * that breathes around the monogram, and a title that rises into place.
 */
export function TopBar({ title, subtitle, badge }: Props) {
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();
  const drift = useBreathe(13000, 0, 0, 1);
  const driftSlow = useBreathe(19000, 400, 0, 1);
  const sheen = useSweep(2800, 2400, 700);
  const ring = useBreathe(3200, 200, 0, 1);
  const enter = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (reduced) {
      enter.setValue(1);
      return;
    }

    const animation = Animated.timing(enter, {
      toValue: 1,
      duration: duration.slow,
      delay: 40,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: NATIVE_DRIVER,
    });

    animation.start();
    return () => animation.stop();
  }, [enter, reduced]);

  return (
    <View style={[styles.bar, { paddingTop: insets.top + spacing.xl }]}>
      <LinearGradient
        colors={gradients.hero}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <Animated.View
        pointerEvents="none"
        style={[
          styles.orbLarge,
          reduced
            ? null
            : {
                transform: [
                  { translateX: range(drift, -26, 18) },
                  { translateY: range(drift, 16, -20) },
                  { scale: range(drift, 1, 1.09) },
                ],
              },
        ]}
      />
      <Animated.View
        pointerEvents="none"
        style={[
          styles.orbSmall,
          reduced
            ? null
            : {
                transform: [
                  { translateX: range(driftSlow, 20, -16) },
                  { translateY: range(driftSlow, -12, 18) },
                ],
              },
        ]}
      />

      {reduced ? null : (
        <Animated.View
          pointerEvents="none"
          style={[styles.sheen, { transform: [{ translateX: range(sheen, -200, 620) }, { rotate: '14deg' }] }]}
        >
          <LinearGradient
            colors={gradients.sheen}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      )}

      <Animated.View
        style={[
          styles.row,
          reduced
            ? null
            : {
                opacity: enter,
                transform: [
                  { translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) },
                ],
              },
        ]}
      >
        <View style={styles.texts}>
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>

        {badge ? (
          <View style={styles.badgeWrap}>
            {reduced ? null : (
              <Animated.View
                pointerEvents="none"
                style={[
                  styles.badgeRing,
                  {
                    opacity: ring.interpolate({ inputRange: [0, 1], outputRange: [0.65, 0] }),
                    transform: [{ scale: ring.interpolate({ inputRange: [0, 1], outputRange: [1, 1.35] }) }],
                  },
                ]}
              />
            )}
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          </View>
        ) : null}
      </Animated.View>

      <LinearGradient
        pointerEvents="none"
        colors={['rgba(236,72,153,0)', 'rgba(244,114,182,0.75)', 'rgba(236,72,153,0)']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.hairline}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: colors.primaryDark,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl + 2,
    overflow: 'hidden',
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
  },
  orbLarge: {
    position: 'absolute',
    top: -96,
    right: -78,
    width: 236,
    height: 236,
    borderRadius: 118,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  orbSmall: {
    position: 'absolute',
    bottom: -70,
    left: -46,
    width: 156,
    height: 156,
    borderRadius: 78,
    backgroundColor: 'rgba(236,72,153,0.22)',
  },
  sheen: {
    position: 'absolute',
    top: -60,
    bottom: -60,
    width: 96,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  texts: { flex: 1, minWidth: 0 },
  title: {
    color: colors.onPrimary,
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.3,
    lineHeight: 28,
  },
  subtitle: {
    color: colors.onPrimaryMuted,
    fontSize: 13,
    marginTop: 5,
    letterSpacing: 0.1,
  },
  badgeWrap: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  badgeRing: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: 'rgba(244,114,182,0.9)',
  },
  badge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1.5,
    borderColor: 'rgba(244,114,182,0.65)',
    backgroundColor: 'rgba(255,255,255,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: colors.onPrimary, fontSize: 15, fontWeight: '700', letterSpacing: 0.4 },
  hairline: { position: 'absolute', left: 26, right: 26, bottom: 0, height: 1.5 },
});
