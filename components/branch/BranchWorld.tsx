import { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet, useWindowDimensions } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, useDerivedValue, useFrameCallback,
  withTiming, withSequence, runOnJS, Easing, type SharedValue,
} from 'react-native-reanimated';
import Stickman from '@/components/lesson/cinematic/Stickman';
import { pose, stand, type Bundle } from '@/components/lesson/cinematic/rig';
import { strideMode } from '@/components/lesson/cinematic/moves';
import {
  layout, groundAt, sceneProps, gaitForSpan, jumpForSpan, MOON, LAYERS, LEAD, WALK_SECONDS,
  type Marker, type Prop,
} from './worldPath';

// ─────────────────────────────────────────────────────────────────────────────
// A BRANCH IS A PLACE YOU WALK THROUGH.
//
// ── THE WORLD DOES NOT SCROLL SIDEWAYS ──────────────────────────────────────
//
// It did, and that was wrong: being able to drag the landscape turns the walk
// into a thing you can skip, and the walk is the whole point. The camera is now
// driven by exactly three things, all of them animations:
//
//   · arriving — it is simply where the reader already is
//   · the WALK — seven seconds to the next lesson, after finishing one
//   · the DROP — tapping any other lesson lands the figure beside it
//
// Moving between UNITS is vertical, in the list below this strip. Nothing here
// responds to a horizontal drag at all, so there is no way to be somewhere the
// animation did not put you.
//
// ── THE FIGURE STANDS BEHIND THE SIGNS ──────────────────────────────────────
//
// Drawn before the markers, so a lesson's name is never covered by a person.
// The words are the thing being chosen; the figure is who is choosing.
//
// ── DEPTH IS PARALLAX AND TONE, NEVER HUE (§19) ─────────────────────────────
//
// Four layers of flat silhouette — peaks, pines, trees, foreground — each a
// paler tone further out, each riding the camera at its own rate. That stacking
// IS the look of the reference art; almost none of it is detail, and all of it
// survives being black and white.
// ─────────────────────────────────────────────────────────────────────────────

const INK = '#1A1A1A';
const SOFT = '#6B6B6B';
const FAINT = '#C9C5BA';
const PAPER = '#FAFAF7';
const SKY = '#EFECE4';

const FIG_K = 0.62;
const H = 360;
/** How long the figure takes to drop in beside a lesson the reader tapped. */
const DROP_MS = 900;

export interface WorldLesson {
  id: string; title: string;
  unitId: string; unitSlug: string; unitTitle: string;
  done: boolean; accessible: boolean;
}

export default function BranchWorld({
  lessons, current, onOpen, advanceTo,
}: {
  lessons: WorldLesson[];
  current: number;
  onOpen: (l: WorldLesson) => void;
  advanceTo?: { from: number; to: number; done: () => void } | null;
}) {
  const { width } = useWindowDimensions();
  const markers = useMemo(
    () => layout(lessons.map((l) => ({ id: l.id, unitId: l.unitId }))),
    [lessons],
  );

  // Where each unit begins, in world x — what tells the scenery which place it is in.
  const unitStarts = useMemo(() => markers.filter((m) => m.unitStart).map((m) => m.x), [markers]);

  const camX = useSharedValue(0);
  const figX = useSharedValue(0);
  const figLift = useSharedValue(0);      // the drop: height above the ground
  const wFrom = useSharedValue(0);
  const wTo = useSharedValue(0);
  const wp = useSharedValue(1);
  const gait = useSharedValue(0);
  const mode = useSharedValue(0);        // how this span is travelled (moves.gaitFor)
  const jumpH = useSharedValue(0);       // the arc over an obstacle, in stage units
  const jumpAt = useSharedValue(-1);
  const clock = useSharedValue(0);
  const [at, setAt] = useState(current);
  const [busy, setBusy] = useState(false);

  useFrameCallback((f) => {
    'worklet';
    clock.value += Math.min(0.05, (f.timeSincePreviousFrame ?? 16) / 1000);
  }, true);

  const camFor = useCallback((x: number) => x - width * LEAD, [width]);

  // Arriving: put the reader where they already are, with no animation. This runs
  // on mount AND whenever `current` moves underneath us — which is what makes the
  // screen correct when it is reached from anywhere other than a finished lesson.
  useEffect(() => {
    const m = markers[current];
    if (!m) return;
    setAt(current);
    figX.value = m.x;
    camX.value = camFor(m.x);
    figLift.value = 0;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, markers.length, width]);

  const settle = useCallback((i: number, cb?: () => void) => {
    setAt(i);
    setBusy(false);
    cb?.();
  }, []);

  // ── THE WALK ───────────────────────────────────────────────────────────────
  // Armed by an event, not by a value, and started from wherever the figure is
  // standing — so it plays on arrival at this screen after a lesson rather than
  // needing the reader to already be looking at it.
  useEffect(() => {
    if (!advanceTo) return;
    const target = markers[advanceTo.to];
    // FROM THE LESSON JUST FINISHED, not from  — which has already moved
    // to the next one by the time this screen rebuilds. Reading it here is why the
    // walk was invisible: the figure was placed at its destination and then asked
    // to walk there.
    const from = markers[advanceTo.from] ?? markers[at];
    if (!target || !from) { advanceTo.done(); return; }
    setBusy(true);
    figX.value = from.x;
    camX.value = camFor(from.x);
    wFrom.value = from.x;
    wTo.value = target.x;
    wp.value = 0;
    gait.value = 1;
    mode.value = gaitForSpan(advanceTo.to);
    const jump = jumpForSpan(from.x, target.x);
    jumpAt.value = jump ? jump.at : -1;
    jumpH.value = jump ? jump.h : 0;
    const ms = WALK_SECONDS * 1000;
    const cb = advanceTo.done;
    const to = advanceTo.to;
    wp.value = withTiming(1, { duration: ms, easing: Easing.inOut(Easing.quad) });
    camX.value = withTiming(camFor(target.x), { duration: ms, easing: Easing.inOut(Easing.quad) }, (ok) => {
      'worklet';
      gait.value = 0;
      if (ok) runOnJS(settle)(to, cb);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [advanceTo]);

  // ── THE DROP ───────────────────────────────────────────────────────────────
  // Tapping a lesson that is not the one you are standing at moves the figure
  // there by dropping in from above, rather than by walking. That is the honest
  // signal: a walk is earned and takes seven seconds, a jump is navigation.
  const dropTo = useCallback((i: number) => {
    const m = markers[i];
    if (!m || busy) return;
    setBusy(true);
    camX.value = withTiming(camFor(m.x), { duration: DROP_MS * 0.6, easing: Easing.inOut(Easing.quad) });
    figX.value = withTiming(m.x, { duration: DROP_MS * 0.6, easing: Easing.inOut(Easing.quad) });
    figLift.value = withSequence(
      withTiming(150, { duration: DROP_MS * 0.42, easing: Easing.out(Easing.quad) }),
      withTiming(0, { duration: DROP_MS * 0.58, easing: Easing.bounce }, (ok) => {
        'worklet';
        if (ok) runOnJS(settle)(i, undefined);
      }),
    );
  }, [markers, busy, camFor]);

  const tapLesson = useCallback((i: number) => {
    const l = lessons[i];
    if (!l || busy) return;
    if (i !== at) { dropTo(i); return; }   // move there first
    if (l.accessible) onOpen(l);
  }, [lessons, busy, at, dropTo, onOpen]);

  // The figure. Walks when the gait is up, breathes otherwise — the same rig the
  // lessons use, so the feet plant instead of sliding.
  const D = useDerivedValue<Bundle>(() => {
    const s = gait.value > 0
      ? strideMode(wFrom.value, wTo.value, stand(clock.value), wp.value, mode.value)
      : stand(clock.value);
    return pose(s, 0, groundAt(figX.value), FIG_K, 1, 1);
  });
  useDerivedValue(() => {
    if (gait.value > 0) figX.value = wFrom.value + (wTo.value - wFrom.value) * wp.value;
  });
  // The leap: a half-sine centred on the obstacle, added to whatever the drop is
  // doing. Zero everywhere else, so a span with nothing to clear never lifts.
  const airborne = useDerivedValue(() => {
    if (gait.value === 0 || jumpAt.value < 0) return 0;
    const d = Math.abs(wp.value - jumpAt.value);
    const span = 0.16;
    if (d > span) return 0;
    return Math.sin((1 - d / span) * Math.PI * 0.5) * jumpH.value;
  });
  const figStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: figX.value - camX.value },
      { translateY: -figLift.value - airborne.value },
    ],
  }));

  return (
    <View style={{ height: H, backgroundColor: SKY, overflow: 'hidden' }}>
      <Moon width={width} />
      <Depth depth={0} camX={camX} k={LAYERS[0].k} tone={LAYERS[0].tone} unitStarts={unitStarts} />
      <Depth depth={1} camX={camX} k={LAYERS[1].k} tone={LAYERS[1].tone} unitStarts={unitStarts} />
      <Depth depth={2} camX={camX} k={LAYERS[2].k} tone={LAYERS[2].tone} unitStarts={unitStarts} />
      <GroundBand camX={camX} width={width} />

      {/* THE FIGURE, drawn BEFORE the markers so it stands behind their names. */}
      <Animated.View style={[styles.figWrap, figStyle]} pointerEvents="none">
        <Stickman D={D} k={FIG_K} />
      </Animated.View>

      <MarkerLayer
        camX={camX}
        markers={markers}
        lessons={lessons}
        at={at}
        onTap={tapLesson}
        width={width}
      />
    </View>
  );
}

/** High, far, and fixed — the moon does not ride the camera. */
function Moon({ width }: { width: number }) {
  return (
    <View
      style={{
        position: 'absolute', left: width * MOON.x, top: H * MOON.y,
        width: MOON.r * 2, height: MOON.r * 2, borderRadius: MOON.r,
        backgroundColor: '#FFFFFF', opacity: 0.85,
      }}
      pointerEvents="none"
    />
  );
}

/**
 * One depth of silhouette. The props are generated for a WIDE span around the
 * camera and the whole layer is translated, so nothing is recomputed per frame —
 * the same lesson the ridge steps taught: static geometry, one moving parent.
 */
function Depth({ depth, camX, k, tone, unitStarts }: {
  depth: number; camX: SharedValue<number>; k: number; tone: string; unitStarts: number[];
}) {
  const props = useMemo(() => sceneProps(-800, 14000, depth, unitStarts), [depth, unitStarts]);
  const st = useAnimatedStyle(() => ({ transform: [{ translateX: -camX.value * k }] }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, st]} pointerEvents="none">
      {props.map((p, i) => <PropShape key={i} p={p} tone={tone} />)}
    </Animated.View>
  );
}

/** Flat silhouettes. No detail — the reference art has almost none either. */
function PropShape({ p, tone }: { p: Prop; tone: string }) {
  const foot = p.y;
  if (p.kind === 'peak') {
    return (
      <View style={{
        position: 'absolute', left: p.x - p.h, top: foot - p.h * 0.8,
        width: 0, height: 0, borderLeftWidth: p.h, borderRightWidth: p.h,
        borderBottomWidth: p.h * 0.8, borderLeftColor: 'transparent',
        borderRightColor: 'transparent', borderBottomColor: tone,
      }} />
    );
  }
  if (p.kind === 'pine') {
    return (
      <View style={{
        position: 'absolute', left: p.x - p.h * 0.28, top: foot - p.h,
        width: 0, height: 0, borderLeftWidth: p.h * 0.28, borderRightWidth: p.h * 0.28,
        borderBottomWidth: p.h, borderLeftColor: 'transparent',
        borderRightColor: 'transparent', borderBottomColor: tone,
      }} />
    );
  }
  if (p.kind === 'rock') {
    return (
      <View style={{
        position: 'absolute', left: p.x - p.h * 0.5, top: foot - p.h * 0.42,
        width: p.h, height: p.h * 0.42, borderTopLeftRadius: p.h * 0.5,
        borderTopRightRadius: p.h * 0.42, backgroundColor: tone,
      }} />
    );
  }
  // a broadleaf: a trunk and one heavy round crown, which is all a silhouette needs
  return (
    <View style={{ position: 'absolute', left: p.x - p.h * 0.42, top: foot - p.h, width: p.h * 0.84, height: p.h }}>
      <View style={{
        position: 'absolute', left: p.h * 0.36, top: p.h * 0.42,
        width: p.h * 0.11, height: p.h * 0.58, backgroundColor: tone,
      }} />
      <View style={{
        position: 'absolute', left: 0, top: 0,
        width: p.h * 0.84, height: p.h * 0.6, borderRadius: p.h * 0.42, backgroundColor: tone,
      }} />
    </View>
  );
}

/** The ground the figure and the markers stand on. */
function GroundBand({ camX, width }: { camX: SharedValue<number>; width: number }) {
  // 40, not 20. The ground is one static View per step across 14k units, and at 20
  // that is 640 of them for a curve gentle enough that nobody can see the join.
  const STEP = 40;
  const steps = useMemo(() => {
    const n = Math.ceil(12800 / STEP);
    return Array.from({ length: n }, (_, i) => {
      const y = groundAt(i * STEP - 800);
      return { left: i * STEP - 800, top: y, height: H - y + 40 };
    });
  }, []);
  const st = useAnimatedStyle(() => ({ transform: [{ translateX: -camX.value }] }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, st]} pointerEvents="none">
      {steps.map((s, i) => (
        <View key={i} style={{ position: 'absolute', left: s.left, top: s.top, width: STEP + 1, height: s.height, backgroundColor: INK }} />
      ))}
    </Animated.View>
  );
}

/**
 * The lesson signs. Named, and shaped like something you press.
 *
 * A bare dot said nothing about what it was or that it could be tapped. Each one
 * is now a card carrying the lesson's name on a post — the one you are standing
 * at is solid ink with a START caption, the ones you have finished are outlined,
 * and the locked ones are faint. Tapping any other one moves you there; tapping
 * the one you are at opens it.
 */
function MarkerLayer({ camX, markers, lessons, at, onTap, width }: {
  camX: SharedValue<number>; markers: Marker[]; lessons: WorldLesson[];
  at: number; onTap: (i: number) => void; width: number;
}) {
  const st = useAnimatedStyle(() => ({ transform: [{ translateX: -camX.value }] }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, st]}>
      {markers.map((m, i) => {
        const l = lessons[i];
        if (!l) return null;
        const here = i === at;
        const tone = !l.accessible ? FAINT : INK;
        return (
          <Pressable
            key={m.lessonId}
            onPress={() => onTap(i)}
            style={{ position: 'absolute', left: m.x - 74, top: m.y - 132, width: 148, alignItems: 'center' }}
          >
            <View style={[
              styles.card,
              here && styles.cardHere,
              !l.accessible && styles.cardLocked,
              l.done && !here && styles.cardDone,
            ]}>
              <Text numberOfLines={2} style={[styles.cardText, here && { color: PAPER }, !l.accessible && { color: SOFT }]}>
                {l.title}
              </Text>
              {here && l.accessible ? <Text style={styles.start}>TAP TO START</Text> : null}
            </View>
            <View style={{ width: 2.5, height: 30, backgroundColor: tone }} />
            <View style={[styles.foot, { borderColor: tone }, l.done && { backgroundColor: tone }]} />
          </Pressable>
        );
      })}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  figWrap: { position: 'absolute', left: 0, top: 0 },
  card: {
    maxWidth: 148, paddingHorizontal: 10, paddingVertical: 7,
    borderWidth: 2, borderColor: INK, borderRadius: 6, backgroundColor: PAPER,
  },
  cardHere: { backgroundColor: INK, borderColor: INK, paddingBottom: 5 },
  cardDone: { backgroundColor: PAPER, borderColor: INK },
  cardLocked: { borderColor: FAINT, backgroundColor: '#F6F4EE' },
  cardText: {
    fontFamily: 'PlayfairDisplay_700Bold', fontSize: 12, lineHeight: 15,
    color: INK, textAlign: 'center', includeFontPadding: false,
  },
  start: {
    fontFamily: 'Inter_700Bold', fontSize: 7.5, letterSpacing: 1.1,
    color: '#C9C5BA', textAlign: 'center', marginTop: 3, includeFontPadding: false,
  },
  foot: { width: 14, height: 14, borderRadius: 7, borderWidth: 2.5, backgroundColor: PAPER, marginTop: -1 },
});
