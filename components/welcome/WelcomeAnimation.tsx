import { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Line, Path, G, Rect, Defs, LinearGradient, Stop } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useFrameCallback,
  useDerivedValue,
  useAnimatedProps,
  useAnimatedStyle,
  useAnimatedReaction,
  runOnJS,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { useUserDataStore } from '@/stores/userDataStore';
import { clamp01, lerp, easeOutCubic, easeOutBack, INK, PAPER, SOFT } from './ease';
import {
  BEATS,
  BEAT_T,
  CHAPTERS,
  T_FADE,
  T_BEGIN,
  T_HOLD,
  STAGE_W,
  STAGE_H,
  LEN,
  STR,
  GB,
  BUB,
  PEL,
  CHEST,
  HEAD0,
  SH_L,
  SH_R,
  HIP_L,
  HIP_R,
  FOOT_L,
  FOOT_R,
  beatIdxAt,
  speechEnv,
  swayAt,
  ik,
  handTargets,
  tailTip,
  type Beat,
  type Chapter,
} from './rig';
import GrowthChart from './charts/GrowthChart';
import TreeChart from './charts/TreeChart';
import LessonChart from './charts/LessonChart';

// ─────────────────────────────────────────────────────────────────────────────
// First-launch welcome. A featureless black stickman "host" on paper talks
// through a speech bubble — the tail tracks his head as he sways, and the words
// appear one at a time at his speaking pace — while he points at hand-drawn
// charts on a board to his left. Then everything dissolves to the wordmark and
// a Begin button. Plays ONCE and holds on the end card; Skip is always there.
//
// Design stage is a fixed 400×800 (the approved preview's coordinate space),
// scaled to fit the device — letterbox is paper, so it never reads as bars.
//
// See ease.ts for the ONE rule this screen obeys about animated props.
// ─────────────────────────────────────────────────────────────────────────────

const DEG = 180 / Math.PI;

const AG = Animated.createAnimatedComponent(G);

/**
 * DEV-ONLY. `?t=13.2` on the web build pins the timeline to one instant so a
 * frame can be screenshotted and checked. This exists because a 33-second
 * animation is otherwise unverifiable — the previous welcome shipped with
 * frozen arms precisely because nobody could see a still of it. Inert on
 * native (no window.location) and stripped from release bundles by __DEV__.
 */
const FREEZE_T =
  __DEV__ && typeof window !== 'undefined' && window.location
    ? parseFloat(new URLSearchParams(window.location.search).get('t') ?? '')
    : NaN;

// ── static tail path ─────────────────────────────────────────────────────────
// Drawn ONCE in a local frame: root at the origin, tip straight down at
// tailLen0. The component only ever translates / rotates / scaleY's it onto the
// line between the bubble and his head — its `d` never changes.
// The root is lifted 4px INTO the bubble so the bubble's own bottom border is
// covered where they meet and the two read as one shape.
const TW = BUB.tailW;
const TL = BUB.tailLen0;
const TAIL_FILL_D =
  `M${-TW} ${-4} L${TW} ${-4} ` +
  `Q${TW * 0.75} ${TL * 0.52} 0 ${TL} ` + // right side, out to the tip
  `Q${-TW * 0.15} ${TL * 0.46} ${-TW} ${-4} Z`; // and back, hooked
// Only the two SIDES get stroked — never the root, or a line would cut across it.
const TAIL_EDGE_D =
  `M${TW} ${-4} Q${TW * 0.75} ${TL * 0.52} 0 ${TL} ` +
  `Q${-TW * 0.15} ${TL * 0.46} ${-TW} ${-4}`;

interface Props {
  /**
   * The launch screen covers the whole boot (~4s) and this screen mounts
   * underneath it. Hold the timeline at 0 until it has actually lifted,
   * otherwise the opening lines play to a screen nobody can see.
   */
  start?: boolean;
  onDone?: () => void;
}

export default function WelcomeAnimation({ start = true, onDone }: Props) {
  const { width: W, height: H } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const setHasSeenWelcome = useUserDataStore((s) => s.setHasSeenWelcome);

  const scale = Math.min(W / STAGE_W, H / STAGE_H);
  const offX = (W - STAGE_W * scale) / 2;
  const offY = (H - STAGE_H * scale) / 2;

  const clock = useSharedValue(0);
  const started = useSharedValue(start ? 1 : 0);
  useEffect(() => {
    if (!isNaN(FREEZE_T)) return; // DEBUG: a pinned clock must not be restarted
    started.value = start ? 1 : 0;
  }, [start]);

  // DEBUG: ?t=12.4 pins the timeline to one instant so it can be screenshotted.
  useEffect(() => {
    if (isNaN(FREEZE_T)) return;
    // Settle the smoothed hands by simulating forward, exactly as the runtime
    // would have — otherwise a frozen frame shows hands still at their t=0 seats.
    let lx = 0;
    let ly = 0;
    let rx = 0;
    let ry = 0;
    let init = false;
    const k = 1 - Math.exp(-8.5 / 60);
    for (let t = 0; t <= FREEZE_T; t += 1 / 60) {
      const tg = handTargets(t);
      if (!init) {
        lx = tg.lx;
        ly = tg.ly;
        rx = tg.rx;
        ry = tg.ry;
        init = true;
      } else {
        lx = lerp(lx, tg.lx, k);
        ly = lerp(ly, tg.ly, k);
        rx = lerp(rx, tg.rx, k);
        ry = lerp(ry, tg.ry, k);
      }
    }
    hLx.value = lx;
    hLy.value = ly;
    hRx.value = rx;
    hRy.value = ry;
    handInit.value = 1;
    started.value = 0;
    clock.value = FREEZE_T;
    const idx = beatIdxAt(FREEZE_T);
    if (idx >= 0) setBeatIdx(idx);
    // the latch lives in the frame callback, which a pinned clock never reaches
    if (FREEZE_T >= T_BEGIN) setEndReady(true);
  }, []);

  // Persistent, exponentially-chased hand state. The targets can jump hard when
  // a line or a board changes; the hand itself can only ever glide there.
  const hLx = useSharedValue(0);
  const hLy = useSharedValue(0);
  const hRx = useSharedValue(0);
  const hRy = useSharedValue(0);
  const handInit = useSharedValue(0);

  // Bubble box, measured once per beat (its width is content-driven) and chased
  // so it inflates rather than snapping when he reaches a second line.
  const bubW = useSharedValue(200);
  const bubH = useSharedValue(BUB.lh + 2 * BUB.padY);
  const bubHTarget = useSharedValue(BUB.lh + 2 * BUB.padY);
  const lineOf = useSharedValue<number[]>([]);

  const endLatched = useSharedValue(0);
  const [endReady, setEndReady] = useState(false);
  const leaving = useSharedValue(0);

  const [beatIdx, setBeatIdx] = useState(0);
  const beat = BEATS[beatIdx] ?? BEATS[0];

  useFrameCallback((f) => {
    'worklet';
    if (!started.value) return;
    let dt = (f.timeSincePreviousFrame ?? 16) / 1000;
    if (dt > 0.05) dt = 0.05; // a slow mount or a backgrounded app must not fast-forward
    let nt = clock.value + dt;
    if (nt >= T_HOLD) nt = T_HOLD; // play ONCE, then freeze on the end card
    clock.value = nt;

    const tgt = handTargets(nt);
    if (!handInit.value) {
      hLx.value = tgt.lx;
      hLy.value = tgt.ly;
      hRx.value = tgt.rx;
      hRy.value = tgt.ry;
      handInit.value = 1;
    } else {
      const k = 1 - Math.exp(-8.5 * dt); // ~120ms time constant
      hLx.value = lerp(hLx.value, tgt.lx, k);
      hLy.value = lerp(hLy.value, tgt.ly, k);
      hRx.value = lerp(hRx.value, tgt.rx, k);
      hRy.value = lerp(hRy.value, tgt.ry, k);
    }

    // bubble height chases the number of lines he has actually reached
    const kb = 1 - Math.exp(-11 * dt);
    bubH.value = lerp(bubH.value, bubHTarget.value, kb);

    if (nt >= T_BEGIN && !endLatched.value) {
      endLatched.value = 1;
      runOnJS(setEndReady)(true);
    }
  });

  // Which beat is on screen — drives the words (JS side); ~13 renders in 30s.
  useAnimatedReaction(
    () => beatIdxAt(clock.value),
    (cur, prev) => {
      if (cur !== prev && cur >= 0) runOnJS(setBeatIdx)(cur);
    }
  );

  // How many lines of the current beat he has reached → the bubble's target
  // height. lineOf is filled in by the words' onLayout (see Words below).
  useAnimatedReaction(
    () => {
      const idx = beatIdxAt(clock.value);
      if (idx < 0) return 1;
      const lines = lineOf.value;
      if (!lines.length) return 1;
      const age = clock.value - BEAT_T[idx][0];
      const s0 = 0.14;
      const s1 = s0 + BEAT_T[idx][1];
      let n = 1;
      for (let i = 0; i < lines.length; i++) {
        const at = s0 + (s1 - s0) * (i / Math.max(1, lines.length));
        if (age >= at && lines[i] + 1 > n) n = lines[i] + 1;
      }
      return n;
    },
    (n) => {
      bubHTarget.value = n * BUB.lh + 2 * BUB.padY;
      // Nothing is chasing it while the clock is held, so snap instead of
      // sitting at a stale height (this is also what makes ?t= frames honest).
      if (!started.value) bubH.value = bubHTarget.value;
    }
  );

  const rootOpacity = useSharedValue(1);
  const rootStyle = useAnimatedStyle(() => ({ opacity: rootOpacity.value }));

  // Flipping hasSeenWelcome unmounts this screen, so it must be the LAST thing
  // that happens — index.tsx swaps in the auth panel the moment it goes true.
  const finish = useCallback(() => {
    setHasSeenWelcome(true);
    onDone?.();
  }, [setHasSeenWelcome, onDone]);

  // Begin/Skip dissolve this screen first, so the hand-off to the auth panel is
  // a fade rather than a cut. `leaving` guards a double-tap from starting two
  // fades (and calling finish twice).
  const leave = useCallback(() => {
    if (leaving.value) return;
    leaving.value = 1;
    rootOpacity.value = withTiming(0, { duration: 380 }, (done) => {
      'worklet';
      if (done) runOnJS(finish)();
    });
  }, [finish]);

  // ── per-frame figure state ─────────────────────────────────────────────────
  const D = useDerivedValue(() => {
    const t = clock.value;
    const env = speechEnv(t);
    const sway = swayAt(t);
    const headTilt =
      0.05 * Math.sin(t * 0.9 + 2.0) +
      0.02 * Math.sin(t * 2.3) +
      0.022 * env * Math.sin(t * 4.6 + 0.8);
    const headBob = 2.2 * env * (0.5 + 0.5 * Math.sin(t * 9.1)); // tiny talking bob

    // arms: IK from the smoothed hands back to the (swayed) shoulders
    const shLx = SH_L.x + sway;
    const shRx = SH_R.x + sway;
    const elL = ik(shLx, SH_L.y, hLx.value, hLy.value, LEN.uarm, LEN.farm, -1);
    const elR = ik(shRx, SH_R.y, hRx.value, hRy.value, LEN.uarm, LEN.farm, +1);

    const bone = (ax: number, ay: number, bx: number, by: number) => {
      'worklet';
      return [
        { translateX: ax },
        { translateY: ay },
        { rotate: `${Math.atan2(by - ay, bx - ax) * DEG}deg` },
        { scaleX: Math.hypot(bx - ax, by - ay) },
      ];
    };

    const fade = 1 - easeOutCubic(clamp01((t - T_FADE) / 1.2));

    return {
      figure: [{ translateX: sway }],
      // rotate the head about the chest, with the bob applied first
      head: [
        { translateX: CHEST.x },
        { translateY: CHEST.y },
        { rotate: `${-headTilt * DEG}deg` },
        { translateX: -CHEST.x },
        { translateY: -CHEST.y },
        { translateY: headBob },
      ],
      upL: bone(shLx, SH_L.y, elL.x, elL.y),
      foL: bone(elL.x, elL.y, hLx.value, hLy.value),
      upR: bone(shRx, SH_R.y, elR.x, elR.y),
      foR: bone(elR.x, elR.y, hRx.value, hRy.value),
      elLp: [{ translateX: elL.x }, { translateY: elL.y }],
      elRp: [{ translateX: elR.x }, { translateY: elR.y }],
      haLp: [{ translateX: hLx.value }, { translateY: hLy.value }],
      haRp: [{ translateX: hRx.value }, { translateY: hRy.value }],
      fade,
    };
  });

  const figProps = useAnimatedProps(() => ({ transform: D.value.figure, opacity: D.value.fade }));
  const headProps = useAnimatedProps(() => ({ transform: D.value.head }));
  const armsProps = useAnimatedProps(() => ({ opacity: D.value.fade }));
  const upLProps = useAnimatedProps(() => ({ transform: D.value.upL }));
  const foLProps = useAnimatedProps(() => ({ transform: D.value.foL }));
  const upRProps = useAnimatedProps(() => ({ transform: D.value.upR }));
  const foRProps = useAnimatedProps(() => ({ transform: D.value.foR }));
  const elLProps = useAnimatedProps(() => ({ transform: D.value.elLp }));
  const elRProps = useAnimatedProps(() => ({ transform: D.value.elRp }));
  const haLProps = useAnimatedProps(() => ({ transform: D.value.haLp }));
  const haRProps = useAnimatedProps(() => ({ transform: D.value.haRp }));

  // ── the tail: static shape, transformed onto the line to his head ──────────
  const tailXf = useDerivedValue(() => {
    const t = clock.value;
    const sway = swayAt(t);
    const env = speechEnv(t);
    const headTilt =
      0.05 * Math.sin(t * 0.9 + 2.0) +
      0.02 * Math.sin(t * 2.3) +
      0.022 * env * Math.sin(t * 4.6 + 0.8);
    const headBob = 2.2 * env * (0.5 + 0.5 * Math.sin(t * 9.1));
    const L = LEN.head - headBob;
    const headX = CHEST.x + sway - Math.sin(headTilt) * L;
    const headY = CHEST.y - Math.cos(headTilt) * L;

    const half = bubW.value / 2;
    const left = BUB.cx - half;
    const right = BUB.cx + half;
    const tbx = Math.max(
      left + BUB.radius + TW + 4,
      Math.min(right - BUB.radius - TW - 4, headX - 6)
    );
    const tip = tailTip(t, headX, headY, tbx);
    const dx = tip.x - tbx;
    const dy = tip.y - BUB.bottom;
    const len = Math.max(8, Math.hypot(dx, dy));
    return [
      { translateX: tbx },
      { translateY: BUB.bottom },
      { rotate: `${Math.atan2(-dx, dy) * DEG}deg` },
      { scaleY: len / TL },
    ];
  });
  const tailProps = useAnimatedProps(() => ({
    transform: tailXf.value,
    opacity: D.value.fade,
  }));

  const bubbleStyle = useAnimatedStyle(() => ({
    height: bubH.value,
    opacity: easeOutCubic(clamp01(clock.value / 0.6)) * D.value.fade,
  }));

  const onWordLines = useCallback((lines: number[]) => {
    lineOf.value = lines;
  }, []);
  const onBubbleW = useCallback((w: number) => {
    bubW.value = w;
  }, []);

  return (
    <Animated.View style={[styles.root, rootStyle]}>
      {/* everything lives in the 400×800 design stage, scaled to the device */}
      <Svg width={W} height={H} viewBox={`0 0 ${STAGE_W} ${STAGE_H}`} preserveAspectRatio="xMidYMid meet">
        <Defs>
          <LinearGradient id="wa-paper" x1="0" y1="0" x2="0" y2={STAGE_H} gradientUnits="userSpaceOnUse">
            <Stop offset="0" stopColor="#efece4" />
            <Stop offset="0.62" stopColor="#f7f4ee" />
            <Stop offset="1" stopColor="#e6e2d8" />
          </LinearGradient>
        </Defs>
        <Rect x={0} y={0} width={STAGE_W} height={STAGE_H} fill="url(#wa-paper)" />

        {/* the board — one chapter per hand-drawn chart */}
        {CHAPTERS.map((c) => (
          <Board key={c.visual} chapter={c} clock={clock} />
        ))}

        {/* the host. Legs are dead straight and never move, so they're static
            geometry; only sway/tilt/bob and the arms are animated. */}
        <AG animatedProps={figProps}>
          <Line
            x1={HIP_L.x}
            y1={HIP_L.y}
            x2={FOOT_L.x}
            y2={FOOT_L.y}
            stroke={INK}
            strokeWidth={STR.limb}
            strokeLinecap="round"
          />
          <Line
            x1={HIP_R.x}
            y1={HIP_R.y}
            x2={FOOT_R.x}
            y2={FOOT_R.y}
            stroke={INK}
            strokeWidth={STR.limb}
            strokeLinecap="round"
          />
          <Line
            x1={PEL.x}
            y1={PEL.y}
            x2={CHEST.x}
            y2={CHEST.y}
            stroke={INK}
            strokeWidth={STR.torso}
            strokeLinecap="round"
          />
          {/* welded pelvis — without this the torso's bottom shows through */}
          <Circle cx={PEL.x} cy={PEL.y} r={STR.torso / 2 + 1} fill={INK} />
          <Circle cx={SH_L.x} cy={SH_L.y} r={STR.limb / 2} fill={INK} />
          <Circle cx={SH_R.x} cy={SH_R.y} r={STR.limb / 2} fill={INK} />
          <AG animatedProps={headProps}>
            {/* no face — he reads as talking from the bubble, the word-by-word
                reveal and the speech bob, not from a mouth */}
            <Circle cx={HEAD0.x} cy={HEAD0.y} r={STR.headR} fill={INK} />
          </AG>
        </AG>

        {/* Arms sit OUTSIDE the swayed group: the pointing hand aims at the
            board's real position, so it isn't a rigid offset from the body.
            Each bone is a unit line stretched with scaleX and rotated onto its
            joint vector — butt caps, so the non-uniform scale can't distort the
            stroke width; the joint circles round it back off. */}
        <AG animatedProps={armsProps}>
          <AG animatedProps={upLProps}>
            <Line x1={0} y1={0} x2={1} y2={0} stroke={INK} strokeWidth={STR.limb} strokeLinecap="butt" />
          </AG>
          <AG animatedProps={foLProps}>
            <Line x1={0} y1={0} x2={1} y2={0} stroke={INK} strokeWidth={STR.limb} strokeLinecap="butt" />
          </AG>
          <AG animatedProps={upRProps}>
            <Line x1={0} y1={0} x2={1} y2={0} stroke={INK} strokeWidth={STR.limb} strokeLinecap="butt" />
          </AG>
          <AG animatedProps={foRProps}>
            <Line x1={0} y1={0} x2={1} y2={0} stroke={INK} strokeWidth={STR.limb} strokeLinecap="butt" />
          </AG>
          <AG animatedProps={elLProps}>
            <Circle cx={0} cy={0} r={STR.limb / 2} fill={INK} />
          </AG>
          <AG animatedProps={elRProps}>
            <Circle cx={0} cy={0} r={STR.limb / 2} fill={INK} />
          </AG>
          <AG animatedProps={haLProps}>
            <Circle cx={0} cy={0} r={STR.limb / 2} fill={INK} />
          </AG>
          <AG animatedProps={haRProps}>
            <Circle cx={0} cy={0} r={STR.limb / 2} fill={INK} />
          </AG>
        </AG>

      </Svg>

      {/* Text layer, in the same 400×800 space, scaled to match the SVG. */}
      <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
        <View
          pointerEvents="box-none"
          style={{
            position: 'absolute',
            left: offX,
            top: offY,
            width: STAGE_W,
            height: STAGE_H,
            transform: [{ scale }],
            transformOrigin: 'top left',
          }}
        >
          <View pointerEvents="none" style={styles.bubbleRow}>
            <Animated.View style={[styles.bubble, bubbleStyle]} onLayout={(e) => onBubbleW(e.nativeEvent.layout.width)}>
              <Words key={beatIdx} beat={beat} clock={clock} onLines={onWordLines} />
            </Animated.View>
          </View>

        </View>
      </View>

      {/* The tail gets its OWN layer, above the bubble: the bubble is a View, so
          a tail drawn in the scene SVG would sit under it and the bubble's bottom
          border would cut straight across the tail's root. Up here the tail's own
          fill covers that border and the two read as one shape. */}
      <Svg
        pointerEvents="none"
        style={StyleSheet.absoluteFill}
        width={W}
        height={H}
        viewBox={`0 0 ${STAGE_W} ${STAGE_H}`}
        preserveAspectRatio="xMidYMid meet"
      >
        <AG animatedProps={tailProps}>
          <Path d={TAIL_FILL_D} fill="#fdfbf6" />
          <Path
            d={TAIL_EDGE_D}
            fill="none"
            stroke={INK}
            strokeWidth={2.2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path d={TAIL_EDGE_D} fill="none" stroke={INK} strokeWidth={1.0} strokeOpacity={0.4} />
        </AG>
      </Svg>

      {/* End card last, so it lands over everything as they dissolve. */}
      <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
        <View
          pointerEvents="box-none"
          style={{
            position: 'absolute',
            left: offX,
            top: offY,
            width: STAGE_W,
            height: STAGE_H,
            transform: [{ scale }],
            transformOrigin: 'top left',
          }}
        >
          <EndCard clock={clock} endReady={endReady} onBegin={leave} />
        </View>
      </View>

      {/* Skip — device space, clear of the notch, available the whole time */}
      <Pressable onPress={leave} hitSlop={14} style={[styles.skip, { top: insets.top + 10, right: 16 }]}>
        <Text style={styles.skipText}>Skip</Text>
      </Pressable>
    </Animated.View>
  );
}

// ── board ────────────────────────────────────────────────────────────────────
// One chart per chapter. `p` is the chart's own 0→1 draw-on progress; the chart
// itself owns every path's (static) geometry.
function Board({ chapter, clock }: { chapter: Chapter; clock: SharedValue<number> }) {
  const p = useDerivedValue(() => clamp01((clock.value - chapter.t0 - 0.25) / 3.3));
  const props = useAnimatedProps(() => {
    const t = clock.value;
    const inA = easeOutCubic(clamp01((t - chapter.t0 + 0.35) / 0.5));
    const outA = 1 - easeOutCubic(clamp01((t - chapter.t1) / 0.3));
    const fade = 1 - easeOutCubic(clamp01((t - T_FADE) / 1.2));
    return { opacity: clamp01(inA * outA) * fade };
  });
  return (
    <AG animatedProps={props}>
      <G transform={`translate(${GB.x}, ${GB.y}) scale(${GB.w / 300})`}>
        {chapter.visual === 'lesson' ? (
          <LessonChart p={p} />
        ) : chapter.visual === 'growth' ? (
          <GrowthChart p={p} />
        ) : (
          <TreeChart p={p} />
        )}
      </G>
    </AG>
  );
}

// ── words ────────────────────────────────────────────────────────────────────
// Every word of the line is laid out from the start (so the line's centring
// never shifts as he speaks) but each fades in only when he reaches it. The
// bubble is height-clipped to the lines he has actually got to, which is what
// keeps a dead band from sitting under a half-finished line.
function Words({
  beat,
  clock,
  onLines,
}: {
  beat: Beat;
  clock: SharedValue<number>;
  onLines: (lines: number[]) => void;
}) {
  const ys = useRef<Array<number | undefined>>([]);
  const idx = BEATS.indexOf(beat);

  const report = useCallback(
    (i: number, y: number) => {
      ys.current[i] = y;
      let filled = 0;
      for (let k = 0; k < beat.words.length; k++) if (ys.current[k] !== undefined) filled++;
      if (filled === beat.words.length) {
        const base = Math.min(...(ys.current.filter((v) => v !== undefined) as number[]));
        onLines(ys.current.map((y) => Math.round(((y as number) - base) / BUB.lh)));
      }
    },
    [beat, onLines]
  );

  return (
    <View style={styles.words}>
      {beat.words.map((w, i) => (
        <Word
          key={`${idx}-${i}`}
          text={w}
          i={i}
          n={beat.words.length}
          t0={beat.t}
          speak={beat.speak}
          last={idx >= BEATS.length - 1}
          nextT={idx + 1 < BEATS.length ? BEATS[idx + 1].t : T_FADE}
          clock={clock}
          onMeasure={report}
        />
      ))}
    </View>
  );
}

function Word({
  text,
  i,
  n,
  t0,
  speak,
  nextT,
  last,
  clock,
  onMeasure,
}: {
  text: string;
  i: number;
  n: number;
  t0: number;
  speak: number;
  nextT: number;
  last: boolean;
  clock: SharedValue<number>;
  onMeasure: (i: number, y: number) => void;
}) {
  const style = useAnimatedStyle(() => {
    const age = clock.value - t0;
    const s0 = 0.14;
    const s1 = s0 + speak;
    const at = s0 + (s1 - s0) * (i / Math.max(1, n));
    const a = easeOutCubic(clamp01((age - at) / 0.16));
    // hand the words off to the next line — except on the last one, where they
    // must dissolve with the bubble or a blank balloon lingers on screen
    const out = last ? 1 : 1 - easeOutCubic(clamp01((clock.value - (nextT - 0.3)) / 0.3));
    return { opacity: a * out, transform: [{ translateY: (1 - a) * 3 }] };
  });
  return (
    <Animated.Text style={[styles.word, style]} onLayout={(e) => onMeasure(i, e.nativeEvent.layout.y)}>
      {text}
    </Animated.Text>
  );
}

// ── end card ─────────────────────────────────────────────────────────────────
function EndCard({
  clock,
  endReady,
  onBegin,
}: {
  clock: SharedValue<number>;
  endReady: boolean;
  onBegin: () => void;
}) {
  const word = useAnimatedStyle(() => {
    const r = easeOutCubic(clamp01((clock.value - T_BEGIN) / 0.6));
    return { opacity: r, transform: [{ translateY: 14 * (1 - r) }] };
  });
  const begin = useAnimatedStyle(() => {
    const a = easeOutCubic(clamp01((clock.value - T_BEGIN) / 0.6));
    const s = 0.94 + 0.06 * easeOutBack(clamp01((clock.value - T_BEGIN) / 0.6));
    return { opacity: a, transform: [{ scale: s }] };
  });
  return (
    <View pointerEvents="box-none" style={styles.endCard}>
      <Animated.Text style={[styles.lockWord, word]}>Philosophize</Animated.Text>
      <Animated.View style={begin}>
        <Pressable
          onPress={onBegin}
          disabled={!endReady}
          hitSlop={16}
          style={({ pressed }) => [styles.beginBtn, pressed && { opacity: 0.7 }]}
        >
          <Text style={styles.beginText}>Begin</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: PAPER, overflow: 'hidden' },

  skip: { position: 'absolute', paddingHorizontal: 14, paddingVertical: 8 },
  skipText: { fontFamily: 'Inter_500Medium', fontSize: 14, letterSpacing: 1, color: SOFT },

  // Bottom-anchored: the bubble grows UPWARD as he reaches a second line, so the
  // tail root stays pinned at a constant y and never drifts off his head.
  bubbleRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: BUB.bottom,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bubble: {
    maxWidth: BUB.maxTextW + 2 * BUB.padX,
    paddingHorizontal: BUB.padX,
    paddingVertical: BUB.padY,
    backgroundColor: '#fdfbf6',
    borderWidth: 2.2,
    borderColor: INK,
    borderRadius: BUB.radius,
    overflow: 'hidden',
  },
  words: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', flexShrink: 0 },
  word: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 27,
    lineHeight: BUB.lh,
    color: INK,
    // symmetric, so the trailing gap can't push the centred line off-axis
    marginHorizontal: 3.5,
  },

  endCard: { position: 'absolute', left: 0, right: 0, top: 330, alignItems: 'center' },
  lockWord: { fontFamily: 'PlayfairDisplay_700Bold_Italic', fontSize: 46, color: INK, lineHeight: 58 },
  beginBtn: {
    marginTop: 38,
    backgroundColor: INK,
    borderRadius: 25,
    paddingVertical: 14,
    paddingHorizontal: 44,
  },
  beginText: { fontFamily: 'Inter_500Medium', fontSize: 17, color: PAPER },
});
