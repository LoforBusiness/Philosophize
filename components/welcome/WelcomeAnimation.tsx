import { useCallback, useState } from 'react';
import { View, Text, Pressable, StyleSheet, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, {
  Circle,
  Line,
  Polyline,
  G,
  Rect,
  Defs,
  LinearGradient,
  RadialGradient,
  Stop,
  Text as SvgText,
} from 'react-native-svg';
import Animated, {
  useSharedValue,
  useFrameCallback,
  useDerivedValue,
  useAnimatedProps,
  useAnimatedStyle,
  runOnJS,
  type SharedValue,
} from 'react-native-reanimated';
import { useUserDataStore } from '@/stores/userDataStore';

// ─────────────────────────────────────────────────────────────────────────────
// First-launch welcome animation. A solid-black, featureless stickman "host" on
// warm parchment waves hello and gestures through speech-bubble captions pitching
// the app, then resolves into the wordmark + tagline + "Begin". Plays ONCE, then
// holds on the end card; a "Skip" is available throughout. Design coordinates are
// a fixed 1080×1920 stage, scaled to fit the device (letterbox = parchment).
// Spec: design_handoff_philosophize_welcome/README.md
// ─────────────────────────────────────────────────────────────────────────────

const INK = '#161310';
const PARCHMENT = '#E7DEC8';
const MUTED = '#6F6347';

const STAGE_W = 1080;
const STAGE_H = 1920;
const HOLD = 29.0; // play once, then freeze here on the resolved end card

// Pose = [lE.x, lE.y, lH.x, lH.y, rE.x, rE.y, rH.x, rH.y]  (screen-left arm first)
const POSE: Record<string, number[]> = {
  AKIMBO: [212, 915, 524, 1092, 868, 915, 556, 1092],
  WAVE: [212, 915, 524, 1092, 806, 772, 902, 486],
  TALK: [318, 962, 338, 1124, 762, 962, 742, 1124],
  OPEN: [300, 868, 186, 992, 780, 868, 894, 992],
  PRES_R: [332, 980, 372, 1132, 792, 812, 904, 700],
  PRES_L: [288, 812, 176, 700, 748, 980, 708, 1132],
  RAISE: [332, 812, 296, 628, 748, 812, 784, 628],
};

// [t, poseName, lean]
const KEYS: Array<[number, string, number]> = [
  [0.0, 'AKIMBO', 1.0],
  [2.8, 'AKIMBO', 1.0],
  [3.4, 'WAVE', 1.02],
  [6.6, 'WAVE', 1.02],
  [7.1, 'TALK', 1.0],
  [8.6, 'OPEN', 1.0],
  [10.2, 'TALK', 1.0],
  [11.6, 'PRES_R', 1.01],
  [13.2, 'TALK', 1.0],
  [14.4, 'PRES_L', 1.01],
  [16.0, 'TALK', 1.0],
  [17.6, 'OPEN', 1.0],
  [18.9, 'TALK', 1.04],
  [21.4, 'PRES_R', 1.08],
  [23.6, 'TALK', 1.1],
  [24.9, 'RAISE', 1.14],
  [26.6, 'OPEN', 1.06],
  [27.5, 'AKIMBO', 1.0],
  [30.0, 'AKIMBO', 1.0],
];

// Flattened numeric keyframes for the worklets: [t, 8 pose coords…, lean]
const KF: number[][] = KEYS.map(([t, name, lean]) => [t, ...POSE[name], lean]);

const CAPS: Array<{ s: number; e: number; text: string }> = [
  { s: 3.3, e: 7.0, text: 'Welcome to Philosophize.' },
  { s: 7.4, e: 11.3, text: 'Your handbook for learning anything philosophy.' },
  { s: 11.8, e: 15.4, text: 'Stoicism. Existentialism. Free will.' },
  { s: 15.8, e: 18.9, text: 'And so much more.' },
  { s: 19.3, e: 24.4, text: 'Hundreds of philosophers to learn from.' },
  { s: 24.9, e: 27.0, text: 'All right here.' },
];
// Numeric-only copy for worklets.
const CAPT: number[][] = CAPS.map((c) => [c.s, c.e]);

const TERMS: Array<{ text: string; x: number; y: number; size: number; phase: number; op: number }> = [
  { text: 'STOICISM', x: 150, y: 560, size: 78, phase: 0.0, op: 0.09 },
  { text: 'EXISTENTIALISM', x: 250, y: 1180, size: 64, phase: 1.1, op: 0.08 },
  { text: 'FREE WILL', x: 600, y: 760, size: 92, phase: 2.0, op: 0.1 },
  { text: 'ABSURDISM', x: 120, y: 980, size: 70, phase: 0.6, op: 0.07 },
  { text: 'ETHICS', x: 700, y: 1320, size: 84, phase: 2.6, op: 0.08 },
  { text: 'METAPHYSICS', x: 360, y: 420, size: 56, phase: 1.7, op: 0.07 },
  { text: 'VIRTUE', x: 760, y: 1040, size: 72, phase: 3.1, op: 0.09 },
];

// ── worklet math ─────────────────────────────────────────────────────────────
function clamp01(x: number) {
  'worklet';
  return x < 0 ? 0 : x > 1 ? 1 : x;
}
function eoc(x: number) {
  'worklet';
  const u = 1 - clamp01(x);
  return 1 - u * u * u;
}
function eio(x: number) {
  'worklet';
  const c = clamp01(x);
  return c < 0.5 ? 4 * c * c * c : 1 - Math.pow(-2 * c + 2, 3) / 2;
}
// Interpolated pose+lean at time t → [lEx,lEy,lHx,lHy,rEx,rEy,rHx,rHy,lean]
function poseAt(t: number) {
  'worklet';
  const n = KF.length;
  let i = 0;
  for (let k = 0; k < n - 1; k++) if (t >= KF[k][0]) i = k;
  const a = KF[i];
  const b = KF[i + 1 < n ? i + 1 : i];
  const span = b[0] - a[0] > 0.0001 ? b[0] - a[0] : 0.0001;
  const u = eio((t - a[0]) / span);
  const out: number[] = [];
  for (let j = 1; j <= 9; j++) out[j - 1] = a[j] + (b[j] - a[j]) * u;
  return out;
}
// Speech intensity (max caption opacity) at t → drives "talking" motion.
function capK(t: number) {
  'worklet';
  let m = 0;
  for (let k = 0; k < CAPT.length; k++) {
    const s = CAPT[k][0];
    const e = CAPT[k][1];
    if (t < s || t > e) continue;
    const o = Math.min(clamp01((t - s) / 0.4), clamp01((e - t) / 0.35));
    if (o > m) m = o;
  }
  return m;
}

const AG = Animated.createAnimatedComponent(G);
const APolyline = Animated.createAnimatedComponent(Polyline);
const ACircle = Animated.createAnimatedComponent(Circle);

interface Props {
  onDone?: () => void;
}

export default function WelcomeAnimation({ onDone }: Props) {
  const { width: W, height: H } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const setHasSeenWelcome = useUserDataStore((s) => s.setHasSeenWelcome);

  const scale = Math.min(W / STAGE_W, H / STAGE_H);
  const offX = (W - STAGE_W * scale) / 2;
  const offY = (H - STAGE_H * scale) / 2;

  const clock = useSharedValue(0);
  const endLatched = useSharedValue(0);
  const [endReady, setEndReady] = useState(false);

  useFrameCallback((f) => {
    'worklet';
    // Clamp the per-frame delta so a slow first mount or a backgrounded tab can
    // never fast-forward (or skip) the intro — it just advances in real time.
    let dt = (f.timeSincePreviousFrame ?? 16) / 1000;
    if (dt > 0.05) dt = 0.05;
    let nt = clock.value + dt;
    if (nt >= HOLD) nt = HOLD; // freeze on the resolved end card
    clock.value = nt;
    if (nt >= 27.9 && endLatched.value === 0) {
      endLatched.value = 1;
      runOnJS(setEndReady)(true);
    }
  });

  const finish = useCallback(() => {
    setHasSeenWelcome(true);
    onDone?.();
  }, [setHasSeenWelcome, onDone]);

  // Central per-frame figure state, shared by every animated SVG node.
  const D = useDerivedValue(() => {
    const t = clock.value;
    const P = poseAt(t);
    let lEx = P[0],
      lEy = P[1],
      lHx = P[2],
      lHy = P[3],
      rEx = P[4],
      rEy = P[5],
      rHx = P[6],
      rHy = P[7];
    const lean = P[8];
    const tk = capK(t);

    // continuous life
    const bob = 11 * Math.sin(t * 1.5);
    let headTilt = 2.0 * Math.sin(t * 0.8);
    let headNod = 0;

    // speech-driven beats
    if (tk > 0) {
      const bl = (22 * Math.sin(t * 4.7) + 20 * Math.sin(t * 3.1)) * tk;
      const br = (22 * Math.sin(t * 4.7 + 1.7) + 20 * Math.sin(t * 3.1 + 0.9)) * tk;
      lHy += bl;
      lHx += 0.4 * bl;
      rHy += br;
      rHx -= 0.4 * br;
      lEy += 0.4 * bl;
      rEy += 0.4 * br;
      headNod += 9 * Math.sin(t * 4.2) * tk;
      headTilt += 3 * Math.sin(t * 3.3) * tk;
    }

    // waving hand circles
    if (t > 3.4 && t < 6.7) {
      rHx += Math.sin((t - 3.4) * 8.5) * 70;
      rHy += Math.cos((t - 3.4) * 8.5) * 14;
    }

    // intro appear (0.4→2.1)
    const appearOp = t < 0.4 ? 0 : eoc((t - 0.4) / 1.7);
    const appearScale = 0.93 + 0.07 * (t < 0.4 ? 0 : eoc((t - 0.4) / 1.7));

    // outro lockup (27.1→28.7): figure recedes behind the end card
    const lk = eoc((t - 27.1) / 1.6);
    const lockScale = 1 - 0.3 * lk;
    const lockRise = -120 * lk;
    const lockOp = 1 - 0.74 * lk;

    const figScale = lean * appearScale * lockScale;
    const figOp = appearOp * lockOp;
    const ty = 250 + bob + lockRise;
    const sway = 1.4 * Math.sin(t * 1.6) * tk;

    // Transforms as RN transform ARRAYS (not SVG strings): Reanimated 4 parses a
    // string `transform` as CSS and crashes on SVG syntax, but passes arrays
    // straight through to react-native-svg. Each rotate/scale-about-a-point is
    // decomposed translate→op→translate, listed in the same order as the original
    // SVG string so the composed matrix (and the motion) is identical.
    const fig = [
      { translateY: ty },
      // rotate(sway about 540,900)
      { translateX: 540 }, { translateY: 900 }, { rotate: `${sway}deg` }, { translateX: -540 }, { translateY: -900 },
      // translate(540,720) scale(figScale) translate(-540,-720)
      { translateX: 540 }, { translateY: 720 }, { scale: figScale }, { translateX: -540 }, { translateY: -720 },
    ];
    // rotate(headTilt about 540,508) then translate(0, headNod)
    const head = [
      { translateX: 540 }, { translateY: 508 }, { rotate: `${headTilt}deg` }, { translateX: -540 }, { translateY: -508 },
      { translateY: headNod },
    ];

    return {
      fig,
      head,
      op: figOp,
      aL: `496,706 ${lEx},${lEy} ${lHx},${lHy}`,
      aR: `584,706 ${rEx},${rEy} ${rHx},${rHy}`,
      lhx: lHx,
      lhy: lHy,
      rhx: rHx,
      rhy: rHy,
    };
  });

  const figProps = useAnimatedProps(() => ({ transform: D.value.fig, opacity: D.value.op }));
  const headProps = useAnimatedProps(() => ({ transform: D.value.head }));
  const armLProps = useAnimatedProps(() => ({ points: D.value.aL }));
  const armRProps = useAnimatedProps(() => ({ points: D.value.aR }));
  const handLProps = useAnimatedProps(() => ({ cx: D.value.lhx, cy: D.value.lhy }));
  const handRProps = useAnimatedProps(() => ({ cx: D.value.rhx, cy: D.value.rhy }));

  // drifting-terms layer fades in/out across the "schools" section (11.2→18.9)
  const termsProps = useAnimatedProps(() => {
    const t = clock.value;
    const o = Math.min(clamp01((t - 11.2) / 1.3), clamp01((18.9 - t) / 1.3));
    return { opacity: o < 0 ? 0 : o };
  });

  return (
    <View style={[styles.root, { backgroundColor: PARCHMENT }]}>
      <Svg width={W} height={H} viewBox={`0 0 ${STAGE_W} ${STAGE_H}`} preserveAspectRatio="xMidYMid meet">
        <Defs>
          <LinearGradient id="torso" x1="0" y1="600" x2="0" y2="1760" gradientUnits="userSpaceOnUse">
            <Stop offset="0" stopColor={INK} stopOpacity="1" />
            <Stop offset="0.44" stopColor={INK} stopOpacity="1" />
            <Stop offset="1" stopColor={INK} stopOpacity="0" />
          </LinearGradient>
          <RadialGradient id="vig" cx="50%" cy="42%" r="78%">
            <Stop offset="0.6" stopColor="#3A2E18" stopOpacity="0" />
            <Stop offset="1" stopColor="#3A2E18" stopOpacity="0.2" />
          </RadialGradient>
        </Defs>

        {/* parchment + vignette */}
        <Rect x="0" y="0" width={STAGE_W} height={STAGE_H} fill={PARCHMENT} />
        <Rect x="0" y="0" width={STAGE_W} height={STAGE_H} fill="url(#vig)" />

        {/* drifting philosophy terms (behind the figure) */}
        <AG animatedProps={termsProps}>
          {TERMS.map((tm, i) => (
            <SvgText
              key={i}
              x={tm.x}
              y={tm.y}
              fill={INK}
              fillOpacity={tm.op}
              fontFamily="CormorantGaramond_500Medium"
              fontSize={tm.size}
              letterSpacing={tm.size * 0.14}
            >
              {tm.text}
            </SvgText>
          ))}
        </AG>

        {/* the host */}
        <AG animatedProps={figProps}>
          <Line x1="540" y1="600" x2="540" y2="1760" stroke="url(#torso)" strokeWidth={96} strokeLinecap="round" />
          <Line x1="540" y1="598" x2="540" y2="726" stroke={INK} strokeWidth={108} strokeLinecap="round" />
          <AG animatedProps={headProps}>
            <Circle cx="540" cy="508" r="182" fill={INK} />
          </AG>
          <APolyline
            animatedProps={armLProps}
            fill="none"
            stroke={INK}
            strokeWidth={94}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <APolyline
            animatedProps={armRProps}
            fill="none"
            stroke={INK}
            strokeWidth={94}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <ACircle animatedProps={handLProps} r="46" fill={INK} />
          <ACircle animatedProps={handRProps} r="46" fill={INK} />
        </AG>
      </Svg>

      {/* Scaled overlay layer: captions, splash, end card (1080×1920 space) */}
      <View pointerEvents="box-none" style={[StyleSheet.absoluteFill]}>
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
          <Splash clock={clock} />
          {CAPS.map((c, i) => (
            <Caption key={i} clock={clock} s={c.s} e={c.e} text={c.text} />
          ))}
          <EndCard clock={clock} endReady={endReady} onBegin={finish} />
        </View>
      </View>

      {/* Skip — device space, clear of the notch, available the whole time */}
      <Pressable
        onPress={finish}
        hitSlop={14}
        style={[styles.skip, { top: insets.top + 10, right: 16 }]}
      >
        <Text style={styles.skipText}>Skip</Text>
      </Pressable>
    </View>
  );
}

// ── overlay pieces ───────────────────────────────────────────────────────────

function Splash({ clock }: { clock: SharedValue<number> }) {
  const style = useAnimatedStyle(() => {
    const t = clock.value;
    const op = t < 0.15 ? t / 0.15 : t < 1.4 ? 1 : Math.max(0, 1 - (t - 1.4) / 0.25);
    return { opacity: op };
  });
  return (
    <Animated.View style={[styles.splash, style]} pointerEvents="none">
      <Text style={styles.splashWord}>Philosophize</Text>
      <Text style={styles.splashLoading}>LOADING</Text>
    </Animated.View>
  );
}

function Caption({
  clock,
  s,
  e,
  text,
}: {
  clock: SharedValue<number>;
  s: number;
  e: number;
  text: string;
}) {
  const style = useAnimatedStyle(() => {
    const t = clock.value;
    if (t < s - 0.05 || t > e + 0.05) return { opacity: 0, transform: [{ translateY: 12 }] };
    const inn = Math.min(1, Math.max(0, (t - s) / 0.4));
    const out = Math.min(1, Math.max(0, (e - t) / 0.35));
    const op = Math.min(inn, out);
    return { opacity: op, transform: [{ translateY: 12 * (1 - inn) }] };
  });
  return (
    <Animated.View style={[styles.bubble, style]} pointerEvents="none">
      <Text style={styles.bubbleText}>{text}</Text>
      <View style={styles.bubbleTail} />
    </Animated.View>
  );
}

function EndCard({
  clock,
  endReady,
  onBegin,
}: {
  clock: SharedValue<number>;
  endReady: boolean;
  onBegin: () => void;
}) {
  const card = useAnimatedStyle(() => ({ opacity: eoc((clock.value - 27.1) / 1.6) }));
  const word = useAnimatedStyle(() => {
    const r = eoc((clock.value - 27.3) / 1.4);
    return { opacity: r, transform: [{ translateY: 30 * (1 - r) }] };
  });
  const begin = useAnimatedStyle(() => ({ opacity: Math.min(1, Math.max(0, (clock.value - 27.9) / 0.6)) }));

  return (
    <Animated.View style={[styles.endCard, card]} pointerEvents="box-none">
      <View style={styles.divider} />
      <Animated.Text style={[styles.lockWord, word]}>Philosophize</Animated.Text>
      <Text style={styles.tagline}>Your pocket philosophy handbook.</Text>
      <Animated.View style={begin}>
        <Pressable
          onPress={onBegin}
          disabled={!endReady}
          hitSlop={16}
          style={({ pressed }) => [styles.beginBtn, pressed && { opacity: 0.7 }]}
        >
          <Text style={styles.beginText}>Begin</Text>
          <Svg width={34} height={20} viewBox="0 0 34 20">
            <Line x1="2" y1="10" x2="30" y2="10" stroke={INK} strokeWidth={2.4} strokeLinecap="round" />
            <Polyline points="22,3 31,10 22,17" fill="none" stroke={INK} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, overflow: 'hidden' },

  skip: { position: 'absolute', paddingHorizontal: 14, paddingVertical: 8 },
  skipText: {
    fontFamily: 'EBGaramond_400Regular',
    fontSize: 18,
    letterSpacing: 1,
    color: MUTED,
  },

  // 1080×1920-space overlays
  splash: { position: 'absolute', left: 0, right: 0, top: 800, alignItems: 'center' },
  splashWord: { fontFamily: 'CormorantGaramond_500Medium', fontSize: 84, color: INK },
  splashLoading: {
    fontFamily: 'EBGaramond_400Regular',
    fontSize: 34,
    letterSpacing: 10,
    color: MUTED,
    marginTop: 8,
  },

  bubble: {
    position: 'absolute',
    top: 120,
    left: 70,
    right: 70,
    maxWidth: 800,
    alignSelf: 'center',
    backgroundColor: 'rgba(238,230,212,0.82)',
    borderWidth: 1.6,
    borderColor: 'rgba(22,19,16,0.5)',
    borderRadius: 30,
    paddingVertical: 24,
    paddingHorizontal: 40,
    alignItems: 'center',
  },
  bubbleText: {
    fontFamily: 'CormorantGaramond_500Medium',
    fontSize: 56,
    lineHeight: 56 * 1.12,
    color: INK,
    textAlign: 'center',
  },
  bubbleTail: {
    position: 'absolute',
    bottom: -13,
    width: 26,
    height: 26,
    backgroundColor: 'rgba(238,230,212,0.82)',
    borderRightWidth: 1.6,
    borderBottomWidth: 1.6,
    borderColor: 'rgba(22,19,16,0.5)',
    transform: [{ rotate: '45deg' }],
  },

  endCard: { position: 'absolute', left: 0, right: 0, top: 860, alignItems: 'center' },
  divider: { width: 96, height: 2, backgroundColor: MUTED, marginBottom: 40 },
  lockWord: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 138, color: INK, lineHeight: 150 },
  tagline: {
    fontFamily: 'EBGaramond_400Regular_Italic',
    fontStyle: 'italic',
    fontSize: 50,
    color: MUTED,
    marginTop: 14,
  },
  beginBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    marginTop: 120,
    borderWidth: 1.6,
    borderColor: INK,
    borderRadius: 999,
    paddingVertical: 22,
    paddingHorizontal: 56,
  },
  beginText: { fontFamily: 'CormorantGaramond_500Medium', fontSize: 50, color: INK, letterSpacing: 2 },
});
