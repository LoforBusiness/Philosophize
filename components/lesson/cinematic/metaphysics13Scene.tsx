import {
  View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import {
  WALK, dirsFrom, ease01, lerp, moveTr, pose, travelStance, type Bundle, } from './rig';
// The whole movement library, not just rig's 49 emotes. Codes under 100 ARE
// rig's and mean exactly what they always did; 100+ reach moves.ts (emoteAny).
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './metaphysics13Script';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER, useHeld, carryFrom, keepHeld, facing, useCarry, carry,
} from './cinematicKit';
import { followMoves, kindOf, seedOf } from './camera';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';

// A track that forks, stage right; the figure downstage left.
//
// · figure WALKS x = 70 → 168 → 124; widest body span x 132…204 at 168, fist to
//   204.5 at gesture 41. All track ink is at x ≥ 216.
// · YOU token y 230…254 · stem y 258…298 · crossbar y 298…302 · drops y 302…344 ·
//   destinations y 348…386 · answer row y 400…432. A standing crown is y 397; the
//   answer row is below it at an x the figure never has.
// · A5 — the track is out of reach (hand tops out at y 411, B11b); read, not handled.
//
// THE TWO DESTINATIONS ARE ONE STYLE USED TWICE, and the two drops are one style
// used twice. Nothing in this file can make one branch differ from the other, which
// is exactly the claim: there is no fact on the stage that could pick a winner.

const TR_L = 216;
const TR_W = 176;
const MID = TR_L + TR_W / 2;

const TOK_T = 230;
const TOK_H = 24;
const TOK_W = 76;

const STEM_T = 258;
const STEM_H = 40;
const BAR_T = 298;
const BAR_H = 4;
const BAR_INSET = 22;
const DROP_T = 302;
const DROP_H = 42;

const DEST_T = 348;
const DEST_H = 38;
const DEST_W = 76;
const DEST_LX = TR_L + 4;
const DEST_RX = TR_L + TR_W - DEST_W - 4;

const ANS_T = 400;
const ANS_H = 32;
const ANS_GAP = 5;
const ANS_W = (TR_W - 2 * ANS_GAP) / 3;

const ANSWERS = [
  { id: 'ident', label: 'IDENTITY', correct: true },
  { id: 'cont', label: 'THE CHAIN', correct: false },
  { id: 'mem', label: 'MEMORY', correct: false },
];

const P = BEATS.map((b) => b.p ?? 0);
const X = BEATS.map((b) => b.x ?? 124);
// The camera, from the staging: it follows the figure this track describes,
// pulls back to scale 1 on every graded beat so a tap lands where it is aimed,
// and leans in on the quote. See followMoves in ./camera.ts.
const CAM = followMoves(X, BEATS.map(kindOf), seedOf('metaphysics13'));
const DIR = dirsFrom(X, 1);
const TRACK = BEATS.map((b) => b.track ?? 0);
const FORK = BEATS.map((b) => b.fork ?? 0);
const BOTH = BEATS.map((b) => b.both ?? 0);

// R7b — the stage follows the control on its own graded beat, and only there.
// Derived from the beat rather than declared as a channel so it cannot fall out
// of step with the control it is about.
const REACT = BEATS.map((b) => (b.interact?.split ? 1 : 0));

export default function Metaphysics13Scene({ clock, bt, bi, i, picked, onPick, dragPos }: SceneApi) {
  const reacting = REACT[i] === 1;
  const heldS = useHeld();
  const cv = useCarry(4);
  const cur = BEATS[i];
  const prev = i > 0 ? BEATS[i - 1] : undefined;

  const trFade = (cur.track ?? 0) !== (prev?.track ?? 0);
  const fkFade = (cur.fork ?? 0) !== (prev?.fork ?? 0);
  const boFade = (cur.both ?? 0) !== (prev?.both ?? 0);
  const stuckOn = (cur.stuck ?? 0) > 0;
  const stuckFade = (cur.stuck ?? 0) !== (prev?.stuck ?? 0);

  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / moveTr(X[p], X[n], 0.85));
    const t = clock.value;
    const grow = ease01(bt.value / 0.55);

    const s = keepHeld(heldS, travelStance(
      X[p], X[n],
      carryFrom(heldS, n, emoteHold(P[p], t)), emoteHold(P[n], t), emoteLive(P[n], t, bt.value),
      tr, WALK,
    ));
    return {
      fig: pose(s, carry(cv, 0, n, X[p], X[n], tr), GROUND, K_FIG, facing(DIR[p], DIR[n], bt.value), 1),
      track: carry(cv, 1, n, TRACK[p], TRACK[n], tr, trFade ? grow : 1),
      fork: carry(cv, 2, n, FORK[p], FORK[n], fkFade ? grow : tr),
      // R7b — the seam fills the two branches, and it peaks in the MIDDLE. Push it to
      // either end and one destination empties; the only place both are equally there
      // is halfway, which is the answer and also why the question is empty.
      both: carry(cv, 3, n, BOTH[p], reacting ? 1 - Math.abs(dragPos.value * 2 - 1) : BOTH[n], boFade ? grow : tr),
      stuck: stuckOn ? (stuckFade ? grow : 1) : 0,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const trackStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.track }));
  const forkStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.fork }));
  const bothStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.both }));
  // The label sits ON the fork and never moves down either drop. It is drawn at the
  // junction because that is where it got stuck.
  const stuckStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.stuck,
    transform: [{ scale: 0.9 + 0.1 * SCENE.value.stuck }],
  }));

  const answered = picked !== null;
  const showPick = (cur.pick ?? 0) > 0 && !!cur.interact;

  return (
    <Animated.View style={styles.scene}>
      <Animated.View style={[styles.layer, trackStyle]} pointerEvents="none">
        <View style={styles.tok}>
          <Text style={styles.tokText} numberOfLines={1}>YOU</Text>
        </View>
        <View style={styles.stem} />
      </Animated.View>

      <Animated.View style={[styles.layer, forkStyle]} pointerEvents="none">
        <View style={styles.bar} />
        <View style={[styles.drop, { left: TR_L + BAR_INSET }]} />
        <View style={[styles.drop, { left: TR_L + TR_W - BAR_INSET - 4 }]} />
      </Animated.View>

      <Animated.View style={[styles.layer, bothStyle]} pointerEvents="none">
        <View style={[styles.dest, { left: DEST_LX }]}>
          <Text style={styles.destText} numberOfLines={1}>EARTH</Text>
        </View>
        <View style={[styles.dest, { left: DEST_RX }]}>
          <Text style={styles.destText} numberOfLines={1}>MARS</Text>
        </View>
      </Animated.View>

      {/* the label that could not choose */}
      <Animated.View style={[styles.stuckTag, stuckStyle]} pointerEvents="none">
        <Text style={styles.stuckText} numberOfLines={1}>THE REAL YOU  ·  ?</Text>
      </Animated.View>

      {showPick &&
        ANSWERS.map((a, k) => {
          const chosen = picked === a.id;
          return (
            <Target id={a.id} correct={a.correct} picked={picked} onPick={onPick}
              key={a.id} style={[styles.ans, { left: TR_L + k * (ANS_W + ANS_GAP) }]} hitSlop={{ top: 6, bottom: 6, left: ANS_GAP / 2, right: ANS_GAP / 2 }} disabled={answered}>
              <View
                style={[
                  styles.ansInner,
                  answered && a.correct && styles.pickRight,
                  answered && chosen && !a.correct && styles.pickWrong,
                ]}
              >
                <Text
                  style={[styles.ansText, answered && a.correct && styles.onInk]}
                  numberOfLines={1}
                >
                  {a.label}
                </Text>
              </View>
            </Target>
          );
        })}

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DF} k={K_FIG} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 24, right: 14, top: GROUND, height: 1.5, backgroundColor: RULE },
  layer: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H },

  tok: {
    position: 'absolute', left: MID - TOK_W / 2, top: TOK_T, width: TOK_W, height: TOK_H,
    borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: INK,
    alignItems: 'center', justifyContent: 'center',
  },
  tokText: {
    fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.6, color: PAPER,
    includeFontPadding: false,
  },
  stem: { position: 'absolute', left: MID - 2, top: STEM_T, width: 4, height: STEM_H, backgroundColor: INK },
  bar: {
    position: 'absolute', left: TR_L + BAR_INSET, top: BAR_T,
    width: TR_W - 2 * BAR_INSET, height: BAR_H, backgroundColor: INK,
  },
  drop: { position: 'absolute', top: DROP_T, width: 4, height: DROP_H, backgroundColor: INK },

  dest: {
    position: 'absolute', top: DEST_T, width: DEST_W, height: DEST_H,
    borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: PAPER,
    alignItems: 'center', justifyContent: 'center',
  },
  destText: {
    fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1, color: INK,
    includeFontPadding: false,
  },

  stuckTag: {
    position: 'absolute', left: MID - 52, top: BAR_T - 26, width: 104, height: 20,
    borderWidth: 1.5, borderColor: INK, borderRadius: 3, backgroundColor: PAPER,
    alignItems: 'center', justifyContent: 'center',
  },
  stuckText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.6, color: INK,
    includeFontPadding: false,
  },

  ans: { position: 'absolute', top: ANS_T, width: ANS_W },
  ansInner: {
    height: ANS_H, borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: PAPER,
    alignItems: 'center', justifyContent: 'center',
  },
  ansText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0, color: INK,
    includeFontPadding: false,
  },
  onInk: { color: PAPER },
  pickRight: { backgroundColor: INK, borderColor: INK },
  pickWrong: { borderColor: SOFT, opacity: 0.45 },
});

// Ink runs from the stuck tag (272) and the YOU token (230) down to the ground line
// (500). Band 224…512 = 288 (H59).
export function Metaphysics13Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Metaphysics13Scene} band={[224, 512]} camera={CAM} />;
}
