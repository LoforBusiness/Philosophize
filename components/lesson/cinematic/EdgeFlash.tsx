// ─────────────────────────────────────────────────────────────────────────────
// A SOFT GLOW AT THE EDGE YOU TAPPED.
//
// Forward needs no confirmation — the picture moves on and the next line starts —
// but BACK does. A paragraph the reader has already read coming back, with the
// animation it just played playing again, reads as a glitch unless something says
// "you went back". So a tap in either zone breathes a faint ink wash in from that
// edge with a chevron in it, gone in about a third of a second. On the first beat,
// where there is nowhere to go back to, the same glow is the whole answer: it says
// the tap was heard and that this is the start.
//
// Drawn over the body with pointerEvents off, so it never takes a touch. The wash is
// a gradient into transparency rather than a flat band, so it has no inner edge to
// read as a panel sliding in; the chevron is a tiny static <Svg>, whose cost is its
// own 14×24 box (CLAUDE.md §19 — an <Svg> costs its whole box, not its drawing).
// ─────────────────────────────────────────────────────────────────────────────
import { useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSequence, withTiming, Easing, type SharedValue } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { INK } from '@/components/shared/tone';
import type { TapSide } from './tapNav';

export function useEdgeFlash() {
  const back = useSharedValue(0);
  const fwd = useSharedValue(0);
  /** `bump`: the tap was heard and went nowhere (back, on the first beat). */
  const flash = useCallback((side: TapSide, bump = false) => {
    const v = side === 'back' ? back : fwd;
    v.value = withSequence(
      withTiming(1, { duration: 90, easing: Easing.out(Easing.quad) }),
      withTiming(0, { duration: bump ? 460 : 300, easing: Easing.in(Easing.quad) }),
    );
  }, [back, fwd]);
  return { flash, back, fwd };
}

function Chevron({ left }: { left: boolean }) {
  return (
    <Svg width={14} height={24} viewBox="0 0 14 24">
      <Path
        d={left ? 'M10 4 L3 12 L10 20' : 'M4 4 L11 12 L4 20'}
        stroke={INK} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" fill="none"
      />
    </Svg>
  );
}

export default function EdgeFlash({ back, fwd }: { back: SharedValue<number>; fwd: SharedValue<number> }) {
  const backStyle = useAnimatedStyle(() => ({ opacity: back.value, transform: [{ translateX: (back.value - 1) * 6 }] }));
  const fwdStyle = useAnimatedStyle(() => ({ opacity: fwd.value, transform: [{ translateX: (1 - fwd.value) * 6 }] }));
  return (
    <>
      <Animated.View pointerEvents="none" style={[styles.edge, styles.left, backStyle]}>
        <LinearGradient
          colors={['rgba(26,26,26,0.14)', 'rgba(26,26,26,0)']}
          start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={[styles.mark, styles.markLeft]}><Chevron left /></View>
      </Animated.View>
      <Animated.View pointerEvents="none" style={[styles.edge, styles.right, fwdStyle]}>
        <LinearGradient
          colors={['rgba(26,26,26,0)', 'rgba(26,26,26,0.10)']}
          start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={[styles.mark, styles.markRight]}><Chevron left={false} /></View>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  edge: { position: 'absolute', top: 0, bottom: 0, width: 56, justifyContent: 'center' },
  left: { left: 0 },
  right: { right: 0 },
  mark: { position: 'absolute', opacity: 0.55 },
  markLeft: { left: 10 },
  markRight: { right: 10 },
});
