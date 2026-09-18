import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { dirsFrom, clamp01, ease01, moveTr, pose, travelStance, WALK, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './political21Script';
import { facing, GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, PAPER, useHeld, carryFrom, keepHeld, useCarry, carry, lookPose,
} from './cinematicKit';
import { stageTone } from './stageTones';
import { floorStyle, lipOf, PLATE_FACE } from './stageSkin';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// THE STAGE IS STRUCK IN THIS LESSON'S OWN BRANCH HUE (./stageTones).
// Same three tones, same luminance to the third decimal — so every contrast
// measured against the old greys still holds and nothing on the stage moved.
const TONE = stageTone('political-philosophy');
const { RULE, STONE, SHADE } = TONE;
const LIP = lipOf(TONE);   // the ledge a toned plate stands on (scripts/skin-stage.mjs)

// ─────────────────────────────────────────────────────────────────────────────
// FIFTEEN SQUARES, FOURTEEN OF THEM SOMEBODY'S.
//
// THE COMPOSITION, IN NUMBERS (H56).
//
// · the MAP is 5 × 3 cells, each 66×30 with a 2 gap, from x 32 and y 250 — so the
//   block runs x 32…370 and y 250…344 and sits 30 in from either edge.
// · CLAIMED CELLS carry a 1.5-thick border and a two-letter mark at their centre.
//   The one unclaimed cell (row 2, column 4 — bottom right) is drawn with a
//   DASHED border and reads OPEN SEA. It is not empty and it is not dimmed: it
//   is a real place, and the argument depends on that.
// · the EXIT ARROW starts in the cell at row 1 column 1 and hops right along the
//   row on `exit`, four hops of 68, so the reader watches it arrive inside
//   somebody else's border four times.
// · the CAPTION EVERY SQUARE IS SOMEBODY'S sits at y 234, and it is the only
//   sentence on the stage.
// · the FIGURE walks x 200 → 132 → 268 on GROUND 500; crown ≈ 397, and the map
//   ends at y 344, so 53 units stay clear at every stop.
//
// Ink runs y 234 (the caption) … y 500. BAND 228…512 = 284, with the 103-unit
// figure at 36%.
// ─────────────────────────────────────────────────────────────────────────────

/** Crossfade for a beat that does NOT walk. 0.85 is the base `footfalls` assumes. */
const EITHER = BEATS.map((b) => b.either ?? 0);
const NO_HOME = BEATS.map((b) => b.noHome ?? 0);
const NO_REVOLT = BEATS.map((b) => b.noRevolt ?? 0);
const EARNED = BEATS.map((b) => b.earned ?? 0);
const BASE_TR = 0.85;

const COLS = 5;
const ROWS = 3;
const CELL_W = 66;
const CELL_H = 30;
const GAP = 2;
const MAP_X = 32;
const MAP_Y = 250;

/** Two-letter marks. The last cell is the one nobody has. */
const MARKS = [
  'AR', 'BE', 'CA', 'DA', 'EL',
  'FI', 'GA', 'HO', 'IS', 'JU',
  'KE', 'LA', 'MO', 'NO', '~~',
];
const SEA = 14;

/** Which four cells the reader may tap. Three ordinary, and the sea. */
const PICKABLE = [6, 9, 12, SEA];

const FIG_X = 200;

const X = BEATS.map((b) => b.x ?? FIG_X);
// WHICH WAY HE IS POINTING, read off the same x track he walks along:
// +1 where it rises, -1 where it falls, and HOLD while he stands still, so a
// figure who walks left to something keeps facing it while he talks about it.
const DIR = dirsFrom(X, 1);
const P = BEATS.map((b) => b.p ?? 0);
const MAP = BEATS.map((b) => b.map ?? 0);
const CLAIMED = BEATS.map((b) => b.claimed ?? 0);
const EXIT = BEATS.map((b) => b.exit ?? 0);
const LIVE = BEATS.map((b) => b.live ?? 0);

// R7b — the stage follows the control on its own graded beat, and only there.
// Derived from the beat rather than declared as a channel so it cannot fall out
// of step with the control it is about.
const REACT = BEATS.map((b) => (b.interact?.sort ? 1 : 0));

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('political21'));

const cellX = (i: number) => MAP_X + (i % COLS) * (CELL_W + GAP);
const cellY = (i: number) => MAP_Y + Math.floor(i / COLS) * (CELL_H + GAP);

export default function Political21Scene({ clock, bt, bi, i, picked, onPick, pickPos, gazeX, gazeY, gazeOn }: SceneApi) {
  const reacting = REACT[i] === 1;
  const heldFig = useHeld();
  const cv = useCarry(8);
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
      map: carry(cv, 1, n, MAP[p], MAP[n], tr),
      claimed: carry(cv, 2, n, CLAIMED[p], CLAIMED[n], tr),
      // R7c — the leaving arrow IS the lever's top stop. Nothing to take at 'knowing
      // the law exists', a real way out at 'a refusal you could actually take'.
      exit: carry(cv, 3, n, EXIT[p], reacting ? pickPos.value : EXIT[n], tr),
      // The four tap events, carried, so each fades out as well as in (group L).
      either: carry(cv, 4, n, EITHER[p], EITHER[n], tr),
      noHome: carry(cv, 5, n, NO_HOME[p], NO_HOME[n], tr),
      noRevolt: carry(cv, 6, n, NO_REVOLT[p], NO_REVOLT[n], tr),
      earned: carry(cv, 7, n, EARNED[p], EARNED[n], tr),
      t,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const answered = picked !== null;
  const live = !!BEATS[i]?.interact && !BEATS[i]?.interact?.cards && LIVE[i] === 1;

  const mapStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.map }));
  const claimStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.claimed }));
  // Four hops along the middle row, one per quarter of the track, so it lands
  // inside a border each time rather than sliding continuously past them.
  const exitStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.exit,
    transform: [{ translateX: Math.floor(clamp01(SCENE.value.exit) * 4) * (CELL_W + GAP) }],
  }));

  const cells = MARKS.map((_, k) => k);

  // ── the four tap events ────────────────────────────────────────────────────
  //
  // EVERY ONE OF THESE SITS BELOW THE MAP, and that is the composition rather than
  // a preference: each cell carries a word, and nothing may be painted over a word
  // (D31), so a stamp across the grid is not available however well it would read.
  const eitherStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.either,
    transform: [{ rotate: '-3deg' }, { scale: 1.1 - 0.1 * SCENE.value.either }],
  }));
  const noHomeStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.noHome,
    transform: [{ translateY: (1 - SCENE.value.noHome) * -6 }],
  }));
  const noRevoltStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.noRevolt,
    transform: [{ translateY: (1 - SCENE.value.noRevolt) * 8 }],
  }));
  const earnedStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.earned,
    transform: [{ translateY: (1 - SCENE.value.earned) * 8 }],
  }));

  return (
    <View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      <Text style={styles.cap} pointerEvents="none">EVERY SQUARE IS SOMEBODY&apos;S</Text>

      <Animated.View style={[StyleSheet.absoluteFill, mapStyle]} pointerEvents="none">
        {cells.map((k) => (
          <View
            key={k}
            style={[
              styles.cell,
              { left: cellX(k), top: cellY(k) },
              k === SEA && styles.sea,
            ]}
          />
        ))}
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, claimStyle]} pointerEvents="none">
        {cells.map((k) => (
          <Text
            key={`m${k}`}
            style={[styles.mark, { left: cellX(k), top: cellY(k) + 10 }, k === SEA && styles.seaMark]}
          >
            {k === SEA ? 'OPEN SEA' : MARKS[k]}
          </Text>
        ))}
      </Animated.View>

      <Animated.View style={[styles.exit, { left: cellX(5) + 24, top: cellY(5) + 8 }, exitStyle]} pointerEvents="none" />

      {PICKABLE.map((k) => (
        <Target
          key={`t${k}`}
          id={k === SEA ? 'sea' : `land${k}`}
          correct={k === SEA}
          picked={picked}
          onPick={onPick}
          disabled={!live || answered}
          style={[styles.hit, { left: cellX(k), top: cellY(k) }]}
        >
          <View
            style={[
              styles.hitBox,
              answered && k === SEA && styles.right,
              answered && picked === `land${k}` && k !== SEA && styles.wrong,
            ]}
            pointerEvents="none"
          />
        </Target>
      ))}

      {/* Leaving one square only puts you in another one. */}
      <Animated.View style={[styles.eitherStamp, eitherStyle]} pointerEvents="none">
        <Text style={styles.eitherText} numberOfLines={1}>SOMEBODY&apos;S EITHER WAY</Text>
      </Animated.View>

      {/* The sea is unclaimed and uninhabitable, which is not an exit. */}
      <Animated.View style={[styles.noHomeTag, noHomeStyle]} pointerEvents="none">
        <Text style={styles.noHomeText} numberOfLines={1}>NO HOME HERE</Text>
      </Animated.View>

      {/* The conclusion is limited. */}
      <Animated.View style={[styles.limitPlate, noRevoltStyle]} pointerEvents="none">
        <Text style={styles.limitText} numberOfLines={1}>NO CALL TO REVOLT</Text>
      </Animated.View>

      {/* Claimed is not earned. */}
      <Animated.View style={[styles.earnedPlate, earnedStyle]} pointerEvents="none">
        <Text style={styles.earnedText} numberOfLines={1}>CLAIMED, NOT EARNED</Text>
      </Animated.View>

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DF} k={K_FIG} />
    </View>
  );
}

const styles = StyleSheet.create({
  // ── the four tap events (group AH) ─────────────────────────────────────────
  // MAP_BOT is the grid's own foot: MAP_Y plus three rows and their gaps.
  eitherStamp: {
    position: 'absolute', left: 110, top: MAP_Y + ROWS * (CELL_H + GAP) + 8, width: 190, height: 26,
    borderWidth: 2, borderColor: INK, borderRadius: 6, backgroundColor: PLATE_FACE,
    boxShadow: LIP, alignItems: 'center', justifyContent: 'center',
  },
  eitherText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.9, color: INK,
    includeFontPadding: false,
  },
  // Under the sea cell's own column, which is the last column of the last row.
  noHomeTag: {
    position: 'absolute', left: MAP_X + (COLS - 1) * (CELL_W + GAP) - 22,
    top: MAP_Y + ROWS * (CELL_H + GAP) + 38, width: 92, height: 22,
    borderWidth: 1.5, borderColor: SOFT, borderStyle: 'dashed', borderRadius: 6,
    alignItems: 'center', justifyContent: 'center',
  },
  noHomeText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.8, color: INK,
    includeFontPadding: false,
  },
  // Left of the figure's own column on the beats these land on.
  limitPlate: {
    position: 'absolute', left: 40, top: MAP_Y + ROWS * (CELL_H + GAP) + 34, width: 170, height: 26,
    borderWidth: 2, borderColor: INK, borderRadius: 8, backgroundColor: PLATE_FACE,
    boxShadow: LIP, alignItems: 'center', justifyContent: 'center',
  },
  limitText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.8, color: INK,
    includeFontPadding: false,
  },
  earnedPlate: {
    position: 'absolute', left: 40, top: MAP_Y + ROWS * (CELL_H + GAP) + 66, width: 170, height: 26,
    borderWidth: 2, borderColor: INK, borderRadius: 8, backgroundColor: INK,
    alignItems: 'center', justifyContent: 'center',
  },
  earnedText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.8, color: PAPER,
    includeFontPadding: false,
  },

  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 20, right: 14, top: GROUND, height: 1.5, backgroundColor: RULE },
  // THE FLOOR THE GROUND LINE SITS ON. A rule on its own leaves the
  // figure and everything it is looking at standing on bare page;
  // political7 and political8 both stand their subject on a filled mass.
  floor: floorStyle(TONE, GROUND),

  cap: {
    position: 'absolute', left: MAP_X, top: 234, width: 260,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.3, color: SOFT, includeFontPadding: false,
  },

  cell: {
    position: 'absolute', width: CELL_W, height: CELL_H,
    borderWidth: 1.5, borderColor: INK, borderRadius: 8, backgroundColor: STONE, boxShadow: LIP,
  },
  sea: { borderStyle: 'dashed', borderColor: SOFT },
  mark: {
    position: 'absolute', width: CELL_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 1.2, color: INK, includeFontPadding: false,
  },
  seaMark: { fontSize: 8.6, letterSpacing: 0.8, color: SOFT },

  exit: {
    position: 'absolute', width: 14, height: 14, borderRadius: 7,
    borderWidth: 2.5, borderColor: INK,
  },

  hit: { position: 'absolute', width: CELL_W, height: CELL_H },
  hitBox: { width: CELL_W, height: CELL_H, borderRadius: 2 },
  right: { borderWidth: 3, borderColor: INK },
  wrong: { borderWidth: 1.5, borderColor: SOFT, borderStyle: 'dashed' },
});

export function Political21Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Political21Scene} band={[228, 512]} camera={CAM} />;
}
