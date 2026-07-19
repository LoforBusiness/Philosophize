import { useCallback, useRef, useState } from 'react';
import { View, StyleSheet, type LayoutChangeEvent, type ViewStyle } from 'react-native';
import Svg, { Circle, Line, G } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useFrameCallback,
  useDerivedValue,
  useAnimatedProps,
  runOnJS,
} from 'react-native-reanimated';
import { useFocusEffect } from 'expo-router';

// ─────────────────────────────────────────────────────────────────────────────
// A small ink stickman who strolls across the empty band under the home-screen
// actions: in from the left, a couple of casual stops to look around (and up at
// the daily quote), then out the right. He plays ONCE per visit and the frame
// callback is switched off the moment he leaves, so an idle Home costs nothing.
//
// This component *is* the flexible spacer it replaces — it claims no extra
// height of its own, and renders nothing at all when the leftover band is too
// short (small phones), so it can never push a feature off-screen or clip.
//
// He is non-interactive: taps pass straight through to whatever is beneath.
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

// Figure scale — deliberately small, matching the two-stickman scene.
const K = 0.58;
const LEN = {
  spine: 33 * K, head: 16 * K, thigh: 19 * K, shin: 18 * K,
  uarm: 17 * K, farm: 16 * K, hipW: 1 * K, shW: 3 * K, shDrop: 7 * K,
};
const STR = { torso: 12 * K, limb: 11 * K, headR: 20 * K };
const WALK = {
  standH: 34 * K, bob: 3 * K, lean: 0.09, S: 34 * K, lift: 13 * K,
  stanceFrac: 0.62, armSwing: 0.42, elBend: 0.18,
};
const CAD = 1.15;                                  // a slightly livelier amble
const SPD = (WALK.S / WALK.stanceFrac) * CAD;      // px/s — foot-lock demands this exact ratio
const PAUSE_A = 2.0;                               // stop 1: looks up at the quote
const PAUSE_B = 1.7;                               // stop 2: looks around
const START_X = -34;                               // starts fully off the left edge
const MIN_BAND = 56;                               // below this there's no room for him

// ── worklet maths ────────────────────────────────────────────────────────────
function clamp01(x: number) { 'worklet'; return x < 0 ? 0 : x > 1 ? 1 : x; }
function lerp(a: number, b: number, t: number) { 'worklet'; return a + (b - a) * t; }
function ease01(t: number) { 'worklet'; const c = clamp01(t); return c * c * (3 - 2 * c); }

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
function footTarget(ph: number) {
  'worklet';
  const u = ((ph / (2 * Math.PI)) % 1 + 1) % 1;
  if (u < WALK.stanceFrac) {
    const s = u / WALK.stanceFrac;
    return { fx: WALK.S / 2 - WALK.S * s, fy: 0 };
  }
  const s = (u - WALK.stanceFrac) / (1 - WALK.stanceFrac);
  const se = s * s * (3 - 2 * s);
  return { fx: -WALK.S / 2 + WALK.S * se, fy: -WALK.lift * Math.sin(Math.PI * s) };
}

interface Props { style?: ViewStyle }

export default function StickmanStroll({ style }: Props) {
  const [band, setBand] = useState({ w: 0, h: 0 });
  const [done, setDone] = useState(false);
  const w = useSharedValue(0);
  const h = useSharedValue(0);
  const clock = useSharedValue(0);
  const frameRef = useRef<{ setActive: (v: boolean) => void } | null>(null);

  const finish = useCallback(() => {
    frameRef.current?.setActive(false);
    setDone(true);                                  // unmount him: zero cost once he's gone
  }, []);

  const frame = useFrameCallback((f) => {
    'worklet';
    const W = w.value;
    if (W <= 0) return;
    let dt = (f.timeSincePreviousFrame ?? 16) / 1000;
    if (dt > 0.05) dt = 0.05;                       // a stall must not teleport him
    clock.value += dt;
    const total = (W - START_X + 40) / SPD + PAUSE_A + PAUSE_B;
    if (clock.value > total) runOnJS(finish)();
  }, false);
  frameRef.current = frame;

  // One crossing per visit: restart on focus, freeze while the tab is away.
  useFocusEffect(
    useCallback(() => {
      clock.value = 0;
      setDone(false);
      if (band.w > 0 && band.h >= MIN_BAND) frame.setActive(true);
      return () => frame.setActive(false);
    }, [band.w, band.h])
  );

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    w.value = width; h.value = height;
    setBand((b) => (Math.abs(b.w - width) < 1 && Math.abs(b.h - height) < 1 ? b : { w: width, h: height }));
  }, []);

  // ── the whole skeleton for this frame ──────────────────────────────────────
  const D = useDerivedValue(() => {
    const t = clock.value, W = w.value, H = h.value;
    const walkNeeded = (W - START_X + 40) / SPD;
    const w1 = walkNeeded * 0.28, w2 = walkNeeded * 0.30;

    // Resolve how far he has walked, and whether he's mid-pause.
    let dist: number, pauseT = 0, pauseDur = 1, look = 0;
    let s = t;
    if (s < w1) { dist = s * SPD; }
    else if ((s -= w1) < PAUSE_A) { dist = w1 * SPD; pauseT = s; pauseDur = PAUSE_A; look = 1; }
    else if ((s -= PAUSE_A) < w2) { dist = (w1 + s) * SPD; }
    else if ((s -= w2) < PAUSE_B) { dist = (w1 + w2) * SPD; pauseT = s; pauseDur = PAUSE_B; look = 2; }
    else { s -= PAUSE_B; dist = (w1 + w2 + s) * SPD; }

    // Phase from DISTANCE (not time) so the feet stay locked across pauses.
    const ph = 2 * Math.PI * dist * WALK.stanceFrac / WALK.S;
    const x = START_X + dist;
    const groundY = H - 11;                         // a little clear of whatever sits below

    // Ease between striding and standing still at each stop.
    const stand = look === 0 ? 0
      : Math.min(ease01(pauseT / 0.34), ease01((pauseDur - pauseT) / 0.34));

    // Look: tilt the head back (reads as gazing up at the quote), or scan around.
    const neck = look === 1 ? 0.44 * stand
      : look === 2 ? 0.30 * stand * Math.sin(pauseT * 2.3)
      : 0;
    const breathe = 0.9 * K * (0.5 - 0.5 * Math.cos(t * 2.0));

    // Walk pose ⟷ standing pose.
    const fR = footTarget(ph), fL = footTarget(ph + Math.PI);
    const bob = lerp(WALK.bob * (0.5 - 0.5 * Math.cos(2 * ph)), breathe, stand);
    const lean = lerp(WALK.lean, 0.05, stand);
    const spine = lerp(0.04 * Math.cos(ph), 0, stand) + (look === 1 ? -0.05 * stand : 0);
    const footRx = lerp(x + fR.fx, x + 6 * K, stand), footRy = lerp(groundY + fR.fy, groundY, stand);
    const footLx = lerp(x + fL.fx, x - 5 * K, stand), footLy = lerp(groundY + fL.fy, groundY, stand);
    const armRu = lerp(WALK.lean + WALK.armSwing * Math.cos(ph + Math.PI), -0.30, stand);
    const armRe = lerp(WALK.elBend + 0.18 * Math.max(0, Math.sin(ph + Math.PI)), 0.34, stand);
    const armLu = lerp(WALK.lean + WALK.armSwing * Math.cos(ph), 0.30, stand);
    const armLe = lerp(WALK.elBend + 0.18 * Math.max(0, Math.sin(ph)), 0.34, stand);

    // Assemble (side view, facing right).
    const py = groundY - WALK.standH - bob;
    const pel = { x, y: py };
    const up = Math.PI + lean;
    const chest = { x: pel.x + Math.sin(up + spine) * LEN.spine, y: pel.y + Math.cos(up + spine) * LEN.spine };
    const ha = up + spine + neck;
    const headC = { x: chest.x + Math.sin(ha) * LEN.head, y: chest.y + Math.cos(ha) * LEN.head };
    const rax = { x: Math.cos(lean), y: Math.sin(lean) };
    const hipL = { x: pel.x - LEN.hipW * rax.x, y: pel.y - LEN.hipW * rax.y };
    const hipR = { x: pel.x + LEN.hipW * rax.x, y: pel.y + LEN.hipW * rax.y };
    const shB = { x: chest.x + Math.sin(lean) * LEN.shDrop, y: chest.y + Math.cos(lean) * LEN.shDrop };
    const shL = { x: shB.x - LEN.shW * rax.x, y: shB.y - LEN.shW * rax.y };
    const shR = { x: shB.x + LEN.shW * rax.x, y: shB.y + LEN.shW * rax.y };
    const kneeL = ik(hipL.x, hipL.y, footLx, footLy, LEN.thigh, LEN.shin, -1);
    const kneeR = ik(hipR.x, hipR.y, footRx, footRy, LEN.thigh, LEN.shin, -1);
    const elL = { x: shL.x + Math.sin(armLu) * LEN.uarm, y: shL.y + Math.cos(armLu) * LEN.uarm };
    const wrL = { x: elL.x + Math.sin(armLu + armLe) * LEN.farm, y: elL.y + Math.cos(armLu + armLe) * LEN.farm };
    const elR = { x: shR.x + Math.sin(armRu) * LEN.uarm, y: shR.y + Math.cos(armRu) * LEN.uarm };
    const wrR = { x: elR.x + Math.sin(armRu + armRe) * LEN.farm, y: elR.y + Math.cos(armRu + armRe) * LEN.farm };

    const bone = (a: { x: number; y: number }, b: { x: number; y: number }) => {
      'worklet';
      return [
        { translateX: a.x }, { translateY: a.y },
        { rotate: `${Math.atan2(b.y - a.y, b.x - a.x) * DEG}deg` },
        { scaleX: Math.hypot(b.x - a.x, b.y - a.y) },
      ];
    };
    const at = (p: { x: number; y: number }) => { 'worklet'; return [{ translateX: p.x }, { translateY: p.y }]; };

    return {
      thighL: bone(hipL, kneeL), shinL: bone(kneeL, { x: footLx, y: footLy }),
      thighR: bone(hipR, kneeR), shinR: bone(kneeR, { x: footRx, y: footRy }),
      torso: bone(pel, chest),
      uarmL: bone(shL, elL), farmL: bone(elL, wrL),
      uarmR: bone(shR, elR), farmR: bone(elR, wrR),
      kneeLp: at(kneeL), kneeRp: at(kneeR),
      ankLp: at({ x: footLx, y: footLy }), ankRp: at({ x: footRx, y: footRy }),
      elLp: at(elL), elRp: at(elR), wrLp: at(wrL), wrRp: at(wrR),
      pelp: at(pel), shp: at(shB), headp: at(headC),
    };
  });

  // one hook per animated node — transform only, never geometry
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

  const show = !done && band.w > 0 && band.h >= MIN_BAND;
  const Limb = () => (
    <Line x1={0} y1={0} x2={1} y2={0} stroke={INK} strokeWidth={STR.limb} strokeLinecap="butt" />
  );

  return (
    <View style={[styles.band, style]} onLayout={onLayout} pointerEvents="none">
      {show ? (
        <Svg width={band.w} height={band.h} pointerEvents="none">
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
        </Svg>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  // Claims exactly the leftover space the old spacer did — no more, no less.
  band: { flex: 1, minHeight: 16, justifyContent: 'flex-end', overflow: 'hidden' },
});
