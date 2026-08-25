import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { ease01, moveTr, pose, travelStance, WALK, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './political24Script';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER,
  useHeld, carryFrom, keepHeld, useCarry, carry,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// ─────────────────────────────────────────────────────────────────────────────
// WHERE A LANGUAGE IS ALLOWED TO APPEAR, AND HOW MANY STILL SPEAK IT.
//
// THE COMPOSITION, IN NUMBERS (H56).
//
// · THREE PLACE PLATES, 104×54, at x 24 · 148 · 272, y 244…298. Each carries an
//   8pt kicker at y 252 and two ink WORD BARS at y 272 and y 282 — 62×5 and
//   40×5. The bars are the language itself: a plate whose words have gone pale
//   is a place it is no longer printed, and no caption has to say so (A1).
// · the FIRST TWO plates are the public ones and dim together. the THIRD is
//   private and is lit on every beat of the lesson, which is the entire point
//   of the first question.
// · FIVE SPEAKER BARS, 60 wide, at x 28 · 98 · 168 · 238 · 308, standing on
//   y 366. Held they run 52 · 51 · 50 · 49 · 48; abandoned they run
//   52 · 37 · 24 · 13 · 5. Both profiles start at the same height, because the
//   generation alive now is the same either way and only what follows differs.
// · the CAPTION SPEAKERS, BY GENERATION sits at y 302, in the 12 units between
//   the plates and the tallest bar.
// · the FIGURE walks x 200 → 132 → 268 on GROUND 500; crown ≈ 397, and the
//   lowest ink is the bar floor at y 366, so 31 units stay clear.
//
// Ink runs y 244 (the plates) … y 500. BAND 238…512 = 274, with the 103-unit
// figure at 37.6%.
// ─────────────────────────────────────────────────────────────────────────────

/** Crossfade for a beat that does NOT walk. 0.85 is the base `footfalls` assumes. */
const BASE_TR = 0.85;

const PL_Y = 244;
const PL_W = 104;
const PL_H = 54;
const PL_X = [24, 148, 272];
const PL_KICK = ['IN COURT', 'IN SCHOOL', 'IN PRIVATE'];

const CAP_Y = 302;

const BAR_X = [28, 98, 168, 238, 308];
const BAR_W = 60;
const BAR_BASE = 366;
const BAR_HELD = [52, 51, 50, 49, 48];
const BAR_GONE = [52, 37, 24, 13, 5];

const FIG_X = 200;

const X = BEATS.map((b) => b.x ?? FIG_X);
const P = BEATS.map((b) => b.p ?? 0);
const SIGNS = BEATS.map((b) => b.signs ?? 0);
const PUB = BEATS.map((b) => b.pub ?? 0);
const LIVE = BEATS.map((b) => b.live ?? 0);

// On its own lever beat the arm drives the whole stage (R7): the two public
// plates light as it travels and the generations stand back up behind them.
// The prompt asks what would keep those bars standing, and the reader can
// simply watch it happen instead of being told.
const PULL = BEATS.map((b) => (b.interact?.lever ? 1 : 0));

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('political24'));

export default function Political24Scene({
  clock, bt, bi, i, picked, onPick, dragPos,
}: SceneApi) {
  const heldFig = useHeld();
  const cv = useCarry(3);
  const pulling = PULL[i] === 1;
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
      fig: pose(figS, carry(cv, 0, n, X[p], X[n], tr), GROUND, K_FIG, 1, 1),
      signs: carry(cv, 1, n, SIGNS[p], SIGNS[n], tr),
      // Through `carry` so the arm takes over across the transition rather than
      // on one frame — see metaphysics21Scene for why that matters.
      pub: carry(cv, 2, n, PUB[p], pulling ? dragPos.value : PUB[n], tr),
      t,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const answered = picked !== null;
  const live = !!BEATS[i]?.interact && !BEATS[i]?.interact?.cards && LIVE[i] === 1;

  const signStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.signs }));

  const plates = [0, 1, 2];
  const bars = [0, 1, 2, 3, 4];

  return (
    <View style={styles.scene}>
      <Animated.View style={[StyleSheet.absoluteFill, signStyle]} pointerEvents="none">
        {PL_X.map((px, k) => (
          <View key={px}>
            <View style={[styles.plate, { left: px }]} />
            <Text style={[styles.kicker, { left: px }]}>{PL_KICK[k]}</Text>
          </View>
        ))}
        <Text style={styles.caption}>SPEAKERS, BY GENERATION</Text>
      </Animated.View>

      {plates.map((k) => <Words key={`w${k}`} S={SCENE} k={k} />)}
      {bars.map((k) => <Bar key={`b${k}`} S={SCENE} k={k} />)}

      {plates.map((k) => (
        <Target
          key={`p${k}`}
          id={`place${k}`}
          correct={k === 2}
          picked={picked}
          onPick={onPick}
          disabled={!live || answered}
          style={[styles.hit, { left: PL_X[k] }]}
        >
          <View
            style={[
              styles.hitBox,
              k === 2 ? (answered && styles.right) : (answered && picked === `place${k}` && styles.wrong),
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

/** The language on plate k. Plate 2 is private and never goes out. */
function Words({ S, k }: { S: { value: { signs: number; pub: number } }; k: number }) {
  const st = useAnimatedStyle(() => {
    const lit = k === 2 ? 1 : 0.14 + 0.86 * S.value.pub;
    return { opacity: S.value.signs * lit };
  });
  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, st]}>
      <View style={[styles.word, { left: PL_X[k] + 12, top: 272, width: 62 }]} />
      <View style={[styles.word, { left: PL_X[k] + 12, top: 282, width: 40 }]} />
    </Animated.View>
  );
}

/** Generation k, counted. It follows the public plates and nothing else. */
function Bar({ S, k }: { S: { value: { signs: number; pub: number } }; k: number }) {
  const st = useAnimatedStyle(() => {
    const h = BAR_GONE[k] + (BAR_HELD[k] - BAR_GONE[k]) * S.value.pub;
    return { opacity: S.value.signs, height: h, top: BAR_BASE - h };
  });
  return <Animated.View pointerEvents="none" style={[styles.bar, { left: BAR_X[k] }, st]} />;
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 20, right: 14, top: GROUND, height: 1.5, backgroundColor: RULE },

  plate: {
    position: 'absolute', top: PL_Y, width: PL_W, height: PL_H,
    borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: PAPER,
  },
  kicker: {
    position: 'absolute', top: PL_Y + 8, width: PL_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1, color: SOFT, includeFontPadding: false,
  },
  word: { position: 'absolute', height: 5, backgroundColor: INK, borderRadius: 2 },

  caption: {
    position: 'absolute', left: BAR_X[0], top: CAP_Y,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.1, color: SOFT, includeFontPadding: false,
  },
  bar: { position: 'absolute', width: BAR_W, backgroundColor: INK, borderTopLeftRadius: 3, borderTopRightRadius: 3 },

  hit: { position: 'absolute', top: PL_Y, width: PL_W, height: PL_H },
  hitBox: { width: PL_W, height: PL_H, borderRadius: 4 },
  right: { borderWidth: 3, borderColor: INK },
  wrong: { borderWidth: 1.5, borderColor: SOFT, borderStyle: 'dashed', opacity: 0.5 },
});

export function Political24Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Political24Scene} band={[238, 512]} camera={CAM} />;
}
