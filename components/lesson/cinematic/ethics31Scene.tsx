import {
  View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import {
  climb, ease01, emoteHold, lerp, mixStance, pose, type Bundle, } from './rig';
import { BEATS } from './ethics31Script';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER, useHeld, carryFrom, keepHeld, useCarry, carry,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// A CLIMB, which no other lesson in the app stages: the figure works on the spot
// and the rungs scroll DOWN past it (C22d — raising a figure up a static ladder
// reads as sliding, and was rejected on sight).
//
// TWO RULES THIS SCENE EXISTS TO OBEY (C22d2):
//  · Rate. The scroll and the leg cycle are driven by the SAME number — `rungs`,
//    a per-beat channel — so they cannot desync. One rung is one step: the cycle
//    phase is π per rung, because `climb` puts two steps in a 2π sine.
//  · Placement. The rails are hung off the POSE's hands, not off the figure's x.
//    `climb` puts the fists at local x 21…26, so the rails sit at figX + 16 and
//    figX + 40 and the hands land between them. Centring the ladder on the mark
//    would put it three units behind the nearest hand — a man climbing the air.
//
// · figure climbs on the spot at x 120; crown y 397. The ladder occupies
//   x 136…160 and the figure draws OVER it, which is right: you are on the near
//   side of a ladder you are climbing (A5, a deliberate D23 exception).
// · shelf y 216…238 at x 112…206 · ladder clip y 244…470 · lamp y 262…300 and its
//   caption, all at x ≥ 216 so nothing crowds the climber.
// · The three answer targets are OBJECTS already on the stage — the shelf, the top
//   rung and the lamp — not a row of cards. They are static on that beat because
//   `rungs` does not change across it, so nothing drifts under the finger (E37b).

const FIG_X = 120;

const RAIL_L = FIG_X + 16;
const RAIL_R = FIG_X + 40;
const LADDER_W = RAIL_R - RAIL_L;

const CLIP_T = 244;
const CLIP_H = 226;
const RUNG_SP = 22;
const RUNG_N = 14;                 // enough to fill the clip and overrun both ends
const RUNG_H = 4;

/** One rung per step, and `climb` puts two steps in a 2π sine. */
const PHASE_PER_RUNG = Math.PI;

const SHELF_L = 112;
const SHELF_W = 94;
const SHELF_T = 216;
const SHELF_H = 22;

const LAMP_L = 216;
const LAMP_W = 176;
const LAMP_T = 262;
const LAMP_H = 38;

/** The top rung sits just under the shelf when the ladder is short. */
const TOPRUNG_T = 300;
const TOPRUNG_H = 26;

const P = BEATS.map((b) => b.p ?? 0);
const RUNGS = BEATS.map((b) => b.rungs ?? 0);
const LADDER = BEATS.map((b) => b.ladder ?? 0);
const DUTY = BEATS.map((b) => b.duty ?? 0);

/** Non-climbing attitudes, so the figure is not frozen mid-step when it rests. */
const HOLD: Record<number, number> = { 0: 0, 1: 41, 2: 46, 3: 25 };

// THE CAMERA (H60b). `followMoves` reads the x track and gives each beat its own
// shot: it FOLLOWS him when a beat moves him far enough to be worth following,
// pushes close on a quote, and PULLS BACK to the whole band on a question or a
// summary — the beats the reader has to read and act on. Beats that do not set
// `x` stand at FIG_X, so a still lesson gets the one-in-three push rather than a
// camera that never rests.
const X = BEATS.map((b) => b.x ?? FIG_X);
const CAM = followMoves(X, BEATS.map(kindOf), seedOf('ethics31'));

export default function Ethics31Scene({ clock, bt, bi, i, picked, onPick }: SceneApi) {
  const heldS = useHeld();
  const cv = useCarry(3);
  const cur = BEATS[i];
  const prev = i > 0 ? BEATS[i - 1] : undefined;

  const dr = Math.abs((cur.rungs ?? 0) - (prev?.rungs ?? 0));
  const ladderFade = (cur.ladder ?? 0) !== (prev?.ladder ?? 0);
  const dutyFade = (cur.duty ?? 0) !== (prev?.duty ?? 0);

  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    // A climb takes the time its distance needs, exactly as a walk does (C17):
    // 0.92s per rung, which is one full step of the cycle.
    const span = Math.max(0.7, 0.92 * dr);
    const tr = ease01(bt.value / span);
    const t = clock.value;
    const grow = ease01(bt.value / 0.55);

    const travelled = carry(cv, 0, n, RUNGS[p], RUNGS[n], tr);
    // Climbing only while the rung count is actually changing; otherwise hold a
    // human pose rather than a frozen half-step (C20).
    const moving = dr > 0 ? 1 - Math.abs(tr * 2 - 1) : 0;
    const s = keepHeld(heldS, mixStance(carryFrom(heldS, n,
      emoteHold(HOLD[P[n]] ?? 0, t)),
      climb(travelled * PHASE_PER_RUNG),
      moving));
    return {
      fig: pose(s, FIG_X, GROUND, K_FIG, 1, 1),
      // The rungs slide by exactly the distance the legs walked, then wrap — every
      // rung is identical, so the wrap is invisible and the climb never ends.
      scroll: (travelled * RUNG_SP) % RUNG_SP,
      ladder: carry(cv, 1, n, LADDER[p], LADDER[n], tr, ladderFade ? grow : 1),
      duty: carry(cv, 2, n, DUTY[p], DUTY[n], dutyFade ? grow : tr),
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const rungStyle = useAnimatedStyle(() => ({ transform: [{ translateY: SCENE.value.scroll }] }));
  const ladderStyle = useAnimatedStyle(() => ({ opacity: Math.min(1, SCENE.value.ladder) }));
  const lampStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.duty }));
  const darkStyle = useAnimatedStyle(() => ({ opacity: 1 - SCENE.value.duty }));

  const answered = picked !== null;
  const live = (cur.pick ?? 0) > 0 && !!cur.interact;

  const state = (correct: boolean, id: string) => [
    answered && correct && styles.pickRight,
    answered && picked === id && !correct && styles.pickWrong,
  ];

  return (
    <Animated.View style={styles.scene}>
      {/* the thing on the shelf — target one */}
      <Target id={'shelf'} correct={false} picked={picked} onPick={onPick}
              style={styles.shelf} disabled={!live || answered}>
        <View style={[styles.shelfInner, ...state(false, 'shelf')]}>
          <Text style={styles.shelfText} numberOfLines={1}>THE SHELF</Text>
        </View>
      </Target>

      {/* the ladder: rails hung off the pose's hands, rungs scrolling inside a clip */}
      <Animated.View style={[styles.clip, ladderStyle]} pointerEvents="none">
        <Animated.View style={[styles.rungLayer, rungStyle]}>
          {Array.from({ length: RUNG_N }, (_, k) => (
            <View key={k} style={[styles.rung, { top: k * RUNG_SP - RUNG_SP }]} />
          ))}
        </Animated.View>
        <View style={[styles.rail, { left: 0 }]} />
        <View style={[styles.rail, { left: LADDER_W - 3 }]} />
      </Animated.View>

      {/* the highest rung you can stand on — target two */}
      <Target id={'rung'} correct={false} picked={picked} onPick={onPick}
              style={styles.topRung} disabled={!live || answered}>
        <View style={[styles.topRungInner, ...state(false, 'rung')]}>
          <Text style={styles.topRungText} numberOfLines={1}>YOUR REACH</Text>
        </View>
      </Target>

      {/* the lamp — target three, and the answer */}
      <Target id={'duty'} correct={true} picked={picked} onPick={onPick}
              style={styles.lamp} disabled={!live || answered}>
        {/* Once answered the box fills INK, so the word has to flip to PAPER or it
            disappears into its own background — the correct-state fill and the
            text colour are a matched pair everywhere in the app (H61). */}
        <View style={[styles.lampBox, ...state(true, 'duty')]}>
          <Animated.Text
            style={[styles.lampOn, answered && styles.onInk, lampStyle]}
            numberOfLines={1}
          >
            DUTY
          </Animated.Text>
          <Animated.Text
            style={[styles.lampOff, answered && styles.offInk, darkStyle]}
            numberOfLines={1}
          >
            DUTY
          </Animated.Text>
        </View>
      </Target>

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DF} k={K_FIG} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 24, right: 14, top: GROUND, height: 1.5, backgroundColor: RULE },

  shelf: { position: 'absolute', left: SHELF_L, top: SHELF_T, width: SHELF_W },
  shelfInner: {
    height: SHELF_H, borderWidth: 2, borderColor: INK, borderRadius: 3, backgroundColor: PAPER,
    alignItems: 'center', justifyContent: 'center',
  },
  shelfText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.5, letterSpacing: 1, color: INK,
    includeFontPadding: false,
  },

  clip: {
    position: 'absolute', left: RAIL_L, top: CLIP_T, width: LADDER_W, height: CLIP_H,
    overflow: 'hidden',
  },
  rungLayer: { position: 'absolute', left: 0, top: 0, width: LADDER_W, height: CLIP_H + RUNG_SP },
  rung: {
    position: 'absolute', left: 0, width: LADDER_W, height: RUNG_H,
    backgroundColor: INK, borderRadius: 1,
  },
  rail: { position: 'absolute', top: 0, width: 3, height: CLIP_H, backgroundColor: INK },

  topRung: { position: 'absolute', left: 216, top: TOPRUNG_T, width: 176 },
  topRungInner: {
    height: TOPRUNG_H, borderWidth: 2, borderColor: INK, borderRadius: 3, backgroundColor: PAPER,
    alignItems: 'center', justifyContent: 'center',
  },
  topRungText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.5, letterSpacing: 1, color: INK,
    includeFontPadding: false,
  },

  lamp: { position: 'absolute', left: LAMP_L, top: LAMP_T, width: LAMP_W },
  lampBox: {
    height: LAMP_H, borderWidth: 2.5, borderColor: INK, borderRadius: 4, backgroundColor: PAPER,
    alignItems: 'center', justifyContent: 'center',
  },
  lampOn: {
    position: 'absolute',
    fontFamily: 'Inter_700Bold', fontSize: 15, letterSpacing: 3, color: INK,
    includeFontPadding: false,
  },
  lampOff: {
    position: 'absolute',
    fontFamily: 'Inter_700Bold', fontSize: 15, letterSpacing: 3, color: RULE,
    includeFontPadding: false,
  },

  onInk: { color: PAPER },
  offInk: { color: SOFT },
  pickRight: { backgroundColor: INK, borderColor: INK },
  pickWrong: { borderColor: SOFT, opacity: 0.45 },
});

// Ink runs from the shelf (216) to the ground line (500). Band 210…512 = 302 (H59).
export function Ethics31Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Ethics31Scene} band={[210, 512]} camera={CAM} />;
}
