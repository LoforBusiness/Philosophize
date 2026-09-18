import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { dirsFrom, clamp01, ease01, moveTr, travelStance, WALK, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './metaphysics30Script';
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
const TONE = stageTone('metaphysics');
const { RULE, STONE, SHADE } = TONE;
const LIP = lipOf(TONE);   // the ledge a toned plate stands on (scripts/skin-stage.mjs)

// ─────────────────────────────────────────────────────────────────────────────
// A CAVERN, THE PASSAGES CHARTED SO FAR, AND A WALL NOBODY HAS REACHED.
//
// THE COMPOSITION, IN NUMBERS (H56).
//
// · the CAVERN is a filled STONE slab 250×140 at x 120 (120…370), y 250…390. It
//   is the dark the map is drawn against, which is what lets a charted passage be
//   PAPER and still be visible (T2).
// · TEN PASSAGES, each a 30×5 PAPER bar, are scattered across it at fixed places
//   and arrive in order as `charted` climbs. They never move once drawn: an old
//   map is corrected by later ones, not thrown away.
// · the FAR WALL is a dashed 3-wide RULE column at x 364, running the cavern's
//   full height. It is dashed for the whole lesson because a dashed edge is a
//   BOUNDARY rather than a thing, and nobody has ever touched this one.
// · THREE PLATES of 90×34 at x 124 · 216 · 308 (124…398), top y 452, two lines.
// · the figure stands at x 24 and walks to 80; his widest span at the walked mark
//   is x ≈ 55…105, fifteen units clear of the cavern at 120.
//
// Ink runs y 236 (the caption) … y 500 (ground). BAND 232…512 = 280 — a 103-unit
// figure at 36.8%, inside H58's 38%.
// ─────────────────────────────────────────────────────────────────────────────

/** Crossfade for a beat that does NOT walk. 0.85 is the base `footfalls` assumes. */
const BASE_TR = 0.85;

const CAVE_X = 120;
const CAVE_Y = 250;
const CAVE_W = 250;
const CAVE_H = 140;

/** Where each charted passage lies, in cavern-relative units. */
const PASS = [
  [18, 22], [64, 40], [30, 74], [96, 18], [110, 62],
  [58, 104], [142, 36], [128, 88], [174, 66], [166, 112],
];
const PASS_W = 30;
const PASS_H = 5;

const WALL_X = 364;

const CAP_T = 236;

const PLATE_X = [124, 216, 308];
const PLATE_Y = 452;
const PLATE_W = 90;
const PLATE_H = 34;
const PLATE_CAP = ['IT UNDERMINES ITSELF', 'SCIENCE IS UNCERTAIN TOO', 'THE ANSWERS ARE IN'];
const PLATE_ID = ['self', 'science', 'answers'];
/** Only what science can test is meaningful is not a claim science can test. */
const SELF = 0;

const FIG_X = 24;

const X = BEATS.map((b) => b.x ?? FIG_X);
// WHICH WAY HE IS POINTING, read off the same x track he walks along.
const DIR = dirsFrom(X, 1);
const P = BEATS.map((b) => b.p ?? 0);
const CAVE = BEATS.map((b) => (b.cave ? 1 : 0));
const CHARTED = BEATS.map((b) => b.charted ?? 0);
const PLATES = BEATS.map((b) => (b.plates ? 1 : 0));
const LIVE = BEATS.map((b) => (b.live ? 1 : 0));
const WALL_BRACKET = BEATS.map((b) => (b.wallBracket ? 1 : 0));
const DEAD_ENDS = BEATS.map((b) => (b.deadEnds ? 1 : 0));
const WALL_QUERY = BEATS.map((b) => (b.wallQuery ? 1 : 0));
/** Two dead ends, clear of the ten charted passages and clear of the wall. */
const DEAD_END = [
  [200, 26],
  [210, 96],
];

// R7c — the stage follows the control on its own graded beat, and only there.
// Derived from the beat so it cannot fall out of step with the control.
const REACT = BEATS.map((b) => (b.interact?.plot ? 1 : 0));

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('metaphysics30'));

/** One charted passage. Ten of these is ten hooks, so each gets a component. */
function Passage({ S, k, left, top }: { S: { value: { charted: number } }; k: number; left: number; top: number }) {
  const st = useAnimatedStyle(() => ({ opacity: clamp01(S.value.charted * 10 - k) }));
  return <Animated.View style={[styles.pass, { left, top }, st]} pointerEvents="none" />;
}

export default function Metaphysics30Scene({ clock, bt, bi, i, picked, onPick, dragPos, gazeX, gazeY, gazeOn }: SceneApi) {
  const reacting = REACT[i] === 1;
  const heldFig = useHeld();
  const cv = useCarry(7);
  const cur = BEATS[i];
  const prev = i > 0 ? BEATS[i - 1] : undefined;
  const wallBracketFade = (cur.wallBracket ?? 0) !== (prev?.wallBracket ?? 0);
  const deadEndsFade = (cur.deadEnds ?? 0) !== (prev?.deadEnds ?? 0);
  const wallQueryFade = (cur.wallQuery ?? 0) !== (prev?.wallQuery ?? 0);
  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    // A WALKING BEAT TAKES AS LONG AS THE WALK NEEDS (rig.moveTr).
    const tr = ease01(bt.value / moveTr(X[p], X[n], BASE_TR));
    const t = clock.value;
    const grow = ease01(bt.value / 0.55);

    const figS = keepHeld(heldFig, travelStance(
      X[p], X[n],
      carryFrom(heldFig, n, emoteHold(P[p], t)), emoteHold(P[n], t), emoteLive(P[n], t, bt.value),
      tr, WALK,
    ));

    return {
      fig: lookPose(figS, carry(cv, 0, n, X[p], X[n], tr), GROUND, K_FIG, facing(DIR[p], DIR[n], bt.value), 1, gazeX.value, gazeY.value, gazeOn.value),
      t,
      cave: carry(cv, 1, n, CAVE[p], CAVE[n], tr),
      // HOW MUCH OF THE CAVE IS ON THE MAP, which is what the drawn curve reports.
      charted: carry(cv, 2, n, CHARTED[p], reacting ? dragPos.value : CHARTED[n], tr),
      plates: carry(cv, 3, n, PLATES[p], PLATES[n], tr),
      // A bracket marks the far wall: the same boundary questioned since antiquity.
      wallBracket: carry(cv, 4, n, WALL_BRACKET[p], WALL_BRACKET[n], wallBracketFade ? grow : 1),
      // Two dead ends appear in the cavern — the false starts each expedition records.
      deadEnds: carry(cv, 5, n, DEAD_ENDS[p], DEAD_ENDS[n], deadEndsFade ? grow : 1),
      // A "?" hovers at the wall: what every passage's own tools take for granted.
      wallQuery: carry(cv, 6, n, WALL_QUERY[p], WALL_QUERY[n], wallQueryFade ? grow : 1),
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const answered = picked !== null;
  const live = !!BEATS[i]?.interact && !BEATS[i]?.interact?.cards && LIVE[i] === 1;

  const caveStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.cave }));
  const platesStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.plates }));
  const wallBracketStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.wallBracket }));
  const deadEndsStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.deadEnds }));
  const wallQueryStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.wallQuery }));

  return (
    <View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      <Text style={styles.cap} pointerEvents="none">THE MAP OF WHAT COULD BE TRUE</Text>

      <Animated.View style={[StyleSheet.absoluteFill, caveStyle]} pointerEvents="none">
        <View style={styles.cave} />
        <View style={styles.wall} />
      </Animated.View>

      {PASS.map(([dx, dy], k) => (
        <Passage key={`${dx}-${dy}`} S={SCENE} k={k} left={CAVE_X + dx} top={CAVE_Y + dy} />
      ))}

      {/* group AH — two dead-end stubs: the false starts each expedition records. */}
      <Animated.View style={[StyleSheet.absoluteFill, deadEndsStyle]} pointerEvents="none">
        {DEAD_END.map(([dx, dy]) => (
          <View key={`${dx}-${dy}`} style={[styles.deadEnd, { left: CAVE_X + dx, top: CAVE_Y + dy }]}>
            <View style={styles.deadEndStub} />
            <View style={styles.deadEndCap} />
          </View>
        ))}
      </Animated.View>

      {/* group AH — a bracket on the far wall: the questions raised since antiquity. */}
      <Animated.View style={[styles.wallBracketTop, wallBracketStyle]} pointerEvents="none" />
      <Animated.View style={[styles.wallBracketBot, wallBracketStyle]} pointerEvents="none" />

      {/* group AH — a "?" at the wall: what physics itself takes for granted. */}
      <Animated.View style={[styles.wallQuery, wallQueryStyle]} pointerEvents="none">
        <Text style={styles.wallQueryText}>?</Text>
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, platesStyle]}>
        {PLATE_ID.map((id, k) => (
          <AnswerLift key={id} id={id} picked={picked} correct={k === SELF}>
            <View style={[styles.plate, { left: PLATE_X[k] }]} />
          </AnswerLift>
        ))}
        {PLATE_ID.map((id, k) => (
          <Target
            key={id}
            id={id}
            correct={k === SELF}
            picked={picked}
            onPick={onPick}
            disabled={!live || answered}
            style={[styles.hit, { left: PLATE_X[k] }]}
            radius={4}
          >
            <Text style={styles.plateText} numberOfLines={2} pointerEvents="none">{PLATE_CAP[k]}</Text>
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
  // ── the three tap events (group AH) ────────────────────────────────────────
  // Two end-caps bracketing the far wall, just outside the cave: the same
  // boundary questioned since antiquity, singled out from the whole cavern.
  wallBracketTop: { position: 'absolute', left: WALL_X - 5, top: CAVE_Y - 6, width: 13, height: 2, backgroundColor: INK },
  wallBracketBot: { position: 'absolute', left: WALL_X - 5, top: CAVE_Y + CAVE_H + 4, width: 13, height: 2, backgroundColor: INK },
  // A "?" at the wall: what a passage's own tools take for granted rather than examine.
  wallQuery: {
    position: 'absolute', left: WALL_X - 7, top: CAVE_Y + CAVE_H / 2 - 7, width: 14, height: 14,
    borderWidth: 1.5, borderColor: INK, borderRadius: 7, backgroundColor: PLATE_FACE, boxShadow: LIP,
    alignItems: 'center', justifyContent: 'center',
  },
  wallQueryText: { fontFamily: 'Inter_700Bold', fontSize: 8.6, color: INK, includeFontPadding: false },
  // A dead end: a short passage stub capped by a stop, where the corpus's own
  // charted passages run open.
  deadEnd: { position: 'absolute', width: PASS_W / 2, height: PASS_H + 6 },
  deadEndStub: { position: 'absolute', left: 0, top: 3, width: 10, height: PASS_H, backgroundColor: PAPER },
  deadEndCap: { position: 'absolute', left: 9, top: 0, width: 1.5, height: PASS_H + 6, backgroundColor: PAPER },
  ground: { position: 'absolute', left: 20, right: 14, top: GROUND, height: 1.5, backgroundColor: RULE },
  // THE FLOOR THE GROUND LINE SITS ON — a subject standing on a filled mass
  // rather than on bare page.
  floor: floorStyle(TONE, GROUND),

  cap: {
    position: 'absolute', left: CAVE_X, top: CAP_T, width: CAVE_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.4, color: SOFT, includeFontPadding: false,
  },

  cave: {
    position: 'absolute', left: CAVE_X, top: CAVE_Y, width: CAVE_W, height: CAVE_H,
    backgroundColor: STONE, boxShadow: LIP, borderWidth: 2, borderColor: INK,
  },
  // A DASHED EDGE IS A BOUNDARY, not a thing. Nobody has reached this one.
  wall: {
    position: 'absolute', left: WALL_X, top: CAVE_Y, width: 3, height: CAVE_H,
    borderLeftWidth: 3, borderStyle: 'dashed', borderColor: PAPER,
  },
  pass: { position: 'absolute', width: PASS_W, height: PASS_H, backgroundColor: PAPER },

  hit: { position: 'absolute', top: PLATE_Y, width: PLATE_W, height: PLATE_H },
  plate: {
    position: 'absolute', top: PLATE_Y, width: PLATE_W, height: PLATE_H,
    borderWidth: 2, borderColor: INK, borderRadius: 8, backgroundColor: PAPER,
  },
  plateText: {
    position: 'absolute', left: 0, top: 7, width: PLATE_W, textAlign: 'center', lineHeight: 10,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.4, color: INK, includeFontPadding: false,
  },
});

export function Metaphysics30Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Metaphysics30Scene} band={[232, 512]} camera={CAM} />;
}
