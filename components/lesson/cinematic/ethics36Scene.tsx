import {
  View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { dirsFrom, clamp01, ease01, lerp, moveTr, pose, travelStance, WALK, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './ethics36Script';
import {
  facing, GROUND, K_FIG, STAGE_W, STAGE_H, INK, STONE, SOFT, RULE, PAPER, useHeld, carryFrom, keepHeld, useCarry, carry,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// ─────────────────────────────────────────────────────────────────────────────
// THREE LINES IN A LEDGER, AND EXACTLY ONE OF THEM GETS STRUCK.
//
// THE COMPOSITION, IN NUMBERS (H56).
//
// · the LEDGER is 248×132 at x 130, y 258…390, with a 2-thick spine down x 138
//   and a rule under its heading at y 284.
// · the three ENTRIES are 216×30 rows inside it at y 292, y 326 and y 360:
//   WHAT HAPPENED · WHOSE FAULT IT WAS · WHAT YOU ARE OWED. A struck row carries
//   a 2-thick horizontal stroke through its middle — the row stays legible under
//   it, because forgiving does not delete anything.
// · the EXCUSING PANEL is 108×80 at x 262, y 404…484: the same three rows in
//   miniature with the SECOND one struck instead, so the two ways of cancelling
//   sit side by side and can be compared rather than described.
// · the GIFT MARK is a 2-thick arm from the ledger's right edge (x 378, y 375)
//   out to x 398 — small, and pointing away from the book, because the thing being
//   handed over leaves the page. Its label sits UNDER the ledger at y 394…414,
//   right-aligned to x 396, because beside the arm there are only 22 units left.
// · the figure stands at x 56 and walks to 130; crown ~397, and the ledger begins
//   at x 130, so he stands beside it.
//
// Ink runs y 240 (caption) … y 500 (ground). BAND 234…512 = 278 (H59).
//
// NOTHING IS EVER REMOVED FROM THIS PAGE. A row that faded out would be a picture
// of forgetting, which is the one thing the lesson says forgiveness is not (A1).
// ─────────────────────────────────────────────────────────────────────────────

/** Crossfade for a beat that does NOT walk. 0.85 is the base `footfalls` assumes. */
const BASE_TR = 0.85;

const BOOK_X = 130;
const BOOK_Y = 258;
const BOOK_W = 248;
const BOOK_H = 132;

const ROW_Y = [292, 326, 360];
const ROW_X = BOOK_X + 20;
const ROW_W = 216;
const ROW_H = 30;
const ROW_TEXT = ['WHAT HAPPENED', 'WHOSE FAULT IT WAS', 'WHAT YOU ARE OWED'];
const ROW_ID = ['what', 'fault', 'owed'];

const EX_X = 262;
const EX_Y = 404;

const CAP_T = 240;
const FIG_X = 56;

const X = BEATS.map((b) => b.x ?? FIG_X);
// WHICH WAY HE IS POINTING, read off the same x track he walks along:
// +1 where it rises, -1 where it falls, and HOLD while he stands still, so a
// figure who walks left to something keeps facing it while he talks about it.
const DIR = dirsFrom(X, 1);
const P = BEATS.map((b) => b.p ?? 0);
const BOOK = BEATS.map((b) => (b.book ? 1 : 0));
const STRUCK = BEATS.map((b) => (b.struck ? 1 : 0));
const EXCUSE = BEATS.map((b) => (b.excuse ? 1 : 0));
const GIFT = BEATS.map((b) => (b.gift ? 1 : 0));
const LIVE = BEATS.map((b) => (b.live ? 1 : 0));

// R7b — the stage follows the control on its own graded beat, and only there.
// Derived from the beat rather than declared as a channel so it cannot fall out
// of step with the control it is about.
const REACT = BEATS.map((b) => (b.interact?.lever ? 1 : 0));

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('ethics36'));

export default function Ethics36Scene({ clock, bt, bi, qv, i, picked, onPick, dragPos }: SceneApi) {
  const reacting = REACT[i] === 1;
  const heldFig = useHeld();
  const cv = useCarry(5);
  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    // A WALKING BEAT TAKES AS LONG AS THE WALK NEEDS (rig.moveTr). A fixed length
    // here sprinted every long journey and left the footfalls — which the player
    // computes from moveTr — arriving after the figure had stopped.
    const tr = ease01(bt.value / moveTr(X[p], X[n], BASE_TR));
    const t = clock.value;
    const q = clamp01(qv.value);

    const figS = keepHeld(heldFig, travelStance(
      X[p], X[n],
      carryFrom(heldFig, n, emoteHold(P[p], t)), emoteHold(P[n], t), emoteLive(P[n], t, bt.value),
      tr, WALK,
    ));

    // The stroke is drawn ON the graded beat as the answer lands, and held after —
    // a cancellation that un-cancelled itself between beats would be nonsense.
    const scripted = carry(cv, 0, n, STRUCK[p], STRUCK[n], tr);
    return {
      fig: pose(figS, carry(cv, 1, n, X[p], X[n], tr), GROUND, K_FIG, facing(DIR[p], DIR[n], bt.value), 1),
      t,
      bookOn: carry(cv, 2, n, BOOK[p], BOOK[n], tr),
      strike: LIVE[n] === 1 && STRUCK[n] === 0 ? ease01(q) : scripted,
      excuseOn: carry(cv, 3, n, EXCUSE[p], EXCUSE[n], tr),
      // R7b — the arm hands the gift over. Move it to the far setting and the thing
      // that was the wronged person's to give appears in somebody else's hand, which
      // is the whole objection.
      giftOn: carry(cv, 4, n, GIFT[p], reacting ? dragPos.value : GIFT[n], tr),
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const answered = picked !== null;
  const live = !!BEATS[i]?.interact && !BEATS[i]?.interact?.cards && LIVE[i] === 1;

  const bookStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.bookOn }));
  const strikeStyle = useAnimatedStyle(() => ({ transform: [{ scaleX: SCENE.value.strike }] }));
  const excuseStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.excuseOn }));
  const giftStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.giftOn }));

  return (
    <View style={styles.scene}>
      <Text style={styles.cap}>WHAT THE WRONG LEFT BEHIND</Text>

      <Animated.View style={[StyleSheet.absoluteFill, bookStyle]}>
        <View style={styles.book} pointerEvents="none" />
        <View style={styles.spine} pointerEvents="none" />
        <View style={styles.headRule} pointerEvents="none" />

        {ROW_Y.map((ry, k) => (
          <Target
            key={ry}
            id={ROW_ID[k]}
            correct={k === 2}
            picked={picked}
            onPick={onPick}
            disabled={!live || answered}
            style={[styles.row, { top: ry }]}
          >
            <View
              style={[styles.rowBox, answered && picked === ROW_ID[k] && k !== 2 && styles.rowWrong]}
              pointerEvents="none"
            />
            <Text style={styles.rowText}>{ROW_TEXT[k]}</Text>
          </Target>
        ))}

        {/* The cancellation: drawn left to right across the third row only. */}
        <Animated.View style={[styles.strike, strikeStyle]} pointerEvents="none" />
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, excuseStyle]} pointerEvents="none">
        <View style={styles.exBox} />
        <Text style={styles.exCap}>EXCUSING</Text>
        {[0, 1, 2].map((k) => (
          <View key={k} style={[styles.exRow, { top: EX_Y + 26 + k * 16 }]} />
        ))}
        <View style={styles.exStrike} />
      </Animated.View>

      <Animated.View style={[styles.gift, giftStyle]} pointerEvents="none">
        <View style={styles.giftArm} />
        <Text style={styles.giftLabel}>YOURS{'\n'}TO GIVE</Text>
      </Animated.View>

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DF} k={K_FIG} />
    </View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 20, right: 14, top: GROUND, height: 1.5, backgroundColor: RULE },

  cap: {
    position: 'absolute', left: 130, top: CAP_T, width: 260,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.5, color: SOFT, includeFontPadding: false,
  },

  book: {
    position: 'absolute', left: BOOK_X, top: BOOK_Y, width: BOOK_W, height: BOOK_H,
    borderWidth: 2.5, borderColor: INK, borderRadius: 4, backgroundColor: STONE,
  },
  spine: { position: 'absolute', left: BOOK_X + 8, top: BOOK_Y + 6, width: 2, height: BOOK_H - 12, backgroundColor: SOFT },
  headRule: { position: 'absolute', left: ROW_X, top: 284, width: ROW_W, height: 1.5, backgroundColor: SOFT },

  row: { position: 'absolute', left: ROW_X, width: ROW_W, height: ROW_H },
  rowBox: {
    position: 'absolute', left: 0, top: 0, width: ROW_W, height: ROW_H,
    borderWidth: 1.5, borderColor: INK, borderRadius: 3, backgroundColor: STONE,
  },
  rowWrong: { borderColor: SOFT, borderStyle: 'dashed' },
  rowText: {
    position: 'absolute', left: 0, top: 10, width: ROW_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 1, color: INK, includeFontPadding: false,
  },
  // Scaled about its LEFT end, so the stroke is drawn across rather than growing
  // out of the middle of the row.
  strike: {
    position: 'absolute', left: ROW_X + 8, top: ROW_Y[2] + ROW_H / 2 - 1, width: ROW_W - 16, height: 2.5,
    backgroundColor: INK, transformOrigin: '0% 50%',
  },

  exBox: {
    position: 'absolute', left: EX_X, top: EX_Y, width: 108, height: 80,
    borderWidth: 1.5, borderColor: SOFT, borderRadius: 4, backgroundColor: PAPER,
  },
  exCap: {
    position: 'absolute', left: EX_X, top: EX_Y + 7, width: 108, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.4, color: SOFT, includeFontPadding: false,
  },
  exRow: { position: 'absolute', left: EX_X + 14, width: 80, height: 8, borderWidth: 1, borderColor: SOFT, borderRadius: 2 },
  exStrike: { position: 'absolute', left: EX_X + 18, top: EX_Y + 46, width: 72, height: 2, backgroundColor: INK },

  gift: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H },
  giftArm: { position: 'absolute', left: BOOK_X + BOOK_W, top: 375, width: 20, height: 2, backgroundColor: INK },
  giftLabel: {
    // UNDER THE LEDGER, RIGHT-ALIGNED TO 396 — not beside the arm.
    //
    // There is no room beside the arm: the ledger ends at x 378 and the stage ends
    // at 400, so a two-line label of about forty-six units could only ever hang off
    // the edge, and it did — measured 16.5 units past it, with TO GIVE trimmed at
    // both ends on every beat the gift is up. Widening the box made the overhang
    // worse rather than better, which is the tell that the position was wrong and
    // not the size. It sits in the clear band below the ledger's floor (390) now.
    // The EXCUSING panel shares that corner but never shares a beat with the gift.
    position: 'absolute', left: 334, top: 394, width: 62, textAlign: 'right', lineHeight: 10,
    // INK, not SOFT: a control drives this layer, so it rests at values SOFT does
    // not survive — 5.3:1 on paper is 2.3:1 at 0.57 (D35, R7c).
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.9, color: INK, includeFontPadding: false,
  },
});

export function Ethics36Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Ethics36Scene} band={[234, 512]} camera={CAM} />;
}
