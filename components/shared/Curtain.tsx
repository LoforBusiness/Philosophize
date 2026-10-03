import { useCallback, useSyncExternalStore } from 'react';
import { StyleSheet } from 'react-native';
import { useFocusEffect } from 'expo-router';
import Animated, { makeMutable, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import { C } from '@/constants/design';

// ─────────────────────────────────────────────────────────────────────────────
// THE CURTAIN: a fade through paper for a journey that changes TAB.
//
//   "if I click on one of the subjects … it's pretty laggy or it's pretty glitchy
//    … If you click the quick start button, it sometimes does that laggy glitch …
//    It needs to be all clean transitions." (2026-10-01)
//
// Measured in the real tab shell, a tap on a Home subject card or on Quick Start
// was three faults stacked, and the tab navigator's own cross-fade was the worst
// of them:
//
//   · IT NEVER CROSS-FADED. expo-router's BottomTabView starts the fade in an
//     effect that re-runs on EVERY render of the navigator (its `descriptors` are
//     new each render), and on the second run the tab being left is no longer "the
//     previous one", so it is snapped to fully faded in zero milliseconds. A
//     journey from Home always renders the navigator twice — the Learn tab is
//     focused first, and its own stack lifts its state into the navigator about
//     90ms later — so Home vanished on the first frame and the new screen faded
//     in over blank paper. A dissolve the layout promised and the phone never drew.
//   · THE TAP FROZE BEFORE ANYTHING MOVED, while the destination was built (see
//     WORLD_FADE_MS in the road screen), so the fade's opening was spent behind a
//     still Home and the screen then appeared half arrived — a stall and a jump.
//   · TWO ANIMATIONS RAN AT ONCE: the tab fade and the Learn stack's own push, and
//     while the pushed screen was faint the stack's grid showed through.
//
// So these journeys do not lean on the navigator at all. The curtain fades in
// over the screen being left (COVER_MS), the navigation happens UNDERNEATH it with
// the tab fade switched off (`useInstantTabs`), and the destination lifts it as
// soon as it has been drawn once (`useCurtainLift`). Whatever building the new
// screen still costs is paid behind an opaque, motionless sheet, where a stall
// cannot be seen. Material calls this pattern a fade-through; here it is one
// sheet of the app's own paper.
//
// It covers the tab bar too, which is what makes Quick Start clean: the bar hides
// for a lesson, and that happens behind the curtain instead of in front of you.
// ─────────────────────────────────────────────────────────────────────────────

/** How long the paper takes to cover the screen being left. */
export const COVER_MS = 150;
/** How long it takes to lift off the screen arriving. */
export const LIFT_MS = 260;
/** If the destination never says it has been drawn, the curtain lifts anyway. */
const SAFETY_MS = 1600;

const CURTAIN = makeMutable(0);

// Whether the tab navigator should switch tabs without its own fade. A tiny store
// rather than uiStore, because only the tab layout reads it.
let instant = false;
const listeners = new Set<() => void>();
const setInstant = (v: boolean) => {
  if (instant === v) return;
  instant = v;
  listeners.forEach((l) => l());
};
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

let busy = false;
let waiting = false;
let safety: ReturnType<typeof setTimeout> | null = null;

/**
 * Run a navigation behind the curtain. A second call while one is in flight is
 * dropped: a double tap must not queue a second journey under the first.
 */
export function curtainTo(go: () => void) {
  if (busy) return;
  busy = true;
  setInstant(true);
  CURTAIN.value = withTiming(1, { duration: COVER_MS, easing: Easing.inOut(Easing.quad) });
  setTimeout(() => {
    waiting = true;
    try {
      go();
    } finally {
      safety = setTimeout(liftCurtain, SAFETY_MS);
    }
  }, COVER_MS);
}

/** Lift it, two frames after the caller (so the screen under it has painted). */
export function liftCurtain() {
  if (!waiting) return;
  waiting = false;
  if (safety) { clearTimeout(safety); safety = null; }
  requestAnimationFrame(() => requestAnimationFrame(() => {
    CURTAIN.value = withTiming(0, { duration: LIFT_MS, easing: Easing.out(Easing.cubic) });
    setTimeout(() => {
      busy = false;
      // Back on after the curtain is gone: the tab fade's own re-render cannot
      // move anything a reader can see by then.
      setInstant(false);
    }, LIFT_MS + 40);
  }));
}

/** A screen a curtain journey can land on: lifts it when the screen is focused. */
export function useCurtainLift() {
  useFocusEffect(useCallback(() => { liftCurtain(); }, []));
}

/** For the tab layout: true while a curtain journey is changing tab. */
export function useInstantTabs() {
  return useSyncExternalStore(subscribe, () => instant, () => false);
}

/** The sheet itself. Mounted once, over the whole tab shell, bar included. */
export default function Curtain() {
  const st = useAnimatedStyle(() => ({ opacity: CURTAIN.value }));
  return <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.sheet, st]} />;
}

const styles = StyleSheet.create({
  sheet: { backgroundColor: C.paper, zIndex: 50 },
});
