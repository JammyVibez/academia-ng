import LottieView from 'lottie-react-native';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useReducedMotion } from '../lib/motion';

const pulseSource = require('../assets/lottie/pulse.json');
const successSource = require('../assets/lottie/success.json');

interface PulseProps {
  size?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Looping Lottie pulse — two rings expanding out of the brand mark.
 * Under reduced motion it holds the first frame instead of looping.
 */
export function PulseRings({ size = 160, style }: PulseProps) {
  const reduced = useReducedMotion();

  return (
    <View pointerEvents="none" style={[styles.center, style]}>
      <LottieView
        source={pulseSource}
        autoPlay={!reduced}
        loop
        speed={1}
        resizeMode="contain"
        style={{ width: size, height: size }}
      />
    </View>
  );
}

interface SuccessProps {
  size?: number;
  onFinish?: () => void;
  style?: StyleProp<ViewStyle>;
}

/** One-shot Lottie ring + tick, played when a course is added. */
export function SuccessBurst({ size = 92, onFinish, style }: SuccessProps) {
  const reduced = useReducedMotion();

  return (
    <View pointerEvents="none" style={[styles.center, style]}>
      <LottieView
        source={successSource}
        autoPlay={!reduced}
        loop={false}
        speed={1}
        resizeMode="contain"
        style={{ width: size, height: size }}
        onAnimationFinish={onFinish}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
});
