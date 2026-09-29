import { View, Text, StyleSheet } from 'react-native';
import Animated, { makeMutable, useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import Target from './Target';
import ObjectArt from './ObjectArt';
import SpeechBox from './SpeechBox';
import { BEATS } from './epistemologyScript';
import {
  clamp01, ease01, lerp, mixStance, narratorHold, narratorLive, pose, seated, stand, type Bundle, type Stance,
} from './rig';
import { reachHandTo } from './interact';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, useHeld, carryFrom, keepHeld, useCarry, carry, lookPose,
} from './cinematicKit';
import { stageTone, stageToneOf } from './stageTones';
import { floorStyle, lipOf, PLATE_FACE } from './stageSkin';
import type { SceneApi } from './CinematicPlayer';
import { followMoves, kindOf, seedOf } from './camera';
import { emoteAny, emoteAnyLive } from './moves';
import { useLinger } from './useLinger';
import { attendAt } from './attend';
import { easel, juryChairs, juryFront, BOARD, JURY, JURORS, JUROR_HEAD_Y } from './epistemologySet';
import { OLIVE, EMBER, PAPER_LIT } from '@/components/shared/tone';

// ─────────────────────────────────────────────────────────────────────────────
// epistemology-knowledge-1, "What Does It Mean to Know?" — IN A COURTROOM.
//
// Redrawn 2026-09-25, one of five first lessons the owner asked for after the logic
// debate studio, each displaying its information in a way of its own. Here it is an
// EVIDENCE BOARD: every condition of knowledge is a card pinned to it, and
// justification is the red string that ties the belief to the truth.
//
//   b0–1  a courtroom: a jury behind its rail, an advocate, the seeker at an evidence
//         board asking KNOWLEDGE?; the plaque over it names the field.
//   b2–4  TRUE is pinned, then BELIEF and REASONS; with all three the board is
//         stamped KNOWLEDGE.
//   b5–6  REASONS is ringed; then the red string runs from BELIEF through REASONS to
//         TRUE — justification connecting a belief to the truth.
//   b7–9  Plato's jurors: the advocate talks them round. The REASONS card falls, the
//         string drops slack, the stamp reads JUST LUCK; a PERSUADED card goes up in
//         the gap and is struck out.
//   b10   the first question, ON THE STAGE: three loose cards on the easel's shelf.
//         The right one goes up into the empty slot and the string ties again.
//   b11   the order question: the string tightens as the answer moves from a lucky
//         guess to strong reasons.
//
// WHAT IS NOT CHANGED: every word of narration (epistemologyScript.ts beats 0–12 keep
// their text and order; the voice is keyed by index).
//
// COMPOSITION, in stage units: the plaque 104–296 × 298–318; the board 22–206 ×
// 330–428 on its easel, cards pinned at y 356–414; the shelf of loose cards 440–474;
// the seeker at x 34, at the board's left end; the advocate at 274 facing the jury;
// three jurors SEATED at 316/350/384 in the jury box (rail top 452). Band [290, 514].
//
// RESTAGED 2026-09-28 — the owner: "if something's happening on scene, the stick man
// should be looking at it or should be interacting with it." He used to stand right of
// the board facing the court, with every card, the string and both stamps happening on
// the board at his BACK, where the gaze can only nod. He stands at its LEFT end now,
// facing right, so the whole courtroom — board, advocate, jury — is in front of him and
// he never has to turn his back on anyone (N21). He POINTS each card up as it is
// pinned (the board is above his reach), the string pin to pin and PERSUADED as it is
// struck. The jury box is redrawn against photographs (epistemologySet.ts): the
// jurors SIT, each in a chair, one forearm on the rail, chin in hand in turn.
// ─────────────────────────────────────────────────────────────────────────────

const TONE = stageTone('epistemology');
const { RULE, STONE, SHADE } = TONE;
const LIP = lipOf(TONE);
const WOOD = stageToneOf(OLIVE);
const TR = 0.85;

const SEEK_X = 34;
const ADV_X = 274;
const JUROR_X = JURORS.xs;
const JUROR_K = JURORS.k;
const EASEL = easel();
const JURY_CHAIRS = juryChairs();
const JURY_FRONT = juryFront();

// the three pinned cards: TRUE, BELIEF, REASONS — REASONS sits lower, so the red
// string from BELIEF through REASONS to TRUE is a V and not one straight line
const CARD_W = 56;
const CARD_H = 46;
const CARDS = [
  { id: 'true', label: 'TRUE', x: BOARD.x + 6, y: 356 },
  { id: 'belief', label: 'BELIEF', x: BOARD.x + 122, y: 356 },
  { id: 'reasons', label: 'REASONS', x: BOARD.x + 64, y: 368 },
];
const PIN = CARDS.map((c) => ({ x: c.x + CARD_W / 2, y: c.y + 4 }));
// the string's two runs, each hanging from its own pin: TRUE → REASONS, BELIEF → REASONS
const RUN_A = { from: PIN[0], to: PIN[2] };
const RUN_B = { from: PIN[1], to: PIN[2] };
const runLen = (r: { from: { x: number; y: number }; to: { x: number; y: number } }) =>
  Math.hypot(r.to.x - r.from.x, r.to.y - r.from.y);
const runAng = (r: { from: { x: number; y: number }; to: { x: number; y: number } }) =>
  (Math.atan2(r.to.y - r.from.y, r.to.x - r.from.x) * 180) / Math.PI;
const A_LEN = runLen(RUN_A);
const A_ANG = runAng(RUN_A);
const B_LEN = runLen(RUN_B);
const B_ANG = runAng(RUN_B);
// Slack, a run hangs 20 units: down over the card's picture and clear of its label.
const SLACK_A = 20 / A_LEN;
const SLACK_B = 20 / B_LEN;

// the question on the stage: three loose cards on the easel's lower shelf
const PICK_Y = 440;
const PICK_H = 34;
const PICK_W = 56;
const PICKS = [
  { id: 'certain', l1: 'FELT', l2: 'CERTAIN', x: BOARD.x + 10, correct: false },
  { id: 'reasons', l1: 'GOOD', l2: 'REASONS', x: BOARD.x + 68, correct: true },
  { id: 'agreed', l1: 'ALL', l2: 'AGREED', x: BOARD.x + 126, correct: false },
];

// the advocate's line, as he talks the jury round (Theaetetus 201a–c)
/** The plaque naming the field, centred over the board. */
const PLAQUE = { x: BOARD.x + BOARD.w / 2 - 96, y: 298, w: 192, h: 22 };

const SAY_BEAT = BEATS.findIndex((b) => !!b.cite && b.cite.includes('Theaetetus'));
// the box sits over the jury, clear of the board's stamp; its tail leans back to him
const SAY_X = makeMutable(ADV_X + 26);

// ── per-beat tracks, read off the script ─────────────────────────────────────
const HPOSE = BEATS.map((b) => b.hpose ?? 0);
const LOCKS = BEATS.map((b) => b.locks ?? [0, 0, 0]);
const LIT = [0, 1, 2].map((k) => LOCKS.map((l) => (l[k] >= 0.9 ? 1 : 0)));
const FIELD = BEATS.map((b) => (b.field ? 1 : 0));
const OPENS = BEATS.map((b) => (b.opens ? 1 : 0));
const TIE = BEATS.map((b) => (b.tie ? 1 : 0));
const THIRD = BEATS.map((b) => (b.third ? 1 : 0));
const PERS = BEATS.map((b) => (b.persuaded ? 1 : 0));
const PICK = BEATS.map((b) => (b.pick ? 1 : 0));
/** The board's verdict: KNOWLEDGE when all three are pinned and it has been judged, JUST LUCK without REASONS. */
const KNOW = BEATS.map((_, k) => (OPENS[k] && LIT[0][k] && LIT[1][k] && LIT[2][k] ? 1 : 0));
const LUCK = BEATS.map((_, k) => (OPENS[k] && !LIT[2][k] ? 1 : 0));
/** The string is taut while REASONS is pinned, slack once it has gone. */
const TAUT = BEATS.map((_, k) => (TIE[k] && LIT[2][k] ? 1 : 0));
/** Only the beat that pins PERSUADED strikes it out; after that it holds, struck. */
const PERS_IN = PERS.map((v, k) => (v === 1 && (k === 0 || PERS[k - 1] === 0) ? 1 : 0));
const SPEAKS = BEATS.map((_, k) => (k === SAY_BEAT ? 1 : 0));
/** Everyone is in court from the first beat to the question; the summary clears it. */
const COURT = BEATS.map((b) => (b.summary ? 0 : 1));

function hHold(code: number, t: number) {
  'worklet';
  if (code === 4) return emoteAny(260, t);
  return code === 0 ? stand(t) : narratorHold(code === 5 ? 2 : code, t);
}
function hLive(code: number, t: number, bt: number) {
  'worklet';
  if (code === 4) return emoteAnyLive(260, t, bt);
  return code === 0 ? stand(t) : narratorLive(code === 5 ? 2 : code, t, bt);
}

const X = BEATS.map(() => SEEK_X);


/** Put his right hand toward a point: on it if it is in reach, a straight arm aimed at it if not. */
function handOn(s: Stance, tx: number, ty: number, w: number): Stance {
  'worklet';
  return w <= 0 ? s : reachHandTo(s, { x: SEEK_X, groundY: GROUND, k: K_FIG, dir: 1 }, 1, tx, ty, w);
}
/** A window 0→1→0 over [a, b] seconds, a quarter-second in and out. */
function win(b: number, a: number, e: number): number {
  'worklet';
  return Math.min(ease01((b - a) / 0.25), ease01((e - b) / 0.3));
}
/**
 * A seated juror, listening: one forearm on the rail in front of him, the other hand
 * coming up to his chin and going down again on a slow cycle of its own, his head
 * turning with it; a little forward while the advocate talks. The pelvis never moves
 * on the clock (AL) — the life is in the hand, the neck and the lean.
 */
function jurorAt(t: number, x: number, lean: number): Stance {
  'worklet';
  const s = seated(21, t, 16);
  const u = 0.5 - 0.5 * Math.cos(t * 0.8);
  const chin = u * u * (3 - 2 * u);
  const sl = {
    ...s,
    tilt: s.tilt - 0.12 * lean - 0.05 * chin,
    neck: s.neck + 0.1 * chin - 0.08 * lean,
    fistL: { x: lerp(s.fistL.x, 13, chin), y: lerp(s.fistL.y, -33, chin) },
  };
  return reachHandTo(sl, { x, groundY: JURORS.dais, k: JUROR_K, dir: -1 }, 1, x - 13, JURY.top - 3, 1);
}
// R7b — the string follows the order control on its own graded beat, and only there.
const REACT = BEATS.map((b) => (b.interact?.order ? 1 : 0));
const CAM = followMoves(X, BEATS.map(kindOf), seedOf('epistemology'));

export default function EpistemologyScene({
  clock, bt, bi, qv, pickPos, i, picked, onPick, gazeX, gazeY, gazeOn,
}: SceneApi) {
  const reacting = REACT[i] === 1;
  // The right card, picked on the stage, goes up into the gap and ties the string again.
  const rightPick = PICK[i] === 1 && picked === 'reasons' ? 1 : 0;
  const heldSeek = useHeld();
  const cv = useCarry(16);
  const on = useLinger(i);
  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / TR);
    const t = clock.value;
    const back = rightPick * ease01(clamp01(qv.value));

    const b = bt.value;
    let seekS = keepHeld(heldSeek, mixStance(carryFrom(heldSeek, n, hHold(HPOSE[p], t)), hLive(HPOSE[n], t, bt.value), tr));
    // HIS HAND ON THE WORK: he points each card up as it is pinned, the stamp as it
    // lands, the string pin to pin, and PERSUADED as it is struck out. The board is
    // above his reach, so the arm goes out straight AT it rather than onto it.
    const cardAt = (k: number) => {
      'worklet';
      return { x: CARDS[k].x + CARD_W / 2, y: CARDS[k].y + CARD_H / 2 };
    };
    if (LIT[0][n] && !LIT[0][p]) {
      seekS = handOn(seekS, cardAt(0).x, cardAt(0).y, win(b, 0.2, 1.9));
    } else if (LIT[1][n] && !LIT[1][p]) {
      const u = ease01((b - 0.75) / 0.3);
      seekS = handOn(seekS, lerp(cardAt(1).x, cardAt(2).x, u), lerp(cardAt(1).y, cardAt(2).y, u), win(b, 0.2, 2.3));
    } else if (KNOW[n] && !KNOW[p]) {
      seekS = handOn(seekS, BOARD.x + BOARD.w - 45, BOARD.y + 13.5, win(b, 0.3, 1.6));
    } else if (THIRD[n] && !THIRD[p]) {
      seekS = handOn(seekS, cardAt(2).x, cardAt(2).y, win(b, 0.2, 2.6));
    } else if (TIE[n] && !TIE[p]) {
      const u1 = ease01((b - 0.6) / 0.3);
      const u2 = ease01((b - 1.2) / 0.3);
      seekS = handOn(seekS, lerp(lerp(PIN[1].x, PIN[2].x, u1), PIN[0].x, u2), lerp(lerp(PIN[1].y, PIN[2].y, u1), PIN[0].y, u2), win(b, 0.15, 2.8));
    } else if (PERS_IN[n]) {
      seekS = handOn(seekS, cardAt(2).x, cardAt(2).y, win(b, 1.0, 2.6));
    }
    // the advocate speaks on his beat and listens on every other
    const advS = SPEAKS[n] === 1
      ? mixStance(emoteAny(263, t), narratorLive(1, t, bt.value), ease01(bt.value / 0.5))
      : SPEAKS[p] === 1 ? mixStance(narratorHold(1, t), emoteAny(263, t), tr) : emoteAny(263, t);

    const pin = (delay: number) => {
      'worklet';
      return ease01((bt.value - delay) / 0.45);
    };
    // REASONS waits for BELIEF when the two are pinned on the same beat
    const reasons = carry(cv, 2, n, LIT[2][p], LIT[2][n], pin(LIT[1][n] && !LIT[1][p] ? 0.85 : 0.3));

    // ── WHERE HE LOOKS (attend.ts) ───────────────────────────────────────────
    // At what is happening, when it happens, and at nothing (weight 0) when nothing
    // is. Keys are seconds into the beat. This scene keeps no LINES table, so the
    // lengths of the voiced lines are read off lib/narration/manifest.ts
    // (epistemology-knowledge-1): b0 4.96 · b1 7.56 · b2 6.92 · b3 6.60 · b4 7.12 ·
    // b5 6.28 · b6 4.96 · b7 8.16 · b8 5.76. A head is 83 rig units over the ground.
    // Everything is in front of him: the board up to his right, the advocate and the
    // jury beyond it. A seated juror's head is JUROR_HEAD_Y.
    const LK = n === 0 ? [0.3, JUROR_X[1], JUROR_HEAD_Y, 0.8, 2.4, BOARD.x + 40, BOARD.y + 12, 0.9, 4.5, 0, 0, 0]
      // b1: the plaque goes up over the board (PLAQUE)
      : FIELD[n] && !FIELD[p] ? [0.2, PLAQUE.x + PLAQUE.w / 2, PLAQUE.y + PLAQUE.h / 2, 1, 3.2, 0, 0, 0]
      // b2: TRUE is pinned (0.3s), and again when the voice names truth
      : LIT[0][n] && !LIT[0][p] ? [0.2, CARDS[0].x + CARD_W / 2, CARDS[0].y + CARD_H / 2, 1, 1.8, 0, 0, 0,
        3.8, CARDS[0].x + CARD_W / 2, CARDS[0].y + CARD_H / 2, 0.8, 6.3, 0, 0, 0]
      // b3: BELIEF (0.3s), then REASONS (0.85s), and REASONS again for "justification"
      : LIT[1][n] && !LIT[1][p] ? [0.2, CARDS[1].x + CARD_W / 2, CARDS[1].y + CARD_H / 2, 1,
        0.8, CARDS[2].x + CARD_W / 2, CARDS[2].y + CARD_H / 2, 1, 2.2, 0, 0, 0,
        3.6, CARDS[2].x + CARD_W / 2, CARDS[2].y + CARD_H / 2, 0.8, 6.0, 0, 0, 0]
      // b4: the KNOWLEDGE stamp lands (0.4–0.8s), then the three together
      : KNOW[n] && !KNOW[p] ? [0.3, BOARD.x + BOARD.w - 45, BOARD.y + 13.5, 1, 3.0, BOARD.x + BOARD.w / 2, BOARD.y + BOARD.h / 2, 0.8, 6.5, 0, 0, 0]
      // b5: the ring round REASONS
      : THIRD[n] && !THIRD[p] ? [0.2, CARDS[2].x + CARD_W / 2, CARDS[2].y + CARD_H / 2, 1, 3.2, CARDS[2].x + CARD_W / 2, CARDS[2].y + CARD_H / 2, 0.7, 5.7, 0, 0, 0]
      // b6: the red string runs BELIEF → REASONS → TRUE; he follows it pin to pin
      : TIE[n] && !TIE[p] ? [0.2, PIN[1].x, PIN[1].y, 1, 0.7, PIN[2].x, PIN[2].y, 1, 1.3, PIN[0].x, PIN[0].y, 1, 3.0, 0, 0, 0]
      // b7: REASONS falls off the board (0.3–0.75s, 44 down), JUST LUCK is stamped
      // (0.9s), the advocate talks the jury round, and the jury
      : SPEAKS[n] ? [0.2, CARDS[2].x + CARD_W / 2, CARDS[2].y + CARD_H / 2 + 44 * (1 - reasons), 1,
        1.1, BOARD.x + BOARD.w - 45, BOARD.y + 13.5, 1, 2.2, ADV_X, GROUND - 83 * K_FIG, 0.9,
        4.4, JUROR_X[1], JUROR_HEAD_Y, 0.8, 7.6, 0, 0, 0]
      // b8: the jurors believe; PERSUADED goes up in the gap (0.9s) and is struck (1.6s)
      : PERS_IN[n] ? [0.2, JUROR_X[1], JUROR_HEAD_Y, 0.8, 0.8, CARDS[2].x + CARD_W / 2, CARDS[2].y + CARD_H / 2, 1,
        3.2, JUROR_X[1], JUROR_HEAD_Y, 0.8, 5.3, 0, 0, 0]
      // b10: the three loose cards on the shelf; the right one rises into the gap
      : PICK[n] ? [0.3, BOARD.x + BOARD.w / 2, lerp(PICK_Y + PICK_H / 2, CARDS[2].y + CARD_H / 2, back), 0.7]
      // b11: the string, tightening as the order control moves
      : REACT[n] ? [0.3, PIN[2].x, PIN[2].y, 0.6]
      : [0.2, 0, 0, 0];
    const lk = attendAt(LK, bt.value, 0, 0, 0);
    // the jurors lean in to the advocate while he talks them round, and stay persuaded
    const lean = carry(cv, 15, n, SPEAKS[p] || PERS[p] ? 1 : 0, SPEAKS[n] || PERS[n] ? 1 : 0, ease01((b - 0.4) / 0.8));

    return {
      seek: lookPose(seekS, SEEK_X, GROUND, K_FIG, 1, 1, carry(cv, 12, n, lk.x, lk.x, tr), carry(cv, 13, n, lk.y, lk.y, tr), carry(cv, 14, n, 0, lk.w, tr)),
      adv: pose(advS, ADV_X, GROUND, K_FIG, 1, 1),
      j0: pose(jurorAt(t, JUROR_X[0], lean), JUROR_X[0], JURORS.dais, JUROR_K, -1, 1),
      j1: pose(jurorAt(t + 1.3, JUROR_X[1], lean), JUROR_X[1], JURORS.dais, JUROR_K, -1, 1),
      j2: pose(jurorAt(t + 2.6, JUROR_X[2], lean), JUROR_X[2], JURORS.dais, JUROR_K, -1, 1),
      c0: carry(cv, 0, n, LIT[0][p], LIT[0][n], pin(0.3)),
      c1: carry(cv, 1, n, LIT[1][p], LIT[1][n], pin(0.3)),
      c2: Math.max(reasons, back),
      // a card that LEAVES falls off the board; one that arrives is pinned in from above
      c2Falling: LIT[2][p] === 1 && LIT[2][n] === 0 ? 1 : 0,
      field: carry(cv, 3, n, FIELD[p], FIELD[n], tr),
      know: Math.max(carry(cv, 4, n, KNOW[p], KNOW[n], ease01((bt.value - 0.4) / 0.4)), back),
      luck: carry(cv, 5, n, LUCK[p], LUCK[n], ease01((bt.value - 0.9) / 0.4)) * (1 - back),
      tie: carry(cv, 6, n, TIE[p], TIE[n], tr),
      taut: Math.max(carry(cv, 7, n, TAUT[p], TAUT[n], tr), reacting ? pickPos.value : 0, back),
      third: carry(cv, 8, n, THIRD[p], THIRD[n], tr),
      pers: carry(cv, 9, n, PERS[p], PERS[n], ease01((bt.value - 0.9) / 0.45)),
      persStrike: PERS_IN[n] === 1 ? ease01((bt.value - 1.6) / 0.5) : 1,
      court: carry(cv, 10, n, COURT[p], COURT[n], tr),
      pickOn: carry(cv, 11, n, PICK[p], PICK[n], tr),
      twinkle: t,
    };
  });

  const DS = useDerivedValue<Bundle>(() => SCENE.value.seek);
  const DA = useDerivedValue<Bundle>(() => SCENE.value.adv);
  const DJ0 = useDerivedValue<Bundle>(() => SCENE.value.j0);
  const DJ1 = useDerivedValue<Bundle>(() => SCENE.value.j1);
  const DJ2 = useDerivedValue<Bundle>(() => SCENE.value.j2);
  const court = useAnimatedStyle(() => ({ opacity: SCENE.value.court }));

  return (
    <View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      {on(FIELD) ? <Plaque S={SCENE} /> : null}
      {/* the jury stands behind its rail; the rail covers them below the chest */}
      {on(COURT) ? (
        <Animated.View style={[StyleSheet.absoluteFill, court]} pointerEvents="none">
          <ObjectArt parts={JURY_CHAIRS} tone={WOOD} />
          <Stickman D={DJ0} k={JUROR_K} role="crowd" />
          <Stickman D={DJ1} k={JUROR_K} role="crowd" />
          <Stickman D={DJ2} k={JUROR_K} role="crowd" />
          <ObjectArt parts={JURY_FRONT} tone={WOOD} />
        </Animated.View>
      ) : null}
      <ObjectArt parts={EASEL} tone={WOOD} />
      <Board S={SCENE} on={on} />
      {PICK[i] ? <Picks picked={picked} onPick={onPick} /> : null}
      <View style={styles.ground} pointerEvents="none" />
      {on(COURT) ? (
        <Animated.View style={[StyleSheet.absoluteFill, court]} pointerEvents="none">
          <Stickman D={DA} k={K_FIG} role="second" />
        </Animated.View>
      ) : null}
      <Stickman D={DS} k={K_FIG} />
      {on(SPEAKS) ? (
        <SpeechBox
          text={'TRUST ME.\nHE DID IT.'} beat={SAY_BEAT} bi={bi} bt={bt} x={SAY_X}
          tipY={GROUND - 103 - 8} side={1} shout lip={EMBER}
        />
      ) : null}
    </View>
  );
}

// ── the plaque over the court: the name of the field ─────────────────────────

function Plaque({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({
    opacity: S.value.field,
    transform: [{ translateY: (1 - S.value.field) * -6 }],
  }));
  return (
    <Animated.View style={[styles.plaque, st]} pointerEvents="none">
      <Text style={styles.plaqueText} numberOfLines={1}>EPISTEMOLOGY</Text>
    </Animated.View>
  );
}

// ── the evidence board ───────────────────────────────────────────────────────

/** A card's little picture: a photograph for TRUE, a thought for BELIEF, a fingerprint for REASONS. */
function CardArt({ id }: { id: string }) {
  if (id === 'true') {
    return (
      <View style={styles.photo}>
        <View style={styles.photoSun} />
        <View style={styles.photoHill} />
      </View>
    );
  }
  if (id === 'belief') {
    return (
      <View style={styles.thoughtArt}>
        <View style={styles.thoughtCloud} />
        <View style={[styles.thoughtDot, { left: 7, top: 17 }]} />
        <View style={[styles.thoughtDot, { left: 3, top: 21, width: 3, height: 3 }]} />
      </View>
    );
  }
  return (
    <View style={styles.printArt}>
      <View style={[styles.printRing, { width: 22, height: 24, borderRadius: 11 }]} />
      <View style={[styles.printRing, { width: 14, height: 16, borderRadius: 7 }]} />
      <View style={[styles.printRing, { width: 6, height: 8, borderRadius: 3 }]} />
    </View>
  );
}

function Card({ S, k }: { S: SharedValue<any>; k: number }) {
  const c = CARDS[k];
  const key = (['c0', 'c1', 'c2'] as const)[k];
  const st = useAnimatedStyle(() => {
    const v = S.value[key];
    // falling off: the card drops toward the tray and turns as it goes
    if (k === 2 && S.value.c2Falling === 1) {
      return {
        opacity: v,
        transform: [{ translateY: (1 - v) * 44 }, { rotate: `${(1 - v) * 24}deg` }],
      };
    }
    return { opacity: v, transform: [{ translateY: (1 - v) * -12 }, { rotate: '0deg' }] };
  });
  return (
    <Animated.View style={[styles.card, { left: c.x, top: c.y }, st]}>
      <CardArt id={c.id} />
      <Text style={styles.cardText} numberOfLines={1}>{c.label}</Text>
      <View style={styles.pin} />
    </Animated.View>
  );
}

function Board({ S, on }: { S: SharedValue<any>; on: (a: readonly number[]) => boolean }) {
  const know = useAnimatedStyle(() => ({
    opacity: S.value.know,
    transform: [{ rotate: '-5deg' }, { scale: lerp(1.2, 1, S.value.know) }],
  }));
  const luck = useAnimatedStyle(() => ({
    opacity: S.value.luck,
    transform: [{ rotate: '-5deg' }, { scale: lerp(1.2, 1, S.value.luck) }],
  }));
  const ring = useAnimatedStyle(() => ({
    opacity: S.value.third * (0.75 + 0.25 * Math.sin(S.value.twinkle * 3)),
    transform: [{ scale: lerp(1.3, 1, S.value.third) }],
  }));
  // The string's two runs hang from their pins. Taut, they reach the REASONS pin;
  // slack, each swings down under its own pin.
  const runA = useAnimatedStyle(() => ({
    opacity: S.value.tie,
    transform: [{ rotate: `${lerp(90, A_ANG, S.value.taut)}deg` }, { scaleX: S.value.tie * lerp(SLACK_A, 1, S.value.taut) }],
  }));
  const runB = useAnimatedStyle(() => ({
    opacity: S.value.tie,
    transform: [{ rotate: `${lerp(90, B_ANG, S.value.taut)}deg` }, { scaleX: S.value.tie * lerp(SLACK_B, 1, S.value.taut) }],
  }));
  const pers = useAnimatedStyle(() => ({
    opacity: S.value.pers,
    transform: [{ translateY: (1 - S.value.pers) * -12 }],
  }));
  const strike = useAnimatedStyle(() => ({ transform: [{ scaleX: S.value.persStrike }] }));
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={styles.board} />
      <Text style={styles.boardHead} numberOfLines={1}>KNOWLEDGE?</Text>
      {/* the empty slots, dashed, so a card that is missing is visibly missing */}
      {CARDS.map((c) => <View key={c.id} style={[styles.slot, { left: c.x, top: c.y }]} />)}
      {on(THIRD) ? <Animated.View style={[styles.ring, ring]} /> : null}
      {CARDS.map((_, k) => <Card key={k} S={S} k={k} />)}
      {on(PERS) ? (
        <Animated.View style={[styles.card, { left: CARDS[2].x, top: CARDS[2].y }, pers]}>
          <View style={styles.sayArt}>
            <View style={styles.sayBubble} />
            <View style={styles.sayTail} />
          </View>
          <Text style={styles.cardTextSmall} numberOfLines={1}>PERSUADED</Text>
          <View style={styles.pin} />
          <Animated.View nativeID="strike-persuaded" style={[styles.cardStrike, strike]} />
        </Animated.View>
      ) : null}
      {on(TIE) ? (
        <>
          <Animated.View style={[styles.run, { left: RUN_A.from.x, top: RUN_A.from.y - 0.75, width: A_LEN }, runA]} />
          <Animated.View style={[styles.run, { left: RUN_B.from.x, top: RUN_B.from.y - 0.75, width: B_LEN }, runB]} />
        </>
      ) : null}
      {on(KNOW) || PICK.some((v) => v) ? (
        <Animated.View style={[styles.stamp, know]}>
          <Text style={styles.stampText} numberOfLines={1}>KNOWLEDGE</Text>
        </Animated.View>
      ) : null}
      {on(LUCK) ? (
        <Animated.View style={[styles.stamp, luck]}>
          <Text style={styles.stampText} numberOfLines={1}>JUST LUCK</Text>
        </Animated.View>
      ) : null}
    </View>
  );
}

// ── the question on the stage: which card would make it knowledge? ──────────

function Picks({ picked, onPick }: { picked: string | null; onPick: (id: string, ok: boolean) => void }) {
  const answered = picked !== null;
  return (
    <>
      <View style={styles.shelf} pointerEvents="none" />
      {PICKS.map((q) => (
        <Target
          key={q.id} id={q.id} correct={q.correct} picked={picked} onPick={onPick} radius={4}
          disabled={answered} sealAt="tr"
          style={[styles.pick, { left: q.x }]}
        >
          <View style={[styles.pickFace, answered && q.correct && styles.pickRight]}>
            <Text style={[styles.pickText, answered && q.correct && styles.pickTextOnInk]} numberOfLines={1}>{q.l1}</Text>
            <Text style={[styles.pickText, answered && q.correct && styles.pickTextOnInk]} numberOfLines={1}>{q.l2}</Text>
          </View>
        </Target>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  floor: floorStyle(TONE, GROUND),
  ground: { position: 'absolute', left: 8, right: 8, top: GROUND, height: 1.5, backgroundColor: RULE },

  plaque: {
    position: 'absolute', left: PLAQUE.x, top: PLAQUE.y, width: PLAQUE.w, height: PLAQUE.h,
    borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: PLATE_FACE, boxShadow: lipOf(WOOD),
    alignItems: 'center', justifyContent: 'center',
  },
  plaqueText: {
    fontFamily: 'Inter_700Bold', fontSize: 12, letterSpacing: 2.2, color: INK, includeFontPadding: false,
  },

  board: {
    position: 'absolute', left: BOARD.x, top: BOARD.y, width: BOARD.w, height: BOARD.h,
    borderWidth: 1.5, borderColor: INK, borderRadius: 2, backgroundColor: STONE,
  },
  boardHead: {
    position: 'absolute', left: BOARD.x + 8, top: BOARD.y + 6,
    fontFamily: 'Inter_700Bold', fontSize: 10.5, letterSpacing: 1.2, color: INK, includeFontPadding: false,
  },
  slot: {
    position: 'absolute', width: CARD_W, height: CARD_H, borderRadius: 3,
    borderWidth: 1.5, borderColor: SHADE, borderStyle: 'dashed',
  },
  card: {
    position: 'absolute', width: CARD_W, height: CARD_H, borderRadius: 3,
    borderWidth: 1.5, borderColor: INK, backgroundColor: PLATE_FACE, boxShadow: LIP,
    alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 4,
  },
  cardText: {
    fontFamily: 'Inter_700Bold', fontSize: 9, lineHeight: 11, letterSpacing: 0.2, color: INK, includeFontPadding: false,
  },
  cardTextSmall: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10, letterSpacing: -0.3, color: INK, includeFontPadding: false,
  },
  pin: {
    position: 'absolute', top: -3, left: CARD_W / 2 - 4.5, width: 7, height: 7, borderRadius: 3.5,
    backgroundColor: EMBER, borderWidth: 1, borderColor: INK,
  },
  photo: {
    position: 'absolute', left: 6, top: 8, width: CARD_W - 15, height: 20, borderRadius: 1,
    backgroundColor: SHADE, overflow: 'hidden',
  },
  photoSun: { position: 'absolute', left: 5, top: 3, width: 7, height: 7, borderRadius: 3.5, backgroundColor: PAPER_LIT },
  photoHill: {
    position: 'absolute', left: 4, top: 11, width: 40, height: 22, borderRadius: 20, backgroundColor: INK,
  },
  thoughtArt: { position: 'absolute', left: 12, top: 5, width: 26, height: 25 },
  thoughtCloud: {
    position: 'absolute', left: 6, top: 2, width: 20, height: 14, borderRadius: 7,
    borderWidth: 1.5, borderColor: INK, backgroundColor: PAPER_LIT,
  },
  thoughtDot: { position: 'absolute', width: 4.5, height: 4.5, borderRadius: 2.5, backgroundColor: INK },
  printArt: { position: 'absolute', left: 14, top: 5, width: 22, height: 26, alignItems: 'center', justifyContent: 'center' },
  printRing: { position: 'absolute', borderWidth: 1.5, borderColor: INK },
  sayArt: { position: 'absolute', left: 13, top: 6, width: 24, height: 22 },
  sayBubble: {
    position: 'absolute', left: 0, top: 0, width: 24, height: 15, borderRadius: 5,
    borderWidth: 1.5, borderColor: INK, backgroundColor: PAPER_LIT,
  },
  sayTail: {
    position: 'absolute', left: 5, top: 13, width: 6, height: 6, backgroundColor: INK,
    transform: [{ rotate: '45deg' }],
  },
  cardStrike: {
    position: 'absolute', left: -4, right: -4, top: 20, height: 3, borderRadius: 1.5,
    backgroundColor: INK, transformOrigin: '0% 50%', transform: [{ rotate: '-18deg' }],
  },
  ring: {
    position: 'absolute', left: CARDS[2].x - 7, top: CARDS[2].y - 8, width: CARD_W + 14, height: CARD_H + 14,
    borderRadius: 30, borderWidth: 2, borderColor: INK, borderStyle: 'dashed',
  },
  run: { position: 'absolute', height: 1.5, borderRadius: 0.75, backgroundColor: EMBER, transformOrigin: '0% 50%' },
  stamp: {
    position: 'absolute', left: BOARD.x + BOARD.w - 84, top: BOARD.y + 5, width: 78, height: 17,
    backgroundColor: INK, borderRadius: 3, alignItems: 'center', justifyContent: 'center',
  },
  stampText: {
    fontFamily: 'Inter_700Bold', fontSize: 9.5, letterSpacing: 1, color: PAPER_LIT, includeFontPadding: false,
  },

  shelf: {
    position: 'absolute', left: BOARD.x + 4, top: PICK_Y + PICK_H, width: BOARD.w - 8, height: 5,
    backgroundColor: WOOD.SHADE, borderWidth: 1.5, borderColor: INK, borderRadius: 2,
  },
  pick: { position: 'absolute', top: PICK_Y, width: PICK_W, height: PICK_H },
  pickFace: {
    flexGrow: 1, borderWidth: 1.5, borderColor: INK, borderRadius: 4, backgroundColor: PLATE_FACE, boxShadow: LIP,
    alignItems: 'center', justifyContent: 'center',
  },
  pickRight: { backgroundColor: INK },
  pickText: {
    fontFamily: 'Inter_700Bold', fontSize: 10, lineHeight: 12, letterSpacing: 0.4, color: INK, includeFontPadding: false,
  },
  pickTextOnInk: { color: PAPER_LIT },
});

export function EpistemologyLesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={EpistemologyScene} band={[290, 514]} camera={CAM} />;
}
