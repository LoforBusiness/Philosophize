import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { clamp01, ease01, lerp, moveTr, pose, travelStance, WALK, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './political36Script';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, STONE, SOFT, RULE, PAPER, useHeld, carryFrom, keepHeld, useCarry, carry,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// ─────────────────────────────────────────────────────────────────────────────
// TWENTY-FOUR LIT WINDOWS, AND A LAMP WITH NOBODY BEHIND IT.
//
// THE COMPOSITION, IN NUMBERS (H56).
//
// · the BLOCK is a 6×4 grid of 30×22 windows with 6 of gap, at x 118…334,
//   y 300…412. A lit window is filled ink; an unlit one is an outline. Nothing
//   moves — windows only change state, because the street is not going anywhere.
// · the LAMP hangs above at x 210, y 240: a 24-wide housing with a 3-thick beam
//   that SWEEPS ±22° about the housing's own bottom edge, so the beam pivots
//   where a beam would.
// · the GUARD BOX is 44×30 at x 188, y 238…268, drawn as an outline with nothing
//   inside it — and it stays empty on every beat, because the design's claim is
//   that the guard need not be there (A1).
// · the three CANDIDATES are 96×24 boxes at x 118, 220 and 118, at y 428, 428 and
//   456 — laid out so no two share an edge and the wide one sits alone.
// · the figure stands at x 52 and walks to 126; crown ~397. The block begins at
//   x 118, so he stands to its left throughout.
//
// Ink runs y 226 (caption) … y 500 (ground). BAND 226…512 = 286 (H59).
//
// THE BAND WAS 268 AND THAT IS EXACTLY H58's LINE. A 103-unit figure is 38% of
// 268, which the check counts as over — so the lamp and the guard box moved up 12
// units rather than the budget moving. A band with no margin is a band that fails
// the next time anything is nudged.
//
// WINDOWS ARE NOT PEOPLE (H57). Each is a thing someone is doing, and the lesson
// is about how many of them there are — a count, not a cast.
// ─────────────────────────────────────────────────────────────────────────────

/** Crossfade for a beat that does NOT walk. 0.85 is the base `footfalls` assumes. */
const BASE_TR = 0.85;

const WIN_W = 30;
const WIN_H = 22;
const GRID_X = 118;
const GRID_Y = 300;
const COLS = 6;
const ROWS = 4;
const WINDOWS = COLS * ROWS;

// · HE STOPS AT x 84, NOT 126. The pick chips start at x 118 and gesture 35 puts
//   his hand about seventeen units past his own x, so at 126 he stood on A NEW
//   LAW. Same fault as logic36: a figure walking over to look at the cards ends
//   up in front of them.
const LAMP_X = 210;
const LAMP_Y = 240;

const PICK = [
  { id: 'law', text: 'A NEW LAW', left: 118, top: 428 },
  { id: 'arrest', text: 'AN ARREST', left: 220, top: 428 },
  { id: 'unsure', text: 'NOT KNOWING', left: 118, top: 456 },
];

// AT THE BAND'S TOP. The guard box is 44x30 at (188, 238) and the caption ran
// 232…242, so the box's top three units crossed the bottom of EVERY LIT WINDOW
// IS SOMETHING LEGAL. The band starts at 226 and nothing else is up there.
const CAP_T = 226;
const FIG_X = 52;

const X = BEATS.map((b) => b.x ?? FIG_X);
const P = BEATS.map((b) => b.p ?? 0);
const STREET = BEATS.map((b) => (b.street ? 1 : 0));
const WATCH = BEATS.map((b) => b.watch ?? 0);
const LIVE_D = BEATS.map((b) => (b.live_d ? 1 : 0));
const LAMP = BEATS.map((b) => (b.lamp ? 1 : 0));
const EMPTY = BEATS.map((b) => (b.empty ? 1 : 0));
const PICKS = BEATS.map((b) => (b.picks ? 1 : 0));
const LIVE = BEATS.map((b) => (b.live ? 1 : 0));

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('political36'));

export default function Political36Scene({ clock, bt, bi, i, picked, onPick, dragPos }: SceneApi) {
  const heldFig = useHeld();
  const cv = useCarry(6);
  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    // A WALKING BEAT TAKES AS LONG AS THE WALK NEEDS (rig.moveTr). A fixed length
    // here sprinted every long journey and left the footfalls — which the player
    // computes from moveTr — arriving after the figure had stopped.
    const tr = ease01(bt.value / moveTr(X[p], X[n], BASE_TR));
    const t = clock.value;

    const figS = keepHeld(heldFig, travelStance(
      X[p], X[n],
      carryFrom(heldFig, n, emoteHold(P[p], t)), emoteHold(P[n], t), emoteLive(P[n], t, bt.value),
      tr, WALK,
    ));

    return {
      fig: pose(figS, carry(cv, 0, n, X[p], X[n], tr), GROUND, K_FIG, 1, 1),
      t,
      streetOn: carry(cv, 1, n, STREET[p], STREET[n], tr),
      // Reader's thumb on the drag beat, the script's track everywhere else.
      watch: LIVE_D[n] === 1 ? clamp01(dragPos.value) : carry(cv, 2, n, WATCH[p], WATCH[n], tr),
      lampOn: carry(cv, 3, n, LAMP[p], LAMP[n], tr),
      emptyOn: carry(cv, 4, n, EMPTY[p], EMPTY[n], tr),
      picksOn: carry(cv, 5, n, PICKS[p], PICKS[n], tr),
      // The beam sweeps on the wall clock, not the beat clock, so it keeps moving
      // whatever the reader does — which is the point of it.
      sweep: Math.sin(t * 0.9) * 22,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const answered = picked !== null;
  const live = !!BEATS[i]?.interact && !BEATS[i]?.interact?.drag && LIVE[i] === 1;

  const streetStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.streetOn }));
  const lampStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.lampOn }));
  const beamStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${SCENE.value.sweep}deg` }] }));
  const emptyStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.emptyOn }));
  const picksStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.picksOn }));

  const wins: number[] = [];
  for (let w = 0; w < WINDOWS; w++) wins.push(w);

  return (
    <View style={styles.scene}>
      <Text style={styles.cap}>EVERY LIT WINDOW IS SOMETHING LEGAL</Text>

      <Animated.View style={[StyleSheet.absoluteFill, lampStyle]} pointerEvents="none">
        <View style={styles.lampBox} />
        <Animated.View style={[styles.beam, beamStyle]} />
      </Animated.View>
      <Animated.View style={[StyleSheet.absoluteFill, emptyStyle]} pointerEvents="none">
        <View style={styles.guardBox} />
        <Text style={styles.guardLabel}>EMPTY</Text>
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, streetStyle]} pointerEvents="none">
        {wins.map((w) => {
          const left = GRID_X + (w % COLS) * (WIN_W + 6);
          const top = GRID_Y + Math.floor(w / COLS) * (WIN_H + 6);
          return <Window key={w} S={SCENE} index={w} left={left} top={top} />;
        })}
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, picksStyle]}>
        {PICK.map((c, k) => (
          <Target
            key={c.id}
            id={c.id}
            correct={k === 2}
            picked={picked}
            onPick={onPick}
            disabled={!live || answered}
            style={[styles.pick, { left: c.left, top: c.top, width: k === 2 ? 198 : 96 }]}
          >
            <View
              style={[
                styles.pickBox,
                { width: k === 2 ? 198 : 96 },
                answered && picked === c.id && k !== 2 && styles.pickWrong,
              ]}
              pointerEvents="none"
            />
            <Text style={[styles.pickText, { width: k === 2 ? 198 : 96 }]}>{c.text}</Text>
          </Target>
        ))}
      </Animated.View>

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DF} k={K_FIG} />
    </View>
  );
}

/**
 * One window. Goes dark as the watching passes its own share of the rail, in a
 * fixed scattered order so the street thins out rather than emptying row by row.
 */
const ORDER = [17, 3, 22, 9, 14, 1, 20, 7, 12, 23, 5, 18, 0, 11, 16, 8, 21, 2, 13, 19, 6, 15, 10, 4];
function Window({ S, index, left, top }: { S: SharedValue<any>; index: number; left: number; top: number }) {
  const rank = ORDER.indexOf(index);
  const st = useAnimatedStyle(() => ({ opacity: 1 - clamp01(S.value.watch * WINDOWS - rank) }));
  return (
    <View style={{ position: 'absolute', left, top }}>
      <View style={styles.winFrame} />
      <Animated.View style={[styles.winLit, st]} />
    </View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 20, right: 14, top: GROUND, height: 1.5, backgroundColor: RULE },
  // THE FLOOR THE GROUND LINE SITS ON. A rule on its own leaves the
  // figure and everything it is looking at standing on bare page;
  // political7 and political8 both stand their subject on a filled mass.
  floor: { position: 'absolute', left: 0, right: 0, top: GROUND, bottom: 0, backgroundColor: RULE },

  cap: {
    position: 'absolute', left: 118, top: CAP_T, width: 270,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.3, color: SOFT, includeFontPadding: false,
  },

  winFrame: {
    position: 'absolute', left: 0, top: 0, width: WIN_W, height: WIN_H,
    borderWidth: 1.5, borderColor: INK, borderRadius: 2, backgroundColor: STONE,
  },
  winLit: { position: 'absolute', left: 3, top: 3, width: WIN_W - 6, height: WIN_H - 6, backgroundColor: INK, borderRadius: 1 },

  lampBox: {
    position: 'absolute', left: LAMP_X, top: LAMP_Y, width: 24, height: 14,
    borderWidth: 2, borderColor: INK, borderRadius: 2, backgroundColor: PAPER,
  },
  // Pivots about the housing's bottom edge, which is where a beam leaves a lamp.
  beam: {
    position: 'absolute', left: LAMP_X + 11, top: LAMP_Y + 14, width: 3, height: 34,
    backgroundColor: SOFT, transformOrigin: '50% 0%',
  },

  guardBox: {
    position: 'absolute', left: 188, top: 238, width: 44, height: 30,
    borderWidth: 1.5, borderColor: SOFT, borderRadius: 3, backgroundColor: STONE,
  },
  guardLabel: {
    position: 'absolute', left: 188, top: 270, width: 44, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.1, color: SOFT, includeFontPadding: false,
  },

  pick: { position: 'absolute', height: 24 },
  pickBox: {
    position: 'absolute', left: 0, top: 0, height: 24,
    borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: PAPER,
  },
  pickWrong: { borderColor: SOFT, borderStyle: 'dashed' },
  pickText: {
    position: 'absolute', left: 0, top: 7, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1, color: INK, includeFontPadding: false,
  },
});

export function Political36Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Political36Scene} band={[226, 512]} camera={CAM} />;
}
