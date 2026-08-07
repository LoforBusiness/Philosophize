import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { clamp01, ease01, emoteHold, emoteLive, lerp, mixStance, pose, type Bundle } from './rig';
import { BEATS } from './political2Script';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER } from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';

// A ruler and a subject play out power vs authority, under two pieces of ink
// information design:
//
//   · THE MATRIX (top) — a two-row, two-column bar chart headed REACHES · BODIES ·
//     MINDS. POWER fills the BODIES cell (ALL) and leaves MINDS empty (NONE);
//     AUTHORITY fills both. That is beat 1's line ("power bends bodies; authority
//     wins minds") drawn instead of asserted, with every cell reading its own value
//     so the chart needs no legend.
//   · THE LEDGER (right) — Weber's four answers to "why do they obey?", stacked as
//     full-width rows. From beat 4 the subject steps out of frame and the ledger
//     takes that half of the stage; on the question beat the same rows ARE the
//     tap targets, so the reader answers by choosing a source of legitimacy.
//
// There is no camera transform: the art is authored straight into stage space and
// the player crops to the band below, so every measurement here is final.
//
// Composition rule: the ruler never stands past x = 150 and the ledger starts at
// x = 194, so the figure can never cover a tap target.

const K = K_FIG * 1.08;            // stage units per rig unit (figure ≈ 111 tall)

const RULER_X = 96;
const SUBJECT_X = 252;
const PODIUM_H = 26;
const PODIUM_W = 84;

// ── the BODIES / MINDS matrix ────────────────────────────────────────────────
const LAB_L = 18;
const LAB_W = 106;
const BAR_W = 112;
const BAR_X1 = 134;
const BAR_X2 = 258;                // BAR_X1 + BAR_W + 12
const BAR_H = 20;
const HDR_Y = 224;
const R1_Y = 242;
const R2_Y = 268;                  // matrix ends at 288

// ── the legitimacy ledger ────────────────────────────────────────────────────
const LG_L = 194;
const LG_W = 192;
const LG_HDR_Y = 294;
const LG_TOP = 310;
const LG_H = 40;
const LG_STEP = 46;                // 4 rows: 310 · 356 · 402 · 448 → ends at 488

/** The four rows, and the four options of the scene-answered question. */
const ROWS = [
  { id: 'a', title: 'TRADITION', sub: 'custom and bloodline', correct: false },
  { id: 'b', title: 'CHARISMA', sub: 'devotion to a person', correct: false },
  { id: 'c', title: 'RATIONAL-LEGAL', sub: 'office, rules, law', correct: true },
  { id: 'd', title: 'RAW FORCE', sub: 'no legitimacy at all', correct: false },
];

const R_CODE = BEATS.map((b) => b.r ?? 0);
const SUB_CODE = BEATS.map((b) => b.sub ?? 0);
const POD = BEATS.map((b) => (b.podium ? 1 : 0));
const CHART = BEATS.map((b) => b.chart ?? 0);
const LED = BEATS.map((b) => (b.ledger ? 1 : 0));
const TR = 0.85;

export default function Political2Scene({ clock, bt, bi, i, picked, onPick }: SceneApi) {
  const cur = BEATS[i];
  const showPick = !!cur.interact && !!cur.ledger;
  const answered = picked !== null;

  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / TR);
    const L = (a: number, b: number) => { 'worklet'; return lerp(a, b, tr); };
    const t = clock.value;

    const rulerS = mixStance(emoteHold(R_CODE[p], t), emoteLive(R_CODE[n], t, bt.value), tr);
    const subS = mixStance(emoteHold(SUB_CODE[p], t), emoteLive(SUB_CODE[n], t, bt.value), tr);
    const pod = L(POD[p], POD[n]);
    const led = L(LED[p], LED[n]);

    return {
      ruler: pose(rulerS, RULER_X, GROUND - pod * PODIUM_H, K, 1, 1),
      subject: pose(subS, SUBJECT_X, GROUND, K, -1, 1 - led),
      pod,
      led,
      rowP: L(clamp01(CHART[p]), clamp01(CHART[n])),
      rowA: L(clamp01(CHART[p] - 1), clamp01(CHART[n] - 1)),
    };
  });

  const DR = useDerivedValue<Bundle>(() => SCENE.value.ruler);
  const DS = useDerivedValue<Bundle>(() => SCENE.value.subject);

  const podStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.pod,
    transform: [{ scaleY: 0.2 + 0.8 * SCENE.value.pod }],
  }));
  const rowPStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.rowP,
    transform: [{ translateX: (1 - SCENE.value.rowP) * -12 }],
  }));
  const rowAStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.rowA,
    transform: [{ translateX: (1 - SCENE.value.rowA) * -12 }],
  }));
  const hdrStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.rowP }));
  const fillP = useAnimatedStyle(() => ({ transform: [{ scaleX: Math.max(0.001, SCENE.value.rowP) }] }));
  const fillA = useAnimatedStyle(() => ({ transform: [{ scaleX: Math.max(0.001, SCENE.value.rowA) }] }));
  const ledStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.led,
    transform: [{ translateX: (1 - SCENE.value.led) * 16 }],
  }));

  return (
    <Animated.View style={styles.scene}>
      <View style={styles.ground} pointerEvents="none" />

      {/* ── the BODIES / MINDS matrix ───────────────────────────────────────── */}
      <Animated.View style={[styles.colHdrRow, hdrStyle]} pointerEvents="none">
        <Text style={styles.rowHdr}>REACHES</Text>
        <Text style={[styles.colHdr, { left: BAR_X1 }]}>BODIES</Text>
        <Text style={[styles.colHdr, { left: BAR_X2 }]}>MINDS</Text>
      </Animated.View>

      <Animated.View style={[styles.mRow, { top: R1_Y }, rowPStyle]} pointerEvents="none">
        <Text style={styles.mLab}>POWER</Text>
        <View style={[styles.barTrack, { left: BAR_X1 }]}>
          <View style={[styles.tick, { left: BAR_W * 0.5 }]} />
          <Animated.View style={[styles.barFill, fillP]} />
          <Text style={styles.barOn}>ALL</Text>
        </View>
        {/* the cell that stays empty — the whole point of the row, so it says so */}
        <View style={[styles.barTrack, { left: BAR_X2 }]}>
          <View style={[styles.tick, { left: BAR_W * 0.5 }]} />
          <Text style={styles.barOff}>NONE</Text>
        </View>
      </Animated.View>

      <Animated.View style={[styles.mRow, { top: R2_Y }, rowAStyle]} pointerEvents="none">
        <Text style={styles.mLab}>AUTHORITY</Text>
        <View style={[styles.barTrack, { left: BAR_X1 }]}>
          <View style={[styles.tick, { left: BAR_W * 0.5 }]} />
          <Animated.View style={[styles.barFill, fillA]} />
          <Text style={styles.barOn}>ALL</Text>
        </View>
        <View style={[styles.barTrack, { left: BAR_X2 }]}>
          <View style={[styles.tick, { left: BAR_W * 0.5 }]} />
          <Animated.View style={[styles.barFill, fillA]} />
          <Text style={styles.barOn}>ALL</Text>
        </View>
      </Animated.View>

      {/* ── the podium of legitimacy under the ruler ────────────────────────── */}
      <Animated.View style={[styles.podWrap, podStyle]} pointerEvents="none">
        <View style={styles.podBox} />
        <View style={styles.podCap} />
        <Text style={styles.podLab}>LEGITIMACY</Text>
      </Animated.View>

      <Stickman D={DR} k={K} />
      <Stickman D={DS} k={K} />

      {/* ── the legitimacy ledger (and, on the question beat, the targets) ──── */}
      <Animated.View style={[styles.ledger, ledStyle]} pointerEvents="box-none">
        <Text style={styles.ledHdr}>{showPick ? 'TAP THE TRUE SOURCE' : 'WHY DO THEY OBEY?'}</Text>

        {ROWS.map((r, k) => {
          const top = LG_TOP - LG_HDR_Y + k * LG_STEP;
          const chosen = picked === r.id;
          const right = showPick && answered && r.correct;
          const wrong = showPick && answered && chosen && !r.correct;
          const body = (
            <View style={[styles.ledRow, right && styles.ledRight, wrong && styles.ledWrong]}>
              <Text style={[styles.ledTitle, right && styles.ledTitleOn]}>{r.title}</Text>
              <Text style={[styles.ledSub, right && styles.ledSubOn]}>{r.sub}</Text>
            </View>
          );
          if (!showPick) {
            return <View key={r.id} style={[styles.ledSlot, { top }]} pointerEvents="none">{body}</View>;
          }
          return (
            <Target id={r.id} correct={r.correct} picked={picked} onPick={onPick}
              key={r.id} style={[styles.ledSlot, { top }]} disabled={answered}>
              {body}
            </Target>
          );
        })}
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 16, right: 14, top: GROUND, height: 2, backgroundColor: RULE },

  // ── matrix ────────────────────────────────────────────────────────────────
  colHdrRow: { position: 'absolute', left: 0, top: HDR_Y, width: STAGE_W, height: 15 },
  rowHdr: {
    position: 'absolute', left: LAB_L, top: 0, width: LAB_W, textAlign: 'right',
    fontFamily: 'Inter_700Bold', fontSize: 10.5, lineHeight: 14, letterSpacing: 1.4, color: SOFT,
    includeFontPadding: false,
  },
  colHdr: {
    position: 'absolute', top: 0, width: BAR_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 11, lineHeight: 14, letterSpacing: 1.4, color: SOFT,
    includeFontPadding: false,
  },
  mRow: { position: 'absolute', left: 0, width: STAGE_W, height: BAR_H },
  mLab: {
    position: 'absolute', left: LAB_L, top: 0, width: LAB_W, textAlign: 'right',
    fontFamily: 'Inter_700Bold', fontSize: 13.5, lineHeight: BAR_H, color: INK,
    letterSpacing: 0.3, includeFontPadding: false,
  },
  barTrack: {
    position: 'absolute', top: 0, width: BAR_W, height: BAR_H,
    borderWidth: 2, borderColor: INK, borderRadius: 3, backgroundColor: PAPER, overflow: 'hidden',
  },
  tick: { position: 'absolute', top: 0, bottom: 0, width: 1.5, backgroundColor: RULE },
  barFill: {
    position: 'absolute', left: 0, top: 0, bottom: 0, width: '100%',
    backgroundColor: INK, transformOrigin: '0% 50%',
  },
  // Reading a bar shouldn't need a legend: the inked cells say ALL, the empty one
  // says NONE, so "power bends bodies but never wins minds" is literally spelled out.
  barOn: {
    position: 'absolute', left: 0, right: 0, top: 0, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 11, lineHeight: 16, letterSpacing: 1.8,
    color: PAPER, includeFontPadding: false,
  },
  barOff: {
    position: 'absolute', left: 0, right: 0, top: 0, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 11, lineHeight: 16, letterSpacing: 1.8,
    color: SOFT, includeFontPadding: false,
  },

  // ── podium ────────────────────────────────────────────────────────────────
  podWrap: {
    position: 'absolute', left: RULER_X - PODIUM_W / 2 - 7, top: GROUND - PODIUM_H,
    width: PODIUM_W + 14, height: PODIUM_H, transformOrigin: '50% 100%',
  },
  podBox: {
    position: 'absolute', left: 7, top: 0, width: PODIUM_W, height: PODIUM_H,
    borderWidth: 2.5, borderColor: INK, backgroundColor: PAPER,
  },
  podCap: { position: 'absolute', left: 0, top: 0, width: PODIUM_W + 14, height: 5, backgroundColor: INK },
  podLab: {
    position: 'absolute', left: 7, top: 11, width: PODIUM_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.2, color: SOFT, includeFontPadding: false,
  },

  // ── ledger ────────────────────────────────────────────────────────────────
  ledger: { position: 'absolute', left: LG_L, top: LG_HDR_Y, width: LG_W, height: 200 },
  ledHdr: {
    position: 'absolute', left: 0, top: 0, width: LG_W,
    fontFamily: 'Inter_700Bold', fontSize: 11, lineHeight: 14, letterSpacing: 1.4, color: SOFT, includeFontPadding: false,
  },
  // Tap target: 192 × 40 stage units, two lines of ≥12px — comfortably readable and
  // hittable at the band's ~2.2× on-device scale.
  ledSlot: { position: 'absolute', left: 0, width: LG_W, height: LG_H },
  ledRow: {
    width: LG_W, height: LG_H, borderWidth: 2, borderColor: INK, borderRadius: 4,
    backgroundColor: PAPER, justifyContent: 'center', paddingHorizontal: 10,
  },
  ledRight: { backgroundColor: INK, borderColor: INK },
  ledWrong: { borderColor: SOFT, opacity: 0.45 },
  ledTitle: { fontFamily: 'Inter_700Bold', fontSize: 14, lineHeight: 17, color: INK, letterSpacing: 0.3, includeFontPadding: false },
  ledTitleOn: { color: PAPER },
  ledSub: { fontFamily: 'Inter_500Medium', fontSize: 12, lineHeight: 15, color: SOFT, includeFontPadding: false },
  ledSubOn: { color: RULE },
});

// BAND. Topmost ink is the matrix's column header row at 224; the lowest is the
// ground line at 500 + 2 thick. Every extreme in between is inside that: the matrix
// rows end at 288, the ledger's last row at 488, the podium spans 474..500, and the
// tallest the figures ever get is the ruler standing ON the podium — crown at
// 474 − 103 rig × 1.458 ≈ 324, or ~318 with the celebrate gesture's bob. So
// [216, 512] holds the lot with 8 units of margin at the top and 10 at the bottom,
// and the whole scene renders about 90% larger than the letterboxed full-height fit.
export function Political2Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Political2Scene} band={[216, 512]} />;
}
