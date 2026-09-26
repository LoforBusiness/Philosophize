import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  makeMutable, useAnimatedStyle, useDerivedValue, useSharedValue,
  type SharedValue,
} from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer, { type SceneApi } from './CinematicPlayer';
import {
  BLANK, WALK, clamp01, dirsFrom, ease01, easeOutBack, lerp,
  mixStance, moveTr, narratorHold, narratorLive, pose, stand, travelStance,
  type Bundle, type Stance,
} from './rig';
import {
  Bubble, GROUND, K_FIG, STAGE_H, INK, PAPER, carry, lookPose, useCarry,
} from './cinematicKit';
import { stageTone, stageToneOf } from './stageTones';
import { floorStyle, lipOf } from './stageSkin';
import type { Shot } from './camera';
import { BEATS, type BoardKey } from './logic1Script';
import { emoteAny } from './moves';
import ObjectArt from './ObjectArt';
import { lectern, notes, bust, klepsydra, LECTERN_OFF } from './logic1Set';
import { BOARD_PHASES } from './logic1Boards';
import ChalkPieces from '@/components/professor/ChalkPieces';
import { layoutRaws, BOARD_W, BOARD_H, type ChalkPiece } from '@/components/professor/chalk';
import {
  DEEP, OLIVE, SAGE, EMBER, PAPER_LIT, MID,
} from '@/components/shared/tone';

// ─────────────────────────────────────────────────────────────────────────────
// logic-arguments-1, "Arguments Are Not Fights" — IN A TV DEBATE STUDIO.
//
// Redrawn on 2026-09-25 in the style of the professor's lecture room, at the owner's
// ask: *"redesign it … with the good objects making the objects real world things
// instead of just random boxes."* The owner chose the setting — a TV debate studio,
// over a boxing ring and a kitchen table — and approved every beat's object.
//
//   ACT 1  two speakers shout across two lecterns with gooseneck microphones. A
//          VOLUME needle meter swings into the red; the REASONS flip counter never
//          leaves 0; the ON AIR light blinks.
//   ACT 2  the narrator walks on, and a chalkboard — the professor's own board and
//          chalk — writes the anatomy of an argument.
//   ACT 3  Aristotle's bust beside the syllogism; a counter balance tipping away
//          from a megaphone toward the evidence; a signpost to TRUTH and WINNING;
//          and Socrates' cross-examination scratched into a wax tablet, timed by an
//          Athenian water clock, stamped CONTRADICTION.
//   ACT 4  the same two at the same lecterns, calm, with their notes on the tops —
//          the rents line, then the skylines — and the counter flips 1, 2, 3.
//
// WHAT IS UNCHANGED, AND WHY IT HAS TO BE: every word, the voice and both questions
// (logic1Script.ts is untouched — 20 of its 25 beats are voiced and keyed by index),
// the SCENE / CHROME split and the pinned camera table. The chrome is still what the
// camera does not move: the board, the instruments and the tablet hold one size
// while the shot pushes 1.21× → 1.58× on the figures below them.
//
// THE FIGHT CHOREOGRAPHY IS GONE with the ring: speakers at lecterns do not trade
// punches, they lean in and point.
// ─────────────────────────────────────────────────────────────────────────────

// THE STAGE IS STRUCK IN THIS LESSON'S OWN BRANCH HUE (./stageTones); the room's
// other materials — wood, marble, clay — take the palette's own hues at the same
// grey luminance, so every contrast on the stage holds.
const TONE = stageTone('logic');
const LIP = lipOf(TONE);
const WOOD = stageToneOf(OLIVE);
const MARBLE = stageToneOf(SAGE);
const CLAY = stageToneOf(EMBER);

//
// ── AND IT DOES NOT CLAIM A WALK (validate-sound §5) ──────────────────────
//
// `walk={X}` is an assertion this scene does not meet: the narrator is driven from
// its own staging table, and two speakers stand as well. See the note this file has
// carried since the port.

// ── THE BAND ───────────────────────────────────────────────────────
// 136…516, as before: the ground lands at one screen place in every shot (the pin),
// the chrome sets the top (instruments 142…, board 144…) and the closest shot's ankle
// sets the bottom.

/** Where the ground line lands on screen — the same for every shot, by design. */
const GROUND_Y = 496;
/** The pin: `s · (GROUND − cy)`, which is what holds the ground line still. */
const PIN = GROUND_Y - STAGE_H / 2;          // 216

/** The chalkboard's frame, in band space (the chrome), and the slate inside it. */
const FRAME = { x: 56, y: 144, w: 288, h: 176 };
const SLATE = { x: FRAME.x + 7, y: FRAME.y + 7, w: FRAME.w - 14, h: FRAME.h - 14 };
const CHALK_S = Math.min(SLATE.w / BOARD_W, SLATE.h / BOARD_H);
const CHALK_X = SLATE.x + (SLATE.w - BOARD_W * CHALK_S) / 2;
const CHALK_Y = SLATE.y + (SLATE.h - BOARD_H * CHALK_S) / 2;
/** How long a phase of chalk takes to write, from shortly after its beat begins. */
const CHALK_T = 2.4;

// WHERE A SHOUT SITS, in SCENE y, converted per beat (see `topOf`). 82 above the
// crown is the gap the bespoke player used.
const BUBBLE_TOP = 340;

// BAND-SPACE x OF EACH SPEAKER'S MARK, published by the scene for the chrome. A shout
// is drawn in the chrome, where `Bubble`'s clamp is against the width the reader
// actually has, and it sits over the speaker's MARK rather than his head, so a word
// being read holds still (the note this lesson has carried since the port).
const SAY_R = makeMutable(200);
const SAY_B = makeMutable(200);

// ── THE NARRATOR'S TRACK ─────────────────────────────────────────────────────
// One x per beat, only ever moving RIGHT (a figure that walks left then right snaps
// between mirrored copies of itself). He waits just outside the FRAME, not outside
// the STAGE, because no legal shot can show a negative x.
const NARR_X: number[] = [
  46, 46, 46, 46,                              // act 1 — waiting just off the frame
  200, 200, 200, 200, 200,                      // act 2 — walks in between the lecterns
  200, 200, 200, 200, 200, 200, 200, 200, 200, // act 3 — centred under the board
  200, 200, 200, 200, 200,                     // act 4 — gone, parked where he left
  200, 200,                                    // act 5
];
const NARR_DIR = dirsFrom(NARR_X, 1);

// Every scale is measured against what else is on stage that beat, exactly as before.
const S_FIGHT = 1.42;
const S_WALK = 1.22;
const S_BOARD = 1.21;
const S_SOLO = 1.58;
const S_BUST = 1.5;
const S_STACK = 1.46;
const S_REMATCH = 1.42;

/**
 * The two speakers' marks. The same in both acts now: it is one studio. Wider than
 * the boxers stood (54 a side): a lectern stands in front of each, and
 * at the boxers' spacing the two lecterns met in the middle and read as one desk.
 */
const RX = 200 - 90;
const BX = 200 + 90;

/** One row per beat: the camera and where each figure stands. */
interface Stage {
  s: number; cx: number; tr: number;
  rx: number; rOn: number; rMode: number;
  bx: number; bOn: number; bMode: number;
  nx: number; nOn: number; nMode: number;
  /** The studio furniture: the lecterns and their microphones. */
  set: number;
}

const STAGE: Stage[] = BEATS.map((b, i) => {
  const base: Stage = {
    s: 1, cx: 200, tr: 0.75,
    rx: RX, rOn: 0, rMode: 0,
    bx: BX, bOn: 0, bMode: 0,
    nx: NARR_X[i], nOn: 0, nMode: 2,
    set: 0,
  };
  if (b.act === 1) return { ...base, s: S_FIGHT, rOn: 1, bOn: 1, set: 1 };
  if (b.act === 2) {
    const first = BEATS.findIndex((x) => x.act === 2) === i;
    return {
      ...base,
      s: first ? S_WALK : b.board ? S_BOARD : S_SOLO,
      tr: first ? 0.85 : 0.75,
      cx: first ? 176 : 200,
      rOn: first ? 1 : 0, bOn: first ? 1 : 0, set: first ? 1 : 0,
      nOn: 1, nMode: first ? 3 : b.board ? 2 : 1,
    };
  }
  if (b.act === 3) {
    return { ...base, s: b.board ? S_BOARD : b.stack ? S_STACK : S_SOLO, nOn: 1, nMode: b.board ? 2 : 1 };
  }
  if (b.act === 4) return { ...base, s: S_REMATCH, rOn: 1, bOn: 1, rMode: 1, bMode: 1, set: 1 };
  // Act 5: Aristotle's own sentence, under his bust at centre stage. The studio
  // after the show was two small empty lecterns on a bare floor for a whole beat.
  return { ...base, s: S_BUST };
});

// A walk lasts as long as its distance needs (rig `moveTr`).
for (let i = 1; i < STAGE.length; i++) {
  STAGE[i].tr = moveTr(STAGE[i - 1].nx, STAGE[i].nx, STAGE[i].tr);
}

/** The camera, as an authored table, its ground pinned (`Shot.pin`). */
const SHOTS: Shot[] = STAGE.map((st) => ({
  cx: st.cx, cy: GROUND - PIN / st.s, s: st.s, tr: st.tr, pin: PIN,
}));

// ── channels ─────────────────────────────────────────────────────────────────
const VOL: number[] = BEATS.map((b) => b.vol ?? -1);
const REA: number[] = BEATS.map((b) => b.reasons ?? -1);
const STACK: number[] = BEATS.map((b) => b.stack ?? 0);
const NARR_G: number[] = BEATS.map((b) => b.narr ?? 0);
const RED_TALK: boolean[] = BEATS.map((b) => !!b.say?.some((s) => s.who === 'red'));
const BLUE_TALK: boolean[] = BEATS.map((b) => !!b.say?.some((s) => s.who === 'blue'));
const BOARD_OF: (BoardKey | null)[] = BEATS.map((b) => b.board ?? null);
/** Which phase of its board each beat writes: 0 on the board's first beat, 1 on its second. */
const PHASE_OF: number[] = BOARD_OF.map((k, i) => {
  let n = 0;
  for (let j = i - 1; j >= 0 && BOARD_OF[j] === k && k; j--) n++;
  return n;
});
/** The act of each beat — the ON AIR light is on while the show is. */
const ACT: number[] = BEATS.map((b) => b.act);
/** The props that stand on the floor for one board or one exchange. */
const BUST_ON: number[] = BEATS.map((b) => (b.board === 'syllogism' || b.quote ? 1 : 0));
/** Where the bust stands: beside the narrator for the syllogism, alone at centre for the quote. */
const BUST_DX: number[] = BEATS.map((b) => (b.quote ? 200 - 300 : 0));
const CLOCK_ON: number[] = STACK.map((s) => (s > 0 ? 1 : 0));
/** The notes on each lectern: rents from the first premise on, the skylines from the reply. */
const FIRST_PREMISE = BEATS.findIndex((b) => b.act === 4 && b.say?.some((s) => s.who === 'red'));
const FIRST_REPLY = BEATS.findIndex((b) => b.act === 4 && b.say?.some((s) => s.who === 'blue'));
const NOTE_R: number[] = BEATS.map((_, i) => (i >= FIRST_PREMISE ? 1 : 0));
const NOTE_B: number[] = BEATS.map((_, i) => (i >= FIRST_REPLY ? 1 : 0));

/** Every phase of every board, laid out once. */
const LAYOUT: Record<BoardKey, ChalkPiece[][]> = Object.fromEntries(
  (Object.keys(BOARD_PHASES) as BoardKey[]).map((k) => [
    k, BOARD_PHASES[k].map((raws, p) => layoutRaws(raws, `${k}${p}`)),
  ]),
) as Record<BoardKey, ChalkPiece[][]>;

// The set, laid out once.
const LECTERN_R = lectern(RX + LECTERN_OFF, -1);
const LECTERN_B = lectern(BX - LECTERN_OFF, 1);
const NOTES_R = notes(RX + LECTERN_OFF, -1, 'rise');
const NOTES_B = notes(BX - LECTERN_OFF, 1, 'built');
const BUST_X = 300;
const BUST = bust(BUST_X);
const KLEP = klepsydra(262);

const STACK_ROWS = [
  { text: 'WHO IMPROVES THE YOUNG?', ask: true },
  { text: 'EVERYONE BUT YOU.', ask: false },
  { text: 'AND WITH HORSES — EVERYONE?', ask: true },
];

// ── THE SCENE: the studio, the three figures, the props on the floor ─────────
export default function Logic1Scene({
  clock, bt, bi, i, gazeX, gazeY, gazeOn,
}: SceneApi) {
  // Every interpolated track is CARRIED (AH4/L5), so a tap mid-transition never
  // jumps the remaining distance in one frame.
  const cv = useCarry(14);

  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const cur = STAGE[n];
    const prv = STAGE[p];
    const tr = ease01(bt.value / cur.tr);
    const t = clock.value;

    // THE TWO SPEAKERS. The one talking gestures — emphatically in the quarrel, openly
    // in the rematch — and the other LISTENS on a living hold (N21: a held pose while
    // another man shouts at you is a post being argued at). Each blends from the
    // previous beat's pose, so a tap never snaps a hand.
    const hot = cur.rMode === 0;
    const wasHot = prv.rMode === 0;
    const redFrom = RED_TALK[p] ? narratorHold(wasHot ? 1 : 0, t) : emoteAny(263, t);
    const blueFrom = BLUE_TALK[p] ? narratorHold(wasHot ? 1 : 0, t) : emoteAny(260, t + 1.7);
    const redTo = RED_TALK[n] ? narratorLive(hot ? 1 : 0, t, bt.value) : emoteAny(263, t);
    const blueTo = BLUE_TALK[n] ? narratorLive(hot ? 1 : 0, t, bt.value) : emoteAny(260, t + 1.7);
    const redS: Stance = mixStance(redFrom, redTo, tr);
    const blueS: Stance = mixStance(blueFrom, blueTo, tr);

    // The narrator, through the one canonical body motion every lesson uses.
    const fromHold = STAGE[p].nMode === 3 || STAGE[p].nOn < 0.5 ? stand(t) : narratorHold(NARR_G[p], t);
    const narrS = travelStance(
      prv.nx, cur.nx, fromHold,
      narratorHold(NARR_G[n], t), narratorLive(NARR_G[n], t, bt.value),
      tr, WALK, 0,
    );

    const rx = carry(cv, 0, n, prv.rx, cur.rx, tr) + redS.adv;
    const bx = carry(cv, 1, n, prv.bx, cur.bx, tr) - blueS.adv;
    const nx = carry(cv, 2, n, prv.nx, cur.nx, tr);
    // They leave quickly and arrive at the beat's own pace (the narrator walks
    // through where they stood on the beat they go).
    const gone = (a: number, b: number) => { 'worklet'; return b < a ? clamp01(tr * 3) : tr; };
    const rOn = carry(cv, 3, n, prv.rOn, cur.rOn, gone(prv.rOn, cur.rOn));
    const bOn = carry(cv, 4, n, prv.bOn, cur.bOn, gone(prv.bOn, cur.bOn));
    const nOn = cur.nMode === 3 ? ease01(clamp01(tr / 0.2)) : carry(cv, 5, n, prv.nOn, cur.nOn, tr);

    return {
      set: carry(cv, 8, n, prv.set, cur.set, gone(prv.set, cur.set)),
      notesR: carry(cv, 11, n, NOTE_R[p], NOTE_R[n], tr),
      notesB: carry(cv, 12, n, NOTE_B[p], NOTE_B[n], tr),
      bust: carry(cv, 9, n, BUST_ON[p], BUST_ON[n], tr),
      // It only ever MOVES while invisible (act 3 and act 5 are never neighbours), so
      // it takes the place of whichever beat shows it rather than sliding.
      bustDx: BUST_ON[n] ? BUST_DX[n] : BUST_DX[p],
      klep: carry(cv, 10, n, CLOCK_ON[p], CLOCK_ON[n], tr),
      cs: carry(cv, 6, n, SHOTS[p].s, SHOTS[n].s, tr),
      ccx: carry(cv, 7, n, SHOTS[p].cx, SHOTS[n].cx, tr),
      rxm: carry(cv, 13, n, STAGE[p].rx, STAGE[n].rx, tr),
      bxm: STAGE[n].bx,
      red: rOn > 0.002 ? pose(redS, rx, GROUND, K_FIG, 1, rOn) : BLANK,
      blue: bOn > 0.002 ? pose(blueS, bx, GROUND, K_FIG, -1, bOn) : BLANK,
      // THE NARRATOR IS THE MASCOT — the two speakers are the argument — so he is the
      // one the shared figure layers belong on (gaze, reaction, wander).
      narr: nOn > 0.002
        ? lookPose(narrS, nx, GROUND, K_FIG, NARR_DIR[n], nOn, gazeX.value, gazeY.value, gazeOn.value)
        : BLANK,
    };
  });

  // The two shouts' band-space x, for the chrome (see SAY_R).
  useDerivedValue(() => {
    const v = SCENE.value;
    SAY_R.value = 200 + v.cs * (v.rxm - v.ccx);
    SAY_B.value = 200 + v.cs * (v.bxm - v.ccx);
    return 0;
  });

  const DR = useDerivedValue<Bundle>(() => SCENE.value.red);
  const DB = useDerivedValue<Bundle>(() => SCENE.value.blue);
  const DN = useDerivedValue<Bundle>(() => SCENE.value.narr);
  const setStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.set }));
  const notesRStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.notesR * SCENE.value.set }));
  const notesBStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.notesB * SCENE.value.set }));
  const bustStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.bust,
    transform: [{ translateX: SCENE.value.bustDx }],
  }));
  const klepStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.klep }));

  const st = STAGE[i];
  // A PROP IS MOUNTED ONLY ON ITS OWN BEATS, and the one after while it fades out.
  // Always-mounted at opacity 0 would be invisible to the reader and fully visible to
  // the must-box probe, which reads an element's OWN opacity and not its parents' —
  // so every beat's box would carry the bust, the water clock and both lecterns, and
  // the camera could never push in on anything.
  const pi = i > 0 ? i - 1 : 0;
  const onNowOrLeaving = (a: readonly number[]) => a[i] > 0 || a[pi] > 0;
  const showSet = STAGE[i].set > 0 || STAGE[pi].set > 0;
  const showBust = onNowOrLeaving(BUST_ON);
  const showKlep = onNowOrLeaving(CLOCK_ON);
  const showNotesR = showSet && onNowOrLeaving(NOTE_R);
  const showNotesB = showSet && onNowOrLeaving(NOTE_B);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {/* THE FLOOR, from the depth kit, drawn first so it sits behind everything. */}
      <View style={styles.floor} pointerEvents="none" />

      {/* THE PROPS OF ACT 3, each on the floor beside the narrator for its beats. */}
      {showBust ? (
        <Animated.View style={[StyleSheet.absoluteFill, bustStyle]} pointerEvents="none">
          <ObjectArt parts={BUST} tone={MARBLE} />
        </Animated.View>
      ) : null}
      {showKlep ? (
        <Animated.View style={[StyleSheet.absoluteFill, klepStyle]} pointerEvents="none">
          <ObjectArt parts={KLEP.parts} tone={CLAY} />
          <Drops clock={clock} />
        </Animated.View>
      ) : null}

      {/* THE SPEAKERS stand BEHIND their lecterns: the lectern is drawn after them, so
          it covers the legs the way a podium does. They are a CROWD in the wardrobe's
          sense — the narrator is the mascot. */}
      {st.rOn > 0 ? <Stickman D={DR} k={K_FIG} role="crowd" /> : null}
      {st.bOn > 0 ? <Stickman D={DB} k={K_FIG} role="crowd" /> : null}
      {showSet ? (
        <Animated.View style={[StyleSheet.absoluteFill, setStyle]} pointerEvents="none">
          <ObjectArt parts={LECTERN_R} tone={TONE} />
          <ObjectArt parts={LECTERN_B} tone={TONE} />
        </Animated.View>
      ) : null}
      {showNotesR ? (
        <Animated.View style={[StyleSheet.absoluteFill, notesRStyle]} pointerEvents="none">
          <ObjectArt parts={NOTES_R} tone={TONE} />
        </Animated.View>
      ) : null}
      {showNotesB ? (
        <Animated.View style={[StyleSheet.absoluteFill, notesBStyle]} pointerEvents="none">
          <ObjectArt parts={NOTES_B} tone={TONE} />
        </Animated.View>
      ) : null}
      {st.nOn > 0 ? <Stickman D={DN} k={K_FIG} /> : null}
    </View>
  );
}

/** Three drops falling from the upper pot's spout into the lower pot, on the idle clock. */
function Drops({ clock }: { clock: SharedValue<number> }) {
  const [sx, sy] = KLEP.spout;
  const [mx, my] = KLEP.mouth;
  const d0 = useAnimatedStyle(() => dropAt(clock.value, 0, sx, sy, mx, my));
  const d1 = useAnimatedStyle(() => dropAt(clock.value, 0.33, sx, sy, mx, my));
  const d2 = useAnimatedStyle(() => dropAt(clock.value, 0.66, sx, sy, mx, my));
  return (
    <>
      <Animated.View style={[styles.drop, d0]} />
      <Animated.View style={[styles.drop, d1]} />
      <Animated.View style={[styles.drop, d2]} />
    </>
  );
}

function dropAt(t: number, phase: number, sx: number, sy: number, mx: number, my: number) {
  'worklet';
  const u = (t * 0.9 + phase) % 1;
  // Falling accelerates; a drop leaves the spout slowly and lands fast.
  const f = u * u;
  return {
    opacity: u < 0.9 ? 1 : (1 - u) * 10,
    transform: [{ translateX: lerp(sx, mx, u) - 1.5 }, { translateY: lerp(sy, my, f) - 1.5 }],
  };
}

// ── THE CHROME: what the camera does not move ────────────────────────────────
// The board, the instruments and the tablet are read while the shot pushes from
// 1.21× to 1.58× on the figures below them, so they are drawn outside the camera at
// one size. See `Chrome` on CinematicPlayer.
export function Logic1Chrome({ clock, bt, bi, i }: SceneApi) {
  const GRAPH = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    // A card LEAVES quickly and ARRIVES unhurried, so two never sit on top of each
    // other at half opacity.
    const away = 1 - ease01(bt.value / 0.25);
    const here = ease01(bt.value / 0.7);
    const swap = (was: boolean, now: boolean) => {
      'worklet';
      return now ? (was ? 1 : here) : was ? away : 0;
    };
    const rise = ease01(bt.value / 0.55);
    const cnt = STACK[n] > 0 ? STACK[n] : STACK[p];
    const stackRow = (k: number) => {
      'worklet';
      return k < STACK[p] ? 1 : k < cnt ? rise : 0;
    };
    return {
      scoreOn: swap(VOL[p] >= 0, VOL[n] >= 0),
      boardOn: swap(BOARD_OF[p] !== null, BOARD_OF[n] !== null),
      stackOn: swap(STACK[p] > 0, STACK[n] > 0),
      s0: stackRow(0), s1: stackRow(1), s2: stackRow(2),
      stampU: cnt >= 3 ? (STACK[p] >= 3 ? 1 : clamp01((bt.value - 0.45) / 0.9)) : 0,
    };
  });

  const p = i > 0 ? i - 1 : 0;
  const beat = BEATS[i];
  const prevBeat = i > 0 ? BEATS[i - 1] : undefined;
  // A shout keeps its distance from the head, and the head's screen place depends on
  // the beat's own scale, so the scene-space gap is converted per beat.
  const topOf = (k: number) => Math.round(GROUND_Y + SHOTS[k].s * (BUBBLE_TOP - GROUND));
  const volLevel = VOL[i] >= 0 ? VOL[i] : VOL[p] >= 0 ? VOL[p] : 0;
  const reaLevel = REA[i] >= 0 ? REA[i] : REA[p] >= 0 ? REA[p] : 0;
  const volFrom = VOL[p] >= 0 ? VOL[p] : volLevel;
  const reaFrom = REA[p] >= 0 ? REA[p] : reaLevel;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Chalkboard i={i} bt={bt} G={GRAPH} />
      <Instruments
        clock={clock} bt={bt} G={GRAPH} act={ACT[i]} pulseZero={i === 5}
        vol={volLevel} volFrom={volFrom} reasons={reaLevel} reasonsFrom={reaFrom}
      />
      <WaxTablet G={GRAPH} />

      {prevBeat?.say?.map((s) => (
        <Bubble
          key={`out-${s.who}-${s.text}`}
          bt={bt} text={s.text} top={topOf(p)} leaving
          x={s.who === 'red' ? SAY_R : SAY_B}
          shout={prevBeat.act === 1}
        />
      ))}
      {beat.say?.map((s) => (
        <Bubble
          key={`${s.who}-${s.text}`}
          bt={bt} text={s.text} top={topOf(i)}
          x={s.who === 'red' ? SAY_R : SAY_B}
          shout={beat.act === 1}
        />
      ))}
    </View>
  );
}

interface Graph {
  scoreOn: number; boardOn: number; stackOn: number;
  s0: number; s1: number; s2: number; stampU: number;
}

// ── the chalkboard ───────────────────────────────────────────────────────────
// The professor's board: a wooden frame round a DEEP slate, a ledge with a stick of
// chalk, and chalk that writes itself (components/professor/ChalkPieces). A board
// that stays up for two beats adds to itself on the second: every phase before this
// beat's is drawn finished, and this beat's writes over CHALK_T. When the board
// CHANGES, the old chalk is wiped quickly and the new begins.
function Chalkboard({ i, bt, G }: { i: number; bt: SharedValue<number>; G: SharedValue<Graph> }) {
  const key = BOARD_OF[i];
  const prevKey = i > 0 ? BOARD_OF[i - 1] : null;
  const phase = PHASE_OF[i];
  const done = useSharedValue(1);
  const writing = useDerivedValue(() => clamp01((bt.value - 0.3) / CHALK_T));
  const frame = useAnimatedStyle(() => ({ opacity: G.value.boardOn }));
  // The previous board's chalk, wiped over the first quarter-second of a new board.
  const wipe = useAnimatedStyle(() => ({ opacity: 1 - clamp01(bt.value / 0.25) }));
  const showKey = key ?? prevKey;
  const showPhase = key ? phase : prevKey ? PHASE_OF[i - 1] : 0;
  const oldKey = key && prevKey && prevKey !== key ? prevKey : null;
  return (
    <Animated.View style={[StyleSheet.absoluteFill, frame]} pointerEvents="none">
      <View style={[styles.frame, { boxShadow: lipOf(WOOD) }]} />
      <View style={styles.slate} />
      <View style={styles.ledge} />
      <View style={styles.chalkStick} />
      {oldKey ? (
        <Animated.View style={[StyleSheet.absoluteFill, wipe]}>
          {LAYOUT[oldKey].slice(0, PHASE_OF[i - 1] + 1).map((pieces, k) => (
            <ChalkPieces key={`o${k}`} pieces={pieces} progress={done} x={CHALK_X} y={CHALK_Y} s={CHALK_S} />
          ))}
        </Animated.View>
      ) : null}
      {showKey
        ? LAYOUT[showKey].slice(0, showPhase + 1).map((pieces, k) => (
          <ChalkPieces
            key={`${showKey}${k}`}
            pieces={pieces}
            progress={key && k === phase ? writing : done}
            x={CHALK_X} y={CHALK_Y} s={CHALK_S}
          />
        ))
        : null}
    </Animated.View>
  );
}

// ── the instruments on the studio wall ───────────────────────────────────────
// Where the scoreboard's two bars were: a VOLUME needle meter (a cream face, an arc
// scale ending in a red band, a needle from the bottom centre — drawn against a
// cassette deck's own meters), an ON AIR light, and a REASONS flip counter whose
// digit flips when a reason is given.
// 62 tall, not 56: at 56 the needle's pivot sat on the top of VOLUME (check:readable
// STRIKE), and the pivot is where the needle has to come from.
const VU = { x: 46, y: 143, w: 134, h: 62 };
const AIR = { x: 182, y: 158, w: 56, h: 32 };
const CTR = { x: 240, y: 143, w: 114, h: 62 };
const PIVOT = { x: VU.x + VU.w / 2, y: VU.y + 41 };
const ARC_R = 30;
const TICKS = Array.from({ length: 11 }, (_, k) => k);

function Instruments({
  clock, bt, G, act, pulseZero, vol, volFrom, reasons, reasonsFrom,
}: {
  clock: SharedValue<number>; bt: SharedValue<number>; G: SharedValue<Graph>;
  act: number; pulseZero: boolean;
  vol: number; volFrom: number; reasons: number; reasonsFrom: number;
}) {
  const card = useAnimatedStyle(() => ({ opacity: G.value.scoreOn }));
  // The needle: from last beat's level to this one's, then a nervous shiver once it
  // is in the red. `clock` never resets, so the shiver never restarts on a tap.
  const needle = useAnimatedStyle(() => {
    const u = ease01(clamp01((bt.value - 0.15) / 0.8));
    const v = lerp(volFrom, vol, u);
    const shiver = v >= 8 ? Math.sin(clock.value * 23) * 1.6 + Math.sin(clock.value * 37) * 0.8 : 0;
    return { transform: [{ rotate: `${-50 + v * 10 + shiver}deg` }] };
  });
  // ON AIR: the LAMP is lit while the show is on and blinks during the quarrel. The
  // words never dim — the ember cannot carry a word (tone.ts), and a word that blinks
  // is a word at 0.7 for half the time — so they sit on the dark plate, and only the
  // lamp beside them does the blinking.
  const air = useAnimatedStyle(() => ({
    opacity: act === 1 ? 0.35 + 0.65 * (Math.sin(clock.value * 8) > 0 ? 1 : 0) : 1,
  }));
  const on = act !== 3 && act !== 5;
  // The flip: the old digit folds away, the new one unfolds.
  const flips = reasons !== reasonsFrom;
  const outgoing = useAnimatedStyle(() => ({
    transform: [{ scaleY: flips ? 1 - clamp01((bt.value - 0.3) / 0.15) : 1 }],
    opacity: flips && bt.value > 0.45 ? 0 : 1,
  }));
  const incoming = useAnimatedStyle(() => ({
    transform: [{ scaleY: clamp01((bt.value - 0.45) / 0.15) }],
    opacity: bt.value > 0.45 ? 1 : 0,
  }));
  // "Because a quarrel contains no reasons" — the 0 gives a single nudge.
  const nudge = useAnimatedStyle(() => {
    if (!pulseZero) return { transform: [{ scale: 1 }] };
    const a = clamp01((bt.value - 0.8) / 0.5);
    return { transform: [{ scale: 1 + 0.16 * Math.sin(Math.PI * a) }] };
  });
  return (
    <Animated.View style={[StyleSheet.absoluteFill, card]} pointerEvents="none">
      {/* THE METER */}
      <View style={[styles.vu, { boxShadow: LIP }]}>
        <View style={styles.vuFace} />
        <Text style={styles.vuLabel} numberOfLines={1}>VOLUME</Text>
      </View>
      {TICKS.map((k) => {
        const a = ((-50 + k * 10) * Math.PI) / 180;
        const red = k >= 8;
        return (
          <View
            key={k}
            style={[
              styles.tick,
              red && styles.tickRed,
              {
                left: PIVOT.x + Math.sin(a) * ARC_R - 1,
                top: PIVOT.y - Math.cos(a) * ARC_R - (k % 5 === 0 ? 7 : 5),
                height: k % 5 === 0 ? 7 : 5,
                transform: [{ rotate: `${-50 + k * 10}deg` }],
              },
            ]}
          />
        );
      })}
      <Animated.View style={[styles.needleArm, needle]}>
        <View style={styles.needle} />
      </Animated.View>
      <View style={styles.pivot} />

      {/* ON AIR */}
      <View style={[styles.air, { boxShadow: LIP }]}>
        <Animated.View style={[styles.lamp, on ? styles.lampOn : styles.lampOff, on && air]} />
        <Text style={styles.airText} numberOfLines={1}>ON AIR</Text>
      </View>

      {/* THE FLIP COUNTER */}
      <View style={[styles.ctr, { boxShadow: LIP }]}>
        <Text style={styles.ctrLabel} numberOfLines={1}>REASONS</Text>
      </View>
      <Animated.View style={[styles.card, nudge]}>
        <Animated.View style={[styles.cardFace, outgoing]}>
          <Text style={styles.digit}>{String(reasonsFrom)}</Text>
        </Animated.View>
        {flips ? (
          <Animated.View style={[styles.cardFace, incoming]}>
            <Text style={styles.digit}>{String(reasons)}</Text>
          </Animated.View>
        ) : null}
        <View style={styles.cardSplit} />
      </Animated.View>
    </Animated.View>
  );
}

// ── the wax tablet, the stylus and the stamp ─────────────────────────────────
// Socrates' cross-examination of Meletus, scratched into wax a line at a time — the
// question, the answer, the question that broke it — and then CONTRADICTION stamped
// across all three with a real rubber stamp: it falls, strikes, and lifts away,
// leaving its impression.
const TAB = { x: 62, y: 148, w: 276, h: 148 };
const ROW_TOP = TAB.y + 20;
const ROW_H = 30;
const ROW_GAP = 10;

function WaxTablet({ G }: { G: SharedValue<Graph> }) {
  const wrap = useAnimatedStyle(() => ({ opacity: G.value.stackOn }));
  // A line is SCRATCHED in, left to right: its clip widens with its value.
  const r0 = useAnimatedStyle(() => ({ width: `${G.value.s0 * 100}%` }));
  const r1 = useAnimatedStyle(() => ({ width: `${G.value.s1 * 100}%` }));
  const r2 = useAnimatedStyle(() => ({ width: `${G.value.s2 * 100}%` }));
  const rows = [r0, r1, r2];
  // The stamp: falls accelerating (0 → 0.35), squashes on contact, lifts away.
  const tool = useAnimatedStyle(() => {
    const u = G.value.stampU;
    const fall = clamp01(u / 0.35);
    const lift = clamp01((u - 0.55) / 0.4);
    const y = u < 0.35 ? -90 + 90 * fall * fall : -70 * ease01(lift);
    const squash = u >= 0.35 && u < 0.5 ? 0.94 : 1;
    return {
      opacity: u <= 0 ? 0 : 1 - clamp01((u - 0.8) / 0.2),
      transform: [{ translateY: y }, { rotate: '-7deg' }, { scaleY: squash }],
    };
  });
  const mark = useAnimatedStyle(() => {
    const u = G.value.stampU;
    return {
      opacity: u >= 0.35 ? 1 : 0,
      transform: [{ rotate: '-7deg' }, { scale: u >= 0.35 ? lerp(1.04, 1, clamp01((u - 0.35) / 0.2)) : 1 }],
    };
  });
  const toolTone = useMemo(() => ({ handle: WOOD.SHADE, block: WOOD.STONE }), []);
  return (
    <Animated.View style={[StyleSheet.absoluteFill, wrap]} pointerEvents="none">
      <View style={[styles.tablet, { boxShadow: lipOf(WOOD) }]} />
      <View style={styles.wax} />
      {STACK_ROWS.map((r, k) => (
        <View key={r.text} style={[styles.rowClip, { top: ROW_TOP + k * (ROW_H + ROW_GAP) }]}>
          <Animated.View style={[styles.rowReveal, rows[k]]}>
            <Text style={[styles.rowText, !r.ask && styles.rowTextAns]} numberOfLines={1}>{r.text}</Text>
          </Animated.View>
        </View>
      ))}
      {/* the stylus, laid across the corner */}
      <View style={styles.stylus} />
      <Animated.View style={[styles.imprint, mark]}>
        <Text style={styles.imprintText} numberOfLines={1}>CONTRADICTION</Text>
      </Animated.View>
      <Animated.View style={[styles.stampTool, tool]}>
        <View style={[styles.stampKnob, { backgroundColor: toolTone.handle }]} />
        <View style={[styles.stampNeck, { backgroundColor: toolTone.handle }]} />
        <View style={[styles.stampBlock, { backgroundColor: toolTone.block }]} />
        <View style={styles.stampRubber} />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  floor: floorStyle(TONE, GROUND),
  drop: { position: 'absolute', left: 0, top: 0, width: 3, height: 3, borderRadius: 1.5, backgroundColor: DEEP },

  frame: {
    position: 'absolute', left: FRAME.x, top: FRAME.y, width: FRAME.w, height: FRAME.h,
    borderRadius: 6, backgroundColor: WOOD.STONE, borderWidth: 1.5, borderColor: INK,
  },
  slate: {
    position: 'absolute', left: SLATE.x, top: SLATE.y, width: SLATE.w, height: SLATE.h,
    borderRadius: 3, backgroundColor: DEEP,
  },
  ledge: {
    position: 'absolute', left: FRAME.x - 6, top: FRAME.y + FRAME.h - 2, width: FRAME.w + 12, height: 7,
    borderRadius: 2, backgroundColor: WOOD.SHADE, borderWidth: 1.5, borderColor: INK,
  },
  chalkStick: {
    position: 'absolute', left: FRAME.x + 40, top: FRAME.y + FRAME.h - 5, width: 14, height: 3.5,
    borderRadius: 1.5, backgroundColor: PAPER_LIT,
  },

  vu: {
    position: 'absolute', left: VU.x, top: VU.y, width: VU.w, height: VU.h,
    borderRadius: 6, backgroundColor: TONE.STONE, borderWidth: 1.5, borderColor: INK,
  },
  vuFace: {
    position: 'absolute', left: 6, top: 5, right: 6, height: 38,
    borderRadius: 3, backgroundColor: PAPER_LIT, borderWidth: 1, borderColor: TONE.SHADE,
  },
  vuLabel: {
    position: 'absolute', left: 0, right: 0, bottom: 2, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 1.2, color: INK, includeFontPadding: false,
  },
  tick: { position: 'absolute', width: 2, backgroundColor: INK, transformOrigin: '50% 100%' },
  tickRed: { backgroundColor: EMBER },
  needleArm: {
    position: 'absolute', left: PIVOT.x - 1, top: PIVOT.y - ARC_R - 2, width: 2, height: (ARC_R + 2) * 2,
  },
  needle: { width: 1.8, height: ARC_R + 2, backgroundColor: INK, marginLeft: 0.1, borderRadius: 0.9 },
  pivot: {
    position: 'absolute', left: PIVOT.x - 3.5, top: PIVOT.y - 3.5, width: 7, height: 7, borderRadius: 3.5,
    backgroundColor: INK,
  },

  air: {
    position: 'absolute', left: AIR.x, top: AIR.y, width: AIR.w, height: AIR.h,
    borderRadius: 5, borderWidth: 1.5, borderColor: INK, backgroundColor: DEEP,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 3,
  },
  lamp: { width: 6, height: 6, borderRadius: 3 },
  lampOn: { backgroundColor: EMBER },
  lampOff: { backgroundColor: MID },
  airText: {
    fontFamily: 'Inter_700Bold', fontSize: 10.5, letterSpacing: 0.3, color: PAPER_LIT, includeFontPadding: false,
  },

  ctr: {
    position: 'absolute', left: CTR.x, top: CTR.y, width: CTR.w, height: CTR.h,
    borderRadius: 6, backgroundColor: TONE.SHADE, borderWidth: 1.5, borderColor: INK,
  },
  ctrLabel: {
    position: 'absolute', left: 0, right: 0, bottom: 3, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 1.2, color: INK, includeFontPadding: false,
  },
  card: {
    position: 'absolute', left: CTR.x + CTR.w / 2 - 18, top: CTR.y + 5, width: 36, height: 34,
  },
  cardFace: {
    position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, borderRadius: 3,
    backgroundColor: PAPER_LIT, alignItems: 'center', justifyContent: 'center',
  },
  digit: { fontFamily: 'Inter_700Bold', fontSize: 24, color: INK, includeFontPadding: false },
  cardSplit: { position: 'absolute', left: 0, right: 0, top: 16.5, height: 1, backgroundColor: TONE.SHADE },

  tablet: {
    position: 'absolute', left: TAB.x, top: TAB.y, width: TAB.w, height: TAB.h,
    borderRadius: 6, backgroundColor: WOOD.STONE, borderWidth: 1.5, borderColor: INK,
  },
  wax: {
    position: 'absolute', left: TAB.x + 10, top: TAB.y + 10, width: TAB.w - 20, height: TAB.h - 20,
    borderRadius: 3, backgroundColor: WOOD.SHADE,
  },
  rowClip: { position: 'absolute', left: TAB.x + 18, width: TAB.w - 36, height: ROW_H, overflow: 'hidden' },
  rowReveal: { height: ROW_H, overflow: 'hidden', justifyContent: 'center' },
  rowText: {
    width: TAB.w - 36, fontFamily: 'Inter_700Bold', fontSize: 12.5, letterSpacing: 0.3,
    color: INK, textAlign: 'center', includeFontPadding: false,
  },
  // INK, not paper: a stylus line in wax is a groove, and paper on the shaded wax is
  // 2.5:1 (check:readable FAINT).
  rowTextAns: { fontStyle: 'italic' },
  stylus: {
    position: 'absolute', left: TAB.x + TAB.w - 70, top: TAB.y + TAB.h - 16, width: 64, height: 3.5,
    borderRadius: 2, backgroundColor: INK, transform: [{ rotate: '-18deg' }],
  },
  imprint: {
    position: 'absolute', left: 110, top: ROW_TOP + 1.5 * ROW_H + ROW_GAP - 6, width: 180, height: 30,
    backgroundColor: INK, borderRadius: 3, alignItems: 'center', justifyContent: 'center',
  },
  imprintText: {
    fontFamily: 'Inter_700Bold', fontSize: 13, letterSpacing: 1.8, color: PAPER, includeFontPadding: false,
  },
  stampTool: {
    position: 'absolute', left: 150, top: ROW_TOP + 1.5 * ROW_H + ROW_GAP - 62, width: 100, height: 64,
    alignItems: 'center',
  },
  stampKnob: { width: 26, height: 24, borderRadius: 13, borderWidth: 1.5, borderColor: INK },
  stampNeck: { width: 12, height: 14, marginTop: -2, borderWidth: 1.5, borderColor: INK },
  stampBlock: { width: 96, height: 18, marginTop: -1, borderRadius: 2, borderWidth: 1.5, borderColor: INK },
  stampRubber: { width: 92, height: 5, backgroundColor: INK },
});

// EVERY BEAT KEEPS THE AUTHORED CAMERA (K10's override: an empty `tour`). This
// lesson writes a shot for every beat and PINS the ground line to one screen place,
// and a generated tour honours neither. Measured in the browser, the tours pushed to
// 1.72× with the ground lifted from 496 to 413 — half the frame became floor — and
// the speech boxes, which are drawn in the chrome over each speaker's mark as the
// AUTHORED shot places it (outside anything the must-box probe can see), landed on a
// head and 65px to one side of the man speaking. Mapped here rather than written
// into the script, whose beats are voiced and keyed by index (AH8).
const PLAYED = BEATS.map((b) => ({ ...b, tour: [] as number[][] }));

// The band is unchanged and the pin is why it can be: the ground lands at one screen
// place in every shot and all the way through every move.
export function Logic1Lesson({ lesson }: { lesson: Lesson }) {
  return (
    <CinematicPlayer
      lesson={lesson}
      beats={PLAYED}
      gesture={NARR_G}
      Scene={Logic1Scene}
      Chrome={Logic1Chrome}
      band={[136, 516]}
      shots={SHOTS}
    />
  );
}
