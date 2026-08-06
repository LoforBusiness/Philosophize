import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet, useWindowDimensions } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, useAnimatedRef, useAnimatedScrollHandler,
  useDerivedValue, useFrameCallback, withTiming, scrollTo, runOnJS, Easing,
  type SharedValue,
} from 'react-native-reanimated';
import Stickman from '@/components/lesson/cinematic/Stickman';
import { pose, travelStance, stand, WALK, type Bundle } from '@/components/lesson/cinematic/rig';
import {
  layout, groundAt, LAYERS, LEAD, SPAN, WALK_SECONDS, WALK_SPEED, BASE_Y, type Marker,
} from './worldPath';

// ─────────────────────────────────────────────────────────────────────────────
// A BRANCH IS A PLACE YOU WALK THROUGH.
//
// It was a vertical list of dots joined by a rule — accurate, scannable, and with
// nothing in it that made you want to take the next step. This is the same 32
// lessons laid end to end on the ground, with the reader's figure standing at the
// last one they finished and walking to the next when they earn it.
//
// ── ONE CAMERA, TWO DRIVERS, NEVER BOTH ─────────────────────────────────────
//
// `camX` is the only thing that decides what is on screen. It is driven either by
// the native scroll (browsing) or by a timed walk — and the walk turns scrolling
// OFF while it runs. Two things writing one camera is how a scroll fights an
// animation and the world judders; making it impossible is cheaper than tuning it.
//
// The ScrollView is doing the browsing rather than a pan gesture because it brings
// momentum, bounds and fling for nothing, and `scrollTo` in a worklet is what lets
// the walk drive the same surface.
//
// ── DEPTH IS PARALLAX AND TONE, NEVER HUE (§19) ─────────────────────────────
//
// The layers ride `camX` at different rates (worldPath.LAYERS). They sit OUTSIDE
// the scroll content, as siblings behind it, so they can move at their own speed
// while the markers move at exactly the ground's.
//
// The markers are INSIDE the scroll content at their world x, so hit-testing is
// native and a tap lands where the finger is — a marker positioned by a transform
// would need its touch target moved in step, which is a bug waiting to happen.
// ─────────────────────────────────────────────────────────────────────────────

const INK = '#1A1A1A';
const SOFT = '#6B6B6B';
const FAINT = '#C9C5BA';
const PAPER = '#FAFAF7';
const SKY = '#F1EEE7';

/** The figure's height in stage units — the same 103 the cinematic lessons use. */
const FIG_K = 0.62;
const H = 340;                     // the world strip's height on screen

export interface WorldLesson {
  id: string;
  title: string;
  unitId: string;
  unitSlug: string;
  unitTitle: string;
  done: boolean;
  accessible: boolean;
}

export default function BranchWorld({
  lessons, current, onOpen, advanceTo,
}: {
  /** Every lesson in the branch, in teaching order. */
  lessons: WorldLesson[];
  /** Index the figure stands at. */
  current: number;
  onOpen: (l: WorldLesson) => void;
  /** Set to an index to play the 5-second walk to it, then call back. */
  advanceTo?: { to: number; done: () => void } | null;
}) {
  const { width } = useWindowDimensions();
  const markers = useMemo(() => layout(lessons.map((l) => ({ id: l.id, unitId: l.unitId }))), [lessons]);
  const worldW = markers.length ? markers[markers.length - 1].x + SPAN : SPAN;

  const aref = useAnimatedRef<Animated.ScrollView>();
  const camX = useSharedValue(0);
  const figX = useSharedValue(markers[current]?.x ?? SPAN);
  const wFrom = useSharedValue(markers[current]?.x ?? SPAN);
  const wTo = useSharedValue(markers[current]?.x ?? SPAN);
  const wp = useSharedValue(1);          // 0->1 through the traverse
  const gait = useSharedValue(0);          // 0 standing … 1 walking
  const clock = useSharedValue(0);
  const [walking, setWalking] = useState(false);

  useFrameCallback((f) => {
    'worklet';
    clock.value += Math.min(0.05, (f.timeSincePreviousFrame ?? 16) / 1000);
  }, true);

  // Browsing writes the camera…
  const onScroll = useAnimatedScrollHandler({
    onScroll: (e) => { if (gait.value === 0) camX.value = e.contentOffset.x; },
  });
  // …and the walk writes it instead, mirroring into the scroll surface so the two
  // can never disagree about where the world is.
  useDerivedValue(() => {
    if (gait.value > 0) scrollTo(aref, camX.value, 0, false);
  });

  const finish = useCallback((cb?: () => void) => {
    setWalking(false);
    cb?.();
  }, []);

  useEffect(() => {
    if (!advanceTo) return;
    const target = markers[advanceTo.to];
    if (!target) { advanceTo.done(); return; }
    setWalking(true);
    gait.value = 1;
    const camTarget = Math.max(0, Math.min(worldW - width, target.x - width * LEAD));
    const ms = WALK_SECONDS * 1000;
    const cb = advanceTo.done;
    wFrom.value = figX.value;
    wTo.value = target.x;
    wp.value = 0;
    wp.value = withTiming(1, { duration: ms, easing: Easing.inOut(Easing.quad) });
    camX.value = withTiming(camTarget, { duration: ms, easing: Easing.inOut(Easing.quad) }, (ok) => {
      'worklet';
      gait.value = 0;
      if (ok) runOnJS(finish)(cb);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [advanceTo]);

  // Jump to a unit — instant, because surveying is not the earned part.
  const jumpTo = useCallback((i: number) => {
    const m = markers[i];
    if (!m || walking) return;
    const x = Math.max(0, Math.min(worldW - width, m.x - width * LEAD));
    aref.current?.scrollTo({ x, animated: true });
  }, [markers, width, worldW, walking, aref]);

  // Start the reader looking at where they are.
  useEffect(() => {
    const m = markers[current];
    if (!m) return;
    const x = Math.max(0, Math.min(worldW - width, m.x - width * LEAD));
    camX.value = x;
    figX.value = m.x;
    requestAnimationFrame(() => aref.current?.scrollTo({ x, animated: false }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markers.length]);

  // The figure: walks when gait is up, breathes when it is not. `travelStance`
  // is the same one the lessons use, so the feet plant on the ground rather than
  // sliding — and the gait is cycled on DISTANCE, which is what keeps it true at
  // any speed the camera happens to be moving.
  const D = useDerivedValue<Bundle>(() => {
    const s = gait.value > 0
      ? travelStance(wFrom.value, wTo.value, stand(clock.value), stand(clock.value), stand(clock.value), wp.value, WALK)
      : stand(clock.value);
    return pose(s, 0, groundAt(figX.value), FIG_K, 1, 1);
  });
  useDerivedValue(() => {
    if (gait.value > 0) figX.value = wFrom.value + (wTo.value - wFrom.value) * wp.value;
  });
  const figStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: figX.value - camX.value }],
  }));

  const units = useMemo(
    () => markers.filter((m) => m.unitStart).map((m) => ({ i: m.i, title: lessons[m.i]?.unitTitle ?? '' })),
    [markers, lessons],
  );

  return (
    <View style={{ height: H, backgroundColor: SKY }}>
      {/* PARALLAX, behind everything and outside the scroll content. */}
      {LAYERS.slice(0, 3).map((L, k) => (
        <Ridge key={k} camX={camX} k={L.k} tone={L.tone} lift={54 - k * 16} worldW={worldW} />
      ))}

      <Animated.ScrollView
        ref={aref}
        horizontal
        scrollEnabled={!walking}
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ width: worldW }}
        style={StyleSheet.absoluteFill}
      >
        {/* the ground the markers stand on */}
        <Ground width={worldW} />
        {markers.map((m, i) => (
          <MarkerPost
            key={m.lessonId}
            m={m}
            l={lessons[i]}
            isCurrent={i === current}
            onPress={() => !walking && lessons[i].accessible && onOpen(lessons[i])}
          />
        ))}
      </Animated.ScrollView>

      {/* THE FIGURE rides above the scroll surface, positioned from the same camX,
          so it is never a frame behind the world it is standing on. */}
      <Animated.View style={[styles.figWrap, figStyle]} pointerEvents="none">
        <Stickman D={D} k={FIG_K} />
      </Animated.View>

      {/* THE UNIT BAR — surveying, which is instant. The walk is the earned part;
          crossing four units to look at something is not. */}
      <View style={styles.bar} pointerEvents="box-none">
        {units.map((u) => (
          <Pressable key={u.i} onPress={() => jumpTo(u.i)} style={styles.barItem} hitSlop={6}>
            <Text numberOfLines={1} style={styles.barText}>{u.title.toUpperCase()}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

/** One parallax ridge: a stepped silhouette sampled from the same ground curve. */
function Ridge({ camX, k, tone, lift, worldW }: {
  camX: SharedValue<number>; k: number; tone: string; lift: number; worldW: number;
}) {
  // ONE animated style for the whole layer. The first version gave every step its
  // own useAnimatedStyle and recomputed its height each frame — ninety animated
  // styles across three ridges, all to draw a shape that only ever slides
  // sideways. The steps are static; the layer moves.
  const STEP = 18;
  const steps = useMemo(() => {
    const n = Math.ceil((worldW * k + 900) / STEP);
    return Array.from({ length: n }, (_, i) => {
      const y = groundAt((i * STEP) / Math.max(0.05, k)) - lift;
      return { left: i * STEP, top: y, height: Math.max(2, H - y) };
    });
  }, [worldW, k, lift]);
  const st = useAnimatedStyle(() => ({ transform: [{ translateX: -camX.value * k }] }));
  return (
    <Animated.View style={[styles.ridge, st]} pointerEvents="none">
      {steps.map((s, i) => (
        <View key={i} style={{ position: 'absolute', left: s.left, top: s.top, width: STEP + 1, height: s.height, backgroundColor: tone }} />
      ))}
    </Animated.View>
  );
}

/** The ground line the markers stand on, sampled across the whole world. */
function Ground({ width }: { width: number }) {
  const STEP = 16;
  const n = Math.ceil(width / STEP);
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {Array.from({ length: n }, (_, i) => {
        const y = groundAt(i * STEP);
        return <View key={i} style={{ position: 'absolute', left: i * STEP, top: y, width: STEP + 1, height: H - y, backgroundColor: INK }} />;
      })}
    </View>
  );
}

/**
 * A lesson, standing on the ground.
 *
 * DONE is a filled cairn, CURRENT is an open ring with its title showing, LOCKED
 * is the same post in faint grey — the same three states the dots carried, said
 * in a way that survives being one of thirty-two in a landscape.
 */
function MarkerPost({ m, l, isCurrent, onPress }: {
  m: Marker; l: WorldLesson; isCurrent: boolean; onPress: () => void;
}) {
  const tone = !l.accessible ? FAINT : INK;
  return (
    <Pressable
      onPress={onPress}
      disabled={!l.accessible}
      style={{ position: 'absolute', left: m.x - 60, top: m.y - 120, width: 120, height: 130, alignItems: 'center', justifyContent: 'flex-end' }}
    >
      {isCurrent || l.done ? (
        <Text numberOfLines={2} style={[styles.title, !l.accessible && { color: FAINT }]}>{l.title}</Text>
      ) : null}
      <View style={[styles.head, { borderColor: tone }, l.done && { backgroundColor: tone }, isCurrent && styles.headNow]} />
      <View style={{ width: 3, height: 34, backgroundColor: tone }} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  ridge: { position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 },
  figWrap: { position: 'absolute', left: 0, top: 0 },
  title: {
    fontFamily: 'PlayfairDisplay_700Bold', fontSize: 12, lineHeight: 15, color: INK,
    textAlign: 'center', marginBottom: 6, includeFontPadding: false,
  },
  head: { width: 18, height: 18, borderRadius: 9, borderWidth: 2.5, backgroundColor: PAPER },
  headNow: { width: 24, height: 24, borderRadius: 12, borderWidth: 3 },
  bar: {
    position: 'absolute', left: 0, right: 0, top: 0, flexDirection: 'row',
    paddingHorizontal: 8, paddingTop: 8, gap: 6,
  },
  barItem: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, backgroundColor: '#FAFAF7CC' },
  barText: { fontFamily: 'Inter_700Bold', fontSize: 8.5, letterSpacing: 0.8, color: SOFT, includeFontPadding: false },
});
