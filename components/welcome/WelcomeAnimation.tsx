import { useCallback, useEffect, useRef, useState, memo } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Rect, G, Defs, LinearGradient, Stop } from 'react-native-svg';
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
// RENDERING NOTE — why the figure is native Views, not SVG:
// react-native-svg 15 has no partial invalidation: any animated child re-renders
// and re-uploads the WHOLE <Svg> surface to a GPU bitmap every frame. With the
// figure drawn in a full-screen <Svg>, that was ~10fps on an S24 Ultra (100%
// janky frames, all "slow bitmap uploads", GPU otherwise idle). So the figure is
// now plain RN Views driven by Reanimated transforms — those composite on the GPU
// with NO per-frame rasterization. The maths in rig.ts is reused verbatim, so
// every position, angle and timing is identical to the SVG version; only the draw
// primitive changed (a butt-capped bone is a 1×STR.limb ink View stretched by
// scaleX; a joint/head is a borderRadius View; a round-capped leg is a stadium
// View). What stays in SVG — the paper gradient (static, drawn once), the charts
// (only the on-screen chapter is mounted, in a board-sized surface) and the tail
// (a bounded surface a fraction of the screen) — no longer re-rasters the full
// screen every frame.
//
// Design stage is a fixed 400×800 (the approved preview's coordinate space),
// scaled to fit the device — letterbox is paper, so it never reads as bars.
// ─────────────────────────────────────────────────────────────────────────────

const DEG = 180 / Math.PI;

const AG = Animated.createAnimatedComponent(G);

// Bounded stage sub-regions (400×800 space) for the surfaces that DO stay in SVG,
// so each re-rasters a fraction of the screen instead of the whole thing.
// BOARD_BOX covers every chart's extent (GB + margin); TAIL_BOX covers the band
// the tail can ever reach (bubble bottom down past his swaying head).
const BOARD_BOX = { x: 8, y: 384, w: 244, h: 132 };
const TAIL_BOX = { x: 30, y: 356, w: 340, h: 188 };

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

// ── static figure geometry, as View styles (rig coords, no sway) ──────────────
// The body wrapper applies sway; these never move relative to it.
function limbStyle(ax: number, ay: number, bx: number, by: number, s: number): ViewStyle {
  // A round-capped line A→B: a stadium of width L+s (caps extend s/2 past each
  // end, exactly like strokeLinecap="round"), height s, centred on the midpoint.
  const L = Math.hypot(bx - ax, by - ay);
  const mx = (ax + bx) / 2;
  const my = (ay + by) / 2;
  const ang = Math.atan2(by - ay, bx - ax) * DEG;
  return {
    position: 'absolute',
    left: mx - (L + s) / 2,
    top: my - s / 2,
    width: L + s,
    height: s,
    borderRadius: s / 2,
    backgroundColor: INK,
    transform: [{ rotate: `${ang}deg` }],
  };
}
function dotStyle(cx: number, cy: number, r: number): ViewStyle {
  return {
    position: 'absolute',
    left: cx - r,
    top: cy - r,
    width: 2 * r,
    height: 2 * r,
    borderRadius: r,
    backgroundColor: INK,
  };
}

const LEG_L_STYLE = limbStyle(HIP_L.x, HIP_L.y, FOOT_L.x, FOOT_L.y, STR.limb);
const LEG_R_STYLE = limbStyle(HIP_R.x, HIP_R.y, FOOT_R.x, FOOT_R.y, STR.limb);
const TORSO_STYLE = limbStyle(PEL.x, PEL.y, CHEST.x, CHEST.y, STR.torso);
const PELVIS_STYLE = dotStyle(PEL.x, PEL.y, STR.torso / 2 + 1); // welded pelvis
const SH_L_STYLE = dotStyle(SH_L.x, SH_L.y, STR.limb / 2);
const SH_R_STYLE = dotStyle(SH_R.x, SH_R.y, STR.limb / 2);

// Animated bases, anchored so a Reanimated transform lands them exactly where the
// SVG version did. Head/joints are circles centred on the origin (translate moves
// the centre). A bone is a unit-length butt-capped bar whose LEFT-centre is the
// origin (transformOrigin 0% 50%), so [translate, rotate, scaleX(len)] — the very
// array the SVG <G> used — stretches it from the start joint along the bone.
const HEAD_BASE: ViewStyle = {
  position: 'absolute',
  left: -STR.headR,
  top: -STR.headR,
  width: 2 * STR.headR,
  height: 2 * STR.headR,
  borderRadius: STR.headR,
  backgroundColor: INK,
};
const JOINT_BASE: ViewStyle = {
  position: 'absolute',
  left: -STR.limb / 2,
  top: -STR.limb / 2,
  width: STR.limb,
  height: STR.limb,
  borderRadius: STR.limb / 2,
  backgroundColor: INK,
};
const BONE_BASE: ViewStyle = {
  position: 'absolute',
  left: 0,
  top: -STR.limb / 2,
  width: 1,
  height: STR.limb,
  backgroundColor: INK,
  transformOrigin: '0% 50%',
};

/**
 * DEV-ONLY. `?t=13.2` on the web build pins the timeline to one instant so a
 * frame can be screenshotted and checked. Inert on native (no window.location)
 * and stripped from release bundles by __DEV__.
 */
const FREEZE_T =
  __DEV__ && typeof window !== 'undefined' && window.location
    ? parseFloat(new URLSearchParams(window.location.search).get('t') ?? '')
    : NaN;

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

  // DEBUG: ?t=12.4 pins the timeline to one instant so it can be screenshotted.
  useEffect(() => {
    if (isNaN(FREEZE_T)) return;
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
    if (FREEZE_T >= T_BEGIN) setEndReady(true);
  }, []);

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
      // Snap each channel once it's within a sub-pixel of a (now-constant) target,
      // so on the frozen end card the chase reaches EXACT equality and the figure
      // stops re-committing. During playback the idle-sway terms keep the targets
      // moving, so this threshold is never hit and the glide is unchanged.
      const nlx = lerp(hLx.value, tgt.lx, k);
      hLx.value = Math.abs(nlx - tgt.lx) < 0.1 ? tgt.lx : nlx;
      const nly = lerp(hLy.value, tgt.ly, k);
      hLy.value = Math.abs(nly - tgt.ly) < 0.1 ? tgt.ly : nly;
      const nrx = lerp(hRx.value, tgt.rx, k);
      hRx.value = Math.abs(nrx - tgt.rx) < 0.1 ? tgt.rx : nrx;
      const nry = lerp(hRy.value, tgt.ry, k);
      hRy.value = Math.abs(nry - tgt.ry) < 0.1 ? tgt.ry : nry;
    }

    // Bubble height chases the number of lines he has reached. An asymptotic chase
    // never exactly equals its target, and `height` is a LAYOUT prop — writing a
    // sub-pixel-different value every frame relays out the bubble + wrapped Words
    // for the whole 34s. Snap the final <0.25px and then hold a bit-exact constant,
    // so a layout pass runs only when the target actually steps at a beat.
    const diff = bubHTarget.value - bubH.value;
    if (Math.abs(diff) > 0.25) {
      const kb = 1 - Math.exp(-11 * dt);
      bubH.value = lerp(bubH.value, bubHTarget.value, kb);
    } else if (diff !== 0) {
      bubH.value = bubHTarget.value;
    }

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

  // ── per-frame figure state (consumed by native Views, not SVG) ──────────────
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

    // A butt-capped bone as a View transform: translate to the start joint, rotate
    // onto the joint vector, stretch a unit bar to the bone length with scaleX.
    // Identical array to the SVG <G> the arms used before.
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
      fade,
      // the whole body sways; the wrapper carries this, its children are static
      figure: [{ translateX: sway }],
      // head centre in body-local space (no sway — the wrapper adds it), rotated
      // about the chest by the tilt with the talking bob applied after.
      headCx: CHEST.x - Math.sin(headTilt) * LEN.head,
      headCy: CHEST.y - Math.cos(headTilt) * LEN.head + headBob,
      upL: bone(shLx, SH_L.y, elL.x, elL.y),
      foL: bone(elL.x, elL.y, hLx.value, hLy.value),
      upR: bone(shRx, SH_R.y, elR.x, elR.y),
      foR: bone(elR.x, elR.y, hRx.value, hRy.value),
      elLp: [{ translateX: elL.x }, { translateY: elL.y }],
      elRp: [{ translateX: elR.x }, { translateY: elR.y }],
      haLp: [{ translateX: hLx.value }, { translateY: hLy.value }],
      haRp: [{ translateX: hRx.value }, { translateY: hRy.value }],
    };
  });

  // The body group (legs/torso/pelvis/shoulders/head) sways and fades as one.
  const bodyStyle = useAnimatedStyle(() => ({ transform: D.value.figure, opacity: D.value.fade }));
  const headStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: D.value.headCx }, { translateY: D.value.headCy }],
  }));
  // Arms sit OUTSIDE the swayed group (each bone's maths already carries sway, so
  // the pointing hand aims at the board's real position). Their own fade, kept
  // separate from the body's so overlaps composite exactly as they did in SVG.
  const armsStyle = useAnimatedStyle(() => ({ opacity: D.value.fade }));
  const upLStyle = useAnimatedStyle(() => ({ transform: D.value.upL }));
  const foLStyle = useAnimatedStyle(() => ({ transform: D.value.foL }));
  const upRStyle = useAnimatedStyle(() => ({ transform: D.value.upR }));
  const foRStyle = useAnimatedStyle(() => ({ transform: D.value.foR }));
  const elLStyle = useAnimatedStyle(() => ({ transform: D.value.elLp }));
  const elRStyle = useAnimatedStyle(() => ({ transform: D.value.elRp }));
  const haLStyle = useAnimatedStyle(() => ({ transform: D.value.haLp }));
  const haRStyle = useAnimatedStyle(() => ({ transform: D.value.haRp }));

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

  const stageWrap: ViewStyle = {
    position: 'absolute',
    left: offX,
    top: offY,
    width: STAGE_W,
    height: STAGE_H,
    transform: [{ scale }],
    transformOrigin: 'top left',
  };

  return (
    <Animated.View style={[styles.root, rootStyle]}>
      {/* Paper — its own STATIC surface (no animated children), so it rasterizes
          once and never re-uploads with the animation. */}
      <Svg
        pointerEvents="none"
        style={StyleSheet.absoluteFill}
        width={W}
        height={H}
        viewBox={`0 0 ${STAGE_W} ${STAGE_H}`}
        preserveAspectRatio="xMidYMid meet"
      >
        <Defs>
          <LinearGradient id="wa-paper" x1="0" y1="0" x2="0" y2={STAGE_H} gradientUnits="userSpaceOnUse">
            <Stop offset="0" stopColor="#efece4" />
            <Stop offset="0.62" stopColor="#f7f4ee" />
            <Stop offset="1" stopColor="#e6e2d8" />
          </LinearGradient>
        </Defs>
        <Rect x={0} y={0} width={STAGE_W} height={STAGE_H} fill="url(#wa-paper)" />
      </Svg>

      {/* The board — one chapter per hand-drawn chart. Only the on-screen chapter
          is mounted, in a board-sized surface, so the other two cost nothing. */}
      {CHAPTERS.map((c) => (
        <Board key={c.visual} chapter={c} clock={clock} scale={scale} offX={offX} offY={offY} />
      ))}

      {/* The host — native Views (GPU-composited transforms, no per-frame raster).
          Legs are dead straight and never move, so they're static geometry; only
          sway/tilt/bob and the arms animate. */}
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <View style={stageWrap}>
          {/* body: sways + fades as one group. needsOffscreenAlphaCompositing so
              the dissolve composites the whole body ONCE then applies alpha —
              matching SVG group opacity, where overlapping parts (shoulders/head/
              torso) don't double-darken. Only allocates the offscreen buffer while
              opacity < 1 (the ~1.4s dissolve), so the main animation is unaffected. */}
          <Animated.View needsOffscreenAlphaCompositing style={[StyleSheet.absoluteFill, bodyStyle]}>
            <View style={LEG_L_STYLE} />
            <View style={LEG_R_STYLE} />
            <View style={TORSO_STYLE} />
            <View style={PELVIS_STYLE} />
            <View style={SH_L_STYLE} />
            <View style={SH_R_STYLE} />
            {/* no face — he reads as talking from the bubble, the word-by-word
                reveal and the speech bob, not from a mouth */}
            <Animated.View style={[HEAD_BASE, headStyle]} />
          </Animated.View>

          {/* arms: each bone is a unit bar stretched with scaleX and rotated onto
              its joint vector; butt-capped, with the joint circles rounding the
              ends off — exactly the SVG construction, now as Views. */}
          <Animated.View needsOffscreenAlphaCompositing style={[StyleSheet.absoluteFill, armsStyle]}>
            <Animated.View style={[BONE_BASE, upLStyle]} />
            <Animated.View style={[BONE_BASE, foLStyle]} />
            <Animated.View style={[BONE_BASE, upRStyle]} />
            <Animated.View style={[BONE_BASE, foRStyle]} />
            <Animated.View style={[JOINT_BASE, elLStyle]} />
            <Animated.View style={[JOINT_BASE, elRStyle]} />
            <Animated.View style={[JOINT_BASE, haLStyle]} />
            <Animated.View style={[JOINT_BASE, haRStyle]} />
          </Animated.View>
        </View>
      </View>

      {/* Text layer, in the same 400×800 space, scaled to match. */}
      <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
        <View pointerEvents="box-none" style={stageWrap}>
          <View pointerEvents="none" style={styles.bubbleRow}>
            <Animated.View style={[styles.bubble, bubbleStyle]} onLayout={(e) => onBubbleW(e.nativeEvent.layout.width)}>
              <Words key={beatIdx} beat={beat} clock={clock} onLines={onWordLines} />
            </Animated.View>
          </View>
        </View>
      </View>

      {/* The tail gets its OWN layer, above the bubble, in a surface bounded to the
          band it can reach: the bubble is a View, so a tail under it would have the
          bubble's bottom border cut across its root. Up here the tail's own fill
          covers that border and the two read as one shape. */}
      <Svg
        pointerEvents="none"
        style={{
          position: 'absolute',
          left: offX + TAIL_BOX.x * scale,
          top: offY + TAIL_BOX.y * scale,
          width: TAIL_BOX.w * scale,
          height: TAIL_BOX.h * scale,
        }}
        width={TAIL_BOX.w * scale}
        height={TAIL_BOX.h * scale}
        viewBox={`${TAIL_BOX.x} ${TAIL_BOX.y} ${TAIL_BOX.w} ${TAIL_BOX.h}`}
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
        <View pointerEvents="box-none" style={stageWrap}>
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
// One chart per chapter. Mounted ONLY while its chapter can be seen (so the other
// two never run their worklets or allocate a surface), inside a board-sized <Svg>
// so it rasterizes a fraction of the screen. The crossfade opacity rides a wrapper
// View (GPU), leaving the chart's own draw-on (strokeDashoffset) as the only SVG
// work — and that only during the ~3s a chart is drawing itself in.
const Board = memo(function Board({
  chapter,
  clock,
  scale,
  offX,
  offY,
}: {
  chapter: Chapter;
  clock: SharedValue<number>;
  scale: number;
  offX: number;
  offY: number;
}) {
  const [active, setActive] = useState(false);
  useAnimatedReaction(
    () => clock.value >= chapter.t0 - 0.6 && clock.value <= chapter.t1 + 0.4,
    (cur, prev) => {
      if (cur !== prev) runOnJS(setActive)(cur);
    }
  );

  const p = useDerivedValue(() => clamp01((clock.value - chapter.t0 - 0.25) / 3.3));
  const wrapStyle = useAnimatedStyle(() => {
    const t = clock.value;
    const inA = easeOutCubic(clamp01((t - chapter.t0 + 0.35) / 0.5));
    const outA = 1 - easeOutCubic(clamp01((t - chapter.t1) / 0.3));
    const fade = 1 - easeOutCubic(clamp01((t - T_FADE) / 1.2));
    return { opacity: clamp01(inA * outA) * fade };
  });

  if (!active) return null;

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          left: offX + BOARD_BOX.x * scale,
          top: offY + BOARD_BOX.y * scale,
          width: BOARD_BOX.w * scale,
          height: BOARD_BOX.h * scale,
        },
        wrapStyle,
      ]}
    >
      <Svg
        width="100%"
        height="100%"
        viewBox={`${BOARD_BOX.x} ${BOARD_BOX.y} ${BOARD_BOX.w} ${BOARD_BOX.h}`}
        preserveAspectRatio="xMidYMid meet"
      >
        <G transform={`translate(${GB.x}, ${GB.y}) scale(${GB.w / 300})`}>
          {chapter.visual === 'lesson' ? (
            <LessonChart p={p} />
          ) : chapter.visual === 'growth' ? (
            <GrowthChart p={p} />
          ) : (
            <TreeChart p={p} />
          )}
        </G>
      </Svg>
    </Animated.View>
  );
});

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
