import type { ReactNode } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { clamp01, ease01, mixStance, pose, type Bundle } from './rig';
// The whole movement library, not just rig's 49 emotes. Codes under 100 ARE
// rig's and mean exactly what they always did; 100+ reach moves.ts (emoteAny).
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './political2Script';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, PAPER, useHeld, carryFrom, keepHeld, useCarry, carry, reactPose,
} from './cinematicKit';
import { stageTone } from './stageTones';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// THE STAGE IS STRUCK IN THIS LESSON'S OWN BRANCH HUE (./stageTones).
// Same three tones, same luminance to the third decimal — so every contrast
// measured against the old greys still holds and nothing on the stage moved.
const { RULE, STONE, SHADE } = stageTone('political-philosophy');
const LIP = `0px 3px 0px ${SHADE}`;   // the shaded lip a toned plate stands on (scripts/lip-stage.mjs)

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
// ── EVERY TAP OF THE OPENING CHANGES THE PICTURE ────────────────────────────
// This is an opener, and four of its taps used to hold one frame. Each now puts on
// the stage the thing its sentence names, and nothing it does not:
//   · the matrix arrives in two steps — the POWER row on "power controls bodies",
//     the AUTHORITY row on "authority is power that people accept" (`chart`);
//   · a MUGGER tag hangs over the ruler on "as a mugger does", and comes off as
//     the podium rises under him — robber to emperor (`tag`);
//   · the podium's LEGITIMACY plate is struck in ink on "only legitimacy tells
//     them apart" (`lit`);
//   · the ledger is written up row by row as Weber's types are named, and its
//     fourth row — raw force, which no sentence offers as a source — arrives
//     with the question it is an option of (`rows`).
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

// ── the MUGGER tag ───────────────────────────────────────────────────────────
// Centred over the ruler, 34 units under the matrix (which ends at 288) and 36
// above his crown (398 standing, measured off the rig for gestures 13 and 266 at
// this scale). Its leader stops 24 units short of the head.
const TAG_W = 72;
const TAG_H = 20;
const TAG_T = 322;
const TAG_LEAD = 18;               // 342 → 360

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
const TAG = BEATS.map((b) => b.tag ?? 0);
const LIT = BEATS.map((b) => b.lit ?? 0);
const LROWS = BEATS.map((b) => b.rows ?? 0);
const TR = 0.85;
const ROW_T = BEATS.map((b) => (b.interact ? TR : 2.2));

// THE CAMERA (H60b). `followMoves` reads the x track and gives each beat its own
// shot: it FOLLOWS the subject when a beat moves far enough to be worth following,
// pushes close on a quote, and PULLS BACK to the whole band on a question or a
// summary — the beats the reader has to read and act on.
// Two figures at 96 and 252, so the track is the point BETWEEN them (174) — following
// either one alone would frame the other out, and here the pair is the subject.
const X = BEATS.map((b) => b.x ?? 174);

// R7b — the stage follows the control on its own graded beat, and only there.
// Derived from the beat rather than declared as a channel so it cannot fall out
// of step with the control it is about.
const REACT = BEATS.map((b) => (b.interact?.sort ? 1 : 0));
const CAM = followMoves(X, BEATS.map(kindOf), seedOf('political2'));

export default function Political2Scene({ clock, bt, bi, i, picked, onPick, pickPos }: SceneApi) {
  const reacting = REACT[i] === 1;
  const heldRulerS = useHeld();
  const cv = useCarry(7);
  const heldSubS = useHeld();
  const cur = BEATS[i];
  const showPick = !!cur.interact && !!cur.ledger;
  const answered = picked !== null;

  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / TR);
    const t = clock.value;

    const rulerS = keepHeld(heldRulerS, mixStance(carryFrom(heldRulerS, n, emoteHold(R_CODE[p], t)), emoteLive(R_CODE[n], t, bt.value), tr));
    const subS = keepHeld(heldSubS, mixStance(carryFrom(heldSubS, n, emoteHold(SUB_CODE[p], t)), emoteLive(SUB_CODE[n], t, bt.value), tr));
    const pod = carry(cv, 0, n, POD[p], POD[n], tr);
    const led = carry(cv, 1, n, LED[p], LED[n], tr);
    // The ledger's rows are written up at a reading pace rather than the stage's:
    // two rows on the charisma beat land one after the other, as each is named. On
    // the question beat its option has to be on the board promptly, so it keeps TR.
    const rowTr = ease01(bt.value / ROW_T[n]);

    return {
      ruler: pose(rulerS, RULER_X, GROUND - pod * PODIUM_H, K, 1, 1),
      subject: reactPose(subS, SUBJECT_X, GROUND, K, -1, 1 - led),
      pod,
      led,
      // Carried, not lerped off the previous beat's value: after the sort the
      // AUTHORITY row may be sitting wherever the reader left it (L5).
      rowP: carry(cv, 2, n, clamp01(CHART[p]), clamp01(CHART[n]), tr),
      // R7c — the AUTHORITY row is what the lever is about. Magnetism and habit fill
      // the POWER row and leave this one empty; the lawful office is the only stop that
      // writes anything here.
      rowA: carry(cv, 3, n, clamp01(CHART[p] - 1), reacting ? pickPos.value : clamp01(CHART[n] - 1), tr),
      tag: carry(cv, 4, n, TAG[p], TAG[n], tr),
      lit: carry(cv, 5, n, LIT[p], LIT[n], tr),
      rows: carry(cv, 6, n, LROWS[p], LROWS[n], rowTr),
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
  // The tag drops onto its leader as it is named, and lifts off the same way.
  const tagStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.tag,
    transform: [{ translateY: (1 - SCENE.value.tag) * -6 }],
  }));
  // The plate is struck, not tinted: the ink face comes up as the stone one goes,
  // so there is never an ink word sitting under an ink plate.
  const litStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.lit }));
  const unlitStyle = useAnimatedStyle(() => ({ opacity: 1 - SCENE.value.lit }));

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
        <Animated.View style={[styles.podLit, litStyle]} />
        <View style={styles.podCap} />
        <Animated.Text style={[styles.podLab, unlitStyle]}>LEGITIMACY</Animated.Text>
        <Animated.Text style={[styles.podLab, styles.podLabOn, litStyle]}>LEGITIMACY</Animated.Text>
      </Animated.View>

      {/* ── what the ruler is, before the podium: Weber's mugger ─────────────── */}
      <Animated.View style={[styles.tag, tagStyle]} pointerEvents="none">
        <View style={styles.tagPlate}>
          <Text style={styles.tagText} numberOfLines={1}>MUGGER</Text>
        </View>
        <View style={styles.tagLead} />
      </Animated.View>

      <Stickman role="second" D={DR} k={K} />
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
            return (
              <View key={r.id} style={[styles.ledSlot, { top }]} pointerEvents="none">
                <RowReveal S={SCENE} k={k}>{body}</RowReveal>
              </View>
            );
          }
          return (
            <Target id={r.id} correct={r.correct} picked={picked} onPick={onPick}
              key={r.id} style={[styles.ledSlot, { top }]} disabled={answered}>
              <RowReveal S={SCENE} k={k}>{body}</RowReveal>
            </Target>
          );
        })}
      </Animated.View>
    </Animated.View>
  );
}

/** One ledger row, written up once `rows` passes its index. A row already up holds still (C20c). */
function RowReveal({ S, k, children }: {
  S: { value: { rows: number } };   // a read-only view of the scene frame (see knowHowScene's StepCard)
  k: number;
  children: ReactNode;
}) {
  const st = useAnimatedStyle(() => {
    const a = clamp01(S.value.rows - k);
    return { opacity: a, transform: [{ translateX: (1 - a) * 10 }] };
  });
  return <Animated.View style={st}>{children}</Animated.View>;
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 16, right: 14, top: GROUND, height: 2, backgroundColor: RULE },

  // ── matrix ────────────────────────────────────────────────────────────────
  colHdrRow: { position: 'absolute', left: 0, top: HDR_Y, width: STAGE_W, height: 15 },
  rowHdr: {
    position: 'absolute', left: LAB_L, top: 0, width: LAB_W, textAlign: 'right',
    fontFamily: 'Inter_700Bold', fontSize: 10.5, lineHeight: 14, letterSpacing: 1.4, color: INK,
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
    borderWidth: 2, borderColor: INK, borderRadius: 3, backgroundColor: RULE, overflow: 'hidden',
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
  // TONE, NOT WHITE. This scene drew every prop as an outline on paper — two
  // values and no depth, which is the flat case `check:shade` exists to find.
  // The structural mass takes STONE, a secondary surface takes RULE, and what
  // carries the message stays PAPER, so the picture has things at different
  // values rather than everything a shade darker. See cinematicKit's ramp.
  podBox: {
    position: 'absolute', left: 7, top: 0, width: PODIUM_W, height: PODIUM_H,
    borderWidth: 2.5, borderColor: INK, backgroundColor: STONE, boxShadow: LIP,
  },
  podCap: { position: 'absolute', left: 0, top: 0, width: PODIUM_W + 14, height: 5, backgroundColor: INK },
  podLab: {
    position: 'absolute', left: 7, top: 11, width: PODIUM_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.2, color: INK, includeFontPadding: false,
  },
  // The struck face: exactly podBox's rectangle in ink, border and all.
  podLit: { position: 'absolute', left: 7, top: 0, width: PODIUM_W, height: PODIUM_H, backgroundColor: INK },
  podLabOn: { color: PAPER },

  // ── the MUGGER tag ────────────────────────────────────────────────────────
  // x 60..132, y 322..360 — clear of the matrix (ends 288), of the ledger (x ≥ 194)
  // and of the ruler's crown (≥ 397 on the two beats it hangs over him).
  tag: { position: 'absolute', left: RULER_X - TAG_W / 2, top: TAG_T, width: TAG_W, height: TAG_H + TAG_LEAD },
  tagPlate: {
    position: 'absolute', left: 0, top: 0, width: TAG_W, height: TAG_H,
    borderWidth: 2, borderColor: INK, borderRadius: 3, backgroundColor: PAPER,
    alignItems: 'center', justifyContent: 'center',
  },
  tagText: {
    fontFamily: 'Inter_700Bold', fontSize: 10.5, lineHeight: 14, letterSpacing: 1.4, color: INK,
    includeFontPadding: false,
  },
  tagLead: { position: 'absolute', left: TAG_W / 2 - 0.75, top: TAG_H, width: 1.5, height: TAG_LEAD, backgroundColor: SOFT },

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
    backgroundColor: STONE, boxShadow: LIP, justifyContent: 'center', paddingHorizontal: 10,
  },
  ledRight: { backgroundColor: INK, borderColor: INK },
  ledWrong: { borderColor: SOFT, opacity: 0.45 },
  ledTitle: { fontFamily: 'Inter_700Bold', fontSize: 14, lineHeight: 17, color: INK, letterSpacing: 0.3, includeFontPadding: false },
  ledTitleOn: { color: PAPER },
  ledSub: { fontFamily: 'Inter_500Medium', fontSize: 12, lineHeight: 15, color: INK, includeFontPadding: false },
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
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Political2Scene} band={[216, 512]} camera={CAM} />;
}
