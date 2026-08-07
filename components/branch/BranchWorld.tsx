import { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet, useWindowDimensions } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, useDerivedValue, useFrameCallback,
  withTiming, withSequence, runOnJS, Easing, type SharedValue,
} from 'react-native-reanimated';
import Svg, { Path as SvgPath } from 'react-native-svg';
import Stickman from '@/components/lesson/cinematic/Stickman';
import { pose, stand, type Bundle } from '@/components/lesson/cinematic/rig';
import { strideMode } from '@/components/lesson/cinematic/moves';
import {
  layout, groundAt, groundArt, chunkLeft, gaitForSpan, jumpForSpan,
  LEAD, WALK_SECONDS, SPAN, CHUNK, CHUNK_W, GROUND_TOP, SIGN_DX,
  type Marker,
} from './worldPath';
import { sceneLayers, DISC, SCENE_NAMES, TILE_W, type LayerArt } from './sceneArt';

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
// ── THE FIGURE STANDS TO THE LEFT OF THE SIGN ───────────────────────────────
//
// Not on it. The sign is `SIGN_DX` to the right of the marker the figure stands
// at, which is reading order — you, then where you are going — and it means the
// lesson's name is never behind a person.
//
// ── ONLY WHAT IS ON SCREEN IS MOUNTED ───────────────────────────────────────
//
// This is the rule that makes the screen usable, and it was learned by breaking
// it three ways at once. The first version mounted the WHOLE branch: 320 static
// Views for the ground, 32 signs, and five backdrop layers each drawn into an
// <Svg> two phones wide and the full height of the strip — all of it under a
// transform that changes every frame. §17 rule 6 already had the number for that
// (a moving full-screen <Svg> is worth about ten frames a second on an S24) and
// this was five of them.
//
// So: the ground is drawn in CHUNKS and three are mounted; the signs are windowed
// to the five around the camera; each backdrop layer is a BAND only as tall as
// its own art, in two tiles so the off-screen one is culled. What re-mounts any
// of that is a single derived value that fires only when one of three INTEGERS
// changes — about twice per seven-second walk, instead of sixty times a second.
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

/** What is mounted right now: which ground chunk, which sign, which place. */
interface Viewport { c: number; m: number; s: number }

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

  // ── WHAT IS MOUNTED ────────────────────────────────────────────────────────
  // One derived value for all three windows, and it only crosses to the JS thread
  // when an integer actually changes. The previous version called runOnJS on every
  // single frame of every animation to re-check the scene name.
  const [vp, setVp] = useState<Viewport>(() => {
    const cam = (markers[current]?.x ?? SPAN) - width * LEAD;
    return { c: Math.floor(cam / CHUNK), m: Math.floor(cam / SPAN), s: 0 };
  });
  const vKey = useSharedValue('');
  useDerivedValue(() => {
    const cam = camX.value;
    const c = Math.floor(cam / CHUNK);
    const m = Math.floor(cam / SPAN);
    let s = 0;
    for (let i = 0; i < unitStarts.length; i++) if (cam + 120 >= unitStarts[i]) s = i;
    const key = `${c}.${m}.${s}`;
    if (key !== vKey.value) {
      vKey.value = key;
      runOnJS(setVp)({ c, m, s });
    }
  });

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
    // FROM THE LESSON JUST FINISHED, not from `at` — which has already moved to
    // the next one by the time this screen rebuilds. Reading it here is why the
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
      <SceneBack camX={camX} scene={vp.s} width={width} />
      <GroundBand camX={camX} chunk={vp.c} />

      {/* THE FIGURE, drawn BEFORE the signs so it can never cover a lesson's name. */}
      <Animated.View style={[styles.figWrap, figStyle]} pointerEvents="none">
        <Stickman D={D} k={FIG_K} />
      </Animated.View>

      <MarkerLayer camX={camX} markers={markers} lessons={lessons} at={at} m={vp.m} onTap={tapLesson} />
    </View>
  );
}

/**
 * THE BACKDROP — the drawn scenes from sceneArt.ts, one per unit.
 *
 * Each layer is an inert <Path> inside an <Svg> under an ANIMATED PARENT: the
 * surface rasterises once and the parent translates it. Two tiles, offset by the
 * camera modulo the tile width, which is what makes it repeat without a seam —
 * and they are two SEPARATE <Svg> children rather than one twice as wide, so the
 * one that is off screen is culled instead of drawn.
 */
function SceneBack({ camX, scene, width }: {
  camX: SharedValue<number>; scene: number; width: number;
}) {
  const name = SCENE_NAMES[scene % SCENE_NAMES.length];
  const layers = useMemo(() => sceneLayers(name), [name]);
  const disc = DISC[name] ?? DISC['the hills'];
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={{
        position: 'absolute', left: width * disc.x - disc.r, top: H * disc.y - disc.r,
        width: disc.r * 2, height: disc.r * 2, borderRadius: disc.r, backgroundColor: '#FFFFFF', opacity: 0.92,
      }} />
      {layers.map((l, i) => (
        <SceneStrip key={name + i} camX={camX} layer={l} />
      ))}
    </View>
  );
}

function SceneStrip({ camX, layer }: { camX: SharedValue<number>; layer: LayerArt }) {
  const { d, tone, k, top, h } = layer;
  const st = useAnimatedStyle(() => {
    const t = camX.value * k;
    // A positive modulo, so a camera left of zero cannot push the tiles off the
    // right-hand side and leave bare sky behind them.
    return { transform: [{ translateX: -(((t % TILE_W) + TILE_W) % TILE_W) }] };
  });
  const box = `0 ${top} ${TILE_W} ${h}`;
  return (
    <Animated.View
      style={[{ position: 'absolute', left: 0, top, width: TILE_W * 2, height: h }, st]}
      pointerEvents="none"
    >
      <Svg style={{ position: 'absolute', left: 0, top: 0 }} width={TILE_W} height={h} viewBox={box}>
        <SvgPath d={d} fill={tone} />
      </Svg>
      <Svg style={{ position: 'absolute', left: TILE_W, top: 0 }} width={TILE_W} height={h} viewBox={box}>
        <SvgPath d={d} fill={tone} />
      </Svg>
    </Animated.View>
  );
}

/**
 * THE GROUND the figure and the signs stand on — one smooth filled curve, with
 * tufts, stones and low bushes growing out of it in the same ink.
 *
 * It was 320 static Views, one per 40 units, which is a staircase however gentle
 * the curve behind it: every step had a flat top and a visible corner. Three
 * chunks of path draw the same hill, smoothly, for a hundredth of the views.
 */
function GroundBand({ camX, chunk }: { camX: SharedValue<number>; chunk: number }) {
  const chunks = useMemo(
    () => [chunk - 1, chunk, chunk + 1].map((c) => ({ c, d: groundArt(c) })),
    [chunk],
  );
  const st = useAnimatedStyle(() => ({ transform: [{ translateX: -camX.value }] }));
  const h = H - GROUND_TOP;
  return (
    <Animated.View style={[StyleSheet.absoluteFill, st]} pointerEvents="none">
      {chunks.map(({ c, d }) => (
        <Svg
          key={c}
          style={{ position: 'absolute', left: chunkLeft(c), top: GROUND_TOP }}
          width={CHUNK_W}
          height={h}
          viewBox={`0 ${GROUND_TOP} ${CHUNK_W} ${h}`}
        >
          <SvgPath d={d} fill={INK} />
        </Svg>
      ))}
    </Animated.View>
  );
}

/**
 * The lesson signs. Named, and shaped like something you press.
 *
 * A bare dot said nothing about what it was or that it could be tapped. Each one
 * is a card carrying the lesson's name on a post — the one you are standing at is
 * solid ink with a START caption, the ones you have finished are outlined, and
 * the locked ones are faint. Tapping any other one moves you there; tapping the
 * one you are at opens it.
 *
 * Only the five around the camera are mounted. That is not only cheaper, it is
 * complete: a sign you cannot see is a sign you cannot press.
 */
function MarkerLayer({ camX, markers, lessons, at, m, onTap }: {
  camX: SharedValue<number>; markers: Marker[]; lessons: WorldLesson[];
  at: number; m: number; onTap: (i: number) => void;
}) {
  const st = useAnimatedStyle(() => ({ transform: [{ translateX: -camX.value }] }));
  const lo = Math.max(0, m - 1);
  const hi = Math.min(markers.length - 1, m + 3);
  const shown: Marker[] = [];
  for (let i = lo; i <= hi; i++) if (markers[i]) shown.push(markers[i]);
  return (
    <Animated.View style={[StyleSheet.absoluteFill, st]}>
      {shown.map((mk) => {
        const i = mk.i;
        const l = lessons[i];
        if (!l) return null;
        const here = i === at;
        const tone = !l.accessible ? FAINT : INK;
        // The sign stands to the RIGHT of where the figure stands, on its own
        // patch of ground — so its foot is planted at ITS x, not the figure's.
        const sx = mk.x + SIGN_DX;
        const sy = groundAt(sx);
        return (
          <Pressable
            key={mk.lessonId}
            onPress={() => onTap(i)}
            style={{ position: 'absolute', left: sx - 74, top: sy - 132, width: 148, alignItems: 'center' }}
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
