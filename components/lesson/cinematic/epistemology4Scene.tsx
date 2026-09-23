import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { clamp01, ease01, lerp, mixStance, pose, type Bundle } from './rig';
// The whole movement library, not just rig's 49 emotes. Codes under 100 ARE
// rig's and mean exactly what they always did; 100+ reach moves.ts (emoteAny).
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './epistemology4Script';
import { K_FIG, STAGE_W, STAGE_H, INK, SOFT, PAPER, useHeld, carryFrom, keepHeld, useCarry, carry, reactPose,
  stageAnswered,
} from './cinematicKit';
import { stageTone } from './stageTones';
import { floorStyle, lipOf, PLATE_FACE } from './stageSkin';
import type { SceneApi } from './CinematicPlayer';
import Target, { useAnswerSpent } from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// THE STAGE IS STRUCK IN THIS LESSON'S OWN BRANCH HUE (./stageTones).
// Same three tones, same luminance to the third decimal — so every contrast
// measured against the old greys still holds and nothing on the stage moved.
const TONE = stageTone('epistemology');
const { RULE, STONE, SHADE } = TONE;
const LIP = lipOf(TONE);   // the ledge a toned plate stands on (scripts/skin-stage.mjs)

// ─────────────────────────────────────────────────────────────────────────────
// A LABELLED FLOW DIAGRAM standing over the two arguers.
//
//   LEFT PANEL  (y 196–278)   [eye] ──•••──▸ [slate]      experience writes it in
//   RIGHT PANEL (y 196–278)   a mind that already holds 2+2=4, A=A, no square circles
//   KANT BOX    (y 286–342)   both panels feed down into one: DATA + FORMS = EXPERIENCE
//   THE ARGUERS (y 354–500)   empiricist facing right, rationalist facing left
//
// On the question beat the panels give way to four big name plates, so Q1 is answered
// by tapping the stage. The camera is identity, so these constants ARE final stage
// coordinates and the band can be read straight off them.
//
// ── EVERY TAP OF THE OPENING CHANGES THE PICTURE ────────────────────────────
// Four taps held one frame. Each now draws what it names, in the empty row under the
// panels (y 288…342) that Kant's box does not use until beat 10:
//   · "this view is called empiricism" — EMPIRICISM under the left panel (x 14…100)
//   · "is called a priori" — A PRIORI under the right one (x 300…386)
//   · "how to double a square" — the boy's square, and on "the soul already knew
//     these truths" the square on its diagonal and KNOWN BEFORE BIRTH (`meno`,
//     x 106…296). Meno's figure: four cells of 24, and the square through their
//     diagonals, which is exactly twice one cell (33.94² = 1152 = 2 × 576).
//   · Kant's box arrives with SENSE DATA alone on "the content … comes through the
//     senses", and completes — + MIND'S FORMS, = KNOWLEDGE, the second feeder — on
//     "the mind orders that content through its own forms … Knowledge needs both"
//     (`forms`). It read = EXPERIENCE; the sentence it stands under says knowledge.
// Both figures' skulls top out at y ≈ 396, far below all of it.
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
const SCHOOL = BEATS.map((b) => b.school ?? 0);
const APRIORI = BEATS.map((b) => b.apriori ?? 0);
const MENO = BEATS.map((b) => b.meno ?? 0);
const FORMS = BEATS.map((b) => b.forms ?? 0);

// Meno's figure: a 2 × 2 grid of 24-unit cells, the boy's square the top-left one.
const MENO_L = 106;
const MENO_T = 290;
const CELL = 24;
const DIAG = CELL * Math.SQRT2;              // the side of the doubled square

// THE CAMERA (H60b). `followMoves` reads the x track and gives each beat its own
// shot: it FOLLOWS the subject when a beat moves far enough to be worth following,
// pushes close on a quote, and PULLS BACK to the whole band on a question or a
// summary — the beats the reader has to read and act on.
// Two figures at 96 and 296, so the track is the point BETWEEN them (196) — following
// either one alone would frame the other out, and here the pair is the subject.
const X = BEATS.map((b) => b.x ?? 196);

// R7b — the stage follows the control on its own graded beat, and only there.
// Derived from the beat rather than declared as a channel so it cannot fall out
// of step with the control it is about.
const REACT = BEATS.map((b) => (b.interact?.sort ? 1 : 0));
const CAM = followMoves(X, BEATS.map(kindOf), seedOf('epistemology4'));

export default function Epistemology4Scene({ clock, bt, bi, i, picked, onPick, dragPos, pickPos }: SceneApi) {
  const reacting = REACT[i] === 1;
  const heldE = useHeld();
  const cv = useCarry(7);
  const heldR = useHeld();
  const cur = BEATS[i];
  const answered = picked !== null;
  // ONLY THE QUESTION ASKED ON THE STAGE mounts its targets (E41). It was
  // `!!cur.interact`, so on the second question — a control answered below the
  // figure — the stage swapped its diagram for the first question's cards, and the
  // diagram the control moves (R7c) could not be seen at all.
  const asking = stageAnswered(cur);
  // The instruction retires once answered: the chosen card lifts into its line.
  const spent = useAnswerSpent(picked);

  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / 0.85);
    const t = clock.value;

    const e = keepHeld(heldE, mixStance(carryFrom(heldE, n, emoteHold(E_CODE[p], t)), emoteLive(E_CODE[n], t, bt.value), tr));
    const r = keepHeld(heldR, mixStance(carryFrom(heldR, n, emoteHold(R_CODE[p], t)), emoteLive(R_CODE[n], t, bt.value), tr));
    return {
      e: reactPose(e, E_X, 500, K_FIG, 1, 1),
      r: pose(r, R_X, 500, K_FIG, -1, 1),
      fill: carry(cv, 0, n, FILL[p], FILL[n], tr),
      // R7b — the knob raises the innate glow. The rail runs from none of it comes
      // before experience to all of it, and the rationalist's light on the slate rises
      // with it, so the reader sees the claim they are settling on.
      glow: carry(cv, 1, n, GLOW[p], reacting ? pickPos.value : GLOW[n], tr),
      bridge: carry(cv, 2, n, BRIDGE[p], BRIDGE[n], tr),
      school: carry(cv, 3, n, SCHOOL[p], SCHOOL[n], ease01((bt.value - 0.2) / 0.6)),
      apriori: carry(cv, 4, n, APRIORI[p], APRIORI[n], ease01((bt.value - 0.9) / 0.6)),
      meno: carry(cv, 5, n, MENO[p], MENO[n], ease01((bt.value - 0.3) / 1.0)),
      forms: carry(cv, 6, n, FORMS[p], FORMS[n], ease01((bt.value - 0.4) / 0.8)),
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
  // Kant's second term, its sum and the rationalist's feeder: one value, one style each.
  const formsTerm = useAnimatedStyle(() => ({ opacity: SCENE.value.forms }));
  const formsSum = useAnimatedStyle(() => ({
    opacity: SCENE.value.forms,
    transform: [{ translateY: (1 - SCENE.value.forms) * 4 }],
  }));
  const formsFeed = useAnimatedStyle(() => ({ opacity: SCENE.value.forms }));
  const schoolStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.school,
    transform: [{ translateY: (1 - SCENE.value.school) * -5 }],
  }));
  const aprioriStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.apriori,
    transform: [{ translateY: (1 - SCENE.value.apriori) * -5 }],
  }));
  // Meno's figure clears the row for Kant's box, which arrives in the same place.
  const menoCell = useAnimatedStyle(() => {
    const u = clamp01(SCENE.value.meno * 2);
    return { opacity: u * (1 - SCENE.value.bridge), transform: [{ scale: 0.8 + 0.2 * u }] };
  });
  const menoGrid = useAnimatedStyle(() => ({
    opacity: clamp01(SCENE.value.meno * 2 - 1) * (1 - SCENE.value.bridge),
  }));
  const menoDiag = useAnimatedStyle(() => {
    const u = clamp01(SCENE.value.meno * 2 - 1);
    return { opacity: u * (1 - SCENE.value.bridge), transform: [{ rotate: '45deg' }, { scale: 0.6 + 0.4 * u }] };
  });
  const menoCap = useAnimatedStyle(() => {
    const u = clamp01(SCENE.value.meno * 3 - 2);
    return { opacity: u * (1 - SCENE.value.bridge), transform: [{ translateX: (1 - u) * -8 }] };
  });

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
          <Animated.View style={[styles.aura, { left: PAN_R + 6, top: 216 }, auraStyle]} />
          <View style={[styles.mind, { left: PAN_R + 12, top: 219 }]}>
            {AXIOMS.map((a, k) => <Axiom key={a} S={SCENE} text={a} k={k} />)}
          </View>

          {/* the two schools, named under their panels */}
          <Animated.Text style={[styles.schoolLbl, { left: PAN_L }, schoolStyle]} numberOfLines={1}>EMPIRICISM</Animated.Text>
          <Animated.Text style={[styles.schoolLbl, { left: PAN_R + PAN_W - 86 }, aprioriStyle]} numberOfLines={1}>A PRIORI</Animated.Text>

          {/* MENO — the boy's square, then the square on its diagonal */}
          <Animated.View style={[styles.menoFrame, menoGrid]}>
            <View style={styles.menoMidV} />
            <View style={styles.menoMidH} />
          </Animated.View>
          <Animated.View style={[styles.menoCell, menoCell]} />
          <Animated.View style={[styles.menoDiag, menoDiag]} />
          <Animated.Text style={[styles.menoCap, menoCap]} numberOfLines={1}>KNOWN BEFORE BIRTH</Animated.Text>

          {/* KANT — both feed one box */}
          <Animated.View style={[StyleSheet.absoluteFill, kantStyle]}>
            <View style={[styles.feeder, { left: 120 }]} />
            <Animated.View style={[styles.feeder, { left: 280 }, formsFeed]} />
            <View style={styles.kant}>
              <Text style={styles.kantTag}>KANT’S TRUCE</Text>
              <View style={styles.kantRow}>
                <Text style={styles.kantA}>SENSE DATA</Text>
                <Animated.Text style={[styles.kantA, formsTerm]}>  +  MIND’S FORMS</Animated.Text>
              </View>
              <Animated.Text style={[styles.kantB, formsSum]}>=  KNOWLEDGE</Animated.Text>
            </View>
          </Animated.View>
        </View>
      )}

      {/* ── the two arguers ───────────────────────────────────────────────── */}
      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DE} k={K_FIG} />
      <Stickman role="second" D={DR} k={K_FIG} />

      {/* ── Q1 answered in the scene: tap the blank-slate thinker ─────────── */}
      {asking && (
        <>
          <Animated.Text style={[styles.askLabel, spent]}>TAP THE BLANK-SLATE THINKER</Animated.Text>
          {PLATES.map((pl) => (
            <Target id={pl.id} correct={pl.correct} picked={picked} onPick={onPick}
              key={pl.id} style={[styles.plateHit, { left: pl.x, top: pl.y }]} disabled={answered}>
              <View
                style={[
                  styles.plate,
                  answered && pl.correct && styles.plateRight,
                  answered && picked === pl.id && !pl.correct && styles.plateWrong,
                ]}
              >
                <Text style={[styles.plateT, answered && pl.correct && styles.plateTOn]}>{pl.label}</Text>
              </View>
            </Target>
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
    <Animated.View style={[styles.axRow, { top: 3 + k * 14 }, st]}>
      <Text style={styles.axT}>{text}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 24, right: 24, top: 500, height: 1.5, backgroundColor: RULE },

  // TONE, NOT WHITE. This scene drew every prop as an outline on paper — two
  // values and no depth, which is the flat case `check:shade` exists to find.
  // The structural mass takes STONE, a secondary surface takes RULE, and what
  // carries the message stays PAPER, so the picture has things at different
  // values rather than everything a shade darker. See cinematicKit's ramp.
  panel: {
    position: 'absolute', top: PAN_T, width: PAN_W, height: PAN_H,
    borderWidth: 1.5, borderColor: RULE, borderRadius: 5, backgroundColor: RULE,
  },
  // Sits at 201–214. The rationalist's aura ring starts at 216, so the ring no longer
  // slices through the header the way it did at top 212.
  panHdr: {
    marginTop: 5, textAlign: 'center', lineHeight: 13,
    fontFamily: 'Inter_700Bold', fontSize: 9.5, letterSpacing: 1.2, color: SOFT,
    includeFontPadding: false,
  },
  tiny: {
    position: 'absolute', textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 1.2, color: SOFT,
    includeFontPadding: false,
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
    position: 'absolute', width: PAN_W - 12, height: 58,
    borderWidth: 2, borderColor: INK, borderRadius: 30,
  },
  mind: {
    position: 'absolute', width: PAN_W - 24, height: 52,
    borderWidth: 2, borderColor: INK, borderRadius: 26, backgroundColor: STONE, boxShadow: LIP,
  },
  axRow: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  // 3 / 17 / 31 with a 14-unit line: the last axiom ends at 45, inside the pill's
  // 48 units of interior, so nothing is clipped off the bottom.
  axT: { fontFamily: 'Inter_700Bold', fontSize: 11, lineHeight: 14, letterSpacing: 0.6, color: INK, includeFontPadding: false },

  feeder: { position: 'absolute', top: 278, width: 2, height: 10, backgroundColor: INK },
  // Three stacked lines in a fixed-height box, so every one carries an explicit
  // lineHeight and includeFontPadding:false — Android's hidden font padding is what
  // silently eats the last line of a box like this. 4+11+3+13+3+15 = 49, inside the
  // 51 units of interior.
  kant: {
    position: 'absolute', left: 100, top: 286, width: 200, height: 56,
    borderWidth: 2.5, borderColor: INK, borderRadius: 8, backgroundColor: STONE, boxShadow: LIP, alignItems: 'center',
  },
  kantTag: { marginTop: 4, fontFamily: 'Inter_700Bold', fontSize: 9, lineHeight: 11, letterSpacing: 1.6, color: INK, includeFontPadding: false },
  // The first line is two pieces now, so the second term can arrive a beat after
  // the first. Laid out whole from the start, so nothing reflows when it does.
  kantRow: { flexDirection: 'row' },
  kantA: { marginTop: 3, fontFamily: 'Inter_700Bold', fontSize: 10, lineHeight: 13, letterSpacing: 0.4, color: INK, includeFontPadding: false },
  kantB: { marginTop: 3, fontFamily: 'Inter_700Bold', fontSize: 12.5, lineHeight: 15, letterSpacing: 0.6, color: INK, includeFontPadding: false },

  // Under the panels, outside Kant's box (100…300): 71 and 52 units of type in 86.
  schoolLbl: {
    position: 'absolute', top: 290, width: 86, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 9.5, lineHeight: 12, letterSpacing: 1.4, color: INK,
    includeFontPadding: false,
  },
  menoFrame: {
    position: 'absolute', left: MENO_L, top: MENO_T, width: CELL * 2, height: CELL * 2,
    borderWidth: 1.5, borderColor: SOFT,
  },
  // The cell boundaries sit 24 in from the frame's outer edge, 22.5 inside its border.
  menoMidV: { position: 'absolute', left: CELL - 1.5 - 0.75, top: 0, bottom: 0, width: 1.5, backgroundColor: SOFT },
  menoMidH: { position: 'absolute', top: CELL - 1.5 - 0.75, left: 0, right: 0, height: 1.5, backgroundColor: SOFT },
  menoCell: {
    position: 'absolute', left: MENO_L, top: MENO_T, width: CELL, height: CELL,
    borderWidth: 2, borderColor: INK, backgroundColor: STONE, boxShadow: LIP,
  },
  menoDiag: {
    position: 'absolute', left: MENO_L + CELL - DIAG / 2, top: MENO_T + CELL - DIAG / 2, width: DIAG, height: DIAG,
    borderWidth: 2, borderColor: INK,
  },
  // Right of the figure, on the grid's middle line; 130 units of type ending at 294.
  menoCap: {
    position: 'absolute', left: MENO_L + CELL * 2 + 10, top: MENO_T + CELL - 6,
    fontFamily: 'Inter_700Bold', fontSize: 9.5, lineHeight: 12, letterSpacing: 1.2, color: INK,
    includeFontPadding: false,
  },

  askLabel: {
    position: 'absolute', left: 0, right: 0, top: 198, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.4, color: SOFT,
    includeFontPadding: false,
  },
  plateHit: { position: 'absolute', width: PAN_W },
  plate: {
    height: 44, borderWidth: 2.5, borderColor: INK, borderRadius: 5, backgroundColor: PLATE_FACE, boxShadow: LIP,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8,
  },
  plateRight: { backgroundColor: INK, borderColor: INK },
  plateWrong: { borderColor: SOFT },
  plateT: { fontFamily: 'Inter_700Bold', fontSize: 14, letterSpacing: 0.4, color: INK, includeFontPadding: false },
  plateTOn: { color: PAPER },
});

// The band. Highest ink: the question label at y 198 and the panels at 196. Lowest:
// the ground rule at 500 plus the figures' ankle joints, whose 7.4-unit radius reaches
// ≈ 507. The arguers' crowns sit at y ≈ 354 even on their bounciest gesture (the shrug
// on beat 1), so the Kant box (bottom 342) never meets them. The four name plates run
// 220–318. The school labels (290–302) and Meno's figure (290–338) share Kant's row.
// 328 units instead of 560 renders everything at ~2×.
export function Epistemology4Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Epistemology4Scene} band={[186, 514]} camera={CAM} />;
}
