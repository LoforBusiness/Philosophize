import { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet, useWindowDimensions } from 'react-native';
import { useFocusEffect } from 'expo-router';
import Animated, {
  useSharedValue, useAnimatedStyle, useDerivedValue, useFrameCallback,
  withTiming, withDelay, runOnJS, Easing, type SharedValue,
} from 'react-native-reanimated';
import Svg, { Path as SvgPath } from 'react-native-svg';
import Stickman from '@/components/lesson/cinematic/Stickman';
import { pose, type Bundle } from '@/components/lesson/cinematic/rig';
import {
  layout, groundAt, groundArt, chunkLeft, gaitForSpan, jumpForSpan, travelEase,
  LEAD, WALK_SECONDS, SPAN, CHUNK, CHUNK_W, GROUND_TOP, SIGN_DX,
  type Marker,
} from './worldPath';
import { figureAt, hopAt, hopMs, hopTravel } from './walkFigure';
import { sceneLayers, discFor, skyFor, placeFromUnitId, TILE_W, type LayerArt } from './sceneArt';

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
//   · the HOP — tapping any other lesson leaps the figure across to it
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
/** The body of the ground, under its ink turf. See worldPath's drawing header. */
const EARTH = '#635D51';

const FIG_K = 0.62;
const H = 360;
/** How long the figure stands before setting off after a finished lesson. Long
 *  enough for the screen behind it to finish arriving; short enough to read as a
 *  breath rather than a stall. */
const WALK_LEAD_IN = 520;
/** A sign's box: two lines of title, the caption, the post and the foot. The
 *  stack is bottom-aligned inside it, so the foot always meets the ground. */
const SIGN_H = 106;

export interface WorldLesson {
  id: string; title: string;
  unitId: string; unitSlug: string; unitTitle: string;
  done: boolean; accessible: boolean;
}

/** What is mounted right now: which ground chunk, which sign, which place. */
interface Viewport { c: number; m: number; s: number }

export default function BranchWorld({
  lessons, current, onOpen, advanceTo, place = '',
}: {
  lessons: WorldLesson[];
  current: number;
  onOpen: (l: WorldLesson) => void;
  advanceTo?: { from: number; to: number; done: () => void } | null;
  /**
   * Branch slug — which of the six places this road runs through (sceneArt).
   *
   * OPTIONAL, and it is not merely tolerated — omitting it is CORRECT. Unit ids
   * are branch-prefixed, so `placeFromUnitId` reads the country off the lessons
   * themselves and the road is right whether or not anybody threads a prop down
   * to it. A prop that must be remembered is a prop that will one day be
   * forgotten, and forgetting this one would put the same scenery behind all six
   * branches without erroring anywhere.
   */
  place?: string;
}) {
  const { width } = useWindowDimensions();
  // Told, or worked out from the lessons themselves. See the prop's note.
  const where = place || placeFromUnitId(lessons[0]?.unitId ?? '');
  const markers = useMemo(
    () => layout(lessons.map((l) => ({ id: l.id, unitId: l.unitId }))),
    [lessons],
  );

  // Where each unit begins, in world x — what tells the scenery which place it is in.
  const unitStarts = useMemo(() => markers.filter((m) => m.unitStart).map((m) => m.x), [markers]);

  const camX = useSharedValue(0);
  const figX = useSharedValue(0);
  const wFrom = useSharedValue(0);
  const wTo = useSharedValue(0);
  const wp = useSharedValue(1);
  const gait = useSharedValue(0);
  const mode = useSharedValue(0);        // how this span is travelled (moves.gaitFor)
  const jumpH = useSharedValue(0);       // the arc over an obstacle, in stage units
  const jumpAt = useSharedValue(-1);
  // The hop: tapping a lesson you are not standing at. One clock, 0→1, linear —
  // `hopAt` does the phasing, so gather, flight and absorb cannot drift apart.
  const hopP = useSharedValue(0);
  const hopping = useSharedValue(0);
  const hopFrom = useSharedValue(0);
  const hopDist = useSharedValue(0);
  const clock = useSharedValue(0);
  const [at, setAt] = useState(current);
  const [busy, setBusy] = useState(false);

  // STOPPED WHEN THIS SCREEN IS NOT THE ONE YOU ARE LOOKING AT.
  //
  // This clock is not a counter. It feeds `D` below, which runs figureAt() and
  // pose() — the full skeleton solve, the same rig the lessons use — and commits
  // it to every bone of the figure. Every frame.
  //
  // And opening a lesson does not unmount this screen. The branches stack is a
  // plain <Stack>, nothing calls enableFreeze or freezeOnBlur, so pushing a lesson
  // leaves the whole world mounted and animating UNDERNEATH it. The reader sees a
  // cinematic lesson; the UI thread is solving two figures, one of which is behind
  // an opaque screen for the entire lesson.
  //
  // This is the third time this exact defect has been found in this app — see the
  // identical notes on StickmanStroll's frame callback and HomeHeader's drift.
  // Both were guarded; this one, the heaviest of the three, shipped without it.
  const frame = useFrameCallback((f) => {
    'worklet';
    clock.value += Math.min(0.05, (f.timeSincePreviousFrame ?? 16) / 1000);
  }, false);

  const [focused, setFocused] = useState(false);
  useFocusEffect(
    useCallback(() => {
      setFocused(true);
      return () => setFocused(false);
    }, [])
  );
  useEffect(() => {
    // Pauses rather than resets: the clock stops where it was, so coming back
    // continues the breath instead of snapping the figure to a fresh pose.
    frame.setActive(focused);
    return () => frame.setActive(false);
  }, [focused, frame]);

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
    hopping.value = 0;
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
    hopping.value = 0;
    mode.value = gaitForSpan(advanceTo.to);
    // Aimed at whatever is lying in THIS span — the same `obstacleAt` the ground
    // is drawn from, so he only ever leaves the ground at something that is there.
    const jump = jumpForSpan(advanceTo.from);
    jumpAt.value = jump ? jump.at : -1;
    jumpH.value = jump ? jump.h : 0;
    const ms = WALK_SECONDS * 1000;
    const cb = advanceTo.done;
    const to = advanceTo.to;
    // ── A BEAT BEFORE IT SETS OFF ──────────────────────────────────────────────
    //
    // Arriving on this screen mounts a photograph, a world and a list of lessons.
    // A seven-second animation beginning in the middle of that spends its opening
    // stuttering — which is the whole of the lag: the walk was smooth, the mount
    // was not, and they were happening on the same frames.
    //
    // The delay is on the ANIMATIONS, not on arming the walk, so the figure is
    // standing in the right place from the first frame. And it buys the shot its
    // establishing beat: someone already in motion when a screen appears reads as
    // gone, while someone who stands and then leaves reads as leaving.
    // ONE animation drives the traverse. `figX` follows `wp`, and the camera
    // follows `figX` — so there is a single clock for the body, the feet and the
    // ground, and nothing to drift.
    //
    // ── AND IT TRAVELS AT ONE SPEED ────────────────────────────────────────────
    //
    // `travelEase` replaces `Easing.inOut(Easing.quad)`, which is the whole of
    // "he gets faster and faster": a quadratic ease-in-out peaks at TWICE the
    // average speed, so this seven-second walk spent three and a half seconds
    // accelerating to 92 units a second and three and a half braking, with the
    // stride cadence dutifully doubling along with it. The trapezoid gets him up
    // to speed in seven-tenths of a second and then holds it — eleven per cent of
    // variation across the whole span, against a hundred. See worldPath.
    wp.value = withDelay(WALK_LEAD_IN, withTiming(1, { duration: ms, easing: travelEase }, (ok) => {
      'worklet';
      gait.value = 0;
      if (ok) runOnJS(settle)(to, cb);
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [advanceTo]);

  // ── THE HOP ────────────────────────────────────────────────────────────────
  // Tapping a lesson that is not the one you are standing at moves the figure
  // there by leaping, rather than by walking. That is the honest signal: a walk
  // is earned and takes seven seconds, a jump is navigation.
  //
  // ONE LINEAR CLOCK, and every part of the leap is derived from it inside
  // `hopAt` / `hopTravel`. The version this replaces ran two animations at once —
  // a horizontal `inOut(quad)` and a vertical `withSequence` ending on
  // `Easing.bounce` — over a figure that was still in its STANDING pose, because
  // nothing told the rig a jump was happening. So he slid sideways 150 units in
  // the air, three and a half times his own height, with his knees straight, and
  // then bounced twice on landing like a dropped ball.
  const hopTo = useCallback((i: number) => {
    const m = markers[i];
    if (!m || busy) return;
    setBusy(true);
    const dist = m.x - figX.value;
    hopFrom.value = figX.value;
    hopDist.value = dist;
    hopping.value = 1;
    hopP.value = 0;
    hopP.value = withTiming(1, { duration: hopMs(dist), easing: Easing.linear }, (ok) => {
      'worklet';
      hopping.value = 0;
      if (ok) runOnJS(settle)(i, undefined);
    });
  }, [markers, busy, settle]);

  const tapLesson = useCallback((i: number) => {
    const l = lessons[i];
    if (!l || busy) return;
    if (i !== at) { hopTo(i); return; }   // move there first
    if (l.accessible) onOpen(l);
  }, [lessons, busy, at, hopTo, onOpen]);

  // The figure. Walks when the gait is up, breathes otherwise — the same rig the
  // lessons use, so the feet plant instead of sliding.
  // `wp > 0` as well as the gait, and that is what makes the lead-in a STAND
  // rather than a freeze. A stride pose held at zero progress is a figure stopped
  // mid-step with one foot in the air; falling through to `stand` means it waits
  // there breathing, and takes its first step the instant the traverse begins.
  const D = useDerivedValue<Bundle>(() => {
    const walking = gait.value > 0;
    const f = hopping.value > 0
      ? hopAt(hopP.value, hopDist.value, clock.value, FIG_K)
      : figureAt(
        walking ? wFrom.value : figX.value,
        walking ? wTo.value : figX.value,
        walking ? wp.value : 0,
        clock.value,
        mode.value,
        walking ? jumpAt.value : -1,
        jumpH.value,
        FIG_K,
      );
    // The lift goes in through the GROUND LINE, not as a second transform on the
    // wrapper. One route off the floor, whether it is a hop or a hurdled log.
    return pose(f.stance, 0, groundAt(figX.value) - f.lift, FIG_K, 1, 1);
  });
  useDerivedValue(() => {
    if (gait.value > 0) figX.value = wFrom.value + (wTo.value - wFrom.value) * wp.value;
    else if (hopping.value > 0) figX.value = hopFrom.value + hopDist.value * hopTravel(hopP.value);
  });
  // THE CAMERA IS THE BODY, less the lead. Not a second animation that happens to
  // carry the same duration and easing — that is two clocks agreeing by luck, and
  // any frame they disagree on is a frame where the ground slides under planted
  // feet. Derived, they cannot disagree at all.
  useDerivedValue(() => {
    camX.value = figX.value - width * LEAD;
  });
  const figStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: figX.value - camX.value }],
  }));

  return (
    // THE SKY IS THE PLACE'S OWN. Cloud only reads against something darker than
    // it is, and every one of the reference pictures is cream cloud on a grey
    // ground — so a single near-white sky for all six was quietly forbidding the
    // one shape they all have in common.
    <View style={{ height: H, backgroundColor: skyFor(where), overflow: 'hidden' }}>
      <SceneBack camX={camX} place={where} unit={vp.s} width={width} />
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
function SceneBack({ camX, place, unit, width }: {
  camX: SharedValue<number>; place: string; unit: number; width: number;
}) {
  const layers = useMemo(() => sceneLayers(place, unit), [place, unit]);
  const disc = useMemo(() => discFor(place, unit), [place, unit]);
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {disc ? (
        <View style={{
          position: 'absolute', left: width * disc.x - disc.r, top: H * disc.y - disc.r,
          width: disc.r * 2, height: disc.r * 2, borderRadius: disc.r,
          backgroundColor: disc.tone, opacity: disc.opacity,
        }} />
      ) : null}
      {layers.map((l, i) => (
        <SceneStrip key={place + unit + '.' + i} camX={camX} layer={l} />
      ))}
    </View>
  );
}

function SceneStrip({ camX, layer }: { camX: SharedValue<number>; layer: LayerArt }) {
  const { d, tone, k, top, h, under, underTone } = layer;
  const st = useAnimatedStyle(() => {
    const t = camX.value * k;
    // A positive modulo, so a camera left of zero cannot push the tiles off the
    // right-hand side and leave bare sky behind them.
    return { transform: [{ translateX: -(((t % TILE_W) + TILE_W) % TILE_W) }] };
  });
  const box = `0 ${top} ${TILE_W} ${h}`;
  // `under` is the shaded face of the same mass, drawn first and in the SAME
  // surface — one <Svg>, two <Path>s. A second layer would be a second thing to
  // rasterise and a second thing to keep in register with this one.
  const tile = (left: number) => (
    <Svg key={left} style={{ position: 'absolute', left, top: 0 }} width={TILE_W} height={h} viewBox={box}>
      {under ? <SvgPath d={under} fill={underTone} /> : null}
      <SvgPath d={d} fill={tone} />
    </Svg>
  );
  return (
    <Animated.View
      style={[{ position: 'absolute', left: 0, top, width: TILE_W * 2, height: h }, st]}
      pointerEvents="none"
    >
      {tile(0)}
      {tile(TILE_W)}
    </Animated.View>
  );
}

/**
 * THE GROUND the figure and the signs stand on — level, with a hard ink turf line
 * along the top and grass, stones, bushes and the odd fallen log growing out of it.
 *
 * TWO FILLS, drawn back to front in one surface: the earth, then everything in
 * ink on top of it. A single flat black slab under a black figure read as a
 * shadow he was standing on; cutting a lit turf line away from a darker body is
 * what every one of the reference engravings does where ground meets sky.
 */
function GroundBand({ camX, chunk }: { camX: SharedValue<number>; chunk: number }) {
  const chunks = useMemo(
    () => [chunk - 1, chunk, chunk + 1].map((c) => ({ c, art: groundArt(c) })),
    [chunk],
  );
  const st = useAnimatedStyle(() => ({ transform: [{ translateX: -camX.value }] }));
  const h = H - GROUND_TOP;
  return (
    <Animated.View style={[StyleSheet.absoluteFill, st]} pointerEvents="none">
      {chunks.map(({ c, art }) => (
        <Svg
          key={c}
          style={{ position: 'absolute', left: chunkLeft(c), top: GROUND_TOP }}
          width={CHUNK_W}
          height={h}
          viewBox={`0 ${GROUND_TOP} ${CHUNK_W} ${h}`}
        >
          <SvgPath d={art.earth} fill={EARTH} />
          <SvgPath d={art.ink} fill={INK} />
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
            // ANCHORED AT ITS FOOT, not at its top. Positioned from the top, a
            // sign's height decided where it stood: a one-line title made a
            // shorter stack, so the post ended in mid-air 48 units above the
            // ground with nothing holding it up (rule A1). Stacking from the
            // bottom of a fixed box means the foot lands on the ground line
            // whatever the title does above it.
            style={{
              position: 'absolute', left: sx - 74, top: sy - SIGN_H + 5,
              width: 148, height: SIGN_H, alignItems: 'center', justifyContent: 'flex-end',
            }}
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
