import {
  View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { dirsFrom, clamp01, ease01, lerp, moveTr, pose, travelStance, WALK, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './metaphysics37Script';
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
const TONE = stageTone('metaphysics');
const { RULE, STONE, SHADE } = TONE;
const LIP = lipOf(TONE);   // the ledge a toned plate stands on (scripts/skin-stage.mjs)

// ─────────────────────────────────────────────────────────────────────────────
// ONE GLASS THAT NEVER MOVES, AND EVERYTHING ELSE THAT DOES.
//
// THE COMPOSITION, IN NUMBERS (H56).
//
// · the SHELF is a 3-thick rule from x 128 to x 384 at y 396, with two brackets
//   dropping 12 below it at x 148 and x 360.
// · the GLASS stands on it at x 240…282, y 340…396: a bowl (42 wide, 34 tall,
//   rounded at the bottom), a 4-wide stem and a 26-wide foot. It is drawn ONCE
//   and never animated — no wobble, no shatter, no scale. Everything the lesson
//   claims depends on it doing nothing.
// · the HAMMER hangs above at x 258, pivoting about (258, 250): a 3-thick shaft
//   58 long with a 22×14 head. It swings from −64° to −6°, so at full swing the
//   head sits at the rim of the bowl and never inside it.
// · the WARD is a 60-radius ring centred on the glass's bowl, drawn only when the
//   blow is stopped — an outline, no fill, so the glass stays visible through it.
// · the four LABELS are 150×24 boxes at x 128, stacked y 258, 286, 314, 342 —
//   they occupy the air the hammer uses, so they and the hammer never share a
//   beat, which the script enforces.
// · the figure stands at x 56 and walks to 128; crown ~397, level with the shelf
//   and clear of it to the left.
//
// Ink runs y 250 (the hammer pivot) … y 500 (ground). BAND 232…512 = 280 (H59),
// and the 103-unit figure is 37% of it (H58).
// ─────────────────────────────────────────────────────────────────────────────

/** Crossfade for a beat that does NOT walk. 0.85 is the base `footfalls` assumes. */
const BASE_TR = 0.85;

const SHELF_Y = 396;
const GLASS_X = 240;

const PIVOT_X = 258;
const PIVOT_Y = 250;
const SWING_FROM = -64;
const SWING_TO = -6;

const LABEL_X = 128;
const LABEL_Y = [258, 286, 314, 342];
const LABEL_TEXT = ['WHAT IT DID', 'WHAT IT IS MADE OF', 'WHAT IT WOULD DO', 'WHAT WE EXPECT'];
const LABEL_ID = ['did', 'made', 'would', 'expect'];

// THE QUESTION (group AH) — a bubble over the glass, clear of the cap above and
// the bowl below; it is gone before the labels or the hammer ever appear.
const WONDER_X = 246;
const WONDER_Y = 294;
const WONDER_D = 30;

// THE CONTACT (group AH) — a small mark right at the bowl's rim, where the
// hammer's head comes down.
const TOUCH_X = 255;
const TOUCH_Y = 335;
const TOUCH_D = 6;

// THE REJECTED ANALYSIS (group AH) — clear of the ward ring (its right edge sits
// at 321) and of the hammer (247…269), in the open air above the shelf's right
// half.
const FAIL_X = 326;
const FAIL_Y = 346;
const FAIL_W = 56;
const FAIL_H = 34;

const CAP_T = 236;
const FIG_X = 56;

const X = BEATS.map((b) => b.x ?? FIG_X);
// WHICH WAY HE IS POINTING, read off the same x track he walks along:
// +1 where it rises, -1 where it falls, and HOLD while he stands still, so a
// figure who walks left to something keeps facing it while he talks about it.
const DIR = dirsFrom(X, 1);
const P = BEATS.map((b) => b.p ?? 0);
const SHELF = BEATS.map((b) => (b.shelf ? 1 : 0));
const HAMMER = BEATS.map((b) => (b.hammer ? 1 : 0));
const SWING = BEATS.map((b) => b.swing ?? 0);
const WARD = BEATS.map((b) => (b.ward ? 1 : 0));
const LABELS = BEATS.map((b) => (b.labels ? 1 : 0));
const LIVE_D = BEATS.map((b) => (b.live_d ? 1 : 0));
const LIVE = BEATS.map((b) => (b.live ? 1 : 0));
const WONDER = BEATS.map((b) => (b.wonder ? 1 : 0));
const TOUCH = BEATS.map((b) => (b.touch ? 1 : 0));
const FAILS = BEATS.map((b) => (b.fails ? 1 : 0));

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('metaphysics37'));

export default function Metaphysics37Scene({ clock, bt, bi, i, picked, onPick, dragPos, gazeX, gazeY, gazeOn }: SceneApi) {
  const heldFig = useHeld();
  const cv = useCarry(10);
  const cur = BEATS[i];
  const prev = i > 0 ? BEATS[i - 1] : undefined;
  // Each of the three marks fades in on the beat that introduces it and back out
  // once the scene has moved past it (C20c).
  const wonderFade = (cur.wonder ?? 0) !== (prev?.wonder ?? 0);
  const touchFade = (cur.touch ?? 0) !== (prev?.touch ?? 0);
  const failsFade = (cur.fails ?? 0) !== (prev?.fails ?? 0);
  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    // A WALKING BEAT TAKES AS LONG AS THE WALK NEEDS (rig.moveTr). A fixed length
    // here sprinted every long journey and left the footfalls — which the player
    // computes from moveTr — arriving after the figure had stopped.
    const tr = ease01(bt.value / moveTr(X[p], X[n], BASE_TR));
    const t = clock.value;
    const grow = ease01(bt.value / 0.55);

    const figS = keepHeld(heldFig, travelStance(
      X[p], X[n],
      carryFrom(heldFig, n, emoteHold(P[p], t)), emoteHold(P[n], t), emoteLive(P[n], t, bt.value),
      tr, WALK,
    ));

    // The hammer swings on the beat that raises it and HOLDS at the bottom after,
    // so it never re-swings behind the reader; the ward is the same.
    const swinging = SWING[n] > 0 && SWING[p] === 0;
    return {
      fig: lookPose(figS, carry(cv, 0, n, X[p], X[n], tr), GROUND, K_FIG, facing(DIR[p], DIR[n], bt.value), 1, gazeX.value, gazeY.value, gazeOn.value),
      t,
      shelfOn: carry(cv, 1, n, SHELF[p], SHELF[n], tr),
      hammerOn: carry(cv, 2, n, HAMMER[p], HAMMER[n], tr),
      // Through the carry on the swinging beat too, so the hold after it starts from
      // the glass and not from the top of the swing (C20c).
      swing: carry(cv, 3, n, SWING[p], SWING[n], swinging ? ease01((bt.value - 0.3) / 0.9) : tr),
      wardOn: carry(cv, 4, n, WARD[p], WARD[n], tr),
      labelsOn: carry(cv, 5, n, LABELS[p], LABELS[n], tr),
      // The rail reads the reader's thumb only on its own beat.
      grip: LIVE_D[n] === 1 ? clamp01(dragPos.value) : 0,
      gripOn: carry(cv, 6, n, LIVE_D[p], LIVE_D[n], tr),
      // THE QUESTION, THE CONTACT AND THE REJECTED ANALYSIS (group AH) — each a
      // one-beat mark, on and gone.
      wonderOn: carry(cv, 7, n, WONDER[p], WONDER[n], wonderFade ? grow : 1),
      touchOn: carry(cv, 8, n, TOUCH[p], TOUCH[n], touchFade ? grow : 1),
      failsOn: carry(cv, 9, n, FAILS[p], FAILS[n], failsFade ? grow : 1),
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const answered = picked !== null;
  const live = !!BEATS[i]?.interact && !BEATS[i]?.interact?.drag && LIVE[i] === 1;

  const shelfStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.shelfOn }));
  const hammerStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.hammerOn,
    transform: [{ rotate: `${SWING_FROM + (SWING_TO - SWING_FROM) * SCENE.value.swing}deg` }],
  }));
  const wardStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.wardOn }));
  const labelsStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.labelsOn }));
  // The reader's answer drawn ON the glass: a ring that tightens as they claim it
  // is more fragile. Nothing about the glass itself changes — only the mark.
  const gripStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.gripOn * SCENE.value.grip,
    transform: [{ scale: 1.25 - 0.25 * SCENE.value.grip }],
  }));
  const wonderStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.wonderOn }));
  const touchStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.touchOn }));
  const failsStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.failsOn }));

  return (
    <View style={styles.scene}>
      <Text style={styles.cap}>NINETY YEARS, UNTOUCHED</Text>

      <Animated.View style={[StyleSheet.absoluteFill, hammerStyle]} pointerEvents="none">
        <View style={styles.shaft} />
        <View style={styles.head} />
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, shelfStyle]} pointerEvents="none">
        <View style={styles.shelf} />
        <View style={[styles.bracket, { left: 148 }]} />
        <View style={[styles.bracket, { left: 360 }]} />
        <View style={styles.bowl} />
        <View style={styles.stem} />
        <View style={styles.foot} />
      </Animated.View>

      <Animated.View style={[styles.ward, wardStyle]} pointerEvents="none" />
      <Animated.View style={[styles.grip, gripStyle]} pointerEvents="none" />

      {/* THE QUESTION (group AH) — what the claim about the glass is even about. */}
      <Animated.View style={[styles.wonder, wonderStyle]} pointerEvents="none">
        <Text style={styles.wonderText}>?</Text>
      </Animated.View>

      {/* THE CONTACT (group AH) — the hammer's head, right at the glass. */}
      <Animated.View style={[styles.touch, touchStyle]} pointerEvents="none" />

      {/* THE REJECTED ANALYSIS (group AH) — struck through, once it has failed. */}
      <Animated.View style={[styles.failTag, failsStyle]} pointerEvents="none">
        <Text style={styles.failText}>STRUCK{'\n'}BREAKS</Text>
        <View style={styles.failStrike} />
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, labelsStyle]}>
        {LABEL_Y.map((ly, k) => (
          <Target
            key={ly}
            id={LABEL_ID[k]}
            correct={k === 2}
            picked={picked}
            onPick={onPick}
            disabled={!live || answered}
            style={[styles.label, { top: ly }]}
          >
            <View
              style={[styles.labelBox, answered && picked === LABEL_ID[k] && k !== 2 && styles.labelWrong]}
              pointerEvents="none"
            />
            <Text style={styles.labelText}>{LABEL_TEXT[k]}</Text>
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

  cap: {
    position: 'absolute', left: 128, top: CAP_T, width: 256,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.5, color: SOFT, includeFontPadding: false,
  },

  shelf: { position: 'absolute', left: 128, top: SHELF_Y, width: 256, height: 3, backgroundColor: INK },
  bracket: { position: 'absolute', top: SHELF_Y + 3, width: 3, height: 12, backgroundColor: SOFT },

  bowl: {
    position: 'absolute', left: GLASS_X, top: 340, width: 42, height: 34,
    borderWidth: 2.5, borderColor: INK, backgroundColor: STONE, boxShadow: LIP,
    borderBottomLeftRadius: 20, borderBottomRightRadius: 20,
  },
  stem: { position: 'absolute', left: GLASS_X + 19, top: 374, width: 4, height: 16, backgroundColor: INK },
  foot: { position: 'absolute', left: GLASS_X + 8, top: 390, width: 26, height: 4, borderRadius: 2, backgroundColor: INK },

  // THE QUESTION — a bubble over the glass, holding nothing but its own "?".
  wonder: {
    position: 'absolute', left: WONDER_X, top: WONDER_Y, width: WONDER_D, height: WONDER_D, borderRadius: WONDER_D / 2,
    borderWidth: 2, borderColor: INK, backgroundColor: PLATE_FACE, boxShadow: LIP,
    alignItems: 'center', justifyContent: 'center',
  },
  wonderText: { fontFamily: 'Inter_700Bold', fontSize: 15, color: INK, includeFontPadding: false },

  // THE CONTACT — a filled dot, the size of the mark logic7's token uses.
  touch: {
    position: 'absolute', left: TOUCH_X, top: TOUCH_Y, width: TOUCH_D, height: TOUCH_D, borderRadius: TOUCH_D / 2,
    backgroundColor: INK,
  },

  // THE REJECTED ANALYSIS — a tile carrying a word (PLATE_FACE/LIP), struck.
  failTag: {
    position: 'absolute', left: FAIL_X, top: FAIL_Y, width: FAIL_W, height: FAIL_H,
    borderWidth: 2, borderColor: INK, borderRadius: 6, backgroundColor: PLATE_FACE, boxShadow: LIP,
  },
  failText: {
    position: 'absolute', left: 0, top: 5, width: FAIL_W, textAlign: 'center', lineHeight: 11,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.3, color: INK, includeFontPadding: false,
  },
  failStrike: {
    position: 'absolute', left: FAIL_W / 2 - 33, top: FAIL_H / 2 - 1.5, width: 66, height: 3,
    backgroundColor: INK, transform: [{ rotate: '-31deg' }],
  },

  // Pivots about its top end, which is where a hammer is held.
  shaft: {
    position: 'absolute', left: PIVOT_X - 1.5, top: PIVOT_Y, width: 3, height: 58,
    backgroundColor: SOFT, transformOrigin: '50% 0%',
  },
  head: {
    position: 'absolute', left: PIVOT_X - 11, top: PIVOT_Y + 56, width: 22, height: 14,
    borderRadius: 2, backgroundColor: INK,
  },

  ward: {
    position: 'absolute', left: GLASS_X - 39, top: 297, width: 120, height: 120, borderRadius: 60,
    borderWidth: 2, borderColor: SOFT, borderStyle: 'dashed',
  },
  grip: {
    position: 'absolute', left: GLASS_X - 15, top: 325, width: 72, height: 72, borderRadius: 36,
    borderWidth: 2, borderColor: INK,
  },

  label: { position: 'absolute', left: LABEL_X, width: 150, height: 24 },
  labelBox: {
    position: 'absolute', left: 0, top: 0, width: 150, height: 24,
    borderWidth: 2, borderColor: INK, borderRadius: 8, backgroundColor: PLATE_FACE, boxShadow: LIP,
  },
  labelWrong: { borderColor: SOFT, borderStyle: 'dashed' },
  labelText: {
    position: 'absolute', left: 0, top: 7, width: 150, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1, color: INK, includeFontPadding: false,
  },
});

export function Metaphysics37Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Metaphysics37Scene} band={[232, 512]} camera={CAM} />;
}
