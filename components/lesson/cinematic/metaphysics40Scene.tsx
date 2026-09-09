import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { dirsFrom, clamp01, ease01, moveTr, travelStance, WALK, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './metaphysics40Script';
import {
  facing, GROUND, K_FIG, STAGE_W, STAGE_H, INK, STONE, SOFT, RULE, PAPER, useHeld, carryFrom, keepHeld, useCarry, carry, pickAt, lookPose,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// ─────────────────────────────────────────────────────────────────────────────
// A BOOK OF DAYS WITH TWO LINES WRITTEN AND ONE STILL EMPTY.
//
// THE COMPOSITION, IN NUMBERS (H56).
//
// · the PAGE is 236×176 at x 146, y 268…444 — a filled STONE mass with a 2-unit
//   ink edge, so the scene has something to read the white rows against (T2).
// · THREE ROWS of 186×40 sit inside it at x 158 (158…344), tops y 288 · 340 · 392.
//   One style draws all three: the claim is that tomorrow's line is the same KIND
//   of line as yesterday's, and a row that looked different would answer the
//   question before it was asked.
// · each row carries its DAY at x 166 (width 84) and, when written, an ENTRY bar
//   of 62×10 at x 264…326. The two past rows are written from the moment the book
//   opens; the third is what the whole lesson is about.
// · the STRAP is 14×76 at x 354…368, y 376…452 — clear of the rows' right edge at
//   344 by ten units, so nothing is ever drawn across a word (S9). It is the
//   SECOND half of the argument and is deliberately a separate object: a written
//   line says tomorrow is settled, a strap says it is shut.
// · THREE PLATES of 86×26 at x 128, 220, 312 (128…398), top y 462 — under the page
//   at 444 and above the ground line, each carrying its own words (S11).
// · the figure stands at x 40 and walks to 104. At the plates' height he is legs
//   only, x ≈ 96…112 at the walked mark, so the nearest plate at 128 clears him by
//   sixteen units; at head height his widest span is x ≈ 79…129, still left of the
//   page edge at 146.
//
// Ink runs y 244 (the caption) … y 500 (ground). BAND 240…512 = 272 — a 103-unit
// figure at 37.9%, inside H58's 38%.
// ─────────────────────────────────────────────────────────────────────────────

/** Crossfade for a beat that does NOT walk. 0.85 is the base `footfalls` assumes. */
const BASE_TR = 0.85;

const PAGE_X = 146;
const PAGE_Y = 268;
const PAGE_W = 236;
const PAGE_H = 176;

const ROW_X = 158;
const ROW_W = 186;
const ROW_H = 40;
const ROW_Y = [288, 340, 392];
const ROW_N = 3;
const DAY = ['YESTERDAY', 'TODAY', 'TOMORROW'];

const ENTRY_X = 264;
const ENTRY_W = 62;
const ENTRY_H = 10;

const STRAP_X = 354;
const STRAP_W = 14;
const STRAP_Y = 376;
const STRAP_H = 76;

const PLATE_X = [128, 220, 312];
const PLATE_Y = 462;
const PLATE_W = 86;
const PLATE_H = 26;
const PLATE_CAP = ['ONE OF THE TWO', 'BOTH AT ONCE', 'NOTHING YET'];
const PLATE_ID = ['one', 'both', 'none'];
/** What the rule actually puts there. The other two are the two ways of refusing it. */
const ONE = 0;

const CAP_T = 244;
const FIG_X = 40;

const X = BEATS.map((b) => b.x ?? FIG_X);
// WHICH WAY HE IS POINTING, read off the same x track he walks along.
const DIR = dirsFrom(X, 1);
const P = BEATS.map((b) => b.p ?? 0);
const LEDGER = BEATS.map((b) => b.ledger ?? 0);
const WRITTEN = BEATS.map((b) => b.written ?? 0);
const CLASP = BEATS.map((b) => (b.clasp ? 1 : 0));
const PLATES = BEATS.map((b) => (b.plates ? 1 : 0));
const LIVE = BEATS.map((b) => (b.live ? 1 : 0));

// R7c — the stage follows the control on its own graded beat, and only there.
// Derived from the beat so it cannot fall out of step with the control.
const REACT = BEATS.map((b) => (b.interact?.poll ? 1 : 0));

// THE POLL'S OWN ORDER, never the shuffled rows (X3): 0 shut · 1 blank · 2 open.
// Each row is read off that option's own words, which is what makes a table of
// numbers checkable against the script beside it.
//   shut  — "settled already, and nothing can change it" → the line is written
//           AND the strap is closed over it.
//   blank — "neither true nor false yet"                 → only the past two.
//   open  — "settled, but nothing about it is forced"     → written, strap off.
const WRITE_AT = [1, 0.67, 1];
const STRAP_AT = [1, 0, 0];

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('metaphysics40'));

export default function Metaphysics40Scene({ clock, bt, bi, i, picked, onPick, pickPos, gazeX, gazeY, gazeOn }: SceneApi) {
  const reacting = REACT[i] === 1;
  const heldFig = useHeld();
  const cv = useCarry(5);
  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    // A WALKING BEAT TAKES AS LONG AS THE WALK NEEDS (rig.moveTr).
    const tr = ease01(bt.value / moveTr(X[p], X[n], BASE_TR));
    const t = clock.value;

    const figS = keepHeld(heldFig, travelStance(
      X[p], X[n],
      carryFrom(heldFig, n, emoteHold(P[p], t)), emoteHold(P[n], t), emoteLive(P[n], t, bt.value),
      tr, WALK,
    ));

    return {
      fig: lookPose(figS, carry(cv, 0, n, X[p], X[n], tr), GROUND, K_FIG, facing(DIR[p], DIR[n], bt.value), 1, gazeX.value, gazeY.value, gazeOn.value),
      t,
      ledger: carry(cv, 1, n, LEDGER[p], LEDGER[n], tr),
      written: carry(cv, 2, n, WRITTEN[p], reacting ? pickAt(WRITE_AT, pickPos.value) : WRITTEN[n], tr),
      strap: carry(cv, 3, n, CLASP[p], reacting ? pickAt(STRAP_AT, pickPos.value) : CLASP[n], tr),
      platesOn: carry(cv, 4, n, PLATES[p], PLATES[n], tr),
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const answered = picked !== null;
  const live = !!BEATS[i]?.interact && !BEATS[i]?.interact?.cards && LIVE[i] === 1;

  const pageStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.ledger }));
  const strapStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.strap }));
  const platesStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.platesOn }));

  return (
    <View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      <Text style={styles.cap} pointerEvents="none">THE BOOK OF DAYS</Text>

      <Animated.View style={[StyleSheet.absoluteFill, pageStyle]} pointerEvents="none">
        <View style={styles.page} />
        {ROW_Y.map((ry, k) => <Row key={ry} S={SCENE} top={ry} index={k} />)}
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, strapStyle]} pointerEvents="none">
        <View style={styles.strap} />
        <View style={styles.buckle} />
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, platesStyle]}>
        {PLATE_ID.map((id, k) => (
          <Target
            key={id}
            id={id}
            correct={k === ONE}
            picked={picked}
            onPick={onPick}
            disabled={!live || answered}
            style={[styles.hit, { left: PLATE_X[k] }]}
            radius={4}
          >
            <View style={styles.plate} pointerEvents="none" />
            <Text style={styles.plateText} pointerEvents="none">{PLATE_CAP[k]}</Text>
          </Target>
        ))}
      </Animated.View>

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DF} k={K_FIG} />
    </View>
  );
}

/** One day's line, and the entry on it once the day has been written down. */
function Row({ S, top, index }: { S: SharedValue<any>; top: number; index: number }) {
  // THE LAST ROW IS ABSENT OR PRESENT, never a ghost. At `written` 0.67 the plain
  // form leaves tomorrow's entry at one per cent, which renders as a faint bar in
  // the one row the lesson insists is empty; the offset takes it to nothing.
  const entry = useAnimatedStyle(() => ({
    opacity: clamp01((S.value.written * ROW_N - index - 0.05) / 0.95),
  }));
  return (
    <>
      <View style={[styles.row, { top }]} pointerEvents="none" />
      <Text style={[styles.day, { top: top + 15 }]} pointerEvents="none">{DAY[index]}</Text>
      <Animated.View style={[styles.entry, { top: top + 15 }, entry]} pointerEvents="none" />
    </>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 20, right: 14, top: GROUND, height: 1.5, backgroundColor: RULE },
  // THE FLOOR THE GROUND LINE SITS ON — a subject standing on a filled mass
  // rather than on bare page.
  floor: { position: 'absolute', left: 0, right: 0, top: GROUND, bottom: 0, backgroundColor: RULE },

  cap: {
    position: 'absolute', left: PAGE_X, top: CAP_T, width: PAGE_W,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.4, color: SOFT, includeFontPadding: false,
  },

  page: {
    position: 'absolute', left: PAGE_X, top: PAGE_Y, width: PAGE_W, height: PAGE_H,
    borderWidth: 2, borderColor: INK, backgroundColor: STONE,
  },
  row: {
    position: 'absolute', left: ROW_X, width: ROW_W, height: ROW_H,
    borderWidth: 1.5, borderColor: INK, backgroundColor: PAPER,
  },
  day: {
    position: 'absolute', left: 166, width: 84,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.6, color: INK, includeFontPadding: false,
  },
  // THE ENTRY IS A MARK, NOT A WORD. What tomorrow's line would say is the one
  // thing the lesson refuses to settle, so the picture may not spell it out.
  entry: { position: 'absolute', left: ENTRY_X, width: ENTRY_W, height: ENTRY_H, backgroundColor: INK },

  // SHUT, NOT MERELY WRITTEN. Drawn clear of every row's right edge so it can
  // never lie across a word.
  strap: { position: 'absolute', left: STRAP_X, top: STRAP_Y, width: STRAP_W, height: STRAP_H, backgroundColor: INK },
  buckle: {
    position: 'absolute', left: STRAP_X - 5, top: STRAP_Y + 30, width: 24, height: 16,
    borderWidth: 2.5, borderColor: INK, backgroundColor: PAPER,
  },

  hit: { position: 'absolute', top: PLATE_Y, width: PLATE_W, height: PLATE_H },
  plate: {
    position: 'absolute', left: 0, top: 0, width: PLATE_W, height: PLATE_H,
    borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: PAPER,
  },
  plateText: {
    position: 'absolute', left: 0, top: 8, width: PLATE_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.5, color: INK, includeFontPadding: false,
  },
});

export function Metaphysics40Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Metaphysics40Scene} band={[240, 512]} camera={CAM} />;
}
