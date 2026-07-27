import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { BEATS } from './politicalScript';
import {
  boxMove, clamp01, ease01, lerp, mixStance, pose, stand, type Bundle, type Stance,
} from './rig';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER } from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';

// ─────────────────────────────────────────────────────────────────────────────
// THE WAR OF ALL AGAINST ALL, AND THE SOVEREIGN THEY RAISE.
//
// Four citizens brawl on the ground line. When the covenant is made, a pedestal
// grows out of the ground beneath a fifth figure — crowned, sword aloft — and the
// fighting settles into a calm stand.
//
// Three pieces of information design carry Hobbes's argument above the action:
//   · the headline WAR OF ALL AGAINST ALL, struck through as authority arrives;
//   · a flow, MULTITUDE → SOVEREIGN → PEACE, whose last two boxes ink in;
//   · two opposed meters, FEAR and PEACE, that trade places as `auth` rises.
//
// CAMERA: none. The old scene translated the whole stage up 136 units, which put
// the ground line in mid-air and made the band unmeasurable. Design space is now
// final space: everything stands on GROUND=500, art occupies y 244..508, and the
// band is [234, 514].
// ─────────────────────────────────────────────────────────────────────────────

const TR = 0.85;

// Citizens pulled in from the edges so a lunging brawler never reaches the meters.
const CIT_X = [100, 154, 250, 304];
const CIT_DIR = [1, 1, -1, -1];              // all face the centre
const CIT_K = K_FIG * 0.82;
const SOV_X = 200;
const PED = 30;                              // the pedestal the covenant raises

// the flow, clear of the sovereign's crown (its highest point is y ≈ 320)
const FLOW_T = 274;
const FLOW_H = 34;
const FLOW_W = 100;
const FLOW_X = [26, 150, 274];
const FLOW_LABEL = ['MULTITUDE', 'SOVEREIGN', 'PEACE'];
const ARROW_X = [126, 250];

// the two meters, standing on the ground line either side of the crowd
const MTR_T = 382;
const MTR_H = 112;
const MTR_W = 24;

const SPARK_X = [127, 277];

const AUTH = BEATS.map((b) => b.auth ?? 0);
const Q1 = BEATS.map((b) => (b.weigh === 'q1' ? 1 : 0));

// Each citizen runs an out-of-phase loop of blows — no two in sync, the brawl.
function melee(t: number, k: number): Stance {
  'worklet';
  const codes = [1, 3, 2, 0, 5, 1, 6];       // jab hook cross guard block jab duck
  const period = 0.72;
  const local = t * 1.1 + k * 1.9;
  const idx = Math.floor(local / period) % codes.length;
  const u = (local / period) % 1;
  return boxMove(codes[idx], t, u);
}
function sovereignPose(t: number): Stance {
  'worklet';
  const s = stand(t);
  return { ...s, tilt: s.tilt - 0.02, fistR: { x: 16, y: -42 }, fistL: { x: -9, y: -4 } };
}

export default function PoliticalScene({ clock, bt, bi, qv }: SceneApi) {
  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / TR);
    const t = clock.value;
    const q = clamp01(qv.value);

    const auth = Q1[n] === 1 ? ease01(q) : lerp(AUTH[p], AUTH[n], tr);

    const cit = (k: number): Bundle => {
      'worklet';
      const dir = CIT_DIR[k];
      const s = mixStance(melee(t, k), stand(t), auth);
      const x = CIT_X[k] + s.adv * dir * (1 - auth);   // lunges only in the brawl
      return pose(s, x, GROUND, CIT_K, dir, 1);
    };

    // The pedestal GROWS from the ground under him, so his feet are always planted
    // on it — the old version floated him in mid-air on the way up.
    const sovGY = GROUND - PED * auth;
    return {
      c0: cit(0), c1: cit(1), c2: cit(2), c3: cit(3),
      sov: pose(sovereignPose(t), SOV_X, sovGY, K_FIG, -1, auth),
      auth, t,
    };
  });

  const DC0 = useDerivedValue<Bundle>(() => SCENE.value.c0);
  const DC1 = useDerivedValue<Bundle>(() => SCENE.value.c1);
  const DC2 = useDerivedValue<Bundle>(() => SCENE.value.c2);
  const DC3 = useDerivedValue<Bundle>(() => SCENE.value.c3);
  const DSov = useDerivedValue<Bundle>(() => SCENE.value.sov);

  const ped = useAnimatedStyle(() => ({ opacity: SCENE.value.auth, transform: [{ scaleY: SCENE.value.auth }] }));
  const crown = useAnimatedStyle(() => {
    const h = DSov.value.head;
    return {
      opacity: DSov.value.opacity,
      transform: [{ translateX: h[0].translateX }, { translateY: h[1].translateY - 30 }],
    };
  });
  const sword = useAnimatedStyle(() => {
    const w = DSov.value.wrR;
    return {
      opacity: DSov.value.opacity,
      transform: [{ translateX: w[0].translateX }, { translateY: w[1].translateY }],
    };
  });

  return (
    <View style={styles.scene}>
      <Headline S={SCENE} />
      <Flow S={SCENE} />
      <Meter S={SCENE} side="left" label="FEAR" invert />
      <Meter S={SCENE} side="right" label="PEACE" />
      {SPARK_X.map((x) => <Spark key={x} S={SCENE} x={x} />)}

      <View style={styles.ground} pointerEvents="none" />
      <Animated.View style={[styles.pedestal, ped]} pointerEvents="none" />

      <Stickman D={DC0} k={CIT_K} />
      <Stickman D={DC1} k={CIT_K} />
      <Stickman D={DC2} k={CIT_K} />
      <Stickman D={DC3} k={CIT_K} />
      <Stickman D={DSov} k={K_FIG} />

      {/* the sword held aloft, riding the sovereign's right wrist */}
      <Animated.View style={[styles.rider, sword]} pointerEvents="none">
        <View style={styles.swordBlade} />
        <View style={styles.swordGuard} />
        <View style={styles.swordPommel} />
      </Animated.View>
      {/* the crown, riding his head joint */}
      <Animated.View style={[styles.rider, crown]} pointerEvents="none">
        <View style={styles.crownBand} />
        <View style={[styles.crownPoint, { left: -14 }]} />
        <View style={[styles.crownPoint, { left: -3 }]} />
        <View style={[styles.crownPoint, { left: 8 }]} />
      </Animated.View>
    </View>
  );
}

// ── the headline, struck through when a common power arrives ─────────────────

function Headline({ S }: { S: SharedValue<any> }) {
  const strike = useAnimatedStyle(() => ({ transform: [{ scaleX: S.value.auth }] }));
  return (
    <View style={styles.headWrap} pointerEvents="none">
      <View>
        <Text style={styles.headText}>WAR OF ALL AGAINST ALL</Text>
        <Animated.View style={[styles.strike, strike]} />
      </View>
    </View>
  );
}

// ── the flow: MULTITUDE → SOVEREIGN → PEACE ──────────────────────────────────

function FlowBox({ S, x, label, fixed }: { S: SharedValue<any>; x: number; label: string; fixed?: boolean }) {
  const on = useAnimatedStyle(() => ({ opacity: S.value.auth }));
  const off = useAnimatedStyle(() => ({ opacity: 1 - S.value.auth }));
  if (fixed) {
    return (
      <View style={[styles.flowBox, styles.flowFixed, { left: x }]} pointerEvents="none">
        <Text style={styles.flowTextFixed}>{label}</Text>
      </View>
    );
  }
  return (
    <View style={[styles.flowBox, { left: x }]} pointerEvents="none">
      <Animated.View style={[StyleSheet.absoluteFill, styles.flowOff, off]}>
        <Text style={styles.flowTextOff}>{label}</Text>
      </Animated.View>
      <Animated.View style={[StyleSheet.absoluteFill, styles.flowOn, on]}>
        <Text style={styles.flowTextOn}>{label}</Text>
      </Animated.View>
    </View>
  );
}

function FlowArrow({ S, x }: { S: SharedValue<any>; x: number }) {
  const on = useAnimatedStyle(() => ({ opacity: S.value.auth }));
  const off = useAnimatedStyle(() => ({ opacity: 1 - S.value.auth }));
  return (
    <View style={[styles.arrowWrap, { left: x }]} pointerEvents="none">
      <Animated.Text style={[styles.arrow, off]}>→</Animated.Text>
      <Animated.Text style={[styles.arrow, styles.arrowOn, on]}>→</Animated.Text>
    </View>
  );
}

function Flow({ S }: { S: SharedValue<any> }) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <FlowBox S={S} x={FLOW_X[0]} label={FLOW_LABEL[0]} fixed />
      <FlowArrow S={S} x={ARROW_X[0]} />
      <FlowBox S={S} x={FLOW_X[1]} label={FLOW_LABEL[1]} />
      <FlowArrow S={S} x={ARROW_X[1]} />
      <FlowBox S={S} x={FLOW_X[2]} label={FLOW_LABEL[2]} />
    </View>
  );
}

// ── the two opposed meters ───────────────────────────────────────────────────

function Meter({
  S, side, label, invert,
}: { S: SharedValue<any>; side: 'left' | 'right'; label: string; invert?: boolean }) {
  const fill = useAnimatedStyle(() => ({ transform: [{ scaleY: invert ? 1 - S.value.auth : S.value.auth }] }));
  const x = side === 'left' ? 20 : STAGE_W - 20 - MTR_W;
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Text style={[styles.meterLabel, { left: x - 12, width: MTR_W + 24 }]}>{label}</Text>
      <View style={[styles.meterTrack, { left: x }]}>
        <Animated.View style={[styles.meterFill, fill]} />
      </View>
    </View>
  );
}

// ── clash marks above the brawl, gone once the peace holds ───────────────────

function Spark({ S, x }: { S: SharedValue<any>; x: number }) {
  const st = useAnimatedStyle(() => {
    const blink = Math.max(0, Math.sin(S.value.t * 4.6 + x));
    return { opacity: blink * (1 - S.value.auth) * 0.85, transform: [{ scale: 0.7 + blink * 0.3 }] };
  });
  return (
    <Animated.View style={[styles.sparkWrap, { left: x - 11 }, st]} pointerEvents="none">
      <View style={[styles.sparkBar, { transform: [{ rotate: '0deg' }] }]} />
      <View style={[styles.sparkBar, { transform: [{ rotate: '45deg' }] }]} />
      <View style={[styles.sparkBar, { transform: [{ rotate: '90deg' }] }]} />
      <View style={[styles.sparkBar, { transform: [{ rotate: '135deg' }] }]} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 56, right: 56, top: GROUND, height: 1.5, backgroundColor: RULE },
  pedestal: {
    position: 'absolute', left: SOV_X - 28, top: GROUND - PED, width: 56, height: PED,
    backgroundColor: PAPER, borderWidth: 2, borderColor: INK,
    transformOrigin: '50% 100%',
  },

  headWrap: { position: 'absolute', left: 0, right: 0, top: 244, alignItems: 'center' },
  headText: {
    fontFamily: 'Inter_700Bold', fontSize: 13, letterSpacing: 1.8, lineHeight: 17, color: INK,
    includeFontPadding: false,
  },
  strike: {
    position: 'absolute', left: -5, right: -5, top: 8, height: 2.5,
    backgroundColor: INK, transformOrigin: '0% 50%',
  },

  flowBox: { position: 'absolute', top: FLOW_T, width: FLOW_W, height: FLOW_H },
  flowFixed: {
    borderWidth: 2, borderColor: INK, borderRadius: 5, backgroundColor: PAPER,
    alignItems: 'center', justifyContent: 'center',
  },
  flowOff: {
    borderWidth: 2, borderColor: SOFT, borderRadius: 5, backgroundColor: PAPER,
    alignItems: 'center', justifyContent: 'center',
  },
  flowOn: {
    borderWidth: 2, borderColor: INK, borderRadius: 5, backgroundColor: INK,
    alignItems: 'center', justifyContent: 'center',
  },
  flowTextFixed: {
    fontFamily: 'Inter_700Bold', fontSize: 12, letterSpacing: 0.8, color: INK, includeFontPadding: false,
  },
  flowTextOff: {
    fontFamily: 'Inter_700Bold', fontSize: 12, letterSpacing: 0.8, color: SOFT, includeFontPadding: false,
  },
  flowTextOn: {
    fontFamily: 'Inter_700Bold', fontSize: 12, letterSpacing: 0.8, color: PAPER, includeFontPadding: false,
  },
  arrowWrap: { position: 'absolute', top: FLOW_T + 6, width: 24, height: 22 },
  arrow: {
    position: 'absolute', left: 0, right: 0, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 17, color: SOFT, includeFontPadding: false,
  },
  arrowOn: { color: INK },

  meterLabel: {
    position: 'absolute', top: 364, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 1.2, color: SOFT, includeFontPadding: false,
  },
  meterTrack: {
    position: 'absolute', top: MTR_T, width: MTR_W, height: MTR_H,
    borderWidth: 1.5, borderColor: INK, borderRadius: 3, backgroundColor: PAPER, overflow: 'hidden',
  },
  meterFill: {
    position: 'absolute', left: 0, right: 0, top: 0, bottom: 0,
    backgroundColor: INK, transformOrigin: '50% 100%',
  },

  sparkWrap: { position: 'absolute', top: 353, width: 22, height: 22, alignItems: 'center', justifyContent: 'center' },
  sparkBar: { position: 'absolute', width: 2.5, height: 22, backgroundColor: INK, borderRadius: 1 },

  rider: { position: 'absolute', left: 0, top: 0 },
  swordBlade: { position: 'absolute', left: -2, top: -46, width: 4, height: 46, backgroundColor: INK },
  swordGuard: { position: 'absolute', left: -10, top: -4, width: 20, height: 3.5, backgroundColor: INK, borderRadius: 2 },
  swordPommel: { position: 'absolute', left: -3.5, top: 2, width: 7, height: 7, borderRadius: 3.5, backgroundColor: INK },
  crownBand: { position: 'absolute', left: -14, top: 0, width: 28, height: 8, backgroundColor: INK, borderRadius: 1 },
  crownPoint: {
    position: 'absolute', top: -8, width: 0, height: 0,
    borderLeftWidth: 3, borderRightWidth: 3, borderBottomWidth: 9,
    borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: INK,
  },
});

// Extremes: the headline's cap-line (244) down to the citizens' ankle joints
// (~507) on the ground rule at 500. The sovereign's crown and sword tip top out
// at y ≈ 320, twelve units clear of the flow boxes above them.
export function PoliticalLesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={PoliticalScene} band={[234, 514]} />;
}
