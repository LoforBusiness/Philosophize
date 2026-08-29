import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { dirsFrom, clamp01, ease01, moveTr, pose, travelStance, WALK, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './ethics24Script';
import {
  facing, GROUND, K_FIG, STAGE_W, STAGE_H, INK, STONE, SOFT, RULE, PAPER,
  useHeld, carryFrom, keepHeld, useCarry, carry,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target, { AnswerLift } from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// ─────────────────────────────────────────────────────────────────────────────
// A SLAB ON FOUR LEGS, AND THREE OF THEM TAKEN AWAY.
//
// THE COMPOSITION, IN NUMBERS (H56).
//
// · the SENTENCE is a 300×34 slab at x 50…350, y 250…284, 2.5 thick — the
//   heaviest line on the stage, because it is the thing everything else is
//   holding up.
// · FOUR PILLARS, 46 wide, from y 284 down to y 350, at lefts 62 · 142 · 222 ·
//   302 — the run ends at x 348, two inside the slab at either end so it visibly
//   rests ON them rather than beside them.
// · the NAMES sit under each pillar at y 354…368: STOP HIM · DETER OTHERS ·
//   REFORM HIM · DESERVED.
// · the TEST CASE shortens pillars 0, 1 and 2 to nothing over `gone` and tilts
//   the slab 3° about its right end, which is the one still supported. It is a
//   tilt and not a fall: the sentence is still standing, and noticing that it
//   still feels right is the entire lesson.
// · the FIGURE walks x 200 → 132 → 268 on GROUND 500; crown ≈ 397, and the names
//   end at y 368, so 29 units stay clear at every stop.
//
// Ink runs y 220 (the caption) … y 500. BAND 220…512 = 292, with the 103-unit
// figure at 35%.
// ─────────────────────────────────────────────────────────────────────────────

/** Crossfade for a beat that does NOT walk. 0.85 is the base `footfalls` assumes. */
const BASE_TR = 0.85;

const SLAB_X = 50;
// TEN LOWER THAN THE CAPTION NEEDS, because the slab TILTS. Rotating a 300-wide
// slab three degrees about its supported end lifts the free end by 300 sin 3 =
// 15.7 units, so at 240 its raised corner reached y 224 and the caption above it
// sat inside the slab's own rect — measured in the browser as a 294x48 stone box
// starting one pixel above WHAT IS IT FOR?. Everything below derives from this,
// so the pillars and their names move with it.
const SLAB_Y = 250;
const SLAB_W = 300;
const SLAB_H = 34;

const PIL_TOP = SLAB_Y + SLAB_H;
const PIL_H = 66;
const PIL_W = 46;
const PIL_X = [62, 142, 222, 302];
const PIL_ID = ['protect', 'deter', 'reform', 'desert'];
const PIL_CAP = ['STOP HIM', 'DETER OTHERS', 'REFORM HIM', 'DESERVED'];
/** Which pillars the test case removes. */
const REMOVED = [1, 1, 1, 0];

const FIG_X = 200;

const X = BEATS.map((b) => b.x ?? FIG_X);
// WHICH WAY HE IS POINTING, read off the same x track he walks along:
// +1 where it rises, -1 where it falls, and HOLD while he stands still, so a
// figure who walks left to something keeps facing it while he talks about it.
const DIR = dirsFrom(X, 1);
const P = BEATS.map((b) => b.p ?? 0);
const SLAB = BEATS.map((b) => b.slab ?? 0);
const NAMES = BEATS.map((b) => b.names ?? 0);
const GONE = BEATS.map((b) => b.gone ?? 0);
const LIVE = BEATS.map((b) => b.live ?? 0);

// R7b — the stage follows the control on its own graded beat, and only there.
// Derived from the beat rather than declared as a channel so it cannot fall out
// of step with the control it is about.
const REACT = BEATS.map((b) => (b.interact?.lever ? 1 : 0));

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('ethics24'));

export default function Ethics24Scene({ clock, bt, bi, i, picked, onPick, dragPos }: SceneApi) {
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
      fig: pose(figS, carry(cv, 0, n, X[p], X[n], tr), GROUND, K_FIG, facing(DIR[p], DIR[n], bt.value), 1),
      slab: carry(cv, 1, n, SLAB[p], SLAB[n], tr),
      names: carry(cv, 2, n, NAMES[p], NAMES[n], tr),
      // R7b — the arm takes the pillars away. Each setting is a different account of
      // what punishment is for, and the test case knocks out whichever pillars that
      // account cannot hold up, so the reader watches the cost of each answer.
      gone: carry(cv, 3, n, GONE[p], reacting ? dragPos.value : GONE[n], tr),
      t,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const answered = picked !== null;
  const live = !!BEATS[i]?.interact && !BEATS[i]?.interact?.cards && LIVE[i] === 1;

  const slabStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.slab,
    // About the RIGHT end — the one still supported — so the tilt reads as the
    // slab settling onto the last pillar rather than sliding off it.
    transform: [
      { translateX: SLAB_W / 2 },
      { rotate: `${SCENE.value.gone * 3}deg` },
      { translateX: -SLAB_W / 2 },
    ],
  }));
  const nameStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.names }));

  return (
    <View style={styles.scene}>
      <Text style={styles.cap} pointerEvents="none">WHAT IS IT FOR?</Text>

      <Animated.View style={[styles.slab, slabStyle]} pointerEvents="none">
        <Text style={styles.slabText}>FOUR YEARS</Text>
      </Animated.View>

      {/* EACH PILLAR RIDES WITH ITS OWN TARGET (E39), and so does what is left
          of it — a fallen reason is a heap, not a gap (S11). */}
      {PIL_X.map((px, k) => (
        <AnswerLift key={PIL_ID[k]} id={PIL_ID[k]} picked={picked} correct={PIL_ID[k] === 'desert'}>
          <Pillar S={SCENE} index={k} />
          <Rubble S={SCENE} index={k} />
        </AnswerLift>
      ))}

      <Animated.View style={[StyleSheet.absoluteFill, nameStyle]} pointerEvents="none">
        {PIL_X.map((px, k) => (
          <Text key={`n${k}`} style={[styles.pilCap, { left: px - 12 }]} numberOfLines={2}>
            {PIL_CAP[k]}
          </Text>
        ))}
      </Animated.View>

      {PIL_X.map((px, k) => (
        <Target
          key={`t${PIL_ID[k]}`}
          id={PIL_ID[k]}
          correct={PIL_ID[k] === 'desert'}
          picked={picked}
          onPick={onPick}
          disabled={!live || answered}
          style={[styles.hit, { left: px - 8 }]}
        >
          <View
            style={[
              styles.hitBox,
              answered && PIL_ID[k] === 'desert' && styles.right,
              answered && picked === PIL_ID[k] && PIL_ID[k] !== 'desert' && styles.wrong,
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

/** One reason. The three the test case removes shrink to nothing from the top. */
function Pillar({ S, index }: { S: { value: { slab: number; gone: number } }; index: number }) {
  const left = PIL_X[index];
  const st = useAnimatedStyle(() => {
    const g = REMOVED[index] ? S.value.gone : 0;
    return {
      opacity: S.value.slab * (1 - g * 0.82),
      height: PIL_H * (1 - g),
      top: PIL_TOP + PIL_H * g,
    };
  });
  return <Animated.View pointerEvents="none" style={[styles.pillar, { left }, st]} />;
}

// WHAT A KNOCKED-OUT REASON LEAVES BEHIND (S11).
//
// The three removed pillars used to shrink to nothing and fade to 0.18, so at the
// question the reader was offered four identical outlines of which three held bare
// paper and one held a pillar. "Tap the pillar still holding the slab up" with
// three empty boxes in the row is the blank-box complaint exactly.
//
// A fallen pillar is not an ABSENT pillar, it is a heap — which is also §13's rule
// about the picture being the thing it names, the one the cheese was rebuilt for.
// Three chunks of the same STONE the slab is cut from, low enough that the one
// still standing is never in doubt.
const RUBBLE = [
  { dx: -2, w: 20, h: 11 },
  { dx: 17, w: 15, h: 8 },
  { dx: 31, w: 17, h: 13 },
];
function Rubble({ S, index }: { S: { value: { slab: number; gone: number } }; index: number }) {
  const left = PIL_X[index];
  const st = useAnimatedStyle(() => ({ opacity: S.value.slab * (REMOVED[index] ? S.value.gone : 0) }));
  return (
    <Animated.View pointerEvents="none" style={st}>
      {RUBBLE.map((r, k) => (
        <View
          key={k}
          style={[styles.rubble, {
            left: left + r.dx, width: r.w, height: r.h, top: PIL_TOP + PIL_H - r.h,
          }]}
        />
      ))}
    </Animated.View>
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
    position: 'absolute', left: SLAB_X, top: 220, width: 200,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.4, color: SOFT, includeFontPadding: false,
  },

  slab: {
    position: 'absolute', left: SLAB_X, top: SLAB_Y, width: SLAB_W, height: SLAB_H,
    borderWidth: 2.5, borderColor: INK, borderRadius: 3, backgroundColor: STONE,
    alignItems: 'center', justifyContent: 'center',
  },
  slabText: {
    fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 2, color: INK, includeFontPadding: false,
  },

  pillar: {
    position: 'absolute', width: PIL_W,
    borderWidth: 2, borderColor: INK, borderRadius: 2, backgroundColor: PAPER,
  },
  rubble: {
    position: 'absolute',
    borderWidth: 2, borderColor: INK, borderRadius: 1.5, backgroundColor: STONE,
  },
  pilCap: {
    // DERIVED, like the pillars it labels. This was a hardcoded 344 while PIL_TOP
    // reads SLAB_Y + SLAB_H, so lowering the slab left the names inside the legs.
    position: 'absolute', top: PIL_TOP + PIL_H + 4, width: PIL_W + 24, textAlign: 'center', lineHeight: 10,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.1, color: SOFT, includeFontPadding: false,
  },

  hit: { position: 'absolute', top: PIL_TOP, width: PIL_W + 16, height: PIL_H + 20 },
  hitBox: { width: PIL_W + 16, height: PIL_H + 20, borderRadius: 4 },
  right: { borderWidth: 3, borderColor: INK },
  wrong: { borderWidth: 1.5, borderColor: SOFT, borderStyle: 'dashed', opacity: 0.5 },
});

export function Ethics24Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Ethics24Scene} band={[220, 512]} camera={CAM} />;
}
