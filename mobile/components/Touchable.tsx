import type { ReactNode } from 'react';
import {
  Pressable,
  type AccessibilityRole,
  type AccessibilityState,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Animated } from 'react-native';
import { usePressScale } from '../lib/motion';

interface Props {
  children: ReactNode;
  onPress?: () => void;
  /** Layout styles (margins, flex) live on the animated wrapper. */
  style?: StyleProp<ViewStyle>;
  /** Visual styles for the pressable surface itself. */
  innerStyle?: StyleProp<ViewStyle>;
  scaleTo?: number;
  disabled?: boolean;
  accessibilityLabel?: string;
  accessibilityRole?: AccessibilityRole;
  accessibilityState?: AccessibilityState;
}

/** Pressable with a spring scale-down — the core tactile gesture of the app. */
export function Touchable({
  children,
  onPress,
  style,
  innerStyle,
  scaleTo = 0.96,
  disabled = false,
  accessibilityLabel,
  accessibilityRole = 'button',
  accessibilityState,
}: Props) {
  const { scale, onPressIn, onPressOut } = usePressScale(scaleTo);

  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      <Pressable
        accessibilityRole={accessibilityRole}
        accessibilityLabel={accessibilityLabel}
        accessibilityState={accessibilityState}
        disabled={disabled}
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={innerStyle}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}
