// ─────────────────────────────────────────────────────────────────────────────
// THE CLOSING ENCOUNTER — the shared half (group AJ).
//
// The owner asked for a moment at the very end of a lesson: *"the stickman starts
// to walk and has an encounter with another stickman, maybe a problem, or maybe an
// ethical dilemma or something funny, but it's something you have to solve … I want
// everything else to fade out, so it's just the stickman … a really clever way to
// answer. Not just click what you think … something to make the user feel good
// about themselves … like they learned something in that lesson."*
//
// ── WHY IT IS NOT A BEAT ────────────────────────────────────────────────────
//
// Every structural rule in the book is written about beats. H's house shape says a
// lesson is 7–11 of them with exactly two graded questions and the summary LAST; a
// beat carries narration that has been rendered through the paid voice ledger; a
// beat's stage is inside `muststamp`, so a prop added to one is a corpus-wide
// re-measure; group Q compares neighbours on their channels. A coda that was a beat
// would have to satisfy all of it, and would be a worse coda for it.
//
// So it is a PHASE, after the last tap and before the reward. The script does not
// know it exists, the must-boxes do not record it (`tourFlag.setCodaOff`), and
// `check:cinematic` still sees the summary as the last thing in the lesson.
//
// ── THE SHAPE ALL FOUR SHARE ────────────────────────────────────────────────
//
//   arrive → ask → play → (again → ask)* → land
//
// `play` is the consequence of what the reader did, drawn rather than judged. If it
// went badly the run comes back to `ask` by way of `again`, where he turns and
// looks at the reader — which is the whole of the owner's "make them feel good":
// there is a problem to solve and no way to fail it. `land` names the idea they
// just used, in the lesson's own words.
//
// ── AND THE FIGURE IS DRAWN THE WAY EVERY OTHER FIGURE IS ───────────────────
//
// `Stickman` + `rig.pose`, with the gait from `travelStance` and the gestures from
// `moves.ts`, exactly as `Visitor.tsx` does. Nothing bespoke: that is what keeps a
// coda inside the vocabulary `check:moves`, `check:smooth` and `check:walk` already
// hold, and it is why the figure can move the way the owner asked for — the library
// has 182 actions in it and this is a place with room to use them.
// ─────────────────────────────────────────────────────────────────────────────
import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing, runOnJS, useAnimatedStyle, useFrameCallback, useSharedValue, withTiming, type SharedValue,
} from 'react-native-reanimated';
import Stickman from '../Stickman';
import { GROUND, INK, K_FIG, PAPER, RULE, SOFT, STAGE_H, STAGE_W } from '../cinematicKit';
import { type Bundle } from '../rig';

/** Where a coda's run has got to. */
export type CodaPhase = 'arrive' | 'ask' | 'play' | 'again' | 'land';

/**
 * THE WINDOW A CODA IS SEEN THROUGH — `[x0, y0, x1, y1]` of the 400×560 design space.
 *
 * A BAND ALONE CANNOT ZOOM, which is worth stating because the first version used
 * one. `fit` is `min(w / spanX, h / spanY)`, and every phone is far taller than the
 * art is, so the fit is always decided by the WIDTH: tightening the band only trims
 * empty sky, and the figure comes out exactly the size it is in a lesson. The coda
 * has the whole screen and should not look like a lesson with the words taken off,
 * so it crops the sides as well, and each one declares how close it wants to be.
 */
export type CodaWindow = [number, number, number, number];
export const CODA_FULL: CodaWindow = [0, 150, STAGE_W, 560];

/**
 * THE RUN, AS A STATE MACHINE WITH ONE CLOCK.
 *
 * `t` is seconds since the current phase began, on the UI thread AND in React — the
 * figure reads the shared value every frame and the component reads the state to
 * decide what may be touched. Two readers, one source: `useFrameCallback` advances
 * the shared value and a `setTimeout` moves the phase, and the phase change resets
 * the clock in the same statement, which is the beat clock's own rule (AF1).
 */
const AGAIN_MS = 1900;

export function useCodaRun(arriveMs: number) {
  const t = useSharedValue(0);
  const [phase, setPhase] = useState<CodaPhase>('arrive');
  const [tries, setTries] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // EVERY PHASE CHANGE CLEARS THE PENDING ONE. Two timers agreeing is the defect
  // group AB records twice over; here it would be a reader pressing "go again" a
  // moment before the automatic return fires, and getting two.
  const go = useCallback((p: CodaPhase) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    t.value = 0;
    setPhase(p);
    // A consequence that went badly holds for a moment — he turns and looks at the
    // reader — and then the question is simply open again. Nothing to dismiss.
    if (p === 'again') timer.current = setTimeout(() => { t.value = 0; setPhase('ask'); }, AGAIN_MS);
  }, [t]);

  useFrameCallback((f) => {
    t.value += (f.timeSincePreviousFrame ?? 16) / 1000;
  }, true);

  useEffect(() => {
    timer.current = setTimeout(() => go('ask'), arriveMs);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [arriveMs, go]);

  /**
   * The reader has acted. `ok` decides whether the consequence lands or comes back.
   *
   * THE CONSEQUENCE ALWAYS PLAYS, and that is the design rather than a nicety: the
   * owner asked for a problem to solve and for the reader to feel good at the end of
   * it, and a wrong answer that is simply refused gives them neither. It is drawn,
   * he reacts to it, and then he turns round and waits.
   */
  const resolve = useCallback((ok: boolean, playMs: number) => {
    setTries((n) => n + 1);
    go('play');
    timer.current = setTimeout(() => go(ok ? 'land' : 'again'), playMs);
  }, [go]);

  const again = useCallback(() => go('ask'), [go]);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  return { t, phase, tries, resolve, again };
}

/**
 * THE STAGE, CROPPED AND SCALED LIKE THE PLAYER'S.
 *
 * Same 400×560 design space, so every coordinate in a coda means what it means in a
 * scene and the rig needs no second calibration. It measures itself rather than
 * taking a size, because this layer is full-bleed and the deck is gone.
 */
export function CodaStage({ win = CODA_FULL, children }: { win?: CodaWindow; children: React.ReactNode }) {
  const [box, setBox] = useState({ w: 0, h: 0 });
  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setBox((b) => (Math.abs(b.w - width) < 0.5 && Math.abs(b.h - height) < 0.5 ? b : { w: width, h: height }));
  }, []);
  const spanX = win[2] - win[0];
  const spanY = win[3] - win[1];
  const fit = box.w > 0 ? Math.min(box.w / spanX, box.h / spanY) : 0;
  return (
    <View style={styles.stage} onLayout={onLayout}>
      {fit > 0 ? (
        <View style={{ width: spanX * fit, height: spanY * fit, overflow: 'hidden' }}>
          <View style={{
            position: 'absolute', left: -win[0] * fit, top: -win[1] * fit,
            width: STAGE_W * fit, height: STAGE_H * fit,
          }}
          >
            <View style={{ width: STAGE_W, height: STAGE_H, transform: [{ scale: fit }], transformOrigin: '0% 0%' }}>
              {children}
            </View>
          </View>
        </View>
      ) : null}
    </View>
  );
}

/** The ground, drawn once so a coda never has to. */
export function CodaFloor() {
  return (
    <>
      <View style={styles.floor} pointerEvents="none" />
      <View style={styles.floorEdge} pointerEvents="none" />
    </>
  );
}

/**
 * THE TOUCH SURFACE, OUTSIDE THE TRANSFORM, IN NORMALISED COORDINATES.
 *
 * A gesture detector placed INSIDE the scaled stage reports different numbers on the
 * two platforms: react-native-gesture-handler gives a view's own untransformed space
 * on native and `clientX − rect.left` — which is scaled CSS pixels — on web. The
 * browser is the only place this project can look at itself (§21), so a control
 * calibrated there would be calibrated for the wrong units on the phone, and nothing
 * would say so.
 *
 * So the surface is a full-bleed sibling with no transform above it, and it reports
 * `u` and `v` in 0…1 of its own measured box. Both platforms agree on that, and the
 * coda converts to design units itself with `codaX` and its own window.
 */
export function CodaTouch({
  enabled, u, v, onDrop, onTap, id,
}: {
  enabled: boolean;
  /** Written every frame the finger moves, in 0…1 of the surface. */
  u?: SharedValue<number>;
  v?: SharedValue<number>;
  /** Called on the JS thread when the finger lifts, with the same reading. */
  onDrop?: (u: number, v: number) => void;
  onTap?: () => void;
  id?: string;
}) {
  const [box, setBox] = useState({ w: 1, h: 1 });
  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setBox({ w: Math.max(width, 1), h: Math.max(height, 1) });
  }, []);
  const w = useSharedValue(1);
  const h = useSharedValue(1);
  w.value = box.w;
  h.value = box.h;
  // SHARED VALUES IN, `runOnJS` OUT — never a plain callback. §17 rule 6: Reanimated
  // packs a non-worklet found in a worklet's closure as a RemoteFunction, and the only
  // thing a RemoteFunction does on the UI thread is throw. It is fatal in release and
  // invisible in a browser, which is why `check:worklets` is a static check.
  const drop = onDrop;
  const tapped = onTap;

  const pan = Gesture.Pan()
    .enabled(enabled && !!u)
    .onBegin((e) => {
      'worklet';
      if (u) u.value = e.x / w.value;
      if (v) v.value = e.y / h.value;
    })
    .onUpdate((e) => {
      'worklet';
      if (u) u.value = e.x / w.value;
      if (v) v.value = e.y / h.value;
    })
    .onEnd((e) => {
      'worklet';
      if (drop) runOnJS(drop)(e.x / w.value, e.y / h.value);
    });
  const tap = Gesture.Tap()
    .enabled(enabled)
    .onEnd((e) => {
      'worklet';
      if (u) u.value = e.x / w.value;
      if (v) v.value = e.y / h.value;
      if (tapped) runOnJS(tapped)();
      else if (drop) runOnJS(drop)(e.x / w.value, e.y / h.value);
    });

  return (
    <GestureDetector gesture={Gesture.Exclusive(pan, tap)}>
      <Animated.View style={StyleSheet.absoluteFill} onLayout={onLayout} nativeID={id} />
    </GestureDetector>
  );
}

/**
 * Design-space x from a normalised reading of the touch surface.
 *
 * THROUGH THE WINDOW, because the surface is the whole screen and the stage is the
 * crop: mapping a finger onto the full 400 when the reader can only see 60…360 puts
 * everything they touch in the wrong place, by more the further from the middle they
 * go. The surface is also wider than the crop where the crop is letterboxed, which
 * is why it clamps rather than running off the ends.
 */
export function codaX(u: number, win: CodaWindow = CODA_FULL): number {
  'worklet';
  const x = win[0] + u * (win[2] - win[0]);
  return x < win[0] ? win[0] : x > win[2] ? win[2] : x;
}

/** A figure, posed by whatever the coda derives. */
export function CodaFigure({ D, role }: { D: SharedValue<Bundle>; role?: 'lead' | 'second' }) {
  return <Stickman D={D} k={K_FIG} role={role === 'second' ? 'second' : undefined} />;
}

/**
 * THE LINE HE IS BEING ASKED, AND THE ONE HE IS TOLD AFTERWARDS.
 *
 * Outside the stage rather than on it: everything else has faded, so there is no
 * competition for the middle of the screen, and a caption over the art is D31 with
 * the coda's own hands. It cross-fades rather than cutting, because the whole point
 * of the phase is that one thing follows another.
 */
export function CodaLine({ text, tone = 'ask' }: { text: string; tone?: 'ask' | 'land' }) {
  const o = useSharedValue(0);
  useEffect(() => {
    o.value = 0;
    o.value = withTiming(1, { duration: 260, easing: Easing.out(Easing.cubic) });
  }, [text, o]);
  const st = useAnimatedStyle(() => ({ opacity: o.value, transform: [{ translateY: (1 - o.value) * 6 }] }));
  return (
    <Animated.View style={[styles.lineWrap, st]} pointerEvents="none">
      <Text style={[styles.line, tone === 'land' && styles.lineLand]}>{text}</Text>
    </Animated.View>
  );
}

/**
 * WHAT THE READER JUST DID, NAMED — and the way out.
 *
 * The owner's "make them feel like they learned something in that lesson": the plate
 * does not congratulate them, it tells them what the thing they just did is CALLED.
 * That is the difference between a reward and a click.
 */
export function CodaLand({ idea, note, onDone }: { idea: string; note: string; onDone: () => void }) {
  const o = useSharedValue(0);
  useEffect(() => {
    o.value = withTiming(1, { duration: 420, easing: Easing.out(Easing.cubic) });
  }, [o]);
  const st = useAnimatedStyle(() => ({ opacity: o.value, transform: [{ translateY: (1 - o.value) * 14 }] }));
  return (
    <Animated.View style={[styles.landWrap, st]}>
      <View style={styles.landPlate}>
        <Text style={styles.landIdea}>{idea}</Text>
        <Text style={styles.landNote}>{note}</Text>
      </View>
      <Animated.View style={styles.doneWrap}>
        <Text
          accessibilityRole="button"
          onPress={onDone}
          style={styles.done}
          suppressHighlighting
        >
          Finish
        </Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  stage: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  floor: {
    position: 'absolute', left: 0, right: 0, top: GROUND, bottom: 0, backgroundColor: RULE,
  },
  floorEdge: {
    position: 'absolute', left: 0, right: 0, top: GROUND, height: 1.5, backgroundColor: SOFT,
  },
  lineWrap: { paddingHorizontal: 26, minHeight: 64, justifyContent: 'center' },
  line: {
    fontFamily: 'Inter_500Medium', fontSize: 16, lineHeight: 23, color: INK, textAlign: 'center',
  },
  lineLand: { fontFamily: 'PlayfairDisplay_600SemiBold', fontSize: 18, lineHeight: 25 },
  landWrap: { paddingHorizontal: 22, paddingBottom: 6, alignItems: 'center' },
  landPlate: {
    alignSelf: 'stretch', borderRadius: 14, paddingVertical: 14, paddingHorizontal: 16,
    backgroundColor: PAPER, borderWidth: 1.5, borderColor: INK,
    boxShadow: '0px 3px 0px rgba(26,26,26,0.92)',
  },
  landIdea: {
    fontFamily: 'PlayfairDisplay_600SemiBold', fontSize: 19, lineHeight: 26, color: INK, textAlign: 'center',
  },
  landNote: {
    fontFamily: 'Inter_400Regular', fontSize: 14, lineHeight: 20, color: INK, opacity: 0.78,
    textAlign: 'center', marginTop: 6,
  },
  doneWrap: { marginTop: 16 },
  done: {
    fontFamily: 'Inter_700Bold', fontSize: 14, letterSpacing: 1.4, color: PAPER,
    backgroundColor: INK, paddingVertical: 13, paddingHorizontal: 42, borderRadius: 12,
    overflow: 'hidden', textAlign: 'center',
  },
});
