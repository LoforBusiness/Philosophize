import { useCallback, useEffect, useRef, useState, memo } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  type ViewStyle,
} from 'react-native';
import { LinearGradient as Scrim } from 'expo-linear-gradient';
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

/**
 * Bump this whenever the intro changes enough to be worth showing again, and every
 * reader whose stored `welcomeVersion` is lower gets it once more. It exists because
 * the old boolean gate made the intro unreachable by over-the-air update: a fresh
 * install plays it from the bundle inside the APK on launch one and latches the flag,
 * and the download only takes effect on launch two.
 *
 * 1 → the original.
 * 2 → the sky behind the end card.
 * 3 → he walks on and runs off instead of appearing and dissolving, and the two
 *     decorative boards became the six branches and a timeline of real thinkers.
 * 4 → the analytics notice on the end card. This one is NOT a polish bump: the
 *     analytics default moved to on, and existing readers are only told about it
 *     because this number went up and put the intro back in front of them.
 */
export const WELCOME_VERSION = 4;
import {
  BEATS,
  BEAT_T,
  CHAPTERS,
  T_FADE,
  T_BEGIN,
  T_HOLD,
  SPEAK_T0,
  STAGE_W,
  STAGE_H,
  GROUND,
  LEN,
  STR,
  BUB,
  beatIdxAt,
  ik,
  reachTo,
  tailTip,
  type Beat,
  type Chapter,
} from './rig';
import Stickman from '@/components/lesson/cinematic/Stickman';
import { solve, bundle, type Bundle } from '@/components/lesson/cinematic/rig';
import { hostAtRig, K_HOST, FIG_GROUND } from './hostFigure';
import MapChart from './charts/MapChart';
import ThinkersChart from './charts/ThinkersChart';
import LessonChart from './charts/LessonChart';

// ─────────────────────────────────────────────────────────────────────────────
// First-launch welcome. A featureless black stickman "host" MARCHES ON from
// off-stage right, overshoots his mark, backs up onto it and turns to face you
// (see host.ts). Then he talks through a speech bubble — the tail tracks his head
// as he sways, and the words appear one at a time at his speaking pace — while
// hand-drawn boards to his left carry a real lesson card, the six branches of
// philosophy and a timeline of real thinkers. On the last line he turns away,
// fails to get any traction for half a second, and bolts; the wordmark and a Begin
// button resolve into the empty stage.
//
// Plays ONCE and holds on the end card; Skip is always there.
//
// RENDERING NOTE — why the figure is native Views, not SVG:
// react-native-svg 15 has no partial invalidation: any animated child re-renders
// and re-uploads the WHOLE <Svg> surface to a GPU bitmap every frame. With the
// figure drawn in a full-screen <Svg>, that was ~10fps on an S24 Ultra (100%
// janky frames, all "slow bitmap uploads", GPU otherwise idle). So the figure is
// now plain RN Views driven by Reanimated transforms — those composite on the GPU
// with NO per-frame rasterization. The maths in rig.ts is reused verbatim, so
// every position, angle and timing is identical to the SVG version; only the draw
// primitive changed (a butt-capped bone is a BONE_SRC×STR ink View scaled by
// scaleX; a joint/head is a borderRadius View, and it is those caps that round the
// bones off). What stays in SVG — the paper gradient (static, drawn once), the charts
// (only the on-screen chapter is mounted, in a board-sized surface) and the tail
// (a bounded surface a fraction of the screen) — no longer re-rasters the full
// screen every frame.
//
// Design stage is a fixed 400×800 (the approved preview's coordinate space),
// scaled to fit the device — letterbox is paper, so it never reads as bars.
// ─────────────────────────────────────────────────────────────────────────────

const DEG = 180 / Math.PI;

const AG = Animated.createAnimatedComponent(G);

// Bounded stage sub-region for the tail, which is the one animated thing still
// drawn in SVG, so it re-rasters a fraction of the screen rather than all of it.
// It covers the band the tail can ever reach: the bubble's fixed bottom edge down
// past his head. Safe even though he now walks, because the tail is only ever
// visible while the bubble is — which is only ever while he is on his mark.
// (Each board owns its own box now; see CHAPTERS in rig.ts.)
const TAIL_BOX = { x: 30, y: 356, w: 340, h: 188 };

// ── static tail path ─────────────────────────────────────────────────────────
// Drawn ONCE in a local frame: root at the origin, tip straight down at
// tailLen0. The component only ever translates / rotates / scaleY's it onto the
// line between the bubble and his head — its `d` never changes.
// The root is lifted 4px INTO the bubble so the bubble's own bottom border is
// covered where they meet and the two read as one shape.
/** How far the Begin button drops onto its own ledge. Matches LIP.button. */
const BEGIN_LIP = 4;
/** The accent the ledge is cut from — the app's one structural colour. */
const HUE = '#1B3B3C';

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

// ── figure primitives ────────────────────────────────────────────────────────
// GONE. Twenty-two anchored View bases and a bone-transform helper used to live
// here — a second copy of components/lesson/cinematic/Stickman that had drifted
// from it, which is the same fork the walk itself was. Stickman draws him now.
// ── figure primitives ────────────────────────────────────────────────────────
// NOTHING about the figure is static geometry any more. It used to be: the legs
// were two frozen View styles computed once at module scope, which is exactly why
// he could not walk — and why he simply existed, fully drawn, on the first frame.
// Every part is now solved per frame from the same skeleton, and every one of
// these is an anchored BASE that a Reanimated transform lands in place.
//
// Head/joints are circles centred on the origin, so a translate moves the centre.
// A bone is a BONE_SRC-long butt-capped bar whose LEFT-centre is the origin
// (transformOrigin 0% 50%), so [translate, rotate, scaleX(len/BONE_SRC)] lays it
// from the start joint along the bone. Round caps come from the joint circles
// sitting on top of the ends, which is what the old round-capped stadiums drew.
/** The welded pelvis — wider than a limb joint, so it caps both hips at once. */
/**
 * A BONE IS 100 UNITS LONG AND SCALED DOWN, NOT ONE UNIT SCALED UP.
 *
 * THE SAME DEFECT THE LESSON RIG ALREADY FIXED, and this file predates that fix —
 * see BONE_SRC in components/lesson/cinematic/rig.ts, which is this constant under
 * the same name and for the same reason. Kept as a local copy rather than an
 * import because these two rigs share no code on purpose.
 *
 * A bone used to be a 1px-wide bar stretched by scaleX(length), which is the
 * obvious way to do it and is wrong: the element is rasterized at its LAYOUT size —
 * a single pixel column — and the enormous upscale loses the far end. The loss is
 * PROPORTIONAL, measured here in isolation outside React:
 *
 *     1px × 99   drew 79     1px × 57   drew 45     1px × 41.8 drew 33
 *     4px × 24.8 drew 99     12px × 8.3 drew 99
 *
 * Every bone came out a fifth short. The lesson rig saw it as a white nick at each
 * joint, because its bones are short enough that a fifth is about the radius of the
 * cap that hides them. Here the torso is 99 units long, so a fifth of it is twenty
 * units of missing spine — a hole between his head and his shoulders you cannot
 * miss. It only appeared now because the torso had been a fixed-size rotated box
 * until it had to start leaning.
 *
 * Anything from about 4px up rasterizes true, so the source is 100 and every scale
 * factor is below 1. Downscaling has no such failure mode.
 */
const BONE_SRC = 100;
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
  const setWelcomeVersion = useUserDataStore((s) => s.setWelcomeVersion);

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
    // NO HAND CATCH-UP ANY MORE. This used to step a 60Hz exponential filter from
    // zero to FREEZE_T to find where two smoothed hand targets had settled,
    // because the hands were chased toward targets rather than posed. The rig
    // poses them: `hostAtRig(t)` is a pure function of t, so there is nothing to
    // catch up — jumping the clock is the whole of it.
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

  // The sky arrives with the wordmark and on the same curve — a shade slower, so the
  // ground settles under the word rather than racing it. Before T_BEGIN it is not
  // merely transparent, it is `display: none`: a full-screen image left mounted at
  // opacity 0 behind thirty seconds of animation is a composited layer the GPU pays
  // for on every frame of a screen that never shows it.
  const skyStyle = useAnimatedStyle(() => {
    const a = easeOutCubic(clamp01((clock.value - T_BEGIN) / 0.85));
    return { opacity: a, display: a <= 0 ? ('none' as const) : ('flex' as const) };
  });

  // Recording the version unmounts this screen, so it must be the LAST thing that
  // happens — index.tsx swaps in the auth panel the moment the stored number
  // reaches WELCOME_VERSION. (It sets `hasSeenWelcome` as well, so rolling back to
  // a bundle that still reads the boolean does not replay the intro.)
  const finish = useCallback(() => {
    setWelcomeVersion(WELCOME_VERSION);
    onDone?.();
  }, [setWelcomeVersion, onDone]);

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
  //
  // The WHOLE skeleton, solved every frame from hostAt. This used to be arms-only:
  // the legs, torso, pelvis and shoulders were module-scope constants and the body
  // sway was a single group transform over the top. That is what made him a
  // standing prop rather than a character, and it is why he could only ever appear
  // and dissolve.
  // ── the host, solved by the LESSON rig ────────────────────────────────────
  //
  // This was 110 lines of bespoke skeleton — its own leg IK, its own foot-lock,
  // its own settle, its own arm reach — and a reader could see the difference:
  // "the walking onto the screen is kinda bad … he has to reposition himself.
  // The actual stickman in lessons looks really good."
  //
  // It does not solve anything itself now. `hostAtRig` says where he is and what
  // he is doing; `solve` and `bundle` are the same two calls every cinematic
  // lesson makes, so the gait, the foot-lock, the settle and the arm arcs are
  // literally the same code that draws him in a lesson. See ./hostFigure.
  const D = useDerivedValue(() => {
    const t = clock.value;
    const F = hostAtRig(t);
    const s = F.stance;
    const j = solve({
      x: F.x, groundY: FIG_GROUND, k: K_HOST, dir: F.dir,
      tilt: s.tilt, neck: s.neck, bob: s.bob,
      footL: s.footL, footR: s.footR, fistL: s.fistL, fistR: s.fistR,
    });
    return {
      // He LEAVES rather than dissolving, so there is no figure fade — only a
      // hard cut once he is off the stage entirely, which nobody can see.
      vis: F.vis,
      // The board and the bubble dissolve over the BEAT he holds the last line
      // for, so they are gone by the frame he turns to leave.
      fade: 1 - easeOutCubic(clamp01((t - T_FADE) / 0.5)),
      // The tail tracks his head, and the head comes straight off the solved
      // skeleton — a tail computed from constants would point at where he used
      // to stand.
      headX: j.head.x,
      headY: j.head.y,
      b: bundle(j, K_HOST, 1),
    };
  });
  // Stickman wants a Bundle on its own, so the tail's two numbers ride beside it
  // rather than inside it.
  const DT = useDerivedValue<Bundle>(() => D.value.b);

  // Everything is now solved in stage coordinates, so the figure group carries no
  // transform of its own — only whether he is on the stage at all. `display` and
  // not just opacity, so once he has bolted the whole subtree stops being a
  // composited layer behind the end card.
  const figStyle = useAnimatedStyle(() => ({
    opacity: D.value.vis,
    display: D.value.vis <= 0 ? ('none' as const) : ('flex' as const),
  }));

  // ── the tail: static shape, transformed onto the line to his head ──────────
  const tailXf = useDerivedValue(() => {
    const t = clock.value;
    // Straight off the solved skeleton rather than recomputed from constants — the
    // head is no longer at a fixed place, and a tail that assumed it was would have
    // pointed at where he used to stand.
    const headX = D.value.headX;
    const headY = D.value.headY;

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
  // Tied to the BUBBLE, not to the figure. On the figure's own alpha it would be
  // drawn for the whole entrance — a speech tail trailing a man who has not spoken
  // yet, anchored to a balloon that is not there.
  const tailProps = useAnimatedProps(() => ({
    transform: tailXf.value,
    opacity: easeOutCubic(clamp01((clock.value - SPEAK_T0 + 0.16) / 0.34)) * D.value.fade,
  }));

  const bubbleStyle = useAnimatedStyle(() => ({
    height: bubH.value,
    // Arrives with his FIRST WORD, not with the screen. It used to fade in over the
    // first 0.6 seconds, which now would float an empty balloon above a man still
    // walking in from off-stage.
    opacity: easeOutCubic(clamp01((clock.value - SPEAK_T0 + 0.16) / 0.34)) * D.value.fade,
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

      {/* ── THE SKY, and only for the end card ──────────────────────────────────
          It fades in on the SAME T_BEGIN ramp as the wordmark, so it belongs to the
          "Ashmere / Begin" screen and never appears behind the host while he is
          talking — which is what was asked for, and also what keeps the earlier
          chapters legible.

          THE SCRIM IS NOT OPTIONAL (§19). The wordmark is INK at 46px and the sky is
          hand-hatched with near-black cloud lines, so dark type straight onto it has
          no reliable contrast — worst at the left and right edges, where the drawing
          runs almost solid. A PAPER wash, heaviest through the middle third where the
          word and the button actually sit and lightest top and bottom so the drawing
          still reads, fixes the contrast by CONSTRUCTION rather than by hoping the
          crop lands somewhere pale.

          Explicit width and height, not `absoluteFill` on the Image: given neither,
          an image takes its own intrinsic size and this one is 318 wide, which would
          leave bare paper down the side of any real phone (§19). */}
      <Animated.View style={[StyleSheet.absoluteFill, skyStyle]} pointerEvents="none">
        <Image
          source={require('@/assets/images/welcome/sky.jpg')}
          style={{ width: W, height: H }}
          resizeMode="cover"
        />
        <Scrim
          style={StyleSheet.absoluteFill}
          colors={[
            'rgba(247,244,238,0.22)',
            'rgba(247,244,238,0.28)',
            'rgba(247,244,238,0.72)',
            'rgba(247,244,238,0.72)',
            'rgba(247,244,238,0.30)',
            'rgba(247,244,238,0.22)',
          ]}
          locations={[0, 0.28, 0.4, 0.62, 0.78, 1]}
        />
      </Animated.View>

      {/* The board — one chapter per hand-drawn chart. Only the on-screen chapter
          is mounted, in a board-sized surface, so the other two cost nothing. */}
      {CHAPTERS.map((c) => (
        <Board key={c.visual} chapter={c} clock={clock} scale={scale} offX={offX} offY={offY} />
      ))}

      {/* The host — native Views (GPU-composited transforms, no per-frame raster).
          Every part is solved per frame now, legs included, so he can walk.
          Drawing order is the depth order: the far leg and far arm go down first,
          then the torso, then the near ones on top. */}
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <View style={stageWrap}>
          <Animated.View
            needsOffscreenAlphaCompositing
            style={[StyleSheet.absoluteFill, figStyle]}
          >
            {/* ONE COMPONENT, THE SAME ONE THE LESSONS DRAW.
                Twenty-two hand-placed Views used to live here, each with its own
                animated style reading its own field off the solver above. They
                were a copy of Stickman that had drifted from it. */}
            <Stickman D={DT} k={K_HOST} />
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

  // Each board draws itself in over the whole time it is up, less a beat at each
  // end — a fixed 3.3s was right for the lesson card and far too quick for a map
  // whose six names have to land on six spoken words ten seconds apart.
  const draw = Math.max(2.2, chapter.t1 - chapter.t0 - 1.2);
  const p = useDerivedValue(() => clamp01((clock.value - chapter.t0 - 0.25) / draw));
  const wrapStyle = useAnimatedStyle(() => {
    const t = clock.value;
    const inA = easeOutCubic(clamp01((t - chapter.t0 + 0.35) / 0.5));
    const outA = 1 - easeOutCubic(clamp01((t - chapter.t1) / 0.3));
    const fade = 1 - easeOutCubic(clamp01((t - T_FADE) / 0.5));
    return { opacity: clamp01(inA * outA) * fade };
  });

  if (!active) return null;

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          left: offX + chapter.box.x * scale,
          top: offY + chapter.box.y * scale,
          width: chapter.box.w * scale,
          height: chapter.box.h * scale,
        },
        wrapStyle,
      ]}
    >
      {/* The chart draws in its OWN space (cw × ch) and the viewBox scales that to
          fill the board, so a chart never has to know how big its board is. */}
      <Svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${chapter.cw} ${chapter.ch}`}
        preserveAspectRatio="xMidYMid meet"
      >
        {chapter.visual === 'lesson' ? (
          <LessonChart p={p} />
        ) : chapter.visual === 'map' ? (
          <MapChart p={p} clock={clock} />
        ) : (
          <ThinkersChart p={p} />
        )}
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
  const [beginDown, setBeginDown] = useState(false);
  const word = useAnimatedStyle(() => {
    const r = easeOutCubic(clamp01((clock.value - T_BEGIN) / 0.6));
    return { opacity: r, transform: [{ translateY: 14 * (1 - r) }] };
  });
  const begin = useAnimatedStyle(() => {
    const a = easeOutCubic(clamp01((clock.value - T_BEGIN) / 0.6));
    const s = 0.94 + 0.06 * easeOutBack(clamp01((clock.value - T_BEGIN) / 0.6));
    return { opacity: a, transform: [{ scale: s }] };
  });
  // Arrives AFTER the button, so it reads as a footnote to the choice rather than
  // as a condition on it — but on the same screen, before anything is collected.
  const notice = useAnimatedStyle(() => ({
    opacity: 0.9 * easeOutCubic(clamp01((clock.value - T_BEGIN - 0.45) / 0.7)),
  }));
  return (
    <View pointerEvents="box-none" style={styles.endCard}>
      <Animated.Text style={[styles.lockWord, word]}>Ashmere</Animated.Text>
      <Animated.View style={begin}>
        {/* THE FIRST BUTTON ANYONE EVER PRESSES IN THIS APP, and it was a flat
            pill that dimmed to 70%. Dimming is what a disabled control does; it
            is not what a press feels like. This is the chunk every other button
            in the app has — a slab of the accent behind the face, and the face
            drops onto it — so the very first press teaches the gesture the rest
            of the app answers to. See components/ui/Button. */}
        <Pressable
          onPress={onBegin}
          onPressIn={() => setBeginDown(true)}
          onPressOut={() => setBeginDown(false)}
          disabled={!endReady}
          hitSlop={16}
          style={styles.beginSlot}
        >
          <View style={{ paddingBottom: BEGIN_LIP }}>
            <View pointerEvents="none" style={styles.beginLip} />
            <View style={[styles.beginBtn, { transform: [{ translateY: beginDown ? BEGIN_LIP : 0 }] }]}>
              <Text style={styles.beginText}>Begin</Text>
            </View>
          </View>
        </Pressable>
      </Animated.View>

      {/* THE DISCLOSURE, and it is not decoration.
          Analytics default to ON (see DEFAULT_SETTINGS.usageAnalytics), and the
          only thing that makes that defensible rather than sneaky is telling
          people plainly, before they start, in words they will actually read —
          and saying exactly where the switch is. Do not shrink this away. */}
      <Animated.Text style={[styles.notice, notice]}>
        Anonymous usage data helps improve the lessons — never your name, notes or
        saved quotes. You can turn it off in Settings.
      </Animated.Text>
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
  beginSlot: { marginTop: 38 },
  beginLip: {
    position: 'absolute', left: 0, right: 0, bottom: 0, top: BEGIN_LIP,
    backgroundColor: HUE, borderRadius: 25,
  },
  beginBtn: {
    backgroundColor: INK,
    borderRadius: 25,
    paddingVertical: 14,
    paddingHorizontal: 44,
  },
  beginText: { fontFamily: 'Inter_500Medium', fontSize: 17, color: PAPER },
  // Its own shadow, like the wordmark: the sky behind runs to near-black in
  // places and no type on this screen may take its contrast from the artwork (§19).
  notice: {
    marginTop: 26,
    maxWidth: 300,
    textAlign: 'center',
    fontFamily: 'Inter_400Regular',
    fontSize: 11.5,
    lineHeight: 17,
    color: '#4A4640',
    textShadowColor: 'rgba(247,244,238,0.9)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});
