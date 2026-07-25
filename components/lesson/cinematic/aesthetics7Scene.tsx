import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import {
  WALK, dirsFrom, ease01, emoteHold, emoteLive, lerp, mixStance, pose, travelStance, type Bundle,
} from './rig';
import { BEATS } from './aesthetics7Script';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER } from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';

// A small gallery. Two framed works hang side by side on a picture rail — a
// three-second scribble on the left, a thirty-year composition on the right — each
// with a caption plate beneath it. The narrator walks the floor between them; a
// companion stands stage right, shrugging that it is all just opinion.
//
// Q1 is answered ON THE WALL: the plates swap to name two VIEWERS, and the reader
// taps the whole frame column whose verdict should count for more.
//
// ── COMPOSITION / OCCLUSION ────────────────────────────────────────────────────
// The narrator WALKS the ground line at y = 500 between x = 90 and x = 250, and its
// crown rides no higher than y ≈ 357. The companion is FIXED at x = 340 — 90 units
// clear of the narrator's furthest stop. On the only two beats where the narrator
// stands at x = 250 he holds a NARROW gesture (47 / 24, fists ±27) reaching x ≤ 284,
// and the companion holds a narrow one too (9 / 25, near-side edge x ≥ 311), so the
// two figures never fuse into one mass. The companion's wide poses (8 / 7) only play
// while the narrator is away at x = 90.
// EVERY prop therefore lives entirely ABOVE y = 350:
//   critic marks    y  44 → 94    (revealed only from the payoff beat on)
//   Q1 header       y 106 → 140   (only while the question is live)
//   picture rail    y 148, wires  y 148 → 170
//   frame columns   y 168 → 340   (art 168 → 278, caption plate 282 → 340)
// Nothing the reader must read is ever behind a body, and there is no camera
// transform — every tap target sits exactly under its own art.

const RAIL_Y = 148;
const FR_T = 168;                 // frame top
const FR_W = 120;
const FR_H = 110;                 // art box: 168 → 278
const CAP_T = 114;                // caption plate, in COLUMN coordinates
const CAP_H = 58;                 // stage: 282 → 340
const COL_H = CAP_T + CAP_H;      // 172 — the whole frame column
const FR_A = 60;                  // left frame  60 → 180
const FR_B = 210;                 // right frame 210 → 330
const COMP_X = 340;               // the companion, fixed, never walks

const MK_L = 15;
const MK_W = 88;
const MK_GAP = 6;
const MK_T = 62;
const MK_H = 32;
const MARKS = ['PRACTICE', 'COMPARISON', 'NO PREJUDICE', 'GOOD SENSE'];

// Plate copy by mode: [0] the works themselves · [1] the two viewers (Q1 and after).
const PLATES = [
  [
    { tag: 'UNTITLED · 3 SECONDS', label: 'A SCRIBBLE' },
    { tag: 'OIL ON CANVAS · 30 YEARS', label: 'A MASTERWORK' },
  ],
  [
    { tag: 'SOMEONE WHO HAS', label: 'SEEN ONE PAINTING' },
    { tag: 'SOMEONE WHO HAS', label: 'SEEN A THOUSAND' },
  ],
];

const FRAMES = [
  { id: 'one', left: FR_A, correct: false },
  { id: 'thousand', left: FR_B, correct: true },
];

const P = BEATS.map((b) => b.p ?? 0);
const X = BEATS.map((b) => b.x ?? 160);
const DIR = dirsFrom(X, 1);
const Q = BEATS.map((b) => b.q ?? 0);
const ARTV = BEATS.map((b) => b.art ?? 0);
const MKV = BEATS.map((b) => b.marks ?? 0);

export default function Aesthetics7Scene({ clock, bt, bi, i, picked, onPick }: SceneApi) {
  const cur = BEATS[i];
  const prev = i > 0 ? BEATS[i - 1] : undefined;

  // A prop only fades in on the beat that CHANGES it; otherwise it stays solid, so
  // the wall doesn't re-animate every time the reader taps forward.
  const mode = cur.capt ?? 0;
  const captOn = mode > 0;
  const captFade = mode !== (prev?.capt ?? 0);
  const marksFade = (cur.marks ?? 0) !== (prev?.marks ?? 0);

  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / 0.85);
    const t = clock.value;
    const grow = ease01(bt.value / 0.55);

    // The canonical travel body: walks the gap when the beat moves them, blends
    // gesture-to-gesture when it doesn't. WALK is passed EXPLICITLY — a Gait left to
    // a default parameter is not captured into the worklet runtime and crashes.
    const s = travelStance(
      X[p], X[n],
      emoteHold(P[p], t), emoteHold(P[n], t), emoteLive(P[n], t, bt.value),
      tr, WALK,
    );
    // The companion never moves, so they only ever blend gesture into gesture.
    const c = mixStance(emoteHold(Q[p], t), emoteLive(Q[n], t, bt.value), tr);

    return {
      fig: pose(s, lerp(X[p], X[n], tr), GROUND, K_FIG, DIR[n], 1),
      comp: pose(c, COMP_X, GROUND, K_FIG, -1, 1),
      art: lerp(ARTV[p], ARTV[n], tr),
      capt: captOn ? (captFade ? grow : 1) : 0,
      marks: lerp(MKV[p], MKV[n], tr) * (marksFade ? grow : 1),
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const DC = useDerivedValue<Bundle>(() => SCENE.value.comp);

  const artStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.art }));
  const captStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.capt,
    transform: [{ translateY: (1 - SCENE.value.capt) * 6 }],
  }));
  const marksStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.marks,
    transform: [{ translateY: (1 - SCENE.value.marks) * -6 }],
  }));

  const answered = picked !== null;
  const showPick = (cur.pick ?? 0) > 0 && !!cur.interact;
  const live = mode === 2;          // the question is being asked right now
  const settled = mode === 3;       // the verdict has been named and stays named
  const copy = PLATES[mode === 1 ? 0 : 1];

  return (
    <Animated.View style={styles.scene}>
      {/* ── the four marks of a trained eye, high above everything ───────────── */}
      <Animated.View style={[styles.layer, marksStyle]} pointerEvents="none">
        <Text style={styles.mkHead}>WHAT A GOOD CRITIC HAS</Text>
        {MARKS.map((m, k) => (
          <View key={m} style={[styles.mkChip, { left: MK_L + k * (MK_W + MK_GAP) }]}>
            <Text style={styles.mkText}>{m}</Text>
          </View>
        ))}
      </Animated.View>

      {/* ── the picture rail and its hanging wires ───────────────────────────── */}
      <View style={styles.rail} pointerEvents="none" />
      {FRAMES.map((f) => (
        <View key={`w${f.id}`} style={styles.layer} pointerEvents="none">
          <View style={[styles.wire, { left: f.left + FR_W / 2, transform: [{ rotate: '13deg' }] }]} />
          <View style={[styles.wire, { left: f.left + FR_W / 2, transform: [{ rotate: '-13deg' }] }]} />
        </View>
      ))}

      {/* ── the two framed works, each with its caption plate ────────────────── */}
      {FRAMES.map((f, k) => {
        const chosen = picked === f.id;
        const rightOn = (live && answered && f.correct) || (settled && f.correct);
        const wrongOn = (live && answered && chosen && !f.correct) || (settled && !f.correct);
        return (
          <View key={f.id} style={[styles.col, { left: f.left }, wrongOn && styles.dim]} pointerEvents="none">
            <View style={styles.frameBox} />
            <View style={styles.mat} />
            <Animated.View style={[styles.art, artStyle]}>
              {k === 0 ? <Scribble /> : <Composition />}
            </Animated.View>

            {captOn ? (
              <Animated.View style={[styles.plate, captStyle, rightOn && styles.plateRight]}>
                <Text style={[styles.plateTag, rightOn && styles.plateTagOn]}>{copy[k].tag}</Text>
                <Text style={[styles.plateLabel, rightOn && styles.plateLabelOn]}>{copy[k].label}</Text>
              </Animated.View>
            ) : null}
          </View>
        );
      })}

      {/* ── Q1: the frames themselves are the answer. Big columns, clear ring. ─ */}
      {showPick ? (
        <>
          <View style={styles.qHead} pointerEvents="none">
            <Text style={styles.qTag}>TAP THE VERDICT THAT SHOULD COUNT FOR MORE</Text>
          </View>
          {FRAMES.map((f) => {
            const chosen = picked === f.id;
            return (
              <Pressable
                key={`hit${f.id}`}
                style={[styles.hit, { left: f.left - 4 }]}
                disabled={answered}
                onPress={() => onPick(f.id, f.correct)}
              >
                <View
                  style={[
                    styles.ring,
                    answered && f.correct && styles.ringRight,
                    answered && chosen && !f.correct && styles.ringWrong,
                  ]}
                />
              </Pressable>
            );
          })}
        </>
      ) : null}

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DC} k={K_FIG} />
      <Stickman D={DF} k={K_FIG} />
    </Animated.View>
  );
}

/** Three seconds of biro: strokes at wild angles and one lopsided loop. */
function Scribble() {
  return (
    <>
      <View style={[styles.stroke, { left: 4, top: 18, width: 70, transform: [{ rotate: '14deg' }] }]} />
      <View style={[styles.stroke, { left: 2, top: 40, width: 78, transform: [{ rotate: '-24deg' }] }]} />
      <View style={[styles.stroke, { left: 20, top: 16, width: 46, transform: [{ rotate: '68deg' }] }]} />
      <View style={[styles.stroke, { left: 10, top: 52, width: 62, transform: [{ rotate: '30deg' }] }]} />
      <View style={styles.loop} />
    </>
  );
}

/** Thirty years of looking: two measured peaks, a horizon, a sun, a settled foreground. */
function Composition() {
  return (
    <>
      <View style={styles.sun} />
      <View style={[styles.peak, styles.peakBig]} />
      <View style={[styles.peak, styles.peakSmall]} />
      <View style={styles.horizon} />
      <View style={styles.fore} />
      <View style={styles.foreFar} />
    </>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  // A full-stage carrier for props that fade together, explicitly positioned so its
  // children never depend on flex flow above them.
  layer: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H },
  ground: { position: 'absolute', left: 24, right: 14, top: GROUND, height: 1.5, backgroundColor: RULE },

  // ── the four marks of a trained eye ─────────────────────────────────────────
  mkHead: {
    position: 'absolute', left: 0, top: 44, width: STAGE_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 1.8, color: SOFT,
  },
  mkChip: {
    position: 'absolute', top: MK_T, width: MK_W, height: MK_H,
    borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: PAPER,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4,
  },
  mkText: {
    fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 0.2, color: INK,
    textAlign: 'center', lineHeight: 13,
  },

  // ── the wall: rail + wires ──────────────────────────────────────────────────
  rail: { position: 'absolute', left: 30, right: 30, top: RAIL_Y, height: 2, backgroundColor: SOFT },
  wire: {
    position: 'absolute', top: RAIL_Y, width: 1.5, height: 22,
    backgroundColor: SOFT, transformOrigin: '50% 0%',
  },

  // ── a frame column: frame · mat · art · caption plate ───────────────────────
  col: { position: 'absolute', top: FR_T, width: FR_W, height: COL_H },
  dim: { opacity: 0.45 },
  frameBox: {
    position: 'absolute', left: 0, top: 0, width: FR_W, height: FR_H,
    borderWidth: 3, borderColor: INK, borderRadius: 2, backgroundColor: PAPER,
  },
  mat: {
    position: 'absolute', left: 10, top: 10, width: FR_W - 20, height: FR_H - 20,
    borderWidth: 1.5, borderColor: RULE,
  },
  // Strokes are allowed to run off the edge of the picture; the box clips them.
  art: { position: 'absolute', left: 17, top: 17, width: 86, height: 76, overflow: 'hidden' },

  // the scribble
  stroke: { position: 'absolute', height: 2.5, borderRadius: 1.5, backgroundColor: INK },
  loop: {
    position: 'absolute', left: 28, top: 22, width: 30, height: 26, borderRadius: 14,
    borderWidth: 2.5, borderColor: INK, transform: [{ rotate: '-16deg' }],
  },

  // the careful composition (peaks are CSS border-triangles, not SVG)
  sun: {
    position: 'absolute', left: 58, top: 6, width: 15, height: 15, borderRadius: 8,
    borderWidth: 2, borderColor: INK,
  },
  peak: {
    position: 'absolute', width: 0, height: 0, backgroundColor: 'transparent',
    borderStyle: 'solid', borderTopWidth: 0, borderTopColor: 'transparent',
    borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: INK,
  },
  peakBig: { left: 10, top: 20, borderLeftWidth: 20, borderRightWidth: 20, borderBottomWidth: 28 },
  peakSmall: { left: 44, top: 30, borderLeftWidth: 13, borderRightWidth: 13, borderBottomWidth: 18 },
  horizon: { position: 'absolute', left: 4, top: 48, width: 78, height: 2, backgroundColor: INK },
  fore: { position: 'absolute', left: 12, top: 58, width: 62, height: 1.5, backgroundColor: SOFT },
  foreFar: { position: 'absolute', left: 20, top: 66, width: 46, height: 1.5, backgroundColor: RULE },

  // ── the caption plate under each frame ──────────────────────────────────────
  plate: {
    position: 'absolute', left: 0, top: CAP_T, width: FR_W, height: CAP_H,
    borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: PAPER,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5,
  },
  plateRight: { backgroundColor: INK, borderColor: INK },
  plateTag: {
    fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 1.1, color: SOFT,
    textAlign: 'center', lineHeight: 11, marginBottom: 3,
  },
  plateTagOn: { color: RULE },
  plateLabel: {
    fontFamily: 'Inter_700Bold', fontSize: 14, letterSpacing: 0.2, color: INK,
    textAlign: 'center', lineHeight: 17,
  },
  plateLabelOn: { color: PAPER },

  // ── Q1: the whole frame column is the tap target ────────────────────────────
  qHead: { position: 'absolute', left: 30, top: 106, width: 340 },
  qTag: {
    textAlign: 'center', fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 1.4,
    color: INK, lineHeight: 15,
  },
  hit: { position: 'absolute', top: FR_T - 4, width: FR_W + 8, height: COL_H + 8 },
  ring: {
    position: 'absolute', left: 0, top: 0, width: FR_W + 8, height: COL_H + 8,
    borderWidth: 2, borderColor: RULE, borderStyle: 'dashed', borderRadius: 7,
  },
  ringRight: { borderColor: INK, borderStyle: 'solid' },
  ringWrong: { borderColor: SOFT, opacity: 0.45 },
});

export function Aesthetics7Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Aesthetics7Scene} />;
}
