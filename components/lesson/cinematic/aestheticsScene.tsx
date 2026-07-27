import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { BEATS } from './aestheticsScript';
import {
  clamp01, ease01, lerp, mixStance, narratorHold, narratorLive, pose, stand,
  type Bundle, type Stance,
} from './rig';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER } from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';

// ─────────────────────────────────────────────────────────────────────────────
// WHY THINGS FEEL BEAUTIFUL — Kant's two strange facts, drawn as a chart.
//
// Stage left, a framed sunset labelled BEAUTY glows and asks for nothing. Below
// it, an apple on a stand labelled APPETITE that the figure reaches to take.
// Stage right, a panel that carries the argument as information design and swaps
// halfway through the lesson:
//   · WHAT IT ASKS OF YOU — two bars: APPLE full, SUNSET empty (disinterest).
//   · WHO MUST AGREE — one pip for "I like it", eight for "It is beautiful"
//     (the judgement of taste reaching out for universal assent).
// A ripple travels from the figure to a small crowd as the second half opens.
//
// CAMERA: none — design space is final space, so the figure stands on GROUND=500
// with its crown at ~361. Art occupies y 244..508 → band [234, 514].
// ─────────────────────────────────────────────────────────────────────────────

const TR = 0.82;

// the framed sunset
const FRAME_L = 24;
const FRAME_T = 246;
const FRAME_W = 144;
const FRAME_H = 108;
const SUN_CX = 69;                            // inside the frame's padding box
const SUN_CY = 66;
const SUN_R = 23;
const RAYS = [-70, -50, -30, -10, 10, 30, 50, 70];

// the glow, in stage coordinates, centred on the sun
const GLOW_R = 60;
const GLOW_CX = FRAME_L + 3 + SUN_CX;         // 96
const GLOW_CY = FRAME_T + 3 + SUN_CY;         // 315

// the chart panel
const P_L = 194;
const P_T = 244;
const P_W = 184;
const P_H = 104;
const TRACK_W = 108;

const FIG_X = 262;
const APPLE_CX = 228;
const APPLE_CY = 440;
const APPLE_R = 15;

const CROWD_X = [302, 328, 354, 380];
const RIPPLE_R = 52;
const RIPPLE_CX = 336;
const RIPPLE_CY = 452;

const HPOSE = BEATS.map((b) => b.hpose ?? 0);
const GLOW = BEATS.map((b) => (b.glow ? 1 : 0));
const APPLE = BEATS.map((b) => (b.apple ? 1 : 0));
const CROWD = BEATS.map((b) => (b.crowd ? 1 : 0));
const Q1 = BEATS.map((b) => (b.weigh === 'q1' ? 1 : 0));

function reachApple(t: number): Stance {
  'worklet';
  const s = stand(t);
  return { ...s, tilt: s.tilt - 0.06, neck: 0.10, fistR: { x: 25, y: -2 }, fistL: { x: -4, y: -4 } };
}
function hHold(code: number, t: number): Stance {
  'worklet';
  if (code === 7) return reachApple(t);
  if (code === 0) return stand(t);
  return narratorHold(code, t);
}
function hLive(code: number, t: number, bt: number): Stance {
  'worklet';
  if (code === 7) return reachApple(t);
  if (code === 0) return stand(t);
  return narratorLive(code, t, bt);
}

export default function AestheticsScene({ clock, bt, bi, qv }: SceneApi) {
  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / TR);
    const L = (a: number, b: number) => { 'worklet'; return lerp(a, b, tr); };
    const t = clock.value;
    const q = clamp01(qv.value);

    const figS = mixStance(hHold(HPOSE[p], t), hLive(HPOSE[n], t, bt.value), tr);
    // On Q1 the reaching hand and the apple fall away — pleasure that wants nothing.
    const appleOn = L(APPLE[p], APPLE[n]) * (Q1[n] === 1 ? 1 - ease01(q) : 1);
    const glowOn = L(GLOW[p], GLOW[n]) * (Q1[n] === 1 ? 1 + 0.4 * ease01(q) : 1);

    return {
      fig: pose(figS, FIG_X, GROUND, K_FIG, -1, 1),
      appleOn, glowOn, t,
      crowdOn: L(CROWD[p], CROWD[n]),
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const appleStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.appleOn }));

  return (
    <View style={styles.scene}>
      <Glow S={SCENE} off={0} />
      <Glow S={SCENE} off={0.33} />
      <Glow S={SCENE} off={0.66} />
      <SunsetFrame />
      <Panel S={SCENE} />
      <Crowd S={SCENE} />
      <View style={styles.ground} pointerEvents="none" />

      {/* the apple of appetite, on its labelled stand */}
      <Animated.View style={[StyleSheet.absoluteFill, appleStyle]} pointerEvents="none">
        <View style={styles.applePost} />
        <View style={styles.appleStem} />
        <View style={styles.apple} />
        <Text style={styles.appleLabel}>APPETITE</Text>
      </Animated.View>

      <Stickman D={DF} k={K_FIG} />
    </View>
  );
}

// ── the sunset: a framed picture that glows ──────────────────────────────────

function Glow({ S, off }: { S: SharedValue<any>; off: number }) {
  const st = useAnimatedStyle(() => {
    const ph = ((S.value.t * 0.42 + off) % 1 + 1) % 1;
    return { opacity: S.value.glowOn * (1 - ph) * 0.5, transform: [{ scale: 0.4 + ph * 0.6 }] };
  });
  return <Animated.View style={[styles.glowRing, st]} pointerEvents="none" />;
}

function SunsetFrame() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={styles.frame}>
        <View style={styles.horizon} />
        {/* The ray bar is laid out CENTRED on the origin (left/top = −half), so
            translate→rotate→translate places it at a true radius in every
            direction; laying it out at 0,0 skews the fan by half its own size. */}
        {RAYS.map((a) => (
          <View
            key={a}
            style={[
              styles.ray,
              { transform: [{ translateX: SUN_CX }, { translateY: SUN_CY }, { rotate: `${a}deg` }, { translateY: -34 }] },
            ]}
          />
        ))}
        <View style={styles.sun} />
      </View>
      <Text style={styles.frameLabel}>BEAUTY</Text>
    </View>
  );
}

// ── the crowd the judgement of taste reaches for ─────────────────────────────

function Ripple({ S, off }: { S: SharedValue<any>; off: number }) {
  const st = useAnimatedStyle(() => {
    const ph = ((S.value.t * 0.5 + off) % 1 + 1) % 1;
    return { opacity: S.value.crowdOn * (1 - ph) * 0.45, transform: [{ scale: 0.4 + ph * 0.6 }] };
  });
  return <Animated.View style={[styles.ripple, st]} pointerEvents="none" />;
}

function Crowd({ S }: { S: SharedValue<any> }) {
  const wrap = useAnimatedStyle(() => ({ opacity: S.value.crowdOn }));
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Ripple S={S} off={0} />
      <Ripple S={S} off={0.5} />
      <Animated.View style={[StyleSheet.absoluteFill, wrap]}>
        {CROWD_X.map((x) => (
          <View key={x} style={{ position: 'absolute', left: x - 9, top: 440 }}>
            <View style={styles.crowdHead} />
            <View style={styles.crowdBody} />
          </View>
        ))}
      </Animated.View>
    </View>
  );
}

// ── the panel: two charts, swapped by the lesson's second half ───────────────

function Bar({ top, label, fill, note }: { top: number; label: string; fill: number; note?: string }) {
  return (
    <View style={{ position: 'absolute', left: 12, top, flexDirection: 'row', alignItems: 'center' }}>
      <Text style={styles.barLabel}>{label}</Text>
      <View style={styles.track}>
        {fill > 0 ? <View style={[styles.trackFill, { width: TRACK_W * fill }]} /> : null}
        {note ? <Text style={styles.trackNote}>{note}</Text> : null}
      </View>
    </View>
  );
}

function Pips({ top, n }: { top: number; n: number }) {
  const out: number[] = [];
  for (let k = 0; k < n; k++) out.push(k);
  return (
    <View style={{ position: 'absolute', left: 12, top, flexDirection: 'row' }}>
      {out.map((k) => <View key={k} style={styles.pip} />)}
    </View>
  );
}

function Panel({ S }: { S: SharedValue<any> }) {
  const first = useAnimatedStyle(() => ({ opacity: 1 - S.value.crowdOn }));
  const second = useAnimatedStyle(() => ({ opacity: S.value.crowdOn }));
  return (
    <View style={styles.panel} pointerEvents="none">
      <Animated.View style={[StyleSheet.absoluteFill, first]}>
        <Text style={styles.panelCap}>WHAT IT ASKS OF YOU</Text>
        <Bar top={26} label="APPLE" fill={1} />
        <Bar top={54} label="SUNSET" fill={0} note="NOTHING" />
        <Text style={styles.panelFoot}>BEAUTY WANTS NOTHING</Text>
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, second]}>
        <Text style={styles.panelCap}>WHO MUST AGREE?</Text>
        <Text style={[styles.rowLabel, { top: 26 }]}>“I LIKE IT”</Text>
        <Pips top={42} n={1} />
        <Text style={[styles.rowLabel, { top: 62 }]}>“IT IS BEAUTIFUL”</Text>
        <Pips top={78} n={8} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 20, right: 14, top: GROUND, height: 1.5, backgroundColor: RULE },

  glowRing: {
    position: 'absolute', left: GLOW_CX - GLOW_R, top: GLOW_CY - GLOW_R,
    width: GLOW_R * 2, height: GLOW_R * 2, borderRadius: GLOW_R,
    borderWidth: 1.5, borderColor: SOFT,
  },
  frame: {
    position: 'absolute', left: FRAME_L, top: FRAME_T, width: FRAME_W, height: FRAME_H,
    borderWidth: 3, borderColor: INK, backgroundColor: PAPER, overflow: 'hidden',
  },
  frameLabel: {
    position: 'absolute', left: FRAME_L, top: FRAME_T + FRAME_H + 5, width: FRAME_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 2, color: SOFT, includeFontPadding: false,
  },
  horizon: { position: 'absolute', left: 0, right: 0, top: SUN_CY, height: 1.5, backgroundColor: INK },
  sun: {
    position: 'absolute', left: SUN_CX - SUN_R, top: SUN_CY - SUN_R, width: SUN_R * 2, height: SUN_R * 2,
    borderRadius: SUN_R, borderWidth: 2.5, borderColor: INK, backgroundColor: PAPER,
  },
  ray: { position: 'absolute', left: -1, top: -7, width: 2, height: 14, backgroundColor: INK },

  apple: {
    position: 'absolute', left: APPLE_CX - APPLE_R, top: APPLE_CY - APPLE_R,
    width: APPLE_R * 2, height: APPLE_R * 2, borderRadius: APPLE_R,
    borderWidth: 2.5, borderColor: INK, backgroundColor: PAPER,
  },
  appleStem: {
    position: 'absolute', left: APPLE_CX - 1, top: APPLE_CY - APPLE_R - 6, width: 2.5, height: 8,
    backgroundColor: INK, transform: [{ rotate: '18deg' }],
  },
  applePost: {
    position: 'absolute', left: APPLE_CX - 2, top: APPLE_CY + APPLE_R - 2, width: 4, height: GROUND - APPLE_CY - APPLE_R + 2,
    backgroundColor: SOFT,
  },
  // Callout to the LEFT of the stand: anything centred under the apple would run
  // into the figure's shins, which occupy x 248..276 all the way to the ground.
  appleLabel: {
    position: 'absolute', left: 138, top: 431, width: 72, textAlign: 'right',
    fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.8, color: SOFT, includeFontPadding: false,
  },

  ripple: {
    position: 'absolute', left: RIPPLE_CX - RIPPLE_R, top: RIPPLE_CY - RIPPLE_R,
    width: RIPPLE_R * 2, height: RIPPLE_R * 2, borderRadius: RIPPLE_R,
    borderWidth: 1.5, borderColor: SOFT,
  },
  crowdHead: { width: 18, height: 18, borderRadius: 9, backgroundColor: INK },
  crowdBody: { position: 'absolute', left: 7.5, top: 18, width: 3.5, height: 42, backgroundColor: INK },

  panel: {
    position: 'absolute', left: P_L, top: P_T, width: P_W, height: P_H,
    borderWidth: 2, borderColor: INK, borderRadius: 5, backgroundColor: PAPER,
  },
  panelCap: {
    position: 'absolute', left: 12, top: 8,
    fontFamily: 'Inter_700Bold', fontSize: 9.5, letterSpacing: 1.3, color: SOFT, includeFontPadding: false,
  },
  panelFoot: {
    position: 'absolute', left: 12, top: 82,
    fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 1.1, color: SOFT, includeFontPadding: false,
  },
  barLabel: {
    width: 50, fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 0.4, color: INK, includeFontPadding: false,
  },
  track: {
    width: TRACK_W, height: 16, borderWidth: 1.5, borderColor: INK, borderRadius: 3,
    backgroundColor: PAPER, overflow: 'hidden', justifyContent: 'center',
  },
  trackFill: { position: 'absolute', left: 0, top: 0, bottom: 0, backgroundColor: INK },
  trackNote: {
    textAlign: 'center', fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 1.2,
    color: SOFT, includeFontPadding: false,
  },
  rowLabel: {
    position: 'absolute', left: 12,
    fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 0.3, color: INK, includeFontPadding: false,
  },
  pip: { width: 14, height: 14, borderRadius: 3, borderWidth: 1.5, borderColor: INK, backgroundColor: INK, marginRight: 5 },
});

// Extremes: the chart panel's top edge (244) and the frame at 246 down to the
// figure's ankle joints (~507). The glow rings reach y 255..375 at full scale and
// the ripple rings y 400..504, both inside the slice.
export function AestheticsLesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={AestheticsScene} band={[234, 514]} />;
}
