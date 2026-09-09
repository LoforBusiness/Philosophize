import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { dirsFrom, clamp01, ease01, moveTr, travelStance, WALK, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './aesthetics40Script';
import {
  facing, GROUND, K_FIG, STAGE_W, STAGE_H, INK, STONE, SOFT, RULE, PAPER, useHeld, carryFrom, keepHeld, useCarry, carry, lookPose,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// ─────────────────────────────────────────────────────────────────────────────
// FIVE COLUMNS OFF ONE FLOOR, AND A RULED LINE ONLY TWO OF THEM CLEAR.
//
// THE COMPOSITION, IN NUMBERS (H56).
//
// · FIVE PILLARS of 40 wide at x 146 · 196 · 246 · 296 · 346 (so 146…386), all
//   standing on one floor at y 430. SIGHT and SOUND are 132 tall (tops y 298);
//   TOUCH, SMELL and TASTE are 54 (tops y 376). They are drawn from one style, so
//   the only thing that differs between a sense that carries art and one that does
//   not is its height — which is exactly Hegel's claim and nothing more.
// · the LINE is dashed, x 140…392 at y 340, with its caption at x 296 (296…386),
//   y 326 — over the short pillars, where nothing else is drawn, so the rule can
//   never be laid across a word (S9). Dashed against solid pillars on purpose: the
//   columns are facts about the senses, the line is somebody's decision about them.
// · PILLAR LABELS of 40 wide sit under their own columns at y 436, in ink on paper.
// · the TASTE column is the one the drag moves. Its height runs 54 → 132 and its
//   top therefore runs y 376 → 298, so a reader who takes it all the way puts it
//   level with sight and hearing and clear of the line at 340.
// · THREE PLATES of 80×26 at x 132 · 222 · 312 (132…392), top y 462 — under the
//   pillar labels and above the ground, each carrying its own words (S11).
// · the figure stands at x 32 and walks to 92; his widest span at the walked mark
//   is x ≈ 67…117, fifteen units clear of the nearest plate at 132 and twenty-nine
//   clear of the first pillar at 146.
//
// Ink runs y 244 (the caption) … y 500 (ground). BAND 240…512 = 272 — a 103-unit
// figure at 37.9%, inside H58's 38%.
// ─────────────────────────────────────────────────────────────────────────────

/** Crossfade for a beat that does NOT walk. 0.85 is the base `footfalls` assumes. */
const BASE_TR = 0.85;

const FLOOR_Y = 430;
const PILL_X = [146, 196, 246, 296, 346];
const PILL_W = 40;
const PILL_N = 5;
const TALL_H = 132;
const SHORT_H = 54;
const PILL_H = [TALL_H, TALL_H, SHORT_H, SHORT_H, SHORT_H];
const PILL_CAP = ['SIGHT', 'SOUND', 'TOUCH', 'SMELL', 'TASTE'];
/** The column the reader raises. */
const TASTE = 4;

const LINE_X = 140;
const LINE_W = 252;
const LINE_Y = 340;

const LABEL_Y = 436;

const PLATE_X = [132, 222, 312];
const PLATE_Y = 462;
const PLATE_W = 80;
const PLATE_H = 26;
const PLATE_CAP = ['IT IS EATEN', 'IT IS WEAKER', 'IT IS PRIVATE'];
const PLATE_ID = ['eaten', 'weaker', 'private'];
/** Hegel's actual reason. The other two are the reasons people assume he gave. */
const EATEN = 0;

const CAP_T = 244;
const FIG_X = 32;

const X = BEATS.map((b) => b.x ?? FIG_X);
// WHICH WAY HE IS POINTING, read off the same x track he walks along.
const DIR = dirsFrom(X, 1);
const P = BEATS.map((b) => b.p ?? 0);
const PILLARS = BEATS.map((b) => b.pillars ?? 0);
const LINE = BEATS.map((b) => (b.line ? 1 : 0));
const RAISE = BEATS.map((b) => b.raise ?? 0);
const PLATES = BEATS.map((b) => (b.plates ? 1 : 0));
const LIVE = BEATS.map((b) => (b.live ? 1 : 0));

// R7c — the stage follows the control on its own graded beat, and only there.
// Derived from the beat so it cannot fall out of step with the control.
const REACT = BEATS.map((b) => (b.interact?.drag ? 1 : 0));

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('aesthetics40'));

export default function Aesthetics40Scene({ clock, bt, bi, i, picked, onPick, dragPos, gazeX, gazeY, gazeOn }: SceneApi) {
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
      pillars: carry(cv, 1, n, PILLARS[p], PILLARS[n], tr),
      lineOn: carry(cv, 2, n, LINE[p], LINE[n], tr),
      // R7c — the knob's own 0…1 IS how far the column comes up, so nothing has
      // to be mapped and the reader is moving the thing under discussion.
      raise: carry(cv, 3, n, RAISE[p], reacting ? dragPos.value : RAISE[n], tr),
      platesOn: carry(cv, 4, n, PLATES[p], PLATES[n], tr),
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const answered = picked !== null;
  const live = !!BEATS[i]?.interact && !BEATS[i]?.interact?.cards && LIVE[i] === 1;

  const lineStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.lineOn }));
  const platesStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.platesOn }));

  return (
    <View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      <Text style={styles.cap} pointerEvents="none">THE SENSES, RANKED</Text>

      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {PILL_X.map((px, k) => <Pillar key={px} S={SCENE} left={px} index={k} />)}
      </View>

      <Animated.View style={[StyleSheet.absoluteFill, lineStyle]} pointerEvents="none">
        <View style={styles.line} />
        <Text style={styles.lineCap}>WHERE ART BEGINS</Text>
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, platesStyle]}>
        {PLATE_ID.map((id, k) => (
          <Target
            key={id}
            id={id}
            correct={k === EATEN}
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

/** One sense, standing as high as the account lets it stand. */
function Pillar({ S, left, index }: { S: SharedValue<any>; left: number; index: number }) {
  const st = useAnimatedStyle(() => {
    const h = index === TASTE
      ? SHORT_H + (TALL_H - SHORT_H) * S.value.raise
      : PILL_H[index];
    return {
      opacity: clamp01(S.value.pillars * PILL_N - index),
      top: FLOOR_Y - h,
      height: h,
    };
  });
  return (
    <>
      <Animated.View style={[styles.pillar, { left }, st]} pointerEvents="none" />
      <Text style={[styles.pillarText, { left }]} pointerEvents="none">{PILL_CAP[index]}</Text>
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
    position: 'absolute', left: 146, top: CAP_T, width: 240,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.4, color: SOFT, includeFontPadding: false,
  },

  pillar: {
    position: 'absolute', width: PILL_W,
    borderWidth: 2, borderColor: INK, backgroundColor: STONE,
  },
  pillarText: {
    position: 'absolute', top: LABEL_Y, width: PILL_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.4, color: INK, includeFontPadding: false,
  },

  // DASHED, WHERE THE COLUMNS ARE SOLID. The heights are facts about the senses;
  // this is somebody's decision about them, and the drawing should say so.
  line: {
    position: 'absolute', left: LINE_X, top: LINE_Y, width: LINE_W, height: 0,
    borderTopWidth: 1.5, borderColor: SOFT, borderStyle: 'dashed',
  },
  lineCap: {
    position: 'absolute', left: 296, top: LINE_Y - 14, width: 90, textAlign: 'right',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.6, color: INK, includeFontPadding: false,
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

export function Aesthetics40Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Aesthetics40Scene} band={[240, 512]} camera={CAM} />;
}
