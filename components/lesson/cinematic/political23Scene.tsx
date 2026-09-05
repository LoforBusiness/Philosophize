import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { dirsFrom, ease01, moveTr, pose, travelStance, WALK, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './political23Script';
import {
  facing, GROUND, K_FIG, STAGE_W, STAGE_H, INK, STONE, SOFT, RULE, PAPER,
  useHeld, carryFrom, keepHeld, useCarry, carry, lookPose,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target, { AnswerLift } from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// ─────────────────────────────────────────────────────────────────────────────
// THREE TAGS COMING OFF, AND A BOX MARKED WHAT IS LEFT.
//
// THE COMPOSITION, IN NUMBERS (H56).
//
// · THREE TAGS, 138×30, at x 40…178, tops 258 · 300 · 342. Each has a 5-wide
//   ink spine down its left edge so it reads as a label tied on rather than a
//   button, which matters: the reader is going to be asked which of them was
//   put on by somebody.
// · the CAPTION WHAT YOU ARE sits over them at y 240.
// · the BOX is 128×108 at x 240…368, y 250…358, dashed at 1.5 — the one dashed
//   outline on the stage, because it is the one object whose contents are in
//   dispute.
// · the CHOOSER is a 44-disc at its centre (304, 304), 2.5 thick and hollow. It
//   is drawn while the liberal picture is being stated and fades when the reply
//   comes, and the box stays exactly where it is. An emptying box is the
//   disagreement; a vanishing box would be a different one (A1).
// · the BOX CAPTION WHAT IS LEFT sits at y 240 as well, so the two halves of the
//   stage are captioned on one line and read as a comparison.
// · the FIGURE walks x 200 → 132 → 268 on GROUND 500; crown ≈ 397, and the
//   lowest ink is the third tag at y 372, so 25 units stay clear.
//
// Ink runs y 240 (the captions) … y 500. BAND 234…512 = 278, with the 103-unit
// figure at 37.1%.
// ─────────────────────────────────────────────────────────────────────────────

/** Crossfade for a beat that does NOT walk. 0.85 is the base `footfalls` assumes. */
const BASE_TR = 0.85;

const TAG_X = 40;
const TAG_W = 138;
const TAG_H = 30;
const TAG_TOP = [258, 300, 342];
const TAG_TEXT = ['A DAUGHTER', 'A CAREER', 'A CLUB YOU JOINED'];

const BOX_X = 240;
const BOX_Y = 250;
const BOX_W = 128;
const BOX_H = 108;
const DISC = 44;

const CAP_Y = 240;

const FIG_X = 200;

const X = BEATS.map((b) => b.x ?? FIG_X);
// WHICH WAY HE IS POINTING, read off the same x track he walks along:
// +1 where it rises, -1 where it falls, and HOLD while he stands still, so a
// figure who walks left to something keeps facing it while he talks about it.
const DIR = dirsFrom(X, 1);
const P = BEATS.map((b) => b.p ?? 0);
const TAGS = BEATS.map((b) => b.tags ?? 0);
const STRIP = BEATS.map((b) => b.strip ?? 0);
const BOX = BEATS.map((b) => b.box ?? 0);
const LEFT = BEATS.map((b) => b.left ?? 0);
const LIVE = BEATS.map((b) => b.live ?? 0);

// R7b — the stage follows the control on its own graded beat, and only there.
// Derived from the beat rather than declared as a channel so it cannot fall out
// of step with the control it is about.
const REACT = BEATS.map((b) => (b.interact?.split ? 1 : 0));

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('political23'));

export default function Political23Scene({ clock, bt, bi, i, picked, onPick, dragPos, gazeX, gazeY, gazeOn }: SceneApi) {
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

    const figS = keepHeld(heldFig, travelStance(
      X[p], X[n],
      carryFrom(heldFig, n, emoteHold(P[p], t)), emoteHold(P[n], t), emoteLive(P[n], t, bt.value),
      tr, WALK,
    ));

    return {
      fig: lookPose(figS, carry(cv, 0, n, X[p], X[n], tr), GROUND, K_FIG, facing(DIR[p], DIR[n], bt.value), 1, gazeX.value, gazeY.value, gazeOn.value),
      tags: carry(cv, 1, n, TAGS[p], TAGS[n], tr),
      strip: carry(cv, 2, n, STRIP[p], STRIP[n], tr),
      box: carry(cv, 3, n, BOX[p], BOX[n], tr),
      // R7c — the seam is how much was HANDED to you, so the chooser said to be left
      // in the box thins out as it travels right. The reader empties the box themselves.
      left: carry(cv, 4, n, LEFT[p], reacting ? 1 - dragPos.value : LEFT[n], tr),
      t,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const answered = picked !== null;
  const live = !!BEATS[i]?.interact && !BEATS[i]?.interact?.cards && LIVE[i] === 1;

  const capStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.tags }));
  const boxStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.box }));
  const discStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.left }));

  const tags = [0, 1, 2];

  return (
    <View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      <Animated.View style={[StyleSheet.absoluteFill, capStyle]} pointerEvents="none">
        <Text style={styles.tagCap}>WHAT YOU ARE</Text>
      </Animated.View>

      {/* Tags come off one at a time, right to left, rather than all at once. */}
      {/* Each tag rides with its own target (E39). */}
      {tags.map((k) => (
        <AnswerLift key={k} id={`tag${k}`} picked={picked} correct={k === 0}>
          <Tag S={SCENE} k={k} />
        </AnswerLift>
      ))}

      <Animated.View style={[StyleSheet.absoluteFill, boxStyle]} pointerEvents="none">
        <Text style={styles.boxCap}>WHAT IS LEFT</Text>
        <View style={styles.box} />
      </Animated.View>
      <Animated.View style={[styles.disc, discStyle]} pointerEvents="none" />

      {tags.map((k) => (
        <Target
          key={`t${k}`}
          id={`tag${k}`}
          correct={k === 0}
          picked={picked}
          onPick={onPick}
          disabled={!live || answered}
          style={[styles.hit, { top: TAG_TOP[k] }]}
        >
          <View
            style={[
              styles.hitBox,
              k === 0 ? (answered && styles.right) : (answered && picked === `tag${k}` && styles.wrong),
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

/**
 * Tag k. Each one leaves on its own share of `strip`, so three ties come off in
 * sequence rather than the whole label stack blinking out together.
 */
function Tag({ S, k }: { S: { value: { tags: number; strip: number } }; k: number }) {
  const st = useAnimatedStyle(() => {
    const s = S.value.strip * 3 - (2 - k);
    const gone = s < 0 ? 0 : s > 1 ? 1 : s;
    return { opacity: S.value.tags * (1 - gone), transform: [{ translateX: 34 * gone }] };
  });
  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, st]}>
      <View style={[styles.tag, { top: TAG_TOP[k] }]} />
      <View style={[styles.spine, { top: TAG_TOP[k] }]} />
      <Text style={[styles.tagText, { top: TAG_TOP[k] + 10 }]}>{TAG_TEXT[k]}</Text>
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

  tagCap: {
    position: 'absolute', left: TAG_X, top: CAP_Y, width: TAG_W,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.1, color: SOFT, includeFontPadding: false,
  },
  tag: {
    position: 'absolute', left: TAG_X, width: TAG_W, height: TAG_H,
    borderWidth: 1.5, borderColor: INK, borderRadius: 3, backgroundColor: PAPER,
  },
  spine: { position: 'absolute', left: TAG_X, width: 5, height: TAG_H, backgroundColor: STONE, borderRadius: 2 },
  tagText: {
    position: 'absolute', left: TAG_X + 14, width: TAG_W - 20,
    fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 0.7, color: INK, includeFontPadding: false,
  },

  boxCap: {
    position: 'absolute', left: BOX_X, top: CAP_Y, width: BOX_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.1, color: SOFT, includeFontPadding: false,
  },
  box: {
    position: 'absolute', left: BOX_X, top: BOX_Y, width: BOX_W, height: BOX_H,
    borderWidth: 1.5, borderColor: SOFT, borderStyle: 'dashed', borderRadius: 5 },
  disc: {
    position: 'absolute', left: BOX_X + BOX_W / 2 - DISC / 2, top: BOX_Y + BOX_H / 2 - DISC / 2,
    width: DISC, height: DISC, borderRadius: DISC / 2, borderWidth: 2.5, borderColor: INK,
  },

  hit: { position: 'absolute', left: TAG_X, width: TAG_W, height: TAG_H },
  hitBox: { width: TAG_W, height: TAG_H, borderRadius: 3 },
  right: { borderWidth: 3, borderColor: INK },
  wrong: { borderWidth: 1.5, borderColor: SOFT, borderStyle: 'dashed' },
});

export function Political23Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Political23Scene} band={[234, 512]} camera={CAM} />;
}
