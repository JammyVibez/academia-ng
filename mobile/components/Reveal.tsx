import { useEffect, useRef, type ReactNode } from 'react';
import { Animated, Easing, type StyleProp, type ViewStyle } from 'react-native';
import { NATIVE_DRIVER, duration, useReducedMotion } from '../lib/motion';

interface Props {
  children: ReactNode;
  /** Stagger steps by passing 0, 70, 140… */
  delay?: number;
  offset?: number;
  durationMs?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Fade + rise entrance. Wrap blocks and give each one a slightly later delay
 * so screens assemble themselves instead of snapping into place.
 */
export function Reveal({ children, delay = 0, offset = 16, durationMs = duration.reveal, style }: Props) {
  const reduced = useReducedMotion();
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (reduced) {
      progress.setValue(1);
      return;
    }

    const animation = Animated.timing(progress, {
      toValue: 1,
      duration: durationMs,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: NATIVE_DRIVER,
    });

    animation.start();
    return () => animation.stop();
  }, [delay, durationMs, progress, reduced]);

  return (
    <Animated.View
      style={[
        style,
        reduced
          ? null
          : {
              opacity: progress,
              transform: [
                { translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [offset, 0] }) },
              ],
            },
      ]}
    >
      {children}
    </Animated.View>
  );
}
