import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { ease01, lerp, mixStance, pose, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './metaphysics33Script';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, useHeld, carryFrom, keepHeld, useCarry, carry, lookPose,
} from './cinematicKit';
import { stageTone } from './stageTones';
import { floorStyle, lipOf, PLATE_FACE } from './stageSkin';
import type { SceneApi } from './CinematicPlayer';
import { followMoves, kindOf, seedOf } from './camera';

// THE STAGE IS STRUCK IN THIS LESSON'S OWN BRANCH HUE (./stageTones).
// Same three tones, same luminance to the third decimal — so every contrast
// measured against the old greys still holds and nothing on the stage moved.
const TONE = stageTone('metaphysics');
const { RULE, STONE, SHADE } = TONE;
const LIP = lipOf(TONE);   // the ledge a toned plate stands on (scripts/skin-stage.mjs)

// A TOWER THAT COMES APART UNDER THE READER'S THUMB.
//
// The scatter is the only animated thing and it is nine Views moving — §17 rule 7
// is satisfied by the count, not by a promise: nine transforms is a fraction of a
// path's worth of repaint, and the ground rule and the kicker underneath are inert.
//
// · the stack is nine blocks 46 wide × 24 tall at x 177…223, resting on GROUND and
//   climbing to y 275. Gap of 1 between them, so the tower reads as stacked rather
//   than as one bar.
// · SCATTER holds each block's rubble pose as (dx, dy, deg), hand-written rather
//   than random so the picture is the same every run and can be checked. Every dy
//   is >= 0 — blocks fall, they do not rise — and the widest dx is 118, which puts
//   the far block's outer edge at x 118+223 = 341, inside the stage.
// · the kicker sits at y 338…352, the highest ink in the scene.
// · the figure stands at x 62 facing right; across his poses he reaches x 95, which
//   is 82 clear of the tower's left edge, so he never overlaps the blocks.
//
// Ink runs from the kicker (222) to the ground line (500). Band 216…512 = 296 (H59).

const BLOCK_W = 46;
const BLOCK_H = 24;
const BLOCK_GAP = 1;
const N = 9;
const STACK_X = 177;
const KICK_T = 222;
const FIG_X = 62;

/** Where each block ends up once the tower is rubble: dx, dy, rotation. */
const SCATTER: readonly (readonly [number, number, number])[] = [
  [-2, 0, 0], [26, -1, 8], [-34, 0, -6], [62, -2, 15], [-70, -1, -12],
  [98, 0, 24], [-104, -1, -19], [118, -2, 33], [-126, 0, -28],
];

const FALL = BEATS.map((b) => b.fall ?? 0);
const REV = BEATS.map((b) => b.rev ?? 0);
const WRECKV = BEATS.map((b) => ((b.wreck ?? 0) > 0 ? 1 : 0));
const LAWFULV = BEATS.map((b) => ((b.lawful ?? 0) > 0 ? 1 : 0));
const SYMV = BEATS.map((b) => ((b.symLaw ?? 0) > 0 ? 1 : 0));
const ONEWAYV = BEATS.map((b) => ((b.oneWay ?? 0) > 0 ? 1 : 0));
const P = BEATS.map((b) => b.p ?? 0);
const X = BEATS.map((b) => b.x ?? FIG_X);
const CAM = followMoves(X, BEATS.map(kindOf), seedOf('metaphysics33'));

export default function Metaphysics33Scene({ clock, bt, bi, i, dragPos, gazeX, gazeY, gazeOn }: SceneApi) {
  const heldS = useHeld();
  const cv = useCarry(6);
  const live = (BEATS[i].live ?? 0) > 0;

  // Group AH — each still tap gets exactly one new mark; a fade re-plays only
  // on the beat that actually changes that channel's value (C20c).
  const cur = BEATS[i];
  const prev = i > 0 ? BEATS[i - 1] : undefined;
  const wreckFade = (cur.wreck ?? 0) !== (prev?.wreck ?? 0);
  const lawfulFade = (cur.lawful ?? 0) !== (prev?.lawful ?? 0);
  const symFade = (cur.symLaw ?? 0) !== (prev?.symLaw ?? 0);
  const oneWayFade = (cur.oneWay ?? 0) !== (prev?.oneWay ?? 0);

  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / 0.7);
    const t = clock.value;
    const grow = ease01(bt.value / 0.55);
    const s = keepHeld(heldS, mixStance(carryFrom(heldS, n, emoteHold(P[p], t)), emoteLive(P[n], t, bt.value), tr));
    // A tower takes a moment to go over — 1.1s, so the fall is watchable (C17).
    const drop = ease01(bt.value / 1.1);
    return {
      fig: lookPose(s, FIG_X, GROUND, K_FIG, 1, 1, gazeX.value, gazeY.value, gazeOn.value),
      // ON THE DRAG BEAT THE READER IS THE ANIMATION. Everywhere else the script
      // drives it. One value, two sources, and the picture never disagrees with
      // whichever is in charge.
      fall: live ? dragPos.value : carry(cv, 0, n, FALL[p], FALL[n], drop),
      rev: carry(cv, 1, n, REV[p], REV[n], tr),
      // A dashed box settles round the wreckage; a check ticks onto it; a
      // two-headed arrow, then later a one-way arrow, appear in the clear
      // strip above the tower. All four are new marks, never a re-fade of
      // what is already settled (C20c).
      wreck: carry(cv, 2, n, WRECKV[p], WRECKV[n], wreckFade ? grow : 1),
      lawful: carry(cv, 3, n, LAWFULV[p], LAWFULV[n], lawfulFade ? grow : 1),
      symLaw: carry(cv, 4, n, SYMV[p], SYMV[n], symFade ? grow : 1),
      oneWay: carry(cv, 5, n, ONEWAYV[p], ONEWAYV[n], oneWayFade ? grow : 1),
    };
  });

  const D = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const revStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.rev }));
  const wreckStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.wreck }));
  const lawfulStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.lawful }));
  const symLawStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.symLaw }));
  const oneWayStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.oneWay }));

  return (
    <Animated.View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      <Text style={styles.kicker} numberOfLines={1}>NINE BLOCKS</Text>
      <Animated.Text style={[styles.rev, revStyle]} numberOfLines={1}>◀  RUNNING BACKWARDS</Animated.Text>

      {/* A two-headed arrow: the laws of motion run equally either way (group AH). */}
      <Animated.View style={[styles.arrowGroup, symLawStyle]} pointerEvents="none">
        <View style={styles.arrowLineMid} />
        <View style={styles.arrowHeadL} />
        <View style={styles.arrowHeadR} />
      </Animated.View>
      {/* A one-way arrow: chance only drifts toward disorder (group AH). */}
      <Animated.View style={[styles.arrowGroup, oneWayStyle]} pointerEvents="none">
        <View style={styles.arrowLineFull} />
        <View style={styles.arrowHeadR} />
      </Animated.View>

      {SCATTER.map((s, k) => (
        <Block key={k} k={k} to={s} SCENE={SCENE} />
      ))}

      {/* A dashed box settles round the wreckage — the eye already knows this
          is wrong before anyone says so (group AH). */}
      <Animated.View style={[styles.wreckBox, wreckStyle]} pointerEvents="none" />
      {/* A check ticks onto the box's corner — every collision inside it is
          still lawful (group AH). */}
      <Animated.View style={[styles.lawfulBadge, lawfulStyle]} pointerEvents="none">
        <View style={styles.checkA} />
        <View style={styles.checkB} />
      </Animated.View>

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={D} k={K_FIG} />
    </Animated.View>
  );
}

/**
 * One block. Its own component because a hook cannot be called inside `.map()` —
 * `useAnimatedStyle` per block in a loop is the React rule broken nine times over.
 */
function Block({ k, to, SCENE }: {
  k: number;
  to: readonly [number, number, number];
  SCENE: { value: { fall: number } };
}) {
  const bottom = GROUND - (k + 1) * (BLOCK_H + BLOCK_GAP);
  const style = useAnimatedStyle(() => {
    const f = SCENE.value.fall;
    // Blocks lower in the stack barely move; the top ones fly. Scaling the travel
    // by height is what makes it read as a COLLAPSE rather than an explosion.
    const w = 0.35 + 0.65 * (k / (N - 1));
    return {
      transform: [
        { translateX: to[0] * f * w },
        // Everything ends up on the floor, so the drop is whatever it takes to get
        // this block down to the bottom course, plus its own small settle.
        { translateY: (GROUND - BLOCK_H - bottom + to[1]) * f * w },
        { rotate: `${to[2] * f}deg` },
      ],
    };
  });
  return (
    <Animated.View
      style={[styles.block, { top: bottom, left: STACK_X }, style]}
      pointerEvents="none"
    />
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 16, right: 16, top: GROUND, height: 1.5, backgroundColor: RULE },
  // THE FLOOR THE GROUND LINE SITS ON. A rule on its own leaves the
  // figure and everything it is looking at standing on bare page;
  // political7 and political8 both stand their subject on a filled mass.
  floor: floorStyle(TONE, GROUND),

  kicker: {
    position: 'absolute', left: 120, top: KICK_T, width: 160,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.2, color: SOFT,
    textAlign: 'center', includeFontPadding: false,
  },
  rev: {
    position: 'absolute', left: 120, top: KICK_T + 12, width: 160,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.2, color: INK,
    textAlign: 'center', includeFontPadding: false, backgroundColor: STONE, boxShadow: LIP },

  block: {
    position: 'absolute', width: BLOCK_W, height: BLOCK_H,
    borderWidth: 1.5, borderColor: INK, backgroundColor: 'transparent',
  },

  // GROUP AH — the four still-tap marks. wreckBox/lawfulBadge sit low, over the
  // settled rubble; the two arrow groups share one strip in the clear paper
  // between the kicker and the standing tower's own top (never both visible at
  // once — the underlying channels are mutually exclusive in the script).
  wreckBox: {
    position: 'absolute', left: 108, top: 430, width: 190, height: 66,
    borderRadius: 10, borderWidth: 1.5, borderColor: INK, borderStyle: 'dashed',
    backgroundColor: 'transparent',
  },
  lawfulBadge: {
    position: 'absolute', left: 278, top: 418, width: 22, height: 22, borderRadius: 11,
    borderWidth: 1.5, borderColor: INK, backgroundColor: PLATE_FACE, boxShadow: LIP,
  },
  checkA: { position: 'absolute', left: 6, top: 11, width: 5, height: 2, backgroundColor: INK, borderRadius: 1, transform: [{ rotate: '45deg' }] },
  checkB: { position: 'absolute', left: 8, top: 9, width: 10, height: 2, backgroundColor: INK, borderRadius: 1, transform: [{ rotate: '-50deg' }] },

  arrowGroup: { position: 'absolute', left: 160, top: 249, width: 80, height: 14 },
  arrowLineMid: { position: 'absolute', left: 9, top: 6, width: 62, height: 2, backgroundColor: INK },
  arrowLineFull: { position: 'absolute', left: 0, top: 6, width: 71, height: 2, backgroundColor: INK },
  arrowHeadL: {
    position: 'absolute', left: 0, top: 1, width: 0, height: 0,
    borderTopWidth: 6, borderBottomWidth: 6, borderRightWidth: 9,
    borderTopColor: 'transparent', borderBottomColor: 'transparent', borderRightColor: INK,
  },
  arrowHeadR: {
    position: 'absolute', left: 71, top: 1, width: 0, height: 0,
    borderTopWidth: 6, borderBottomWidth: 6, borderLeftWidth: 9,
    borderTopColor: 'transparent', borderBottomColor: 'transparent', borderLeftColor: INK,
  },
});

export function Metaphysics33Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Metaphysics33Scene} band={[216, 512]} camera={CAM} />;
}
