import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import {
  WALK, dirsFrom, ease01, lerp, moveTr, pose, travelStance, type Bundle,
} from './rig';
// The whole movement library, not just rig's 49 emotes. Codes under 100 ARE
// rig's and mean exactly what they always did; 100+ reach moves.ts (emoteAny).
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './political15Script';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER } from './cinematicKit';
import { followMoves, kindOf, seedOf } from './camera';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';

// A four-stage stair, stage right. The stages are the tap targets.
//
// · figure WALKS x = 70 → 168 → 124; widest span x 132…204 at 168, fist to 204.5.
//   All stair ink is at x ≥ 216, and the deepest indent only moves it further right.
// · header y 226…238 · stages y 248…394 on a 38 pitch · the protest rail runs down
//   the left of the first three. A standing crown is y 397.
// · A5 — the stair is a diagram out of reach (hand tops out at y 411, B11b).
//
// EACH STAGE IS INDENTED BY ITS INDEX, so the stair reads as a climb without any
// rotation — and the answer targets are the stages themselves, so there is no
// second list to keep in step with the first (E33). A 38-unit pitch at this
// lesson's fit of 2.22 is 84dp centre to centre (E37b-2).

const ST_L = 216;
const ST_W = 176;
const INDENT = 10;

const HEAD_T = 226;

// STG_ rather than STAGE_: `STAGE_H` is the 560-unit design space imported from the
// kit, and a local of that name shadowed it — the scene's own root style then sized
// itself to a 32-unit box.
const STG_T = 248;
const STG_H = 32;
const STG_PITCH = 38;
const STG_SLOP = (STG_PITCH - STG_H) / 2;

const STAGES = [
  { id: 'name', label: '1 · NAME THE INJUSTICE', correct: false },
  { id: 'lawful', label: '2 · TRY LAWFUL ROUTES', correct: false },
  { id: 'breach', label: '3 · BREAK IT OPENLY', correct: false },
  { id: 'penalty', label: '4 · ACCEPT THE PENALTY', correct: true },
];

const P = BEATS.map((b) => b.p ?? 0);
const X = BEATS.map((b) => b.x ?? 124);
// The camera, from the staging: it follows the figure this track describes,
// pulls back to scale 1 on every graded beat so a tap lands where it is aimed,
// and leans in on the quote. See followMoves in ./camera.ts.
const CAM = followMoves(X, BEATS.map(kindOf), seedOf('political15'));
const DIR = dirsFrom(X, 1);
const NSTAGES = BEATS.map((b) => b.stages ?? 0);

export default function Political15Scene({ clock, bt, bi, i, picked, onPick }: SceneApi) {
  const cur = BEATS[i];
  const prev = i > 0 ? BEATS[i - 1] : undefined;

  const shown = cur.stages ?? 0;
  const prevShown = prev?.stages ?? 0;
  const nightOn = (cur.night ?? 0) > 0;
  const nightFade = (cur.night ?? 0) !== (prev?.night ?? 0);

  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / moveTr(X[p], X[n], 0.85));
    const t = clock.value;
    const grow = ease01(bt.value / 0.55);

    const s = travelStance(
      X[p], X[n],
      emoteHold(P[p], t), emoteHold(P[n], t), emoteLive(P[n], t, bt.value),
      tr, WALK,
    );
    return {
      fig: pose(s, lerp(X[p], X[n], tr), GROUND, K_FIG, DIR[n], 1),
      fill: lerp(NSTAGES[p], NSTAGES[n], grow),
      night: nightOn ? (nightFade ? grow : 1) : 0,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  // The protest's rail covers the first THREE stages and stops. Its height is a
  // constant derived from the pitch, so it cannot accidentally reach the fourth.
  const nightStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.night,
    transform: [{ scaleY: SCENE.value.night }],
  }));

  const answered = picked !== null;
  const live = (cur.pick ?? 0) > 0 && !!cur.interact;

  return (
    <Animated.View style={styles.scene}>
      <Text style={styles.head} numberOfLines={1} pointerEvents="none">THE FOUR STAGES</Text>

      {/* what the night-time protest actually did: three stages and out */}
      <Animated.View style={[styles.night, nightStyle]} pointerEvents="none" />
      <Animated.Text style={[styles.nightLab, nightStyle]} numberOfLines={1} pointerEvents="none">
        THIS PROTEST
      </Animated.Text>

      {STAGES.map((s, k) => (
        <Stage
          key={s.id}
          index={k}
          stage={s}
          shown={shown}
          prevShown={prevShown}
          live={live}
          answered={answered}
          picked={picked}
          onPick={onPick}
          SCENE={SCENE}
        />
      ))}

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DF} k={K_FIG} />
    </Animated.View>
  );
}

function Stage({
  index, stage, shown, prevShown, live, answered, picked, onPick, SCENE,
}: {
  index: number;
  stage: { id: string; label: string; correct: boolean };
  shown: number; prevShown: number; live: boolean; answered: boolean;
  picked: string | null;
  onPick: (id: string, correct: boolean) => void;
  SCENE: { value: { fill: number } };
}) {
  const held = index < prevShown;
  const arriving = index >= prevShown && index < shown;
  const st = useAnimatedStyle(() => {
    if (held) return { opacity: 1, transform: [{ translateY: 0 }] };
    if (!arriving) return { opacity: 0, transform: [{ translateY: -6 }] };
    const a = Math.max(0, Math.min(1, SCENE.value.fill - index));
    return { opacity: a, transform: [{ translateY: (1 - a) * -6 }] };
  });
  const chosen = picked === stage.id;
  return (
    <Animated.View
      style={[
        styles.stageWrap,
        { top: STG_T + index * STG_PITCH, left: ST_L + index * INDENT, width: ST_W - index * INDENT },
        st,
      ]}
    >
      <Target id={stage.id} correct={stage.correct} picked={picked} onPick={onPick}
              disabled={!live || answered} hitSlop={{ top: STG_SLOP, bottom: STG_SLOP, left: 0, right: 0 }}>
        <View
          style={[
            styles.stage,
            answered && stage.correct && styles.pickRight,
            answered && chosen && !stage.correct && styles.pickWrong,
          ]}
        >
          <Text
            style={[styles.stageText, answered && stage.correct && styles.onInk]}
            numberOfLines={1}
          >
            {stage.label}
          </Text>
        </View>
      </Target>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 24, right: 14, top: GROUND, height: 1.5, backgroundColor: RULE },

  head: {
    position: 'absolute', left: ST_L, top: HEAD_T, width: ST_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.5, letterSpacing: 1.4, color: SOFT,
    includeFontPadding: false,
  },

  night: {
    position: 'absolute', left: ST_L - 8, top: STG_T, width: 4,
    height: 3 * STG_PITCH - (STG_PITCH - STG_H), backgroundColor: INK,
    transformOrigin: '50% 0%',
  },
  nightLab: {
    position: 'absolute', left: ST_L - 8, top: STG_T + 3 * STG_PITCH - 6, width: 90,
    fontFamily: 'Inter_700Bold', fontSize: 7.5, letterSpacing: 1, color: SOFT,
    includeFontPadding: false,
  },

  stageWrap: { position: 'absolute' },
  stage: {
    height: STG_H, borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: PAPER,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8,
  },
  stageText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.5, letterSpacing: 0, color: INK,
    includeFontPadding: false,
  },
  onInk: { color: PAPER },
  pickRight: { backgroundColor: INK, borderColor: INK },
  pickWrong: { borderColor: SOFT, opacity: 0.45 },
});

// Ink runs from the header (226) to the ground line (500). The protest rail sits at
// x 208, left of the stair, which is still clear of the figure's 204.5.
// Band 220…512 = 292 (H59).
export function Political15Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Political15Scene} band={[220, 512]} camera={CAM} />;
}
