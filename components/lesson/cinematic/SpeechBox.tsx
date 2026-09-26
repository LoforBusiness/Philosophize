import { useCallback } from 'react';
import { StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, type SharedValue } from 'react-native-reanimated';
import { STAGE_W, clamp01, ease01, easeOutBack, seg } from './rig';
import { INK, PAPER_LIT } from '@/components/shared/tone';

// ─────────────────────────────────────────────────────────────────────────────
// A SPEECH BOX FOR A FIGURE WHO IS TALKING — drawn in a lesson's CHROME, over the
// speaker's mark, and driven ONLY by the player's shared beat index and clock.
//
// Built for logic-arguments-1 on 2026-09-25, after the owner watched the shipped
// lesson on a phone: *"they glitch or appear and disappear and appear again when
// you press the tab … every time when there is a box above their head."*
//
// ── WHY IT FLICKERED ON A PHONE AND NEVER IN A BROWSER ─────────────────────────
//
// The old box (cinematicKit's `Bubble`) chose WHICH line to show from React's beat
// number and timed its fade from `bt`, the shared clock. On a tap the player rewinds
// `bt` inside React's render, but on a device a shared value lives on the UI thread,
// and the rewind arrives there a frame or so after React has committed the new tree.
// So for a frame the NEW line was drawn against the OLD beat's elapsed time — fully
// in — then the clock landed at 0 and it went out and faded in again. The line that
// was leaving did the same backwards. Worse, the lesson unmounted the current box
// and mounted a fresh "leaving" copy on every tap, which also threw away its
// measured width for a frame (the 10–30px sideways jump a browser recording showed).
// A browser has one thread, so the race cannot happen there and every harness
// called it clean.
//
// So: a box is keyed by the beat it belongs to and stays mounted for as long as it
// can be seen, and everything it animates is a function of `bi` and `bt` TOGETHER.
// The two are written in one statement and reach the UI thread in one batch, so
// they always agree with each other — which React's beat number and `bt` do not.
//
// ── THE LOOK ─────────────────────────────────────────────────────────────────
//
// The app's depth kit (§19): a white face on a hard ink outline, a round corner, a
// hard lip underneath in the lesson's own tone, and a real TAIL — a diamond whose
// two lower edges carry the outline — where the old box had a square notch and a
// hairline leader, which read as a diagram label. A SHOUT is struck in ink with
// light type, tilted a little toward the man shouting, and it POPS from the tail
// with an overshoot; a calm line rises into place. Leaving is quick and small.
// ─────────────────────────────────────────────────────────────────────────────

const EDGE = 10;            // the box stays this far inside the stage
const TAIL = 14;            // the tail's square before it is turned 45°
/** How far the tail's point hangs below the box's bottom edge. */
const TIP = TAIL * Math.SQRT1_2 - 1;

export default function SpeechBox({
  text, beat, bi, bt, x, tipY, side, shout, lip,
}: {
  text: string;
  /** The beat this line is SAID on. It fades in then, and out on the beat after. */
  beat: number;
  bi: SharedValue<number>;
  bt: SharedValue<number>;
  /** The speaker's x in chrome units, updated every frame by the scene. */
  x: SharedValue<number>;
  /** Where the tail's point lands: just above the speaker's crown, for this beat's shot. */
  tipY: number;
  /** Which side of the stage the speaker is on (−1 left). A shout leans toward him. */
  side: -1 | 1;
  shout?: boolean;
  /** The lip's colour. */
  lip: string;
}) {
  // Measured once, and the box is mounted a beat before it is seen (the chrome
  // mounts a window of beats), so the width is known before the first visible frame.
  const w = useSharedValue(0);
  const onLayout = useCallback((e: LayoutChangeEvent) => {
    w.value = e.nativeEvent.layout.width;
  }, []);

  const place = useAnimatedStyle(() => {
    const half = w.value / 2;
    const cx = Math.max(half + EDGE, Math.min(STAGE_W - half - EDGE, x.value));
    return { transform: [{ translateX: cx - STAGE_W / 2 }] };
  });

  // The tail leans back toward the speaker when the box had to be clamped.
  const lean = useAnimatedStyle(() => {
    const half = w.value / 2;
    const cx = Math.max(half + EDGE, Math.min(STAGE_W - half - EDGE, x.value));
    const off = Math.max(-(half - 22), Math.min(half - 22, x.value - cx));
    return { transform: [{ translateX: off }] };
  });

  const life = useAnimatedStyle(() => {
    const n = bi.value;
    const t = bt.value;
    const tilt = shout ? side * -2.5 : 0;
    if (n === beat) {
      // In, after the line before it has gone (that takes 0.16s).
      const u = seg(t, 0.18, 0.44);
      const o = clamp01(seg(t, 0.18, 0.28));
      const s = shout ? 0.62 + 0.38 * easeOutBack(u) : 0.9 + 0.1 * ease01(u);
      return {
        opacity: o,
        transform: [{ translateY: (1 - ease01(u)) * 6 }, { rotate: `${tilt}deg` }, { scale: s }],
      };
    }
    if (n === beat + 1) {
      const e = ease01(seg(t, 0, 0.16));
      return {
        opacity: 1 - e,
        transform: [{ translateY: -3 * e }, { rotate: `${tilt}deg` }, { scale: 1 - 0.08 * e }],
      };
    }
    return { opacity: 0, transform: [{ translateY: 0 }, { rotate: `${tilt}deg` }, { scale: 0.9 }] };
  });

  return (
    <Animated.View style={[styles.wrap, { height: tipY - TIP }, place]} pointerEvents="none">
      <Animated.View onLayout={onLayout} style={[styles.bubble, life]}>
        <View style={[styles.box, shout && styles.boxShout, { boxShadow: `0px 3px 0px ${lip}` }]}>
          <Text style={[styles.text, shout && styles.textShout]}>{text}</Text>
        </View>
        <Animated.View style={[styles.tailWrap, lean]}>
          <View style={[styles.tail, shout && styles.tailShout]} />
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute', left: 0, top: 0, width: STAGE_W,
    alignItems: 'center', justifyContent: 'flex-end',
  },
  // Scales about the tail's root, so it grows out of the mouth rather than swimming.
  bubble: { maxWidth: 206, alignItems: 'center', transformOrigin: '50% 100%' },
  box: {
    backgroundColor: PAPER_LIT, borderWidth: 2, borderColor: INK, borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 9,
  },
  boxShout: { backgroundColor: INK },
  text: {
    fontFamily: 'Inter_500Medium', fontSize: 13.5, lineHeight: 18, color: INK, textAlign: 'center',
  },
  textShout: { fontFamily: 'Inter_700Bold', fontSize: 13, letterSpacing: 0.8, color: PAPER_LIT },
  // A zero-height row under the box: the diamond's upper half sits inside the box
  // (covering its bottom border there, so the outline runs on round the tail) and
  // its lower half is the point.
  tailWrap: { height: TIP, alignItems: 'center' },
  tail: {
    width: TAIL, height: TAIL, marginTop: -TAIL / 2 - 1,
    backgroundColor: PAPER_LIT, borderRightWidth: 2, borderBottomWidth: 2, borderColor: INK,
    transform: [{ rotate: '45deg' }],
  },
  tailShout: { backgroundColor: INK },
});
