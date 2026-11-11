import { ActivityIndicator, Animated, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Redirect } from 'expo-router';
import { BrandMark } from '../components/BrandMark';
import { PulseRings } from '../components/Lottie';
import { Reveal } from '../components/Reveal';
import { useAuthStore } from '../lib/auth-store';
import { range, useBreathe, useReducedMotion } from '../lib/motion';
import { colors, gradients, spacing } from '../lib/theme';

/**
 * Auth gate — branded splash while SecureStore is read, then the tab shell or
 * the auth stack.
 */
export default function Index() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const reduced = useReducedMotion();
  const drift = useBreathe(9000, 0, 0, 1);

  if (!isHydrated) {
    return (
      <View style={styles.screen}>
        <LinearGradient
          colors={gradients.hero}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <Animated.View
          pointerEvents="none"
          style={[
            styles.glow,
            reduced
              ? null
              : {
                  transform: [
                    { translateY: range(drift, -14, 14) },
                    { scale: range(drift, 1, 1.12) },
                  ],
                },
          ]}
        />
        <Animated.View
          pointerEvents="none"
          style={[
            styles.glowSmall,
            reduced ? null : { transform: [{ translateX: range(drift, 18, -14) }] },
          ]}
        />

        <View style={styles.markWrap}>
          <View pointerEvents="none" style={styles.pulseLayer}>
            <PulseRings size={200} />
          </View>
          <Reveal delay={40} durationMs={600}>
            <BrandMark size={76} />
          </Reveal>
        </View>
        <Reveal delay={170}>
          <Text style={styles.title}>Academia NG</Text>
        </Reveal>
        <Reveal delay={280}>
          <Text style={styles.tagline}>Your Nigerian university companion</Text>
        </Reveal>
        <Reveal delay={400}>
          <ActivityIndicator color={colors.accent} style={styles.spinner} />
        </Reveal>
      </View>
    );
  }

  return <Redirect href={isAuthenticated ? '/(tabs)/home' : '/(auth)/login'} />;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute',
    top: -90,
    right: -70,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(255,255,255,0.055)',
  },
  glowSmall: {
    position: 'absolute',
    bottom: -70,
    left: -50,
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: 'rgba(200,163,74,0.18)',
  },
  markWrap: { width: 76, height: 76, alignItems: 'center', justifyContent: 'center' },
  pulseLayer: {
    position: 'absolute',
    top: -62,
    left: -62,
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: colors.onPrimary,
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.4,
    marginTop: spacing.xl,
  },
  tagline: { color: colors.onPrimaryMuted, fontSize: 13, marginTop: 6 },
  spinner: { marginTop: spacing.xxl },
});
