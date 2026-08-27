import {
  View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { clamp01, ease01, moveTr, pose, travelStance, WALK, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './epistemology20Script';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, STONE, SOFT, RULE, PAPER, useHeld, carryFrom, keepHeld, useCarry, carry,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// ─────────────────────────────────────────────────────────────────────────────
// FOUR REPORTS, TWO ORIGINS, AND A BAR THAT WAS COUNTING WRONG.
//
// THE COMPOSITION, IN NUMBERS (H56).
//
// · FOUR SOURCE BOXES, 76 wide and 38 tall, at y 228…266, lefts 30 · 118 · 206 ·
//   294 — the row ends at x 370. Each carries its kind in caps and a rule that
//   arrives when it reports.
// · the WIRES drop from the foot of each box at y 266 to the origin row at y 306.
//   Three of them (boxes 0, 2, 3) run in to ONE origin at x 150…250; the second
//   box runs to its own at x 30…106. The horizontal legs sit at y 294 so no wire
//   ever crosses a box.
// · the ORIGINS are 100×24 and 76×24 at y 306…330 — ONE POST and OWN LEGWORK.
//   They are the only labels below the boxes, so the eye lands on the fan-in
//   rather than on the wires themselves.
// · the CONFIDENCE BAR is 340 wide at x 30…370, y 350…366, captioned at y 338.
//   It runs the full width of the stage, so it is the piece that decides the
//   clearance: at 366 it leaves 31 units above the figure's crown at 397, which
//   is the same gap the strip lessons in this branch use. An earlier draft had it
//   at 380 and the figure would have stood through it.
// · the FIGURE walks x 200 → 132 → 268 on GROUND 500; crown ≈ 397.
//
// Ink runs y 228 (the boxes) … y 500. BAND 222…512 = 290, with the 103-unit
// figure at 35%.
// ─────────────────────────────────────────────────────────────────────────────

/** Crossfade for a beat that does NOT walk. 0.85 is the base `footfalls` assumes. */
const BASE_TR = 0.85;

const BOX_Y = 228;
const BOX_W = 76;
const BOX_H = 38;
const BOX_X = [30, 118, 206, 294];
const BOX_ID = ['paper', 'own', 'podcast', 'friend'];
const BOX_CAP = ['A PAPER', 'A REPORTER', 'A PODCAST', 'A FRIEND'];
/** Which origin each source draws from. 1 = its own legwork. */
const FROM_OWN = [0, 1, 0, 0];

const WIRE_Y = 294;
const ORIGIN_Y = 306;
const SHARED_X = 150;
const SHARED_W = 100;
const OWN_X = 30;
const OWN_W = 92;

const BAR_X = 30;
const BAR_Y = 350;
const BAR_W = 340;
const BAR_H = 16;

const FIG_X = 200;

const X = BEATS.map((b) => b.x ?? FIG_X);
const P = BEATS.map((b) => b.p ?? 0);
const VOICES = BEATS.map((b) => b.voices ?? 0);
const AGREE = BEATS.map((b) => b.agree ?? 0);
const WIRES = BEATS.map((b) => b.wires ?? 0);
const LIVE = BEATS.map((b) => b.live ?? 0);

// R7b — the stage follows the control on its own graded beat, and only there.
// Derived from the beat rather than declared as a channel so it cannot fall out
// of step with the control it is about.
const REACT = BEATS.map((b) => (b.interact?.field ? 1 : 0));

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('epistemology20'));

export default function Epistemology20Scene({ clock, bt, bi, i, picked, onPick, dragPos, dragPos2 }: SceneApi) {
  const reacting = REACT[i] === 1;
  const heldFig = useHeld();
  const cv = useCarry(4);
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
      voices: carry(cv, 1, n, VOICES[p], VOICES[n], tr),
      agree: carry(cv, 2, n, AGREE[p], AGREE[n], tr),
      // R7b — the pad draws the wires. Left along the x axis is a source repeating
      // what it heard, and the wiring behind the four appears: four voices, one
      // origin. The y axis is deliberately left dead, because it is the axis that
      // does nothing — a big name adds reach, not evidence.
      wires: carry(cv, 3, n, WIRES[p], reacting ? 1 - dragPos.value : WIRES[n], tr),
      t,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const answered = picked !== null;
  const live = !!BEATS[i]?.interact && !BEATS[i]?.interact?.cards && LIVE[i] === 1;

  const wireStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.wires }));
  const fillStyle = useAnimatedStyle(() => ({ width: (BAR_W - 4) * SCENE.value.agree }));

  return (
    <View style={styles.scene}>
      {BOX_X.map((bx, k) => <Source key={BOX_ID[k]} S={SCENE} index={k} />)}

      {/* THE WIRING, and the two places it goes. */}
      <Animated.View style={[StyleSheet.absoluteFill, wireStyle]} pointerEvents="none">
        {BOX_X.map((bx, k) => {
          const cx = bx + BOX_W / 2;
          const target = FROM_OWN[k] ? OWN_X + OWN_W / 2 : SHARED_X + SHARED_W / 2;
          const lo = Math.min(cx, target);
          return (
            <View key={`w${bx}`}>
              <View style={[styles.wireDrop, { left: cx - 1, top: BOX_Y + BOX_H, height: WIRE_Y - BOX_Y - BOX_H }]} />
              <View style={[styles.wireRun, { left: lo, top: WIRE_Y, width: Math.abs(target - cx) + 2 }]} />
              <View style={[styles.wireDrop, { left: target - 1, top: WIRE_Y, height: ORIGIN_Y - WIRE_Y }]} />
            </View>
          );
        })}
        <View style={[styles.origin, { left: SHARED_X, width: SHARED_W }]} />
        <Text style={[styles.originText, { left: SHARED_X, width: SHARED_W }]}>ONE POST</Text>
        <View style={[styles.origin, { left: OWN_X, width: OWN_W }]} />
        <Text style={[styles.originText, { left: OWN_X, width: OWN_W }]}>OWN LEGWORK</Text>
      </Animated.View>

      {BOX_X.map((bx, k) => (
        <Target
          key={`t${BOX_ID[k]}`}
          id={BOX_ID[k]}
          correct={FROM_OWN[k] === 1}
          picked={picked}
          onPick={onPick}
          disabled={!live || answered}
          style={[styles.hit, { left: bx }]}
        >
          <View
            style={[
              styles.hitBox,
              answered && FROM_OWN[k] === 1 && styles.hitRight,
              answered && picked === BOX_ID[k] && FROM_OWN[k] !== 1 && styles.hitWrong,
            ]}
            pointerEvents="none"
          />
        </Target>
      ))}

      <Text style={styles.barCap} pointerEvents="none">HOW SURE THIS MAKES YOU</Text>
      <View style={styles.barBox} pointerEvents="none">
        <Animated.View style={[styles.barFill, fillStyle]} />
      </View>

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DF} k={K_FIG} />
    </View>
  );
}

/** One source. Its tick arrives as the row fills, left to right. */
function Source({ S, index }: { S: { value: { voices: number } }; index: number }) {
  const left = BOX_X[index];
  const st = useAnimatedStyle(() => ({ opacity: clamp01(S.value.voices * 4 - index) }));
  return (
    <Animated.View pointerEvents="none" style={st}>
      <View style={[styles.box, { left }]} />
      <Text style={[styles.boxCap, { left }]} numberOfLines={1} pointerEvents="none">{BOX_CAP[index]}</Text>
      <View style={[styles.said, { left: left + BOX_W / 2 - 14 }]} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 20, right: 14, top: GROUND, height: 1.5, backgroundColor: RULE },

  box: {
    position: 'absolute', top: BOX_Y, width: BOX_W, height: BOX_H,
    borderWidth: 2, borderColor: INK, borderRadius: 3, backgroundColor: STONE,
  },
  boxCap: {
    position: 'absolute', top: BOX_Y + 7, width: BOX_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.7, color: INK, includeFontPadding: false,
  },
  said: { position: 'absolute', top: BOX_Y + 23, width: 28, height: 3, backgroundColor: SOFT, borderRadius: 1.5 },

  wireDrop: { position: 'absolute', width: 2, backgroundColor: SOFT },
  wireRun: { position: 'absolute', height: 2, backgroundColor: SOFT },
  origin: {
    position: 'absolute', top: ORIGIN_Y, height: 24,
    borderWidth: 2, borderColor: INK, borderRadius: 3, backgroundColor: PAPER,
  },
  originText: {
    position: 'absolute', top: ORIGIN_Y + 7, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.8, color: INK, includeFontPadding: false,
  },

  barCap: {
    position: 'absolute', left: BAR_X, top: BAR_Y - 12, width: 240,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.3, color: SOFT, includeFontPadding: false,
  },
  barBox: {
    position: 'absolute', left: BAR_X, top: BAR_Y, width: BAR_W, height: BAR_H,
    borderWidth: 2, borderColor: INK, borderRadius: 3, backgroundColor: STONE,
    justifyContent: 'center', paddingHorizontal: 2,
  },
  barFill: { height: BAR_H - 8, backgroundColor: INK, borderRadius: 1 },

  hit: { position: 'absolute', top: BOX_Y, width: BOX_W, height: BOX_H },
  hitBox: { width: BOX_W, height: BOX_H, borderRadius: 3 },
  hitRight: { borderWidth: 3, borderColor: INK },
  hitWrong: { borderWidth: 1.5, borderColor: SOFT, borderStyle: 'dashed', opacity: 0.5 },
});

export function Epistemology20Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Epistemology20Scene} band={[222, 512]} camera={CAM} />;
}
