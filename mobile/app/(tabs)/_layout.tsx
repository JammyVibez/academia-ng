import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import { Redirect, Tabs } from 'expo-router';
import { useAuthStore } from '../../lib/auth-store';
import { NATIVE_DRIVER, springs } from '../../lib/motion';
import { colors } from '../../lib/theme';

/** Tab icon that springs up and gets a gold dot when it becomes active. */
function TabIcon({
  name,
  color,
  size,
  focused,
}: {
  name: keyof typeof Ionicons.glyphMap;
  color: string;
  size: number;
  focused: boolean;
}) {
  const scale = useRef(new Animated.Value(focused ? 1 : 0.9)).current;
  const dot = useRef(new Animated.Value(focused ? 1 : 0)).current;

  useEffect(() => {
    const pop = Animated.spring(scale, {
      toValue: focused ? 1.1 : 1,
      useNativeDriver: NATIVE_DRIVER,
      ...springs.pop,
    });
    const fade = Animated.timing(dot, {
      toValue: focused ? 1 : 0,
      duration: 220,
      easing: Easing.out(Easing.ease),
      useNativeDriver: NATIVE_DRIVER,
    });

    pop.start();
    fade.start();

    return () => {
      pop.stop();
      fade.stop();
    };
  }, [dot, focused, scale]);

  return (
    <Animated.View style={{ alignItems: 'center', transform: [{ scale }] }}>
      <Ionicons name={name} color={color} size={size} />
      <Animated.View
        style={{
          width: 4,
          height: 4,
          borderRadius: 2,
          marginTop: 3,
          backgroundColor: colors.accent,
          opacity: dot,
          transform: [{ scale: dot }],
        }}
      />
    </Animated.View>
  );
}

export default function TabsLayout() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isHydrated = useAuthStore((state) => state.isHydrated);

  if (!isHydrated) return null;
  if (!isAuthenticated) return <Redirect href="/(auth)/login" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingTop: 6,
          width: '100%',
          maxWidth: 520,
          alignSelf: 'center',
          elevation: 12,
          shadowColor: '#0B241C',
          shadowOpacity: 0.07,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: -6 },
        },
        tabBarLabelStyle: { fontSize: 10.5, fontWeight: '700', letterSpacing: 0.2 },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon name={focused ? 'home' : 'home-outline'} color={color as string} size={size} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="learn"
        options={{
          title: 'Learn',
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon name={focused ? 'book' : 'book-outline'} color={color as string} size={size} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon name={focused ? 'person' : 'person-outline'} color={color as string} size={size} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
