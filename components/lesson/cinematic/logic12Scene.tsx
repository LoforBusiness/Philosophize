import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import {
  clamp01, ease01, lerp, mixStance, pose, walk as rigWalk, WALK,
  type Bundle,
} from './rig';
// The whole movement library, not just rig's 49 emotes. Codes under 100 ARE
// rig's and mean exactly what they always did; 100+ reach moves.ts (emoteAny).
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { propAct } from './interact';
import { BEATS } from './logic12Script';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER } from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';

// FOUR DOORS IN ONE WALL, and the answer targets are the doors — the reader answers
// by choosing a way out rather than a sentence (E33). A door here is a FRAME plus a
// LEAF, so the correct one can fill INK like every other answer state (H61) and then
// swing open on its hinge, which is the first door the app has had.
//
// · the wall runs x 84…396 at y 338…346; the four doors hang below it, 66 wide on a
//   78 pitch at x 92 / 170 / 248 / 326, y 352…500. The last ends at x 392.
// · a leaf is inset 4 inside its frame and swings about its LEFT edge
//   (transformOrigin 0% 50%), so scaleX → 0.18 reads as the door standing open
//   rather than as a box shrinking.
// · doors 3 and 4 sit at 0.16 opacity until the lights come up. They are drawn from
//   beat 0 on purpose: the lesson's whole claim is that they were in the room
//   already, so a scene that built them at the turn would contradict its own text (A1).
// · the figure is at x 44 facing right; swept across every pose it holds it reaches
//   x 82, ten clear of the first door.
// · the kicker is at y 314…330 across the wall's width — the highest ink here.

const WALL_L = 84;
const WALL_R = 396;
const WALL_T = 338;

// 62 wide left "NOT THAT" only 3% of clear air inside the leaf (D30). 66 buys 11%,
// and the four doors still stop ten clear of the figure's widest reach.
const DOOR_W = 66;
const DOOR_PITCH = 78;
const DOOR_X = [92, 170, 248, 326];
const DOOR_T = 352;
const DOOR_H = 148;

const FIG_X = 44;
// Where he stands to work the third door. His arm reaches about 33 stage units at
// K_FIG 1, so from 210 the hand arrives at ~243 — on the leaf's hinged left edge
// (248), which is the edge that actually moves when it swings.
const OPEN_X = 210;
const KICK_T = 314;

const DOORS = [
  { id: 'with', label: 'WITH\nUS', offered: true, correct: false },
  { id: 'against', label: 'AGAINST\nUS', offered: true, correct: false },
  { id: 'middle', label: 'ON THIS,\nNOT THAT', offered: false, correct: true },
  { id: 'silent', label: 'SAY\nNOTHING', offered: false, correct: false },
];

const G = BEATS.map((b) => b.g ?? 0);
const LIT = BEATS.map((b) => b.lit ?? 0);

export default function Logic12Scene({ clock, bt, bi, qv, i, picked, onPick }: SceneApi) {
  const cur = BEATS[i];
  const revealing = (cur.pick ?? 0) > 0;

  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / 0.7);      // between beats this is a pose blend
    const t = clock.value;
    const grow = ease01(bt.value / 1.0);

    // ── HE OPENS THE DOOR HIMSELF ──────────────────────────────────────────────
    //
    // The door used to swing on `qv` alone while the figure stood eleven door-widths
    // away with his hands by his sides — a door opening with nobody touching it,
    // which is A1 straight through: the beat says the third way was always there and
    // the picture said it opened by magic.
    //
    // The reveal is now two halves. He WALKS the 166 units to the third door (well
    // past the 60 a walk needs to read as one, C18) and only then does the leaf move,
    // driven by the same `act` that drives his arm — so the swing is caused by the
    // hand rather than merely coincident with it.
    const rv = revealing ? qv.value : 0;
    const arrive = clamp01(rv / 0.45);           // first 45%: cross the room
    const act = clamp01((rv - 0.45) / 0.55);     // then reach out and pull it open
    const fx = lerp(FIG_X, OPEN_X, ease01(arrive));

    let s;
    if (rv <= 0) {
      s = mixStance(emoteHold(G[p], t), emoteLive(G[n], t, bt.value), tr);
    } else if (act <= 0) {
      // Feet are driven by DISTANCE TRAVELLED, not by a clock, so they stay locked
      // to the floor for the whole crossing instead of skating (C17).
      s = mixStance(emoteHold(G[n], t), rigWalk(fx - FIG_X, WALK), ease01(clamp01(arrive / 0.22)));
    } else {
      s = mixStance(rigWalk(OPEN_X - FIG_X, WALK), propAct(7, t, act), ease01(clamp01(act / 0.2)));
    }

    return {
      fig: pose(s, fx, GROUND, K_FIG, 1, 1),
      lit: lerp(LIT[p], LIT[n], grow),
      // The leaf now waits for the hand: nothing moves until he has arrived.
      swing: act,
    };
  });

  const D = useDerivedValue<Bundle>(() => SCENE.value.fig);

  const answered = picked !== null;
  const live = (cur.pick ?? 0) > 0 && !!cur.interact;

  return (
    <Animated.View style={styles.scene}>
      <Text style={styles.kicker} numberOfLines={1}>THE ROOM YOU WERE OFFERED</Text>
      <View style={styles.wall} pointerEvents="none" />

      {DOORS.map((d, k) => (
        <Door
          key={d.id}
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

/** One door: a frame that carries the answer state, and a leaf that swings off it. */
function Door({
  k, SCENE, live, answered, picked, onPick,
}: {
  k: number;
  SCENE: { value: { lit: number; swing: number } };
  live: boolean;
  answered: boolean;
  picked: string | null;
  onPick: (id: string, correct: boolean) => void;
}) {
  const d = DOORS[k];
  const on = answered && d.correct;

  const wrap = useAnimatedStyle(() => ({
    opacity: d.offered ? 1 : 0.16 + 0.84 * clamp01(SCENE.value.lit),
  }));
  const leaf = useAnimatedStyle(() => ({
    transform: [{ scaleX: d.correct ? 1 - 0.82 * SCENE.value.swing : 1 }],
  }));

  return (
    <Animated.View style={[styles.door, { left: DOOR_X[k] }, wrap]}>
      <Target id={d.id} correct={d.correct} picked={picked} onPick={onPick}
              style={styles.fill} disabled={!live || answered}>
        <View
          style={[
            styles.frame,
            on && styles.pickRight,
            answered && picked === d.id && !d.correct && styles.pickWrong,
          ]}
        >
          <Animated.View style={[styles.leaf, leaf]}>
            <Text style={styles.doorText} numberOfLines={2}>{d.label}</Text>
            <View style={styles.knob} />
          </Animated.View>
        </View>
      </Target>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 16, right: 16, top: GROUND, height: 1.5, backgroundColor: RULE },
  fill: { flex: 1 },

  kicker: {
    position: 'absolute', left: WALL_L, top: KICK_T, width: WALL_R - WALL_L,
    fontFamily: 'Inter_700Bold', fontSize: 7.5, letterSpacing: 1.2, color: SOFT,
    textAlign: 'center', includeFontPadding: false,
  },
  wall: { position: 'absolute', left: WALL_L, top: WALL_T, width: WALL_R - WALL_L, height: 8, backgroundColor: INK },

  door: { position: 'absolute', top: DOOR_T, width: DOOR_W, height: DOOR_H },
  frame: {
    flex: 1, borderWidth: 2, borderColor: INK, backgroundColor: PAPER,
  },
  // Hinged on its LEFT edge, so scaleX reads as swinging rather than shrinking.
  leaf: {
    position: 'absolute', left: 4, top: 4, right: 4, bottom: 4,
    borderWidth: 1.5, borderColor: INK, backgroundColor: PAPER,
    alignItems: 'center', paddingTop: 12, transformOrigin: '0% 50%',
  },
  doorText: {
    fontFamily: 'Inter_700Bold', fontSize: 8, lineHeight: 10.5, letterSpacing: 0.3, color: INK,
    textAlign: 'center', includeFontPadding: false,
  },
  knob: { position: 'absolute', right: 7, top: DOOR_H / 2 - 12, width: 7, height: 7, borderRadius: 4, backgroundColor: INK },

  pickRight: { backgroundColor: INK, borderColor: INK },
  pickWrong: { borderColor: SOFT, opacity: 0.45 },
});

// Ink runs from the kicker (314) to the ground line (500). Band 308…512 = 204 (H59).
export function Logic12Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Logic12Scene} band={[308, 512]} />;
}
