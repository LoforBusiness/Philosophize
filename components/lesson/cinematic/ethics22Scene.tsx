import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { dirsFrom, clamp01, ease01, moveTr, pose, travelStance, WALK, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './ethics22Script';
import { facing, GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, PAPER, useHeld, carryFrom, keepHeld, useCarry, carry, lookPose,
} from './cinematicKit';
import { stageTone } from './stageTones';
import { floorStyle, lipOf, PLATE_FACE } from './stageSkin';
import type { SceneApi } from './CinematicPlayer';
import Target, { AnswerLift } from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// THE STAGE IS STRUCK IN THIS LESSON'S OWN BRANCH HUE (./stageTones).
// Same three tones, same luminance to the third decimal — so every contrast
// measured against the old greys still holds and nothing on the stage moved.
const TONE = stageTone('ethics');
const { RULE, STONE, SHADE } = TONE;
const LIP = lipOf(TONE);   // the ledge a toned plate stands on (scripts/skin-stage.mjs)

// ─────────────────────────────────────────────────────────────────────────────
// FIVE COLUMNS, A TANK BEHIND THEM, AND ONE CABLE.
//
// THE COMPOSITION, IN NUMBERS (H56).
//
// · FIVE WANT COLUMNS, 64 wide and 96 tall, at y 258…354, lefts 30 · 100 · 170 ·
//   240 · 310 — the row ends at x 374. Each carries its name in caps across the
//   top and nothing else: they are not gauges and they hold no value, because the
//   reader is going to supply the values themselves on the last beat.
// · the TANK is a 2.5-thick rounded box, 150×36, at x 125…275, y 214…250, drawn
//   BEHIND the columns' row and above it. One object, unlabelled apart from its
//   own caption, so it never competes with the five.
// · the CABLE runs from the tank's foot at (200, 250) left along y 236 to x 62,
//   then down to the FIRST column's top at y 258. It reaches exactly one column
//   and the drawing makes that plain from across the room, which is the argument.
// · the FIGURE walks x 200 → 132 → 268 on GROUND 500; crown ≈ 397, and the
//   columns end at y 354, so 43 units stay clear at every stop.
//
// Ink runs y 214 (the tank) … y 500. BAND 208…512 = 304, with the 103-unit
// figure at 34%.
//
// THE COLUMNS ARE EMPTY ON PURPOSE. A scene that filled them would have answered
// the plot question before it was asked (group O) — the cable says which one is
// reachable; how much is in each is the reader's to draw.
// ─────────────────────────────────────────────────────────────────────────────

/** Crossfade for a beat that does NOT walk. 0.85 is the base `footfalls` assumes. */
const BASE_TR = 0.85;

const COL_Y = 258;
const COL_W = 64;
const COL_H = 96;
const COL_X = [30, 100, 170, 240, 310];
const COL_ID = ['pleasure', 'achieve', 'loved', 'truth', 'doing'];
const COL_CAP = ['PLEASURE', 'ACHIEVING', 'BEING LOVED', 'THE TRUTH', 'DOING IT'];

const TANK_X = 125;
const TANK_Y = 214;
const TANK_W = 150;
const TANK_H = 36;
const CABLE_Y = 236;

const FIG_X = 200;

const X = BEATS.map((b) => b.x ?? FIG_X);
// WHICH WAY HE IS POINTING, read off the same x track he walks along:
// +1 where it rises, -1 where it falls, and HOLD while he stands still, so a
// figure who walks left to something keeps facing it while he talks about it.
const DIR = dirsFrom(X, 1);
const P = BEATS.map((b) => b.p ?? 0);
const WANTS = BEATS.map((b) => b.wants ?? 0);
const MACHINE = BEATS.map((b) => b.machine ?? 0);
const CABLE = BEATS.map((b) => b.cable ?? 0);
const LIVE = BEATS.map((b) => b.live ?? 0);

// R7b — the stage follows the control on its own graded beat, and only there.
// Derived from the beat rather than declared as a channel so it cannot fall out
// of step with the control it is about.
const REACT = BEATS.map((b) => (b.interact?.plot ? 1 : 0));

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('ethics22'));

export default function Ethics22Scene({ clock, bt, bi, i, picked, onPick, dragPos, gazeX, gazeY, gazeOn }: SceneApi) {
  const reacting = REACT[i] === 1;
  const heldFig = useHeld();
  const cv = useCarry(4);
  const cur = BEATS[i];
  const prev = i > 0 ? BEATS[i - 1] : undefined;
  // ANIMATE ONLY WHAT CHANGED (C20c) — a one-shot flash, so it fires only on
  // the beat that raises its own point, never on a beat that merely holds it.
  const noteNow = (cur.note ?? 0) > 0 && (cur.note ?? 0) !== (prev?.note ?? 0) ? (cur.note ?? 0) : 0;
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
      fig: lookPose(figS, carry(cv, 0, n, X[p], X[n], tr), GROUND, K_FIG, facing(DIR[p], DIR[n], bt.value), 1, gazeX.value, gazeY.value, gazeOn.value),
      // R7b — the drawn curve raises the five wants. `pos` on a plot is the MEAN
      // height of what the reader drew (see ShapePlot), so the columns on stage rise
      // and fall with their own line: they are drawing the wants, not a graph of them.
      wants: carry(cv, 1, n, WANTS[p], reacting ? dragPos.value : WANTS[n], tr),
      machine: carry(cv, 2, n, MACHINE[p], MACHINE[n], tr),
      cable: carry(cv, 3, n, CABLE[p], CABLE[n], tr),
      // THE NOTE'S OWN PROGRESS, 0..1 across 1.1s of the beat it belongs to,
      // flatly 0 on every other beat — one flash per tap, not a loop.
      note: noteNow ? ease01(bt.value / 1.1) : 0,
      t,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const answered = picked !== null;
  const live = !!BEATS[i]?.interact && !BEATS[i]?.interact?.cards && LIVE[i] === 1;

  const tankStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.machine }));
  const cableStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.cable }));
  // Fades in over the first fifth of its window and out over the last.
  const noteStyle = useAnimatedStyle(() => {
    const u = SCENE.value.note;
    return { opacity: u <= 0 || u >= 1 ? 0 : Math.min(1, Math.min(u, 1 - u) / 0.2) };
  });

  return (
    <View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      <Animated.View style={[StyleSheet.absoluteFill, tankStyle]} pointerEvents="none">
        <View style={styles.tank} />
        <Text style={styles.tankText}>THE MACHINE</Text>
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, cableStyle]} pointerEvents="none">
        <View style={styles.cStem} />
        <View style={styles.cRun} />
        <View style={styles.cDrop} />
      </Animated.View>

      {/* group AH, beat 5: "the machine can supply only the experience of
          them" — a broken line over the four columns the real cable never
          reaches, against the solid one that does. */}
      {noteNow === 1 && <Animated.View style={[styles.noBar, noteStyle]} pointerEvents="none" />}

      {/* group AH, beat 7: hedonism's own claim, struck by the refusal. */}
      {noteNow === 2 && (
        <Animated.View style={[styles.claimWrap, noteStyle]} pointerEvents="none">
          <View style={styles.claimPlate}>
            <Text style={styles.claimT}>PLEASURE ALONE</Text>
          </View>
          <View style={styles.claimStrike} />
        </Animated.View>
      )}

      {/* Each answer rides with its own target (E39). */}
      {COL_X.map((cx, k) => (
        <AnswerLift key={COL_ID[k]} id={COL_ID[k]} picked={picked} correct={COL_ID[k] === 'pleasure'}>
          <Want S={SCENE} index={k} />
        </AnswerLift>
      ))}

      {COL_X.map((cx, k) => (
        <Target
          key={`t${COL_ID[k]}`}
          id={COL_ID[k]}
          correct={COL_ID[k] === 'pleasure'}
          picked={picked}
          onPick={onPick}
          disabled={!live || answered}
          style={[styles.hit, { left: cx }]}
        >
          <View
            style={[
              styles.hitBox,
              answered && COL_ID[k] === 'pleasure' && styles.right,
              answered && picked === COL_ID[k] && COL_ID[k] !== 'pleasure' && styles.wrong,
            ]}
            pointerEvents="none"
          />
        </Target>
      ))}

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DF} k={K_FIG} />
    </View>
  );
}

/** One thing people want. An empty column, named, and nothing in it. */
function Want({ S, index }: { S: { value: { wants: number } }; index: number }) {
  const left = COL_X[index];
  const st = useAnimatedStyle(() => ({ opacity: clamp01(S.value.wants * 5 - index) }));
  return (
    <Animated.View pointerEvents="none" style={st}>
      <View style={[styles.col, { left }]} />
      <Text style={[styles.colCap, { left }]} numberOfLines={2}>{COL_CAP[index]}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 20, right: 14, top: GROUND, height: 1.5, backgroundColor: RULE },
  // THE FLOOR THE GROUND LINE SITS ON. A rule on its own leaves the
  // figure and everything it is looking at standing on bare page;
  // political7 and political8 both stand their subject on a filled mass.
  floor: floorStyle(TONE, GROUND),

  tank: {
    position: 'absolute', left: TANK_X, top: TANK_Y, width: TANK_W, height: TANK_H,
    borderWidth: 2.5, borderColor: INK, borderRadius: 16, backgroundColor: PLATE_FACE, boxShadow: LIP,
  },
  tankText: {
    position: 'absolute', left: TANK_X, top: TANK_Y + 13, width: TANK_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 1.4, color: INK, includeFontPadding: false,
  },

  cStem: { position: 'absolute', left: 199, top: TANK_Y + TANK_H, width: 2.5, height: 0 },
  cRun: { position: 'absolute', left: 62, top: CABLE_Y, width: 138, height: 2.5, backgroundColor: INK },
  cDrop: { position: 'absolute', left: 61, top: CABLE_Y, width: 2.5, height: COL_Y - CABLE_Y, backgroundColor: INK },

  // ── the two tap events (group AH) — a broken line where the real cable
  // never reaches, and the hedonist's own claim struck by the refusal.
  noBar: {
    position: 'absolute', left: COL_X[1], top: COL_Y - 8, width: COL_X[4] + COL_W - COL_X[1], height: 0,
    borderTopWidth: 1.5, borderColor: SOFT, borderStyle: 'dashed',
  },
  claimWrap: { position: 'absolute', left: 20, top: 222, width: 96, height: 28 },
  claimPlate: {
    width: 96, height: 28, borderWidth: 1.5, borderColor: SOFT, borderRadius: 6,
    backgroundColor: PLATE_FACE, boxShadow: LIP, alignItems: 'center', justifyContent: 'center',
  },
  claimT: {
    fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 0.5, color: INK, includeFontPadding: false,
  },
  claimStrike: {
    position: 'absolute', left: -2, top: 12.75, width: 100, height: 2.5, borderRadius: 1.25,
    backgroundColor: INK, transform: [{ rotate: '16.26deg' }],
  },

  col: {
    position: 'absolute', top: COL_Y, width: COL_W, height: COL_H,
    borderWidth: 1.5, borderColor: SOFT, borderRadius: 3, backgroundColor: STONE, boxShadow: LIP,
  },
  colCap: {
    position: 'absolute', top: COL_Y + 8, width: COL_W, textAlign: 'center', lineHeight: 10,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.6, color: INK, includeFontPadding: false,
  },

  hit: { position: 'absolute', top: COL_Y, width: COL_W, height: COL_H },
  hitBox: { width: COL_W, height: COL_H, borderRadius: 3 },
  right: { borderWidth: 3, borderColor: INK },
  wrong: { borderWidth: 1.5, borderColor: SOFT, borderStyle: 'dashed', opacity: 0.5 },
});

export function Ethics22Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Ethics22Scene} band={[208, 512]} camera={CAM} />;
}
