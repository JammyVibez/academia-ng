import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Redirect } from 'expo-router';
import { BrandMark } from '../components/BrandMark';
import { useAuthStore } from '../lib/auth-store';
import { colors, spacing } from '../lib/theme';

/**
 * Auth gate — branded splash while SecureStore is read, then the tab shell or
 * the auth stack.
 */
export default function Index() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isHydrated = useAuthStore((state) => state.isHydrated);

  if (!isHydrated) {
    return (
      <View style={styles.screen}>
        <View pointerEvents="none" style={styles.glow} />
        <BrandMark size={76} />
        <Text style={styles.title}>Academia NG</Text>
        <Text style={styles.tagline}>Your Nigerian university companion</Text>
        <ActivityIndicator color={colors.accent} style={styles.spinner} />
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
    top: -80,
    right: -60,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(255,255,255,0.05)',
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
