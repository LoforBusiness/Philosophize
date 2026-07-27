import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { clamp01, ease01, emoteHold, emoteLive, lerp, mixStance, pose, type Bundle } from './rig';
import { BEATS } from './epistemology4Script';
import { K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER } from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';

// ─────────────────────────────────────────────────────────────────────────────
// A LABELLED FLOW DIAGRAM standing over the two arguers.
//
//   LEFT PANEL  (y 196–278)   [eye] ──•••──▸ [slate]      experience writes it in
//   RIGHT PANEL (y 196–278)   a mind that already holds 2+2=4, A=A, no square circles
//   KANT BOX    (y 286–340)   both panels feed down into one: DATA + FORMS = EXPERIENCE
//   THE ARGUERS (y 354–500)   empiricist facing right, rationalist facing left
//
// On the question beat the panels give way to four big name plates, so Q1 is answered
// by tapping the stage. The camera is identity, so these constants ARE final stage
// coordinates and the band can be read straight off them.
// ─────────────────────────────────────────────────────────────────────────────

const E_X = 96;
const R_X = 296;

const PAN_T = 196;
const PAN_H = 82;
const PAN_W = 176;
const PAN_L = 14;
const PAN_R = 210;

// left panel internals
const EYE = { x: 24, y: 222, w: 42, h: 26 };
const FLOW = { y: 234, x0: 72, x1: 106 };
const FLOW_RUN = FLOW.x1 - FLOW.x0 - 6;      // how far a sensation travels the arrow
const SLATE = { x: 112, y: 218, w: 70, h: 52 };
const MARKS = [0.15, 0.38, 0.6, 0.82];       // a slate line lands as fill crosses each

// right panel internals
const AXIOMS = ['2 + 2 = 4', 'A = A', 'NO SQUARE CIRCLES'];

// ── the scene-answered question (Q1): four name plates, 176 × 44 each ───────
const PLATES = [
  { id: 'locke', label: 'JOHN LOCKE', x: PAN_L, y: 220, correct: true },
  { id: 'desc', label: 'DESCARTES', x: PAN_R, y: 220, correct: false },
  { id: 'plato', label: 'PLATO', x: PAN_L, y: 274, correct: false },
  { id: 'leib', label: 'LEIBNIZ', x: PAN_R, y: 274, correct: false },
];

const E_CODE = BEATS.map((b) => b.e ?? 0);
const R_CODE = BEATS.map((b) => b.r ?? 0);
const FILL = BEATS.map((b) => b.fill ?? 0);
const GLOW = BEATS.map((b) => b.glow ?? 0);
const BRIDGE = BEATS.map((b) => b.bridge ?? 0);

export default function Epistemology4Scene({ clock, bt, bi, i, picked, onPick }: SceneApi) {
  const cur = BEATS[i];
  const answered = picked !== null;
  const asking = !!cur.interact;

  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / 0.85);
    const L = (a: number, b: number) => { 'worklet'; return lerp(a, b, tr); };
    const t = clock.value;

    const e = mixStance(emoteHold(E_CODE[p], t), emoteLive(E_CODE[n], t, bt.value), tr);
    const r = mixStance(emoteHold(R_CODE[p], t), emoteLive(R_CODE[n], t, bt.value), tr);
    return {
      e: pose(e, E_X, 500, K_FIG, 1, 1),
      r: pose(r, R_X, 500, K_FIG, -1, 1),
      fill: L(FILL[p], FILL[n]),
      glow: L(GLOW[p], GLOW[n]),
      bridge: L(BRIDGE[p], BRIDGE[n]),
      t,
    };
  });

  const DE = useDerivedValue<Bundle>(() => SCENE.value.e);
  const DR = useDerivedValue<Bundle>(() => SCENE.value.r);
  const auraStyle = useAnimatedStyle(() => {
    const g = SCENE.value.glow, pulse = 0.72 + 0.28 * Math.sin(SCENE.value.t * 2.6);
    return { opacity: g * 0.85 * pulse };
  });
  const kantStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.bridge,
    transform: [{ translateY: (1 - SCENE.value.bridge) * -8 }],
  }));

  return (
    <Animated.View style={styles.scene}>
      {/* ── the diagram: two schools, then Kant's join ─────────────────────── */}
      {!asking && (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          {/* LEFT — experience writes it in */}
          <View style={[styles.panel, { left: PAN_L }]}>
            <Text style={styles.panHdr}>THE MIND: BLANK PAPER</Text>
          </View>
          <View style={[styles.eye, { left: PAN_L + EYE.x, top: EYE.y }]}><View style={styles.pupil} /></View>
          <Text style={[styles.tiny, { left: PAN_L + EYE.x - 4, top: EYE.y + EYE.h + 4, width: EYE.w + 8 }]}>SENSES</Text>
          <View style={[styles.flowLine, { left: PAN_L + FLOW.x0, top: FLOW.y, width: FLOW.x1 - FLOW.x0 }]} />
          <View style={[styles.flowHead, { left: PAN_L + FLOW.x1 - 5, top: FLOW.y - 3 }]} />
          {[0, 1, 2].map((k) => <Drop key={k} S={SCENE} k={k} />)}
          <View style={[styles.slate, { left: PAN_L + SLATE.x, top: SLATE.y }]}>
            {MARKS.map((th, k) => <Mark key={th} S={SCENE} th={th} idx={k} />)}
          </View>

          {/* RIGHT — reason already holds it */}
          <View style={[styles.panel, { left: PAN_R }]}>
            <Text style={styles.panHdr}>REASON ALONE GETS THERE</Text>
          </View>
          <Animated.View style={[styles.aura, { left: PAN_R + 6, top: 212 }, auraStyle]} />
          <View style={[styles.mind, { left: PAN_R + 12, top: 218 }]}>
            {AXIOMS.map((a, k) => <Axiom key={a} S={SCENE} text={a} k={k} />)}
          </View>

          {/* KANT — both feed one box */}
          <Animated.View style={[StyleSheet.absoluteFill, kantStyle]}>
            <View style={[styles.feeder, { left: 120 }]} />
            <View style={[styles.feeder, { left: 280 }]} />
            <View style={styles.kant}>
              <Text style={styles.kantTag}>KANT’S TRUCE</Text>
              <Text style={styles.kantA}>SENSE DATA  +  MIND’S FORMS</Text>
              <Text style={styles.kantB}>=  EXPERIENCE</Text>
            </View>
          </Animated.View>
        </View>
      )}

      {/* ── the two arguers ───────────────────────────────────────────────── */}
      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DE} k={K_FIG} />
      <Stickman D={DR} k={K_FIG} />

      {/* ── Q1 answered in the scene: tap the blank-slate thinker ─────────── */}
      {asking && (
        <>
          <Text style={styles.askLabel}>TAP THE BLANK-SLATE THINKER</Text>
          {PLATES.map((pl) => (
            <Pressable
              key={pl.id}
              style={[styles.plateHit, { left: pl.x, top: pl.y }]}
              disabled={answered}
              onPress={() => onPick(pl.id, pl.correct)}
            >
              <View
                style={[
                  styles.plate,
                  answered && pl.correct && styles.plateRight,
                  answered && picked === pl.id && !pl.correct && styles.plateWrong,
                ]}
              >
                <Text style={[styles.plateT, answered && pl.correct && styles.plateTOn]}>{pl.label}</Text>
              </View>
            </Pressable>
          ))}
        </>
      )}
    </Animated.View>
  );
}

/** A sensation travelling the arrow from the eye into the slate. */
function Drop({ S, k }: { S: SharedValue<any>; k: number }) {
  const st = useAnimatedStyle(() => {
    const active = clamp01(S.value.fill * 3);
    const frac = ((S.value.t * 0.62 + k * 0.34) % 1 + 1) % 1;
    return {
      opacity: active * Math.sin(Math.PI * frac),
      transform: [{ translateX: FLOW_RUN * frac }],
    };
  });
  return <Animated.View style={[styles.drop, { left: PAN_L + FLOW.x0 + 2, top: FLOW.y - 2 }, st]} />;
}

/** A line written onto Locke's white paper once the fill passes its threshold. */
function Mark({ S, th, idx }: { S: SharedValue<any>; th: number; idx: number }) {
  const st = useAnimatedStyle(() => {
    const on = clamp01((S.value.fill - th) / 0.12);
    return { opacity: on, transform: [{ scaleX: on }] };
  });
  return <Animated.View style={[styles.mark, { top: 9 + idx * 10 }, st]} />;
}

/** One item of the mind's a-priori furniture, assembling as the glow comes up. */
function Axiom({ S, text, k }: { S: SharedValue<any>; text: string; k: number }) {
  const st = useAnimatedStyle(() => {
    const on = clamp01((S.value.glow - k * 0.12) / 0.5);
    return { opacity: on, transform: [{ translateY: (1 - on) * 6 }] };
  });
  return (
    <Animated.View style={[styles.axRow, { top: 6 + k * 15 }, st]}>
      <Text style={styles.axT}>{text}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 24, right: 24, top: 500, height: 1.5, backgroundColor: RULE },

  panel: {
    position: 'absolute', top: PAN_T, width: PAN_W, height: PAN_H,
    borderWidth: 1.5, borderColor: RULE, borderRadius: 5, backgroundColor: PAPER,
  },
  panHdr: {
    marginTop: 6, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 9.5, letterSpacing: 1.2, color: SOFT,
  },
  tiny: {
    position: 'absolute', textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8, letterSpacing: 1.2, color: SOFT,
  },

  eye: {
    position: 'absolute', width: EYE.w, height: EYE.h, borderWidth: 2, borderColor: INK,
    borderRadius: EYE.h / 2, alignItems: 'center', justifyContent: 'center', backgroundColor: PAPER,
  },
  pupil: { width: 10, height: 10, borderRadius: 5, backgroundColor: INK },
  flowLine: { position: 'absolute', height: 1.5, backgroundColor: RULE },
  flowHead: {
    position: 'absolute', width: 0, height: 0,
    borderTopWidth: 4, borderBottomWidth: 4, borderLeftWidth: 6,
    borderTopColor: 'transparent', borderBottomColor: 'transparent', borderLeftColor: SOFT,
  },
  drop: { position: 'absolute', width: 6, height: 6, borderRadius: 3, backgroundColor: INK },

  slate: {
    position: 'absolute', width: SLATE.w, height: SLATE.h,
    borderWidth: 2, borderColor: INK, borderRadius: 3, backgroundColor: PAPER,
  },
  mark: { position: 'absolute', left: 8, width: SLATE.w - 20, height: 3, backgroundColor: INK, borderRadius: 2, transformOrigin: '0% 50%' },

  aura: {
    position: 'absolute', width: PAN_W - 12, height: 64,
    borderWidth: 2, borderColor: INK, borderRadius: 34,
  },
  mind: {
    position: 'absolute', width: PAN_W - 24, height: 52,
    borderWidth: 2, borderColor: INK, borderRadius: 26, backgroundColor: PAPER,
  },
  axRow: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  axT: { fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 0.6, color: INK, includeFontPadding: false },

  feeder: { position: 'absolute', top: 278, width: 2, height: 10, backgroundColor: INK },
  kant: {
    position: 'absolute', left: 100, top: 286, width: 200, height: 54,
    borderWidth: 2.5, borderColor: INK, borderRadius: 5, backgroundColor: PAPER, alignItems: 'center',
  },
  kantTag: { marginTop: 4, fontFamily: 'Inter_700Bold', fontSize: 8, letterSpacing: 1.6, color: SOFT },
  kantA: { marginTop: 3, fontFamily: 'Inter_700Bold', fontSize: 9.5, letterSpacing: 0.4, color: INK, includeFontPadding: false },
  kantB: { marginTop: 2, fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 0.6, color: INK, includeFontPadding: false },

  askLabel: {
    position: 'absolute', left: 0, right: 0, top: 198, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.4, color: SOFT,
  },
  plateHit: { position: 'absolute', width: PAN_W },
  plate: {
    height: 44, borderWidth: 2.5, borderColor: INK, borderRadius: 5, backgroundColor: PAPER,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8,
  },
  plateRight: { backgroundColor: INK, borderColor: INK },
  plateWrong: { borderColor: SOFT, opacity: 0.45 },
  plateT: { fontFamily: 'Inter_700Bold', fontSize: 14, letterSpacing: 0.4, color: INK, includeFontPadding: false },
  plateTOn: { color: PAPER },
});

// The band. Highest ink: the question label at y 198 and the panels at 196. Lowest:
// the ground rule at 500 plus the figures' ankle joints, which reach ≈ 507. The
// arguers' crowns sit at y ≈ 354 even on their bounciest gesture, so the Kant box
// (bottom 340) never meets them. 328 units instead of 560 renders everything at ~2×.
export function Epistemology4Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Epistemology4Scene} band={[186, 514]} />;
}
