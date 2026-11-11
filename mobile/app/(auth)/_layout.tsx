import { Redirect, Stack } from 'expo-router';
import { useAuthStore } from '../../lib/auth-store';
import { colors } from '../../lib/theme';

export default function AuthLayout() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isHydrated = useAuthStore((state) => state.isHydrated);

  if (isHydrated && isAuthenticated) return <Redirect href="/(tabs)/home" />;

  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }} />;
}
