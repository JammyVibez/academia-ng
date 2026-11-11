import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Animated, Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { usePressScale } from '../lib/motion';
import { colors, gradients, radius, shadow } from '../lib/theme';

type Variant = 'primary' | 'outline' | 'ghost';

interface Props {
  label: string;
  onPress: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  small?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  style?: StyleProp<ViewStyle>;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  small = false,
  icon,
  style,
}: Props) {
  const inactive = disabled || loading;
  const primary = variant === 'primary';
  const tint = primary ? colors.onPrimary : colors.primary;
  const { scale, onPressIn, onPressOut } = usePressScale(primary ? 0.965 : 0.975);

  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled: inactive, busy: loading }}
        disabled={inactive}
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={[
          styles.base,
          small ? styles.small : styles.regular,
          primary ? styles.primary : variant === 'outline' ? styles.outline : styles.ghost,
          primary && !inactive ? shadow.button : null,
          inactive ? styles.inactive : null,
        ]}
      >
        {primary ? (
          <LinearGradient
            pointerEvents="none"
            colors={gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[StyleSheet.absoluteFill, { borderRadius: small ? radius.sm : radius.md }]}
          />
        ) : null}

        {loading ? (
          <ActivityIndicator size="small" color={tint} />
        ) : (
          <View style={styles.content}>
            {icon ? <Ionicons name={icon} size={small ? 15 : 18} color={tint} /> : null}
            <Text style={[styles.label, small ? styles.smallLabel : null, { color: tint }]}>{label}</Text>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    width: '100%',
  },
  regular: { height: 52, paddingHorizontal: 20 },
  small: { height: 38, paddingHorizontal: 16, borderRadius: radius.sm },
  primary: { backgroundColor: colors.primary },
  outline: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
  },
  ghost: { backgroundColor: 'transparent' },
  inactive: { opacity: 0.55 },
  content: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  label: { fontSize: 16, fontWeight: '700', letterSpacing: 0.1 },
  smallLabel: { fontSize: 13 },
});
