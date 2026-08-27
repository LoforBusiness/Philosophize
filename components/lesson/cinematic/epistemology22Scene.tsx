import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { clamp01, ease01, moveTr, pose, travelStance, WALK, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './epistemology22Script';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, STONE, SOFT, RULE, PAPER,
  useHeld, carryFrom, keepHeld, useCarry, carry,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target, { useAnswerRise } from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// ─────────────────────────────────────────────────────────────────────────────
// A ROAD AND A LINE OF STEPPING STONES, ARRIVING AT THE SAME DOOR.
//
// THE COMPOSITION, IN NUMBERS (H56).
//
// · the DESTINATION is a 56×56 box at x 306…362, y 268…324, captioned THE
//   ADDRESS at y 252. It is the only thing both routes touch.
// · the ROAD is a continuous 4-thick rule at y 278, x 40…306. The STONE ROUTE is
//   seven 22-wide slabs at y 330, from x 40 stepping 38 — so it runs x 40…306 as
//   well and ends at the same door. Same start, same end, same length: the only
//   difference in the drawing is the 16-unit gaps.
// · the TOKENS are 16px discs that travel their own route on `run`, and they
//   ARRIVE TOGETHER. Nothing about the journey is drawn as harder for one of
//   them, because on the day it was not.
// · the GAPS are marked only once `gaps` runs, as short hairline ticks in each
//   space. The stones are drawn from the first beat; what arrives later is the
//   reader's attention to what is between them.
// · the FIGURE walks x 200 → 132 → 268 on GROUND 500; crown ≈ 397, and the stone
//   route sits at y 330…344, so 53 units stay clear.
//
// Ink runs y 252 (the caption) … y 500. BAND 246…512 = 266, comfortably inside
// the free-scale line, with the 103-unit figure at 39% — over H58's 38%, so the
// band is opened to 240…512 = 272 and the figure sits at 38%.
// ─────────────────────────────────────────────────────────────────────────────

/** Crossfade for a beat that does NOT walk. 0.85 is the base `footfalls` assumes. */
const BASE_TR = 0.85;

const START_X = 40;
const END_X = 306;
const ROAD_Y = 278;
const STONE_Y = 330;
const STONE_W = 22;
const STONE_N = 7;
const STONE_STEP = (END_X - START_X) / STONE_N;

const DEST_X = 306;
const DEST_Y = 268;
const DEST_W = 56;
const DEST_H = 56;

const TOKEN = 16;

const FIG_X = 200;

const X = BEATS.map((b) => b.x ?? FIG_X);
const P = BEATS.map((b) => b.p ?? 0);
const ROUTES = BEATS.map((b) => b.routes ?? 0);
const RUN = BEATS.map((b) => b.run ?? 0);
const GAPS = BEATS.map((b) => b.gaps ?? 0);
const LIVE = BEATS.map((b) => b.live ?? 0);

// R7b — the stage follows the control on its own graded beat, and only there.
// Derived from the beat rather than declared as a channel so it cannot fall out
// of step with the control it is about.
const REACT = BEATS.map((b) => (b.interact?.plot ? 1 : 0));

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('epistemology22'));

export default function Epistemology22Scene({ clock, bt, bi, i, picked, onPick, dragPos }: SceneApi) {
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
      fig: pose(figS, carry(cv, 0, n, X[p], X[n], tr), GROUND, K_FIG, 1, 1),
      routes: carry(cv, 1, n, ROUTES[p], ROUTES[n], tr),
      run: carry(cv, 2, n, RUN[p], RUN[n], tr),
      // R7c — `pos` is the MEAN of the drawn curve, which is how often the guesser
      // arrives. Draw a high one and the gaps under the lucky route close.
      gaps: carry(cv, 3, n, GAPS[p], reacting ? 1 - dragPos.value : GAPS[n], tr),
      t,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const answered = picked !== null;
  const live = !!BEATS[i]?.interact && !BEATS[i]?.interact?.cards && LIVE[i] === 1;

  const allStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.routes }));
  const gapStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.gaps }));
  const roadTok = useAnimatedStyle(() => ({
    transform: [{ translateX: (END_X - START_X - TOKEN) * SCENE.value.run }],
  }));
  const stoneTok = useAnimatedStyle(() => ({
    transform: [{ translateX: (END_X - START_X - TOKEN) * SCENE.value.run }],
  }));

  const stones: number[] = [];
  for (let k = 0; k < STONE_N; k += 1) stones.push(k);

  // THE ROAD IS THE ANSWER — the lane and the name of how it was got (E39).
  const roadRise = useAnswerRise(picked, 'road', true);

  return (
    <View style={styles.scene}>
      <Animated.View style={[StyleSheet.absoluteFill, allStyle]} pointerEvents="none">
        <Text style={styles.destCap}>THE ADDRESS</Text>
        <View style={styles.dest} />

        <Animated.View style={roadRise} pointerEvents="none">
          <Text style={[styles.lane, { top: ROAD_Y - 16 }]}>ASKED SOMEBODY WHO KNEW</Text>
          <View style={styles.road} />
        </Animated.View>

        <Text style={[styles.lane, { top: STONE_Y - 16 }]}>GUESSED</Text>
        {stones.map((k) => (
          <View key={k} style={[styles.stone, { left: START_X + k * STONE_STEP }]} />
        ))}
      </Animated.View>

      {/* THE GAPS. The stones were always there; the spaces get named later. */}
      <Animated.View style={[StyleSheet.absoluteFill, gapStyle]} pointerEvents="none">
        {stones.slice(0, -1).map((k) => (
          <View key={`g${k}`} style={[styles.gap, { left: START_X + k * STONE_STEP + STONE_W + 3 }]} />
        ))}
      </Animated.View>

      <Animated.View style={[styles.tok, { top: ROAD_Y - TOKEN / 2, left: START_X }, roadTok]} pointerEvents="none" />
      <Animated.View style={[styles.tok, { top: STONE_Y - TOKEN / 2 - 2, left: START_X }, stoneTok]} pointerEvents="none" />

      <Target
        id="road" correct picked={picked} onPick={onPick}
        disabled={!live || answered} style={[styles.hit, { top: ROAD_Y - 20 }]}
      >
        <View style={[styles.hitBox, answered && styles.right]} pointerEvents="none" />
      </Target>
      <Target
        id="stones" correct={false} picked={picked} onPick={onPick}
        disabled={!live || answered} style={[styles.hit, { top: STONE_Y - 20 }]}
      >
        <View style={[styles.hitBox, answered && picked === 'stones' && styles.wrong]} pointerEvents="none" />
      </Target>

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DF} k={K_FIG} />
    </View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 20, right: 14, top: GROUND, height: 1.5, backgroundColor: RULE },
  // THE FLOOR THE GROUND LINE SITS ON. A rule on its own leaves the
  // figure and everything it is looking at standing on bare page;
  // political7 and political8 both stand their subject on a filled mass.
  floor: { position: 'absolute', left: 0, right: 0, top: GROUND, bottom: 0, backgroundColor: RULE },

  destCap: {
    position: 'absolute', left: DEST_X, top: 252, width: DEST_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.8, color: SOFT, includeFontPadding: false,
  },
  dest: {
    position: 'absolute', left: DEST_X, top: DEST_Y, width: DEST_W, height: DEST_H,
    borderWidth: 2.5, borderColor: INK, borderRadius: 4, backgroundColor: STONE,
  },

  lane: {
    position: 'absolute', left: START_X, width: 240,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.9, color: SOFT, includeFontPadding: false,
  },
  road: {
    position: 'absolute', left: START_X, top: ROAD_Y - 2, width: END_X - START_X, height: 4,
    backgroundColor: INK, borderRadius: 2,
  },
  stone: {
    position: 'absolute', top: STONE_Y - 2, width: STONE_W, height: 4,
    backgroundColor: INK, borderRadius: 2,
  },
  gap: { position: 'absolute', top: STONE_Y + 6, width: 12, height: 1, backgroundColor: SOFT },

  tok: {
    position: 'absolute', width: TOKEN, height: TOKEN, borderRadius: TOKEN / 2,
    borderWidth: 2.5, borderColor: INK, backgroundColor: PAPER,
  },

  hit: { position: 'absolute', left: START_X - 6, width: END_X - START_X + 12, height: 40 },
  hitBox: { width: 278, height: 40, borderRadius: 6 },
  right: { borderWidth: 3, borderColor: INK },
  wrong: { borderWidth: 1.5, borderColor: SOFT, borderStyle: 'dashed', opacity: 0.5 },
});

export function Epistemology22Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Epistemology22Scene} band={[240, 512]} camera={CAM} />;
}
