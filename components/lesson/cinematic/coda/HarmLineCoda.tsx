// ─────────────────────────────────────────────────────────────────────────────
// THE CLOSING ENCOUNTER FOR `political-political-4`, "Freedom vs. Control".
//
// MECHANIC: THE READER DRAWS IT. Two stickmen share a bare stage. Drag your finger
// across the ground and you draw the line between them — and then they both walk out
// to whatever room you have left them, and you watch what that costs.
//
// WHY A DRAWN LINE. Mill's harm principle IS a line, and every other way of asking
// about it gives the reader the line already drawn and asks them to agree. Drawing it
// is the only version where the reader has to decide how much, not merely which side,
// and where being nearly right looks different from being wrong.
//
// AND IT HAS A BAND, NOT A POINT. Anywhere in the middle third works, because a
// principle that only one pixel satisfies is a quiz question wearing a gesture (R3 —
// "nothing is graded on hitting a number"). Too far either way and one of them is
// squeezed against the wall, which is the thing the lesson says out loud.
// ─────────────────────────────────────────────────────────────────────────────
import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing, useAnimatedReaction, useAnimatedStyle, useDerivedValue, useSharedValue, withTiming,
} from 'react-native-reanimated';
import { GROUND, INK, K_FIG, PAPER, SHADE, SOFT, STAGE_W, STONE } from '../cinematicKit';
import { clamp01, ease01, lerp, mixStance, pose, strideStance, WALK, type Bundle } from '../rig';
import { emoteAny, emoteAnyLive } from '../moves';
import {
  type CodaWindow,
  CodaFigure, CodaFloor, CodaLand, CodaLine, CodaStage, CodaTouch, codaX, useCodaRun,
} from './codaKit';
import type { CodaProps } from './types';

const WALL_L = 62;
const WALL_R = 338;
const HOME_L = 124;
const HOME_R = 276;
/** The band where both of them can live. Measured off the figure's own width. */
const FAIR_LO = 166;
const FAIR_HI = 234;
/** The whole floor between the walls, and nothing either side of it. */
const WIN: CodaWindow = [46, 330, 354, 548];

const POSE_STAND = 25;
const POSE_OPEN = 7;        // both wide — room to move
const POSE_CRUSH = 22;      // clutch chest — pressed against the wall
const POSE_NOD = 19;
const POSE_SHRUG = 8;

type Verdict = 'left' | 'right' | 'fair' | null;

export default function HarmLineCoda({ onDone }: CodaProps) {
  const { t, phase, tries, resolve, again } = useCodaRun(1900);
  const [verdict, setVerdict] = useState<Verdict>(null);
  /** Where the reader has drawn the line, in design space. −1 before they have. */
  const line = useSharedValue(-1);
  /** 0 while drawing … 1 once they have both walked out to their limit. */
  const settle = useSharedValue(0);

  const judge = useCallback((at: number) => {
    const v: Verdict = at < FAIR_LO ? 'left' : at > FAIR_HI ? 'right' : 'fair';
    setVerdict(v);
    resolve(v === 'fair', 2600);
  }, [resolve]);

  /** The finger, 0…1 across the surface. */
  const u = useSharedValue(-1);
  const drawing = useSharedValue(0);
  drawing.value = phase === 'ask' ? 1 : 0;

  // The line is wherever the finger is, clamped inside the two walls. One expression,
  // read every frame, so the shares below it fill while the finger is still down.
  useAnimatedReaction(() => (drawing.value ? u.value : -1), (uu) => {
    'worklet';
    if (uu < 0) return;
    line.value = Math.max(WALL_L + 42, Math.min(WALL_R - 42, codaX(uu, WIN)));
  });

  const drop = useCallback(() => {
    if (line.value < 0) return;
    settle.value = withTiming(1, { duration: 1300, easing: Easing.inOut(Easing.quad) });
    judge(line.value);
  }, [line, settle, judge]);

  // ── EACH OF THEM WALKS OUT TO WHATEVER ROOM THE LINE LEFT ─────────────────
  //
  // Their limit is the line, less the width they occupy. That arithmetic is the whole
  // mechanic: the reader is not choosing a side, they are apportioning space, and the
  // figures simply take what is theirs.
  const LEFT = useDerivedValue<Bundle>(() => {
    const now = t.value;
    const at = line.value < 0 ? (FAIR_LO + FAIR_HI) / 2 : line.value;
    const limit = at - 30;
    const squeezed = limit - WALL_L < 56;
    const code = phase === 'arrive' ? POSE_STAND
      : settle.value > 0.55 ? (squeezed ? POSE_CRUSH : POSE_OPEN)
        : phase === 'land' ? POSE_NOD
          : POSE_STAND;
    const hold = emoteAny(code, now + 3);
    const lv = emoteAnyLive(code, now + 3, now);
    const tr = phase === 'arrive' ? ease01(Math.min(now / 1.3, 1)) : 1;
    const target = Math.max(WALL_L + 24, Math.min(limit, HOME_L));
    const px = phase === 'arrive'
      ? lerp(-34, HOME_L, tr)
      : lerp(HOME_L, target, settle.value);
    const s = phase === 'arrive'
      ? strideStance(-34, HOME_L, mixStance(hold, lv, 0.5), tr, WALK)
      : settle.value > 0.02 && settle.value < 0.99
        ? strideStance(HOME_L, target, mixStance(hold, lv, 0.5), settle.value, WALK)
        : mixStance(hold, lv, 0.6);
    // He faces the way he is travelling; standing, he faces the line.
    const moving = settle.value > 0.02 && settle.value < 0.99 && Math.abs(target - HOME_L) > 1;
    const dir = moving ? (target > HOME_L ? 1 : -1) : 1;
    return pose(s, px, GROUND, K_FIG, dir, 1);
  }, [phase]);

  const RIGHT = useDerivedValue<Bundle>(() => {
    const now = t.value;
    const at = line.value < 0 ? (FAIR_LO + FAIR_HI) / 2 : line.value;
    const limit = at + 30;
    const squeezed = WALL_R - limit < 56;
    const code = phase === 'arrive' ? POSE_STAND
      : settle.value > 0.55 ? (squeezed ? POSE_CRUSH : POSE_OPEN)
        : phase === 'land' ? POSE_NOD
          : POSE_SHRUG;
    const hold = emoteAny(code, now + 3);
    const lv = emoteAnyLive(code, now + 3, now);
    const tr = phase === 'arrive' ? ease01(Math.min(now / 1.3, 1)) : 1;
    const target = Math.min(WALL_R - 24, Math.max(limit, HOME_R));
    const px = phase === 'arrive'
      ? lerp(400 + 34, HOME_R, tr)
      : lerp(HOME_R, target, settle.value);
    const s = phase === 'arrive'
      ? strideStance(400 + 34, HOME_R, mixStance(hold, lv, 0.5), tr, WALK)
      : settle.value > 0.02 && settle.value < 0.99
        ? strideStance(HOME_R, target, mixStance(hold, lv, 0.5), settle.value, WALK)
        : mixStance(hold, lv, 0.6);
    const moving = settle.value > 0.02 && settle.value < 0.99 && Math.abs(target - HOME_R) > 1;
    const dir = phase === 'arrive' ? -1 : moving ? (target > HOME_R ? 1 : -1) : -1;
    return pose(s, px, GROUND, K_FIG, dir, 1);
  }, [phase]);

  const lineStyle = useAnimatedStyle(() => ({
    opacity: line.value < 0 ? 0 : 1,
    transform: [{ translateX: (line.value < 0 ? 0 : line.value) - 2 }],
  }));
  // The two shares of the floor, filled as the line moves, so the apportioning is
  // visible while the finger is still down rather than only after it lifts.
  const leftShare = useAnimatedStyle(() => ({
    width: Math.max(0, (line.value < 0 ? 200 : line.value) - WALL_L),
    opacity: line.value < 0 ? 0 : 0.5,
  }));
  const rightShare = useAnimatedStyle(() => ({
    left: line.value < 0 ? 200 : line.value,
    width: Math.max(0, WALL_R - (line.value < 0 ? 200 : line.value)),
    opacity: line.value < 0 ? 0 : 0.5,
  }));

  const say = phase === 'arrive' ? 'Two people. One floor. No rules yet.'
    : phase === 'ask' ? (tries ? 'Move it. Somewhere they can both live.' : 'Draw the line. Wherever you think it goes.')
      : phase === 'play' && verdict === 'left' ? 'One of them has nowhere to stand.'
        : phase === 'play' && verdict === 'right' ? 'The other one is against the wall now.'
          : phase === 'play' ? ''
            : phase === 'again' ? 'A line that only one of them can live with is not a principle.'
              : '';

  return (
    <>
      {phase === 'land' ? null : <CodaLine text={say} />}
      <CodaStage win={WIN}>
        <CodaFloor />
        <View style={[styles.wall, { left: WALL_L - 8 }]} pointerEvents="none" />
        <View style={[styles.wall, { left: WALL_R }]} pointerEvents="none" />
        <Animated.View style={[styles.share, { left: WALL_L }, leftShare]} pointerEvents="none" />
        <Animated.View style={[styles.share, rightShare]} pointerEvents="none" />
        <Animated.View style={[styles.drawn, lineStyle]} pointerEvents="none">
          <View style={styles.drawnPost} />
        </Animated.View>
        <CodaFigure D={LEFT} />
        <CodaFigure D={RIGHT} role="second" />
      </CodaStage>
      {/* THE WHOLE SCREEN IS THE CANVAS. A drawing surface smaller than the thing
          being divided would be asking the reader to aim rather than to judge. */}
      {phase === 'ask' ? <CodaTouch enabled u={u} onDrop={drop} id="coda-draw" /> : null}
      {phase === 'land'
        ? (
          <CodaLand
            idea="That is the harm principle, drawn."
            note="You did not pick freedom or control. You found the place where one person's room stops being their own business — which is the only question Mill thought was worth asking."
            onDone={onDone}
          />
        )
        : null}
    </>
  );
}

const styles = StyleSheet.create({
  wall: {
    position: 'absolute', top: GROUND - 150, width: 8, height: 150,
    backgroundColor: SHADE, borderRadius: 2,
  },
  share: {
    position: 'absolute', top: GROUND + 4, height: 12, backgroundColor: STONE, borderRadius: 3,
  },
  drawn: { position: 'absolute', left: 0, top: GROUND - 96, width: 4, height: 110 },
  drawnPost: {
    flex: 1, backgroundColor: '#D35E36', borderRadius: 2,
    boxShadow: '0px 2px 0px rgba(26,26,26,0.5)',
  },
});
