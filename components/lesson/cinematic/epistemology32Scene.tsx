import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import {
  clamp01, ease01, lerp, mixStance, pose, type Bundle,
} from './rig';
// The whole movement library, not just rig's 49 emotes. Codes under 100 ARE
// rig's and mean exactly what they always did; 100+ reach moves.ts (emoteAny).
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './epistemology32Script';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, STONE, SOFT, RULE, PAPER, useHeld, carryFrom, keepHeld, lookPose,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// FOUR MAPS OF ONE COAST, and the answer targets are the four panels — you answer by
// picking a SCALE (E33). The four profiles come out of a single `coast()` function
// sampled at 1, 5 and 13 points, so they are literally the same coastline drawn at
// different resolutions rather than four decorative shapes (A1).
//
// · the board is 2 × 2: panels 124 × 92 at x 120 / 258 and y 302 / 408, with 14 of
//   gutter. The bottom row's bottom edge IS the ground line at 500, so the board
//   stands on the floor rather than hovering over it.
// · inside a panel: art x 6…118, y 6…58 (bars grow up off y 58), then the scale and
//   the name at y 60…86.
// · the figure is at x 56 facing right; its widest ink is a fist at x 89, thirty-one
//   clear of the board. Its crown is y 397, level with the gutter between the rows.
// · the kicker sits at y 280…296 across the board's width, the highest ink here.
//
// Detail DRAWS IN bar by bar (`maps`), so the reader watches usefulness climb through
// the first three panels and fall off a cliff at the fourth — which is the argument,
// not an illustration of it (H64).

const PAN_W = 124;
const PAN_H = 92;
const COL = [120, 258];
const ROW = [302, 408];
const PAD = 6;
const ART_W = PAN_W - PAD * 2;      // 112
const ART_H = 52;

const FIG_X = 56;
const KICK_T = 280;

/** One coastline, as a height in art units. Sampling it more finely is the whole point. */
function coast(u: number) {
  const v = 0.44 + 0.30 * Math.sin(u * 7.1) + 0.18 * Math.sin(u * 3.3 + 1.2) + 0.10 * Math.sin(u * 13.7 + 2.4);
  return Math.max(0.14, Math.min(1, v)) * 48;
}
function profile(n: number) {
  return Array.from({ length: n }, (_, j) => coast((j + 0.5) / n));
}

const MAPS = [
  // The first and last are single bars on purpose: one stroke for the whole country,
  // and — at one to one — the single rock that is all the frame can hold.
  { scale: '1 : 10 000 000', name: 'ONE LINE', bars: [6], correct: false },
  { scale: '1 : 200 000', name: 'THE COAST', bars: profile(5), correct: true },
  { scale: '1 : 2 000', name: 'EVERY ROCK', bars: profile(13), correct: false },
  { scale: '1 : 1', name: 'ONE ROCK', bars: [50], correct: false },
];

const G = BEATS.map((b) => b.g ?? 0);

// THE CAMERA (H60b). `followMoves` reads the x track and gives each beat its own
// shot: it FOLLOWS him when a beat moves him far enough to be worth following,
// pushes close on a quote, and PULLS BACK to the whole band on a question or a
// summary — the beats the reader has to read and act on. Beats that do not set
// `x` stand at FIG_X, so a still lesson gets the one-in-three push rather than a
// camera that never rests.
const X = BEATS.map((b) => b.x ?? FIG_X);

// R7b — the stage follows the control on its own graded beat, and only there.
// Derived from the beat rather than declared as a channel so it cannot fall out
// of step with the control it is about.
const REACT = BEATS.map((b) => (b.interact?.drag ? 1 : 0));
const CAM = followMoves(X, BEATS.map(kindOf), seedOf('epistemology32'));

export default function Epistemology32Scene({ clock, bt, bi, i, picked, onPick, dragPos, gazeX, gazeY, gazeOn }: SceneApi) {
  const reacting = REACT[i] === 1;
  const heldS = useHeld();
  const cur = BEATS[i];
  const prev = i > 0 ? BEATS[i - 1] : undefined;

  const shownMaps = cur.maps ?? 0;
  const prevMaps = prev?.maps ?? 0;

  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / 0.7);      // nobody walks; this is a pose blend
    const t = clock.value;
    // A panel takes 1.1s to fill, so two arriving together read as two events.
    const draw = ease01(bt.value / 1.1);
    const s = keepHeld(heldS, mixStance(carryFrom(heldS, n, emoteHold(G[p], t)), emoteLive(G[n], t, bt.value), tr));
    return {
      fig: lookPose(s, FIG_X, GROUND, K_FIG, 1, 1, gazeX.value, gazeY.value, gazeOn.value),
      // R7c — the four panels ARE the detail the drag is about, so they fill and empty
      // under the reader's thumb: almost nothing at one end, the thing itself at the
      // other.
      maps: lerp(prevMaps, reacting ? dragPos.value * 4 : shownMaps, draw),
    };
  });

  const D = useDerivedValue<Bundle>(() => SCENE.value.fig);

  const answered = picked !== null;
  const live = (cur.pick ?? 0) > 0 && !!cur.interact;

  return (
    <Animated.View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      <Text style={styles.kicker} numberOfLines={1}>THE SAME COAST, FOUR TIMES</Text>

      {MAPS.map((m, k) => (
        <Panel
          key={m.name}
          k={k}
          SCENE={SCENE}
          live={live}
          answered={answered}
          picked={picked}
          onPick={onPick}
        />
      ))}

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={D} k={K_FIG} />
    </Animated.View>
  );
}

/** One map. Its bars draw in left to right, then it holds (C20c). */
function Panel({
  k, SCENE, live, answered, picked, onPick,
}: {
  k: number;
  SCENE: { value: { maps: number } };
  live: boolean;
  answered: boolean;
  picked: string | null;
  onPick: (id: string, correct: boolean) => void;
}) {
  const m = MAPS[k];
  const id = `map${k}`;
  const n = m.bars.length;
  const pitch = ART_W / n;
  const barW = Math.max(2, pitch * (n > 1 ? 0.72 : 1));
  const on = answered && m.correct;

  const label = useAnimatedStyle(() => ({ opacity: clamp01(SCENE.value.maps - k) }));

  return (
    <Target
      id={id}
      correct={m.correct}
      picked={picked}
      onPick={onPick}
      style={[styles.panel, { left: COL[k % 2], top: ROW[k > 1 ? 1 : 0] }]}
      disabled={!live}
    >
      <View
        style={[
          styles.panelInner,
          on && styles.pickRight,
          answered && picked === id && !m.correct && styles.pickWrong,
        ]}
      >
        <View style={styles.art} pointerEvents="none">
          {m.bars.map((h, j) => (
            <Bar
              key={j}
              k={k}
              j={j}
              n={n}
              h={h}
              left={j * pitch + (pitch - barW) / 2}
              w={barW}
              onInk={on}
              SCENE={SCENE}
            />
          ))}
        </View>
        <Animated.View style={[styles.labels, label]} pointerEvents="none">
          <Text style={[styles.scaleText, on && styles.onInkSoft]} numberOfLines={1}>{m.scale}</Text>
          <Text style={[styles.nameText, on && styles.onInk]} numberOfLines={1}>{m.name}</Text>
        </Animated.View>
      </View>
    </Target>
  );
}

/** One sample of the coast. Grows off the baseline, never off its own centre. */
function Bar({
  k, j, n, h, left, w, onInk, SCENE,
}: {
  k: number; j: number; n: number; h: number; left: number; w: number;
  onInk: boolean;
  SCENE: { value: { maps: number } };
}) {
  const st = useAnimatedStyle(() => ({
    transform: [{ scaleY: clamp01(clamp01(SCENE.value.maps - k) * n - j) }],
  }));
  return (
    <Animated.View
      style={[styles.bar, { left, width: w, height: h }, onInk && styles.barOnInk, st]}
      pointerEvents="none"
    />
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 14, right: 14, top: GROUND, height: 1.5, backgroundColor: RULE },
  // THE FLOOR THE GROUND LINE SITS ON. A rule on its own leaves the
  // figure and everything it is looking at standing on bare page;
  // political7 and political8 both stand their subject on a filled mass.
  floor: { position: 'absolute', left: 0, right: 0, top: GROUND, bottom: 0, backgroundColor: RULE },

  kicker: {
    position: 'absolute', left: COL[0], top: KICK_T, width: COL[1] + PAN_W - COL[0],
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.2, color: SOFT,
    textAlign: 'center', includeFontPadding: false,
  },

  panel: { position: 'absolute', width: PAN_W, height: PAN_H },
  panelInner: {
    flex: 1, borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: STONE,
  },
  art: { position: 'absolute', left: PAD, top: PAD, width: ART_W, height: ART_H },
  bar: { position: 'absolute', bottom: 0, backgroundColor: INK, transformOrigin: '50% 100%' },
  barOnInk: { backgroundColor: PAPER },

  labels: { position: 'absolute', left: PAD, right: PAD, top: 60, alignItems: 'center' },
  scaleText: {
    fontFamily: 'Inter_500Medium', fontSize: 8.6, letterSpacing: 0.8, color: INK,
    includeFontPadding: false,
  },
  nameText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.4, color: INK, marginTop: 2,
    includeFontPadding: false,
  },

  onInk: { color: PAPER },
  onInkSoft: { color: RULE },
  pickRight: { backgroundColor: INK, borderColor: INK },
  pickWrong: { borderColor: SOFT },
});

// Ink runs from the kicker (280) to the ground line (500). Band 274…512 = 238 (H59).
export function Epistemology32Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Epistemology32Scene} band={[274, 512]} camera={CAM} />;
}
