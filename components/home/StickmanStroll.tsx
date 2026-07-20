import { useCallback, useEffect, useRef, useState } from 'react';
import { View, StyleSheet, type LayoutChangeEvent, type ViewStyle } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Circle, Line, G } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useFrameCallback,
  useDerivedValue,
  useAnimatedProps,
  runOnJS,
  type SharedValue,
} from 'react-native-reanimated';
import { useFocusEffect } from 'expo-router';
import { useUIStore } from '@/stores/uiStore';

// ─────────────────────────────────────────────────────────────────────────────
// A small ink figure who crosses the empty band under the home-screen actions.
//
// He performs ONCE PER APP OPEN, not once per visit to Home — the flag lives in
// uiStore (unpersisted, so a cold start clears it). Tabbing away merely pauses
// him; coming back resumes where he was rather than restarting.
//
// Four routines rotate, one per launch, so the app feels alive rather than
// looped. The index is kept in AsyncStorage and advanced when a routine starts:
//   0 stroll — an amble with two stops, one gazing up at the daily quote
//   1 run    — straight through at pace, no stops
//   2 wave   — brisk walk, halts a third of the way across and waves
//   3 meet   — brisk walk; a second figure enters from the right, they shake
//              hands mid-band, then each carries on and leaves by their own side
//
// He fades in a little way INSIDE the band and fades out before the far edge, so
// he is never seen clipping through a screen edge.
//
// This component *is* the flexible spacer it replaces — it claims no extra height
// of its own and renders nothing when the leftover band is too short, so it can
// never push a feature off-screen. He is non-interactive: taps pass through.
//
// RENDERING RULE (see components/welcome/ease.ts): on react-native-svg 15 +
// Fabric only transform/opacity repaint — animated geometry (x/y/cx/cy/d) does
// NOT. So every bone here is a fixed unit <Line> stretched with scaleX and
// rotated onto its joint vector, with circles filling the joints. Butt caps,
// because a non-uniform scaleX would smear a round cap into an ellipse.
// ─────────────────────────────────────────────────────────────────────────────

const AG = Animated.createAnimatedComponent(G);
const INK = '#1A1A1A';
const DEG = 180 / Math.PI;

const K = 0.44;
const LEN = {
  spine: 33 * K, head: 16 * K, thigh: 19 * K, shin: 18 * K,
  uarm: 17 * K, farm: 16 * K, hipW: 1 * K, shW: 3 * K, shDrop: 7 * K,
};
const STR = { torso: 12 * K, limb: 11 * K, headR: 20 * K };
// Feet-to-crown: hip + spine + neck + the head's full diameter. Measured, not
// guessed — an earlier value of 87*K undercounted him by ~7 units, which is why
// his head used to poke out of the top of the viewBox and get clipped.
const FIG_H = (34 + 33 + 16 + 20) * K;

// He is drawn in a fixed DESIGN space that the SVG viewBox maps onto whatever band
// actually exists. This matters: a desktop browser leaves ~214dp here, but a real
// 450dpi phone leaves only ~24dp once the masthead, quote, cards, streak, tab bar
// and safe areas have taken their share. Scaling to fit is the only thing that
// works on both — a fixed pixel size gets sliced off on a phone.
//
// DESIGN_H is deliberately taller than FIG_H + FLOOR: the surplus is headroom that
// drops his crown clear of the ruled-paper line that runs across the top of the
// band. Without it he stands at the very top of the viewBox and the rule cuts
// straight through his head.
const FLOOR = 3.5;                                  // ground sits this far off the bottom
const HEADROOM = 8;                                 // clear air above his crown
const DESIGN_H = FIG_H + FLOOR + HEADROOM;          // ≈ 57.3
const MIN_BAND = 14;                                // below this there's genuinely no room

// Where he becomes visible / vanishes, as a fraction of the band width. He fades
// up well inside the frame rather than sliding in from off-screen.
const IN_F = 0.13, OUT_F = 0.87, FADE_F = 0.07;

// Gait tables. `bobSign` flips the vertical bounce: a walk is highest at
// double-support, a run is highest during the flight phase. `tilt` leans the
// torso — NEGATIVE is forward, because the spine is built off Math.PI, so a
// positive angle rocks him onto his heels. `lean` is a separate, smaller thing:
// the rest angle the arms hang from.
const GAITS = [
  { S: 34 * K, lift: 13 * K, stance: 0.62, bob: 3.0 * K, bobSign: -1, tilt: 0.09, lean: 0.09, armSwing: 0.42, elBend: 0.18, standH: 34.0 * K },
  { S: 40 * K, lift: 24 * K, stance: 0.40, bob: 5.5 * K, bobSign: 1, tilt: -0.28, lean: 0.30, armSwing: 0.80, elBend: 1.10, standH: 30.5 * K },
];
const WALK = 0, RUN = 1;

// Speeds in design units/sec. Cadence follows from speed automatically (the phase
// is derived from distance), so these are the only knob that sets the pace.
const SPD_STROLL = 28, SPD_RUN = 80, SPD_WAVE = 42, SPD_MEET = 44;
const PAUSE_A = 2.0, PAUSE_B = 1.7;                 // stroll's two stops
const WAVE_D = 2.6;                                 // how long he waves
const SHAKE_D = 2.2;                                // how long the handshake lasts
const GAP = 15.0;                                   // half the gap between the two figures —
                                                    // tuned so their wrists coincide exactly

const ROT = 4;
const VKEY = 'philosophize-stroll-variant';

// ── worklet maths ────────────────────────────────────────────────────────────
function clamp01(x: number) { 'worklet'; return x < 0 ? 0 : x > 1 ? 1 : x; }
function lerp(a: number, b: number, t: number) { 'worklet'; return a + (b - a) * t; }
function ease01(t: number) { 'worklet'; const c = clamp01(t); return c * c * (3 - 2 * c); }

/** Ramp up over the first `f` units of travel and back down over the last `f`. */
function fadeAt(d: number, end: number, f: number) {
  'worklet';
  return Math.min(ease01(d / f), ease01((end - d) / f));
}

/** Two-bone IK; returns the mid joint (knee). */
function ik(hx: number, hy: number, tx: number, ty: number, l1: number, l2: number, bend: number) {
  'worklet';
  const dx = tx - hx, dy = ty - hy;
  const dist = Math.hypot(dx, dy) || 1e-4;
  const ux = dx / dist, uy = dy / dist;
  const d = Math.max(Math.abs(l1 - l2) + 0.01, Math.min(l1 + l2 - 0.01, dist));
  const a = (d * d + l1 * l1 - l2 * l2) / (2 * d);
  const h = Math.sqrt(Math.max(0, l1 * l1 - a * a));
  return { x: hx + ux * a - uy * h * bend, y: hy + uy * a + ux * h * bend };
}

/** Planted during stance, eased arc during swing — this is what stops foot skate. */
function footTarget(ph: number, S: number, lift: number, stance: number) {
  'worklet';
  const u = ((ph / (2 * Math.PI)) % 1 + 1) % 1;
  if (u < stance) {
    const s = u / stance;
    return { fx: S / 2 - S * s, fy: 0 };
  }
  const s = (u - stance) / (1 - stance);
  const se = s * s * (3 - 2 * s);
  return { fx: -S / 2 + S * se, fy: -lift * Math.sin(Math.PI * s) };
}

type XF = any[];
interface Bundle {
  opacity: number;
  thighL: XF; shinL: XF; thighR: XF; shinR: XF; torso: XF;
  uarmL: XF; farmL: XF; uarmR: XF; farmR: XF;
  kneeLp: XF; kneeRp: XF; ankLp: XF; ankRp: XF;
  elLp: XF; elRp: XF; wrLp: XF; wrRp: XF;
  pelp: XF; shp: XF; headp: XF;
}
const OFF: XF = [{ translateX: -9999 }, { translateY: -9999 }];
const BLANK: Bundle = {
  opacity: 0,
  thighL: OFF, shinL: OFF, thighR: OFF, shinR: OFF, torso: OFF,
  uarmL: OFF, farmL: OFF, uarmR: OFF, farmR: OFF,
  kneeLp: OFF, kneeRp: OFF, ankLp: OFF, ankRp: OFF,
  elLp: OFF, elRp: OFF, wrLp: OFF, wrRp: OFF,
  pelp: OFF, shp: OFF, headp: OFF,
};

interface FigArgs {
  x: number;        // ground position, design units
  dir: number;      // +1 facing/walking right, -1 left (mirrors the whole rig)
  groundY: number;
  gait: number;     // index into GAITS
  dist: number;     // distance walked — drives the step phase, so pauses keep feet locked
  t: number;        // wall clock, for the idle breath
  stand: number;    // 0 = striding, 1 = stopped and standing
  neck: number;     // head tilt: + looks up
  spineAdd: number;
  armRu: number;    // near-arm override (upper, elbow) …
  armRe: number;
  armMix: number;   // … blended in by this much
  alpha: number;
}

/** Builds one figure's full set of bone transforms for this frame. */
function figure(o: FigArgs): Bundle {
  'worklet';
  const g = GAITS[o.gait];
  const ph = 2 * Math.PI * o.dist * g.stance / g.S;
  const st = o.stand;

  const fR = footTarget(ph, g.S, g.lift, g.stance);
  const fL = footTarget(ph + Math.PI, g.S, g.lift, g.stance);
  const breathe = 0.9 * K * (0.5 - 0.5 * Math.cos(o.t * 2.0));

  const bob = lerp(g.bob * (0.5 + 0.5 * g.bobSign * Math.cos(2 * ph)), breathe, st);
  const tilt = lerp(g.tilt, 0.05, st);
  const lean = lerp(g.lean, 0.05, st);
  const spine = lerp(0.04 * Math.cos(ph), 0, st) + o.spineAdd;

  // Feet: swing arc while striding, settled shoulder-width apart while standing.
  const fRx = lerp(fR.fx, 6 * K, st), fRy = lerp(fR.fy, 0, st);
  const fLx = lerp(fL.fx, -5 * K, st), fLy = lerp(fL.fy, 0, st);

  let aRu = lerp(g.lean + g.armSwing * Math.cos(ph + Math.PI), -0.30, st);
  let aRe = lerp(g.elBend + 0.18 * Math.max(0, Math.sin(ph + Math.PI)), 0.34, st);
  const aLu = lerp(g.lean + g.armSwing * Math.cos(ph), 0.30, st);
  const aLe = lerp(g.elBend + 0.18 * Math.max(0, Math.sin(ph)), 0.34, st);
  aRu = lerp(aRu, o.armRu, o.armMix);
  aRe = lerp(aRe, o.armRe, o.armMix);

  // Assemble in LOCAL space (origin under his feet), then mirror by `dir` on the
  // way out — that is what lets the second figure walk left with the same maths.
  const py = o.groundY - g.standH - bob;
  const pel = { x: 0, y: py };
  const up = Math.PI + tilt;
  const chest = { x: Math.sin(up + spine) * LEN.spine, y: py + Math.cos(up + spine) * LEN.spine };
  const ha = up + spine + o.neck;
  const headC = { x: chest.x + Math.sin(ha) * LEN.head, y: chest.y + Math.cos(ha) * LEN.head };
  const rax = { x: Math.cos(lean), y: Math.sin(lean) };
  const hipL = { x: pel.x - LEN.hipW * rax.x, y: pel.y - LEN.hipW * rax.y };
  const hipR = { x: pel.x + LEN.hipW * rax.x, y: pel.y + LEN.hipW * rax.y };
  const shB = { x: chest.x + Math.sin(lean) * LEN.shDrop, y: chest.y + Math.cos(lean) * LEN.shDrop };
  const shL = { x: shB.x - LEN.shW * rax.x, y: shB.y - LEN.shW * rax.y };
  const shR = { x: shB.x + LEN.shW * rax.x, y: shB.y + LEN.shW * rax.y };
  const ankL = { x: fLx, y: o.groundY + fLy };
  const ankR = { x: fRx, y: o.groundY + fRy };
  const kneeL = ik(hipL.x, hipL.y, ankL.x, ankL.y, LEN.thigh, LEN.shin, -1);
  const kneeR = ik(hipR.x, hipR.y, ankR.x, ankR.y, LEN.thigh, LEN.shin, -1);
  const elL = { x: shL.x + Math.sin(aLu) * LEN.uarm, y: shL.y + Math.cos(aLu) * LEN.uarm };
  const wrL = { x: elL.x + Math.sin(aLu + aLe) * LEN.farm, y: elL.y + Math.cos(aLu + aLe) * LEN.farm };
  const elR = { x: shR.x + Math.sin(aRu) * LEN.uarm, y: shR.y + Math.cos(aRu) * LEN.uarm };
  const wrR = { x: elR.x + Math.sin(aRu + aRe) * LEN.farm, y: elR.y + Math.cos(aRu + aRe) * LEN.farm };

  const bone = (a: { x: number; y: number }, b: { x: number; y: number }) => {
    'worklet';
    const ax = o.x + o.dir * a.x, bx = o.x + o.dir * b.x;
    return [
      { translateX: ax }, { translateY: a.y },
      { rotate: `${Math.atan2(b.y - a.y, bx - ax) * DEG}deg` },
      { scaleX: Math.hypot(bx - ax, b.y - a.y) },
    ];
  };
  const at = (p: { x: number; y: number }) => {
    'worklet';
    return [{ translateX: o.x + o.dir * p.x }, { translateY: p.y }];
  };

  return {
    opacity: o.alpha,
    thighL: bone(hipL, kneeL), shinL: bone(kneeL, ankL),
    thighR: bone(hipR, kneeR), shinR: bone(kneeR, ankR),
    torso: bone(pel, chest),
    uarmL: bone(shL, elL), farmL: bone(elL, wrL),
    uarmR: bone(shR, elR), farmR: bone(elR, wrR),
    kneeLp: at(kneeL), kneeRp: at(kneeR),
    ankLp: at(ankL), ankRp: at(ankR),
    elLp: at(elL), elRp: at(elR), wrLp: at(wrL), wrRp: at(wrR),
    pelp: at(pel), shp: at(shB), headp: at(headC),
  };
}

// ── one figure's 20 animated nodes ───────────────────────────────────────────
function Figure({ D }: { D: SharedValue<Bundle> }) {
  const p = {
    thighL: useAnimatedProps(() => ({ transform: D.value.thighL })),
    shinL: useAnimatedProps(() => ({ transform: D.value.shinL })),
    thighR: useAnimatedProps(() => ({ transform: D.value.thighR })),
    shinR: useAnimatedProps(() => ({ transform: D.value.shinR })),
    torso: useAnimatedProps(() => ({ transform: D.value.torso })),
    uarmL: useAnimatedProps(() => ({ transform: D.value.uarmL })),
    farmL: useAnimatedProps(() => ({ transform: D.value.farmL })),
    uarmR: useAnimatedProps(() => ({ transform: D.value.uarmR })),
    farmR: useAnimatedProps(() => ({ transform: D.value.farmR })),
    kneeL: useAnimatedProps(() => ({ transform: D.value.kneeLp })),
    kneeR: useAnimatedProps(() => ({ transform: D.value.kneeRp })),
    ankL: useAnimatedProps(() => ({ transform: D.value.ankLp })),
    ankR: useAnimatedProps(() => ({ transform: D.value.ankRp })),
    elL: useAnimatedProps(() => ({ transform: D.value.elLp })),
    elR: useAnimatedProps(() => ({ transform: D.value.elRp })),
    wrL: useAnimatedProps(() => ({ transform: D.value.wrLp })),
    wrR: useAnimatedProps(() => ({ transform: D.value.wrRp })),
    pel: useAnimatedProps(() => ({ transform: D.value.pelp })),
    sh: useAnimatedProps(() => ({ transform: D.value.shp })),
    head: useAnimatedProps(() => ({ transform: D.value.headp })),
  };
  const fade = useAnimatedProps(() => ({ opacity: D.value.opacity }));
  const Limb = () => (
    <Line x1={0} y1={0} x2={1} y2={0} stroke={INK} strokeWidth={STR.limb} strokeLinecap="butt" />
  );

  return (
    <AG animatedProps={fade}>
      {/* back leg + arm first, so the near limbs read in front */}
      <AG animatedProps={p.thighL}><Limb /></AG>
      <AG animatedProps={p.shinL}><Limb /></AG>
      <AG animatedProps={p.uarmL}><Limb /></AG>
      <AG animatedProps={p.farmL}><Limb /></AG>
      <AG animatedProps={p.kneeL}><Circle cx={0} cy={0} r={STR.limb / 2} fill={INK} /></AG>
      <AG animatedProps={p.ankL}><Circle cx={0} cy={0} r={STR.limb / 2} fill={INK} /></AG>
      <AG animatedProps={p.elL}><Circle cx={0} cy={0} r={STR.limb / 2} fill={INK} /></AG>
      <AG animatedProps={p.wrL}><Circle cx={0} cy={0} r={STR.limb / 2} fill={INK} /></AG>

      <AG animatedProps={p.torso}>
        <Line x1={0} y1={0} x2={1} y2={0} stroke={INK} strokeWidth={STR.torso} strokeLinecap="butt" />
      </AG>
      <AG animatedProps={p.pel}><Circle cx={0} cy={0} r={STR.torso / 2} fill={INK} /></AG>
      <AG animatedProps={p.sh}><Circle cx={0} cy={0} r={STR.torso / 2} fill={INK} /></AG>

      <AG animatedProps={p.thighR}><Limb /></AG>
      <AG animatedProps={p.shinR}><Limb /></AG>
      <AG animatedProps={p.kneeR}><Circle cx={0} cy={0} r={STR.limb / 2} fill={INK} /></AG>
      <AG animatedProps={p.ankR}><Circle cx={0} cy={0} r={STR.limb / 2} fill={INK} /></AG>

      <AG animatedProps={p.head}><Circle cx={0} cy={0} r={STR.headR} fill={INK} /></AG>

      <AG animatedProps={p.uarmR}><Limb /></AG>
      <AG animatedProps={p.farmR}><Limb /></AG>
      <AG animatedProps={p.elR}><Circle cx={0} cy={0} r={STR.limb / 2} fill={INK} /></AG>
      <AG animatedProps={p.wrR}><Circle cx={0} cy={0} r={STR.limb / 2} fill={INK} /></AG>
    </AG>
  );
}

interface Props { style?: ViewStyle }

export default function StickmanStroll({ style }: Props) {
  const launchDone = useUIStore((s) => s.launchDone);
  const strollPlayed = useUIStore((s) => s.strollPlayed);
  const markStrollPlayed = useUIStore((s) => s.markStrollPlayed);

  const [band, setBand] = useState({ w: 0, h: 0 });
  const [variantIdx, setVariantIdx] = useState<number | null>(null);
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);

  const w = useSharedValue(0);
  const clock = useSharedValue(0);
  const variant = useSharedValue(0);
  const frameRef = useRef<{ setActive: (v: boolean) => void } | null>(null);

  const finish = useCallback(() => {
    frameRef.current?.setActive(false);
    setDone(true);                                  // unmount him: zero cost once he's gone
  }, []);

  // ── the timeline ───────────────────────────────────────────────────────────
  // Resolves, for this instant: how far each figure has walked, whether either is
  // standing/waving/shaking, and when the whole routine is over.
  const SIM = useDerivedValue(() => {
    const t = clock.value, W = w.value, v = variant.value;
    const inX = IN_F * W, outX = OUT_F * W, T = outX - inX, F = FADE_F * W;

    let gait = WALK, dist = 0, stand = 0, neck = 0, spineAdd = 0;
    let armRu = 0, armRe = 0, armMix = 0, total = 1;
    let bOn = 0, bDist = 0, bStand = 0, bArmRu = 0, bArmRe = 0, bArmMix = 0;

    if (v === 1) {
      // RUN — straight through, no stops.
      gait = RUN;
      dist = t * SPD_RUN;
      total = T / SPD_RUN;
    } else if (v === 2) {
      // WAVE — brisk walk, halt a third of the way across, wave, carry on.
      const d1 = T / 3, t1 = d1 / SPD_WAVE;
      total = T / SPD_WAVE + WAVE_D;
      if (t < t1) {
        dist = t * SPD_WAVE;
      } else if (t < t1 + WAVE_D) {
        const wt = t - t1;
        dist = d1;
        const env = Math.min(ease01(wt / 0.30), ease01((WAVE_D - wt) / 0.30));
        stand = env;
        armMix = env;
        // Kept around 45° up-and-FORWARD, not straight up: his head is a big solid
        // disc and a vertical arm vanishes into it, killing the read at this size.
        armRu = 1.80;
        armRe = 0.50 + 0.38 * Math.sin(wt * 2 * Math.PI * 2.8);   // forearm rocks: the wave
        neck = 0.10 * env;
        spineAdd = -0.03 * env;
      } else {
        dist = d1 + (t - t1 - WAVE_D) * SPD_WAVE;
      }
    } else if (v === 3) {
      // MEET — a second figure enters from the right when he is a third across;
      // both walk at the same pace, so the meeting point falls out of the maths.
      const V = SPD_MEET;
      const tB = (T / 3) / V;                        // when the second figure appears
      const mx = (inX + outX + T / 3) / 2;           // where they end up meeting
      const aMeet = (mx - GAP) - inX;                // distance each covers to get there
      const bMeet = outX - (mx + GAP);
      const tMeet = aMeet / V;
      total = tMeet + SHAKE_D + Math.max(T - aMeet, T - bMeet) / V;

      if (t < tMeet) {
        dist = t * V;
        bDist = t < tB ? 0 : (t - tB) * V;
      } else if (t < tMeet + SHAKE_D) {
        const st = t - tMeet;
        dist = aMeet; bDist = bMeet;
        const env = Math.min(ease01(st / 0.28), ease01((SHAKE_D - st) / 0.28));
        const pump = Math.sin(st * 2 * Math.PI * 2.4) * env;
        stand = env; bStand = env;
        armMix = env; bArmMix = env;
        // Both reach out level and nearly straight, so they can clasp at arm's
        // length — any closer and two heads this size merge into one blob. GAP is
        // tuned to put both wrists on the same point. The pump adds δ to the upper
        // arm and subtracts it from the elbow, which leaves the forearm's direction
        // untouched and swings the clasped hands vertically, as a real shake does.
        armRu = 1.32 + 0.22 * pump; armRe = 0.30 - 0.22 * pump;
        bArmRu = armRu; bArmRe = armRe;
        neck = 0.05 * env;
      } else {
        const s = t - tMeet - SHAKE_D;
        dist = aMeet + s * V;
        bDist = bMeet + s * V;
      }
      bOn = t >= tB ? 1 : 0;
    } else {
      // STROLL — an amble with two stops: one looking up at the quote, one scanning.
      const d1 = 0.30 * T, d2 = 0.33 * T;
      const t1 = d1 / SPD_STROLL;
      const t2 = t1 + PAUSE_A + d2 / SPD_STROLL;
      total = T / SPD_STROLL + PAUSE_A + PAUSE_B;
      if (t < t1) {
        dist = t * SPD_STROLL;
      } else if (t < t1 + PAUSE_A) {
        const pt = t - t1;
        dist = d1;
        stand = Math.min(ease01(pt / 0.34), ease01((PAUSE_A - pt) / 0.34));
        neck = 0.44 * stand;                         // gazes up at the daily quote
        spineAdd = -0.05 * stand;
      } else if (t < t2) {
        dist = d1 + (t - t1 - PAUSE_A) * SPD_STROLL;
      } else if (t < t2 + PAUSE_B) {
        const pt = t - t2;
        dist = d1 + d2;
        stand = Math.min(ease01(pt / 0.34), ease01((PAUSE_B - pt) / 0.34));
        neck = 0.30 * stand * Math.sin(pt * 2.3);    // has a look around
      } else {
        dist = d1 + d2 + (t - t2 - PAUSE_B) * SPD_STROLL;
      }
    }

    return {
      total,
      a: {
        x: inX + dist, dir: 1, groundY: DESIGN_H - FLOOR, gait, dist, t,
        stand, neck, spineAdd, armRu, armRe, armMix,
        alpha: W > 0 ? fadeAt(dist, T, F) : 0,
      } as FigArgs,
      b: {
        x: outX - bDist, dir: -1, groundY: DESIGN_H - FLOOR, gait: WALK, dist: bDist, t,
        stand: bStand, neck: 0, spineAdd: 0, armRu: bArmRu, armRe: bArmRe, armMix: bArmMix,
        alpha: bOn && W > 0 ? fadeAt(bDist, T, F) : 0,
      } as FigArgs,
      bOn,
    };
  });

  const DA = useDerivedValue<Bundle>(() => (w.value > 0 ? figure(SIM.value.a) : BLANK));
  const DB = useDerivedValue<Bundle>(() =>
    w.value > 0 && SIM.value.bOn ? figure(SIM.value.b) : BLANK
  );

  const frame = useFrameCallback((f) => {
    'worklet';
    if (w.value <= 0) return;
    let dt = (f.timeSincePreviousFrame ?? 16) / 1000;
    if (dt > 0.05) dt = 0.05;                       // a stall must not teleport him
    clock.value += dt;
    const total = SIM.value.total;
    if (total > 0 && clock.value > total) runOnJS(finish)();
  }, false);
  frameRef.current = frame;

  // Which routine is up this launch. Read once on mount; the counter only advances
  // when a routine actually starts, so a Home screen he never got to perform on
  // doesn't burn a turn in the rotation.
  useEffect(() => {
    let alive = true;
    AsyncStorage.getItem(VKEY)
      .then((raw) => {
        if (!alive) return;
        const n = raw === null ? 0 : parseInt(raw, 10);
        setVariantIdx(Number.isFinite(n) ? ((n % ROT) + ROT) % ROT : 0);
      })
      .catch(() => { if (alive) setVariantIdx(0); });
    return () => { alive = false; };
  }, []);

  // Start exactly once per app open, and only once the launch screen has lifted —
  // it covers the whole boot, so a timeline begun at mount would play to a hidden
  // screen. Focus and layout arrive in either order, hence the combined guard.
  useEffect(() => {
    if (started || strollPlayed) return;
    if (!launchDone || variantIdx === null) return;
    if (band.w <= 0 || band.h < MIN_BAND) return;
    variant.value = variantIdx;
    clock.value = 0;
    setStarted(true);
    markStrollPlayed();
    AsyncStorage.setItem(VKEY, String((variantIdx + 1) % ROT)).catch(() => {});
  }, [started, strollPlayed, launchDone, variantIdx, band.w, band.h]);

  // Tabbing away pauses him rather than restarting him — the clock simply stops.
  const [focused, setFocused] = useState(false);
  useFocusEffect(
    useCallback(() => {
      setFocused(true);
      return () => setFocused(false);
    }, [])
  );

  useEffect(() => {
    frame.setActive(started && focused && !done);
    return () => frame.setActive(false);
  }, [started, focused, done]);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    // Work in DESIGN units: the viewBox maps DESIGN_H onto the real band height, so
    // the same rig fits a 24dp phone band and a 200dp tall one without changing.
    w.value = height > 0 ? width * (DESIGN_H / height) : 0;
    setBand((b) => (Math.abs(b.w - width) < 1 && Math.abs(b.h - height) < 1 ? b : { w: width, h: height }));
  }, []);

  const show = started && !done && band.w > 0 && band.h >= MIN_BAND;
  const designW = band.h > 0 ? band.w * (DESIGN_H / band.h) : band.w;

  return (
    <View style={[styles.band, style]} onLayout={onLayout} pointerEvents="none">
      {show ? (
        <Svg
          width={band.w}
          height={band.h}
          viewBox={`0 0 ${designW} ${DESIGN_H}`}
          preserveAspectRatio="xMidYMax meet"
          pointerEvents="none"
        >
          <Figure D={DA} />
          <Figure D={DB} />
        </Svg>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  // Claims exactly the leftover space the old spacer did — no more, no less.
  band: { flex: 1, minHeight: 16, justifyContent: 'flex-end', overflow: 'hidden' },
});
