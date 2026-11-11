/**
 * Motion tokens and hooks.
 *
 * Everything is built on the core `Animated` runtime so it behaves identically
 * on iOS, Android and the web export: no extra Babel plugin, no reanimated
 * worklet build step. Animations that only touch opacity or transform run on
 * the native driver in the app and fall back to the JS driver on web.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, Platform } from 'react-native';

export const NATIVE_DRIVER = Platform.OS !== 'web';

export const duration = {
  instant: 120,
  fast: 180,
  base: 260,
  slow: 420,
  reveal: 540,
} as const;

/** Spring presets — press feedback should be quick and tight, pops a little bouncy. */
export const springs = {
  press: { speed: 40, bounciness: 0 },
  settle: { speed: 20, bounciness: 5 },
  pop: { speed: 14, bounciness: 12 },
} as const;

/** True when the OS asks apps to reduce motion. Every hook here respects it. */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    let alive = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((value) => {
        if (alive) setReduced(value);
      })
      .catch(() => {
        /* not supported on this platform — keep animations on */
      });

    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', (value) =>
      setReduced(value)
    );

    return () => {
      alive = false;
      subscription.remove();
    };
  }, []);

  return reduced;
}

/** Scale-down feedback for pressables. Pair with `onPressIn` / `onPressOut`. */
export function usePressScale(scaleTo = 0.96) {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = useCallback(() => {
    Animated.spring(scale, {
      toValue: scaleTo,
      useNativeDriver: NATIVE_DRIVER,
      ...springs.press,
    }).start();
  }, [scale, scaleTo]);

  const onPressOut = useCallback(() => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: NATIVE_DRIVER,
      ...springs.settle,
    }).start();
  }, [scale]);

  return { scale, onPressIn, onPressOut };
}

/** Spring a value once on mount — used for icon pops. */
export function usePopIn(from = 0.7, delay = 0): Animated.Value {
  const value = useRef(new Animated.Value(from)).current;

  useEffect(() => {
    const animation = Animated.spring(value, {
      toValue: 1,
      delay,
      useNativeDriver: NATIVE_DRIVER,
      ...springs.pop,
    });
    animation.start();
    return () => animation.stop();
  }, [delay, value]);

  return value;
}

/**
 * Counts a number up from zero when `target` changes. Runs on the JS driver
 * because the frames are read back into React state, so values are rounded to
 * whole numbers to keep re-renders cheap.
 */
export function useCountUp(target: number, delay = 0, durationMs = 820): number {
  const [display, setDisplay] = useState(0);
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    progress.setValue(0);
    const listener = progress.addListener(({ value }) => setDisplay(Math.round(value)));
    const animation = Animated.timing(progress, {
      toValue: target,
      duration: durationMs,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    });

    animation.start(({ finished }) => {
      if (finished) setDisplay(target);
    });

    return () => {
      animation.stop();
      progress.removeListener(listener);
    };
  }, [delay, durationMs, progress, target]);

  return display;
}

/** 0 → 1 → 0 forever. For gentle ambient drift and pulses. */
export function useBreathe(durationMs = 9000, delay = 0, from = 0, to = 1): Animated.Value {
  const value = useRef(new Animated.Value(from)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(value, {
          toValue: to,
          duration: durationMs,
          delay,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: NATIVE_DRIVER,
        }),
        Animated.timing(value, {
          toValue: from,
          duration: durationMs,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: NATIVE_DRIVER,
        }),
      ])
    );

    animation.start();
    return () => animation.stop();
  }, [delay, durationMs, from, to, value]);

  return value;
}

/** 0 → 1, then restart. For sheen and shimmer sweeps. */
export function useSweep(durationMs = 2400, pauseMs = 1200, delay = 0): Animated.Value {
  const value = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(value, {
          toValue: 1,
          duration: durationMs,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: NATIVE_DRIVER,
        }),
        Animated.delay(pauseMs),
        Animated.timing(value, {
          toValue: 0,
          duration: 0,
          useNativeDriver: NATIVE_DRIVER,
        }),
      ])
    );

    animation.start();
    return () => animation.stop();
  }, [delay, durationMs, pauseMs, value]);

  return value;
}

/** Map an animated 0..1 value onto a small pixel range. */
export function range(value: Animated.Value, from: number, to: number) {
  return value.interpolate({ inputRange: [0, 1], outputRange: [from, to] });
}
