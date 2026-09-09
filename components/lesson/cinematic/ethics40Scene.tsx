import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { dirsFrom, ease01, moveTr, travelStance, WALK, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './ethics40Script';
import {
  facing, GROUND, K_FIG, STAGE_W, STAGE_H, INK, STONE, SOFT, RULE, PAPER, useHeld, carryFrom, keepHeld, useCarry, carry, pickAt, lookPose,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// ─────────────────────────────────────────────────────────────────────────────
// A SEALED PROMISE ABOVE AN EMPTY SEAT, AND ONE TIE LOOKING FOR SOMETHING.
//
// THE COMPOSITION, IN NUMBERS (H56).
//
// · the PROMISE is a 100×44 card at x 250 (250…350), y 272…316, standing on a
//   SHELF of 236×8 at x 150 (150…386), y 316…324. It carries a 16-unit SEAL at
//   x 258, y 292 — the mark of something meant to outlast the moment it was made.
// · the SEAT is drawn as a filled STONE mass, never as an outline: a back of
//   10×70 at x 170, y 346…416, a seat of 82×10 at x 170 (170…252), y 414…424, and
//   two legs of 6×28 at x 176 and x 240, y 424…452. Its centre is x 211.
// · the TIE leaves the promise's bottom edge at x 298, drops to y 440, runs
//   sideways to its anchor and rises 10 units into it. Nothing carries a word at
//   y 440, so the run cannot be drawn across one (S9). Its anchor is the whole
//   answer: x 96 is the man who promised, x 211 is the seat, and between them it
//   is holding nothing.
// · THREE PLATES of 80×26 at x 138 · 226 · 314 (138…394), top y 462 — below the
//   legs at 452 and above the ground line, each carrying its own words (S11).
// · the figure stands at x 36 and walks to 96; his widest span at the walked mark
//   is x ≈ 71…121, seventeen units clear of the nearest plate at 138 and forty-nine
//   clear of the seat at 170.
//
// Ink runs y 244 (the caption) … y 500 (ground). BAND 240…512 = 272 — a 103-unit
// figure at 37.9%, inside H58's 38%.
// ─────────────────────────────────────────────────────────────────────────────

/** Crossfade for a beat that does NOT walk. 0.85 is the base `footfalls` assumes. */
const BASE_TR = 0.85;

const CARD_X = 250;
const CARD_Y = 272;
const CARD_W = 100;
const CARD_H = 44;
const SHELF_X = 150;
const SHELF_Y = CARD_Y + CARD_H;
const SHELF_W = 236;

const SEAT_X = 170;
const SEAT_W = 82;
const BACK_Y = 346;
const BACK_H = 70;
const PAN_Y = 414;
const LEG_Y = 424;
const LEG_H = 28;
/** The middle of the seat — where a tie aimed at HIM would land. */
const SEAT_MID = 211;

const TIE_X = 298;
const TIE_Y = 440;
const TIE_RISE = 10;
/** Where the man who made the promise stands when the question is asked. */
const FIG_MARK = 96;

const PLATE_X = [138, 226, 314];
const PLATE_Y = 462;
const PLATE_W = 80;
const PLATE_H = 26;
const PLATE_CAP = ['THE MAN', 'HIS WISHES', 'NOTHING'];
const PLATE_ID = ['man', 'wishes', 'nothing'];
/** The stake that outlived him. The other two are the two ways of giving up. */
const WISHES = 1;

const CAP_T = 244;
const FIG_X = 36;

const X = BEATS.map((b) => b.x ?? FIG_X);
// WHICH WAY HE IS POINTING, read off the same x track he walks along.
const DIR = dirsFrom(X, 1);
const P = BEATS.map((b) => b.p ?? 0);
const PROMISE = BEATS.map((b) => (b.promise ? 1 : 0));
const SEAT = BEATS.map((b) => (b.seat ? 1 : 0));
const TIE = BEATS.map((b) => (b.tie ? 1 : 0));
const PLATES = BEATS.map((b) => (b.plates ? 1 : 0));
const LIVE = BEATS.map((b) => (b.live ? 1 : 0));

// R7c — the stage follows the control on its own graded beat, and only there.
// Derived from the beat so it cannot fall out of step with the control.
const REACT = BEATS.map((b) => (b.interact?.poll ? 1 : 0));

// THE POLL'S OWN ORDER, never the shuffled rows (X3): 0 you · 1 nobody · 2 him.
// Each row is read off that option's own words, and the three are authored left
// to right across the stage so the tie's far end travels rather than jumps.
//   you    — "you alone"                  → the tie lands on the man at x 96.
//   nobody — "the duty died with him"      → it holds nothing, and is not drawn.
//   him    — "his surviving wants"         → it lands on the seat at x 211.
const ANCHOR_AT = [FIG_MARK, (FIG_MARK + SEAT_MID) / 2, SEAT_MID];
const HELD_AT = [1, 0, 1];

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('ethics40'));

export default function Ethics40Scene({ clock, bt, bi, i, picked, onPick, pickPos, gazeX, gazeY, gazeOn }: SceneApi) {
  const reacting = REACT[i] === 1;
  const heldFig = useHeld();
  const cv = useCarry(6);
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
      promiseOn: carry(cv, 1, n, PROMISE[p], PROMISE[n], tr),
      seatOn: carry(cv, 2, n, SEAT[p], SEAT[n], tr),
      // The tie is drawn when the beat asks for it AND the reader's own answer
      // gives it something to hold.
      tieOn: carry(cv, 3, n, TIE[p], reacting ? TIE[n] * pickAt(HELD_AT, pickPos.value) : TIE[n], tr),
      anchor: carry(cv, 4, n, SEAT_MID, reacting ? pickAt(ANCHOR_AT, pickPos.value) : SEAT_MID, tr),
      platesOn: carry(cv, 5, n, PLATES[p], PLATES[n], tr),
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const answered = picked !== null;
  const live = !!BEATS[i]?.interact && !BEATS[i]?.interact?.cards && LIVE[i] === 1;

  const promiseStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.promiseOn }));
  const seatStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.seatOn }));
  const platesStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.platesOn }));
  const tieStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.tieOn }));
  const runStyle = useAnimatedStyle(() => ({
    left: Math.min(SCENE.value.anchor, TIE_X),
    width: Math.abs(TIE_X - SCENE.value.anchor),
  }));
  const riseStyle = useAnimatedStyle(() => ({ left: SCENE.value.anchor - 1.5 }));

  return (
    <View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      <Text style={styles.cap} pointerEvents="none">NOBODY LEFT TO HOLD YOU TO IT</Text>

      <Animated.View style={[StyleSheet.absoluteFill, promiseStyle]} pointerEvents="none">
        <View style={styles.shelf} />
        <View style={styles.card} />
        <Text style={styles.cardText}>THE PROMISE</Text>
        <View style={styles.seal} />
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, seatStyle]} pointerEvents="none">
        <View style={styles.back} />
        <View style={styles.pan} />
        <View style={[styles.leg, { left: 176 }]} />
        <View style={[styles.leg, { left: 240 }]} />
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, tieStyle]} pointerEvents="none">
        <View style={styles.drop} />
        <Animated.View style={[styles.run, runStyle]} />
        <Animated.View style={[styles.rise, riseStyle]} />
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, platesStyle]}>
        {PLATE_ID.map((id, k) => (
          <Target
            key={id}
            id={id}
            correct={k === WISHES}
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

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 20, right: 14, top: GROUND, height: 1.5, backgroundColor: RULE },
  // THE FLOOR THE GROUND LINE SITS ON — a subject standing on a filled mass
  // rather than on bare page.
  floor: { position: 'absolute', left: 0, right: 0, top: GROUND, bottom: 0, backgroundColor: RULE },

  cap: {
    position: 'absolute', left: SHELF_X, top: CAP_T, width: SHELF_W,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.4, color: SOFT, includeFontPadding: false,
  },

  shelf: { position: 'absolute', left: SHELF_X, top: SHELF_Y, width: SHELF_W, height: 8, backgroundColor: INK },
  card: {
    position: 'absolute', left: CARD_X, top: CARD_Y, width: CARD_W, height: CARD_H,
    borderWidth: 2, borderColor: INK, backgroundColor: PAPER,
  },
  cardText: {
    position: 'absolute', left: CARD_X + 24, top: CARD_Y + 17, width: CARD_W - 30,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.6, color: INK, includeFontPadding: false,
  },
  // A SEAL, NOT A SIGNATURE. It is left of the words with six units between them,
  // so nothing is ever printed over the mark or the mark over the words.
  seal: {
    position: 'absolute', left: CARD_X + 8, top: CARD_Y + 14, width: 16, height: 16, borderRadius: 8,
    backgroundColor: INK,
  },

  back: {
    position: 'absolute', left: SEAT_X, top: BACK_Y, width: 10, height: BACK_H,
    borderWidth: 1.5, borderColor: INK, backgroundColor: STONE,
  },
  pan: {
    position: 'absolute', left: SEAT_X, top: PAN_Y, width: SEAT_W, height: 10,
    borderWidth: 1.5, borderColor: INK, backgroundColor: STONE,
  },
  leg: { position: 'absolute', top: LEG_Y, width: 6, height: LEG_H, backgroundColor: INK },

  // THE TIE IS ONE LINE IN THREE ORTHOGONAL PIECES, so its far end can travel
  // without anything rotating and without crossing a word.
  drop: { position: 'absolute', left: TIE_X - 1.5, top: SHELF_Y + 8, width: 3, height: TIE_Y - SHELF_Y - 8, backgroundColor: INK },
  run: { position: 'absolute', top: TIE_Y - 1.5, height: 3, backgroundColor: INK },
  rise: { position: 'absolute', top: TIE_Y - TIE_RISE, width: 3, height: TIE_RISE, backgroundColor: INK },

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

export function Ethics40Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Ethics40Scene} band={[240, 512]} camera={CAM} />;
}
