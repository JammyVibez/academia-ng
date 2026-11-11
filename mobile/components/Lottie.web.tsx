import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useReducedMotion } from '../lib/motion';

const pulseSource = require('../assets/lottie/pulse.json');
const successSource = require('../assets/lottie/success.json');

/**
 * Web build of the Lottie players.
 *
 * lottie-react-native's web path lays the canvas out by the composition's
 * intrinsic ratio, which squashed the 1:1 pulse into a 2:1 strip and clipped
 * the rings. Driving @lottiefiles/dotlottie-react with an explicit square
 * container keeps the animation intact while native keeps using LottieView.
 */
interface PulseProps {
  size?: number;
  style?: StyleProp<ViewStyle>;
}

export function PulseRings({ size = 160, style }: PulseProps) {
  const reduced = useReducedMotion();

  return (
    <View pointerEvents="none" style={[styles.center, style]}>
      <View style={{ width: size, height: size }}>
        <DotLottieReact
          data={pulseSource}
          autoplay={!reduced}
          loop
          speed={1}
          style={{ width: size, height: size }}
        />
      </View>
    </View>
  );
}

interface SuccessProps {
  size?: number;
  onFinish?: () => void;
  style?: StyleProp<ViewStyle>;
}

/** One-shot tick. `onFinish` is unused on web; the caller's timer clears it. */
export function SuccessBurst({ size = 92, style }: SuccessProps) {
  const reduced = useReducedMotion();

  return (
    <View pointerEvents="none" style={[styles.center, style]}>
      <View style={{ width: size, height: size }}>
        <DotLottieReact
          data={successSource}
          autoplay={!reduced}
          loop={false}
          speed={1}
          style={{ width: size, height: size }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
});
