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
// with a caption plate beneath it. Above them, a two-bar chart of WHAT VISITORS
// FEEL, which is the "nearly everyone senses the gap" line drawn rather than said.
// The narrator walks the floor between the works; a companion stands stage right,
// shrugging that it is all just opinion.
//
// Q1 is answered ON THE WALL: the plates swap to name two VIEWERS — one who has
// seen one painting, one who has seen a thousand, each with an EXPERIENCE BAR that
// fills to show the gap — and the reader taps the whole frame column whose verdict
// should count for more.
//
// ── COMPOSITION / OCCLUSION ────────────────────────────────────────────────────
// The narrator WALKS the ground line at y = 500 between x = 90 and x = 250; a
// standing crown sits at y ≈ 361 and the liveliest gesture lifts it to y ≈ 355.
// The companion is FIXED at x = 340 — 90 units clear of the narrator's furthest
// stop. On the only two beats where the narrator stands at x = 250 he holds a
// NARROW gesture (47 / 24) and the companion holds a narrow one too (9 / 25), so
// the two figures never fuse into one mass.
// EVERY prop therefore lives entirely ABOVE y = 342:
//   top strip      y 112 → 162   (visitors chart · Q1 caption · critic's marks —
//                                 three things sharing one slot, never at once)
//   picture rail   y 166, wires  y 166 → 182
//   frame columns  y 182 → 338   (art 182 → 282, caption plate 286 → 338)
//   tap rings      y 178 → 342
// Nothing the reader must read is ever behind a body, and there is no camera
// transform — every tap target sits exactly under its own art.

const TOP_T = 112;                // the shared top strip (chart / caption / marks)

const RAIL_Y = 166;
const FR_T = 182;                 // frame top
const FR_W = 132;
const FR_H = 100;                 // art box: 182 → 282
const CAP_T = 104;                // caption plate, in COLUMN coordinates
const CAP_H = 52;                 // stage: 286 → 338
const COL_H = CAP_T + CAP_H;      // 156 — the whole frame column
const FR_A = 52;                  // left frame   52 → 184
const FR_B = 216;                 // right frame 216 → 348
const COMP_X = 340;               // the companion, fixed, never walks

// ── the four marks of a trained eye ──────────────────────────────────────────
const MK_L = 16;
const MK_W = 86;
const MK_GAP = 8;                 // 4 × 86 + 3 × 8 = 368, so 16 … 384
const MK_T = 128;
const MK_H = 32;
const MARKS = ['PRACTICE', 'COMPARISON', 'NO GRUDGES', 'GOOD SENSE'];

// ── the visitors chart (two bars, no invented numbers) ───────────────────────
const CH_L = 24;
const CH_LABEL_W = 92;
const CH_TRACK_L = 122;
const CH_TRACK_W = 200;
const CH_NOTE_L = 328;
const CH_ROW_T = 128;
const CH_ROW_GAP = 18;
const VISITORS = [
  { key: 'scribble', label: 'SCRIBBLE', fill: 0.09, note: 'A FEW' },
  { key: 'master', label: 'MASTERWORK', fill: 0.94, note: 'NEARLY ALL' },
];

// Plate copy by mode: [0] the works themselves · [1] the two viewers (Q1 and after).
// Two short lines each — a plate is a tap target, and short labels read at a glance.
const PLATES = [
  [
    { tag: '3 SECONDS', label: 'A SCRIBBLE', bar: 0 },
    { tag: '30 YEARS', label: 'A MASTERWORK', bar: 0 },
  ],
  [
    { tag: 'HAS SEEN', label: 'ONE PAINTING', bar: 0.04 },
    { tag: 'HAS SEEN', label: 'A THOUSAND', bar: 1 },
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
// The chart owns the top strip only while the plates still name the WORKS; once the
// plates become viewers the strip belongs to the question, then to the marks.
const CHV = BEATS.map((b) => (b.summary ? 0 : (b.capt ?? 0) <= 1 ? 1 : 0));

export default function Aesthetics7Scene({ clock, bt, bi, i, picked, onPick }: SceneApi) {
  const cur = BEATS[i];
  const prev = i > 0 ? BEATS[i - 1] : undefined;

  // A prop only fades in on the beat that CHANGES it; otherwise it stays solid, so
  // the wall doesn't re-animate every time the reader taps forward.
  const mode = cur.capt ?? 0;
  const captOn = mode > 0;
  const captFade = mode !== (prev?.capt ?? 0);
  const marksFade = (cur.marks ?? 0) !== (prev?.marks ?? 0);
  const chartFade = CHV[i] !== (i > 0 ? CHV[i - 1] : CHV[i]);

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
      chart: lerp(CHV[p], CHV[n], tr) * (chartFade ? grow : 1),
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const DC = useDerivedValue<Bundle>(() => SCENE.value.comp);

  const artStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.art }));
  const captStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.capt,
    transform: [{ translateY: (1 - SCENE.value.capt) * 6 }],
  }));
  // The experience bar FILLS from the left as the plate lands — the whole Q1 answer
  // in one moving shape.
  const fillStyle = useAnimatedStyle(() => ({ transform: [{ scaleX: SCENE.value.capt }] }));
  const marksStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.marks,
    transform: [{ translateY: (1 - SCENE.value.marks) * -6 }],
  }));
  const chartStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.chart }));
  const chartFillStyle = useAnimatedStyle(() => ({ transform: [{ scaleX: SCENE.value.chart }] }));

  const answered = picked !== null;
  const showPick = (cur.pick ?? 0) > 0 && !!cur.interact;
  const live = mode === 2;          // the question is being asked right now
  const settled = mode === 3;       // the verdict has been named and stays named
  const copy = PLATES[mode === 1 ? 0 : 1];

  return (
    <Animated.View style={styles.scene}>
      {/* ── what visitors feel: two bars, drawn not asserted ─────────────────── */}
      <Animated.View style={[styles.layer, chartStyle]} pointerEvents="none">
        <Text style={styles.stripHead}>WHAT VISITORS FEEL</Text>
        {VISITORS.map((v, k) => (
          <View key={v.key} style={[styles.chRow, { top: CH_ROW_T + k * CH_ROW_GAP }]}>
            <Text style={styles.chLabel}>{v.label}</Text>
            <View style={styles.chTrack}>
              <Animated.View
                style={[styles.chFill, { width: (CH_TRACK_W - 4) * v.fill }, chartFillStyle]}
              />
            </View>
            <Text style={styles.chNote}>{v.note}</Text>
          </View>
        ))}
      </Animated.View>

      {/* ── the four marks of a trained eye, in the same top strip ───────────── */}
      <Animated.View style={[styles.layer, marksStyle]} pointerEvents="none">
        <Text style={styles.stripHead}>WHAT A GOOD CRITIC HAS</Text>
        {MARKS.map((m, k) => (
          <View key={m} style={[styles.mkChip, { left: MK_L + k * (MK_W + MK_GAP) }]}>
            <Text style={styles.mkText}>{`✓ ${m}`}</Text>
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
                {mode >= 2 ? (
                  <View style={[styles.expTrack, rightOn && styles.expTrackOn]}>
                    <Animated.View
                      style={[
                        styles.expFill,
                        { width: Math.max(4, 100 * copy[k].bar) },
                        rightOn && styles.expFillOn,
                        fillStyle,
                      ]}
                    />
                  </View>
                ) : null}
              </Animated.View>
            ) : null}
          </View>
        );
      })}

      {/* ── Q1: the frames themselves are the answer. Big columns, clear ring. ─ */}
      {showPick ? (
        <>
          <View style={styles.qHead} pointerEvents="none">
            <Text style={styles.qTag}>TAP THE VERDICT THAT COUNTS FOR MORE</Text>
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
      <View style={[styles.stroke, { left: 4, top: 14, width: 84, transform: [{ rotate: '14deg' }] }]} />
      <View style={[styles.stroke, { left: 2, top: 38, width: 92, transform: [{ rotate: '-24deg' }] }]} />
      <View style={[styles.stroke, { left: 22, top: 10, width: 52, transform: [{ rotate: '68deg' }] }]} />
      <View style={[styles.stroke, { left: 8, top: 50, width: 74, transform: [{ rotate: '30deg' }] }]} />
      <View style={[styles.stroke, { left: 40, top: 30, width: 58, transform: [{ rotate: '-52deg' }] }]} />
      <View style={styles.loop} />
    </>
  );
}

/** Thirty years of looking: three measured peaks, a horizon, a sun, a settled foreground. */
function Composition() {
  return (
    <>
      <View style={styles.sun} />
      <View style={[styles.peak, styles.peakBig]} />
      <View style={[styles.peak, styles.peakMid]} />
      <View style={[styles.peak, styles.peakSmall]} />
      <View style={styles.horizon} />
      <View style={styles.fore} />
      <View style={styles.foreFar} />
      <View style={styles.foreNear} />
    </>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  // A full-stage carrier for props that fade together, explicitly positioned so its
  // children never depend on flex flow above them. Always pointerEvents="none": an
  // overlay at opacity 0 still swallows taps and silently kills the interaction.
  layer: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H },
  ground: { position: 'absolute', left: 24, right: 14, top: GROUND, height: 1.5, backgroundColor: RULE },

  // ── the shared top strip ────────────────────────────────────────────────────
  stripHead: {
    position: 'absolute', left: 0, top: TOP_T, width: STAGE_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.8, color: SOFT,
    includeFontPadding: false, lineHeight: 13,
  },

  // the two-bar visitors chart
  chRow: { position: 'absolute', left: 0, width: STAGE_W, height: 16, flexDirection: 'row', alignItems: 'center' },
  chLabel: {
    position: 'absolute', left: CH_L, width: CH_LABEL_W, textAlign: 'right',
    fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 0.3, color: INK,
    includeFontPadding: false, lineHeight: 13,
  },
  chTrack: {
    position: 'absolute', left: CH_TRACK_L, width: CH_TRACK_W, height: 13,
    borderWidth: 1.5, borderColor: SOFT, borderRadius: 2, justifyContent: 'center',
  },
  chFill: { height: 7, marginLeft: 1.5, backgroundColor: INK, borderRadius: 1, transformOrigin: '0% 50%' },
  chNote: {
    position: 'absolute', left: CH_NOTE_L, width: 68,
    fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 0.6, color: SOFT,
    includeFontPadding: false, lineHeight: 12,
  },

  // the four marks of a trained eye
  mkChip: {
    position: 'absolute', top: MK_T, width: MK_W, height: MK_H,
    borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: PAPER,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3,
  },
  mkText: {
    fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 0.1, color: INK,
    textAlign: 'center', lineHeight: 13, includeFontPadding: false,
  },

  // ── the wall: rail + wires ──────────────────────────────────────────────────
  rail: { position: 'absolute', left: 24, right: 24, top: RAIL_Y, height: 2, backgroundColor: SOFT },
  wire: {
    position: 'absolute', top: RAIL_Y, width: 1.5, height: 17,
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
    position: 'absolute', left: 9, top: 9, width: FR_W - 18, height: FR_H - 18,
    borderWidth: 1.5, borderColor: RULE,
  },
  // Strokes are allowed to run off the edge of the picture; the box clips them.
  art: { position: 'absolute', left: 16, top: 16, width: 100, height: 68, overflow: 'hidden' },

  // the scribble
  stroke: { position: 'absolute', height: 2.5, borderRadius: 1.5, backgroundColor: INK },
  loop: {
    position: 'absolute', left: 32, top: 20, width: 34, height: 30, borderRadius: 16,
    borderWidth: 2.5, borderColor: INK, transform: [{ rotate: '-16deg' }],
  },

  // the careful composition (peaks are CSS border-triangles, not SVG)
  sun: {
    position: 'absolute', left: 70, top: 5, width: 16, height: 16, borderRadius: 8,
    borderWidth: 2, borderColor: INK,
  },
  peak: {
    position: 'absolute', width: 0, height: 0, backgroundColor: 'transparent',
    borderStyle: 'solid', borderTopWidth: 0, borderTopColor: 'transparent',
    borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: INK,
  },
  peakBig: { left: 8, top: 12, borderLeftWidth: 24, borderRightWidth: 24, borderBottomWidth: 32 },
  peakMid: { left: 44, top: 20, borderLeftWidth: 18, borderRightWidth: 18, borderBottomWidth: 24 },
  peakSmall: { left: 72, top: 28, borderLeftWidth: 13, borderRightWidth: 13, borderBottomWidth: 16 },
  horizon: { position: 'absolute', left: 2, top: 44, width: 96, height: 2, backgroundColor: INK },
  fore: { position: 'absolute', left: 10, top: 52, width: 78, height: 1.5, backgroundColor: SOFT },
  foreFar: { position: 'absolute', left: 20, top: 58, width: 58, height: 1.5, backgroundColor: RULE },
  foreNear: { position: 'absolute', left: 6, top: 64, width: 88, height: 1.5, backgroundColor: RULE },

  // ── the caption plate under each frame ──────────────────────────────────────
  plate: {
    position: 'absolute', left: 0, top: CAP_T, width: FR_W, height: CAP_H,
    borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: PAPER,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4,
  },
  plateRight: { backgroundColor: INK, borderColor: INK },
  plateTag: {
    fontFamily: 'Inter_700Bold', fontSize: 9.5, letterSpacing: 1.1, color: SOFT,
    textAlign: 'center', lineHeight: 12, marginBottom: 2, includeFontPadding: false,
  },
  plateTagOn: { color: RULE },
  plateLabel: {
    fontFamily: 'Inter_700Bold', fontSize: 14, letterSpacing: 0.1, color: INK,
    textAlign: 'center', lineHeight: 17, includeFontPadding: false,
  },
  plateLabelOn: { color: PAPER },
  // How much this viewer has actually seen — one painting against a thousand.
  expTrack: {
    width: 104, height: 9, marginTop: 4, borderWidth: 1.5, borderColor: SOFT,
    borderRadius: 2, justifyContent: 'center',
  },
  expTrackOn: { borderColor: PAPER },
  expFill: { height: 4, marginLeft: 1, backgroundColor: INK, borderRadius: 1, transformOrigin: '0% 50%' },
  expFillOn: { backgroundColor: PAPER },

  // ── Q1: the whole frame column is the tap target ────────────────────────────
  qHead: { position: 'absolute', left: 20, top: 130, width: 360 },
  qTag: {
    textAlign: 'center', fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 1.4,
    color: SOFT, lineHeight: 15, includeFontPadding: false,
  },
  hit: { position: 'absolute', top: FR_T - 4, width: FR_W + 8, height: COL_H + 8 },
  ring: {
    position: 'absolute', left: 0, top: 0, width: FR_W + 8, height: COL_H + 8,
    borderWidth: 2, borderColor: RULE, borderStyle: 'dashed', borderRadius: 7,
  },
  ringRight: { borderColor: INK, borderStyle: 'solid' },
  ringWrong: { borderColor: SOFT, opacity: 0.45 },
});

// Art runs from the top strip's header (y 112, lifted 6 as the marks slide in) down
// to the ground rule at y 501.5; the figures' crowns sit at y ≈ 355 inside that. The
// player crops to [98, 510] and scales up, so the whole gallery renders about 36%
// larger than the letterboxed full-height fit.
export function Aesthetics7Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Aesthetics7Scene} band={[98, 510]} />;
}
