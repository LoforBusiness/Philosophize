import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import {
  clamp01, ease01, emoteHold, emoteLive, lerp, mixStance, pose, type Bundle,
} from './rig';
import { BEATS } from './epistemology31Script';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER } from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';

// A CABINET WHOSE DRAWERS SLIDE OUT, and a door nobody walks to. The answer targets
// are containers rather than cards — three drawers and the door — so choosing an
// answer is choosing which thing to open (E33). Their inners carry the ordinary
// answer state so a correct pick still looks like every other one in the app (H61).
//
// · the cabinet frame is x 18…160, y 320…500 — it stands ON the ground line.
// · three drawers inside it at x 27, w 124, h 48, tops y 329 / 386 / 443. Nine units
//   of padding all round, which is what makes 3 × 48 + 2 × 9 come to exactly 180.
// · a drawer slides RIGHT by 30, so the furthest ink a drawer can reach is x 181.
// · the door is x 306…366, y 352…500 — also on the ground, its handle at (354, 430).
// · the figure stands at x 236 FACING LEFT (dir −1). Measured across every pose it
//   holds it sweeps x 197…268: sixteen clear of the open drawers on one side and
//   thirty-eight clear of the door on the other, with its back to the door, which is
//   the whole joke of the picture. It was at 226 until the sweep was measured rather
//   than estimated off the arm's reach — that put it six from an open drawer.
// · the kicker sits above the cabinet at y 296…314, the highest ink in the scene.
//
// A drawer's LABEL fades in with its slide, so a closed cabinet is three blank
// fronts and the argument accumulates as the drawers come out (C20c).

const CAB_L = 18;
const CAB_T = 320;
const CAB_W = 142;
const CAB_H = 180;

const DRW_L = 27;
const DRW_W = 124;
const DRW_H = 48;
const DRW_T0 = 329;
const DRW_PITCH = 57;
const SLIDE = 30;

const DOOR_L = 306;
const DOOR_T = 352;
const DOOR_W = 60;
const DOOR_H = 148;

const FIG_X = 236;
const KICK_T = 296;

const LABELS = ['I LOCKED IT', 'I REMEMBER\nCHECKING', 'AND I REMEMBER\nTHAT'];

const G = BEATS.map((b) => b.g ?? 0);

export default function Epistemology31Scene({ clock, bt, bi, i, picked, onPick }: SceneApi) {
  const cur = BEATS[i];
  const prev = i > 0 ? BEATS[i - 1] : undefined;

  const shownOpen = cur.open ?? 0;
  const prevOpen = prev?.open ?? 0;

  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / 0.7);      // nobody walks; this is a pose blend
    const t = clock.value;
    // A drawer takes its own time to come out — 0.9s per drawer, so the pull reads
    // as a pull rather than a jump (C17).
    const slide = ease01(bt.value / 0.9);
    const s = mixStance(emoteHold(G[p], t), emoteLive(G[n], t, bt.value), tr);
    return {
      fig: pose(s, FIG_X, GROUND, K_FIG, -1, 1),
      open: lerp(prevOpen, shownOpen, slide),
    };
  });

  const D = useDerivedValue<Bundle>(() => SCENE.value.fig);

  const answered = picked !== null;
  const live = (cur.pick ?? 0) > 0 && !!cur.interact;

  return (
    <Animated.View style={styles.scene}>
      <Text style={styles.kicker} numberOfLines={1}>WHAT I REMEMBER</Text>
      <View style={styles.cabinet} pointerEvents="none" />

      {LABELS.map((label, k) => (
        <Drawer
          key={label}
          index={k}
          label={label}
          SCENE={SCENE}
          live={live}
          answered={answered}
          picked={picked}
          onPick={onPick}
        />
      ))}

      <Target id={'door'} correct={true} picked={picked} onPick={onPick}
              style={styles.door} disabled={!live || answered}>
        <View
          style={[
            styles.doorInner,
            answered && styles.pickRight,
          ]}
        >
          <Text
            style={[styles.doorText, answered && styles.onInk]}
            numberOfLines={1}
          >
            THE DOOR
          </Text>
          <View style={[styles.knob, answered && styles.knobOnInk]} />
        </View>
      </Target>

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={D} k={K_FIG} />
    </Animated.View>
  );
}

/** One drawer: slides out on its beat, and its front only gets a label once open. */
function Drawer({
  index, label, SCENE, live, answered, picked, onPick,
}: {
  index: number;
  label: string;
  SCENE: { value: { open: number } };
  live: boolean;
  answered: boolean;
  picked: string | null;
  onPick: (id: string, correct: boolean) => void;
}) {
  const id = `drawer${index}`;
  const wrap = useAnimatedStyle(() => ({
    transform: [{ translateX: clamp01(SCENE.value.open - index) * SLIDE }],
  }));
  const text = useAnimatedStyle(() => ({ opacity: clamp01(SCENE.value.open - index) }));
  return (
    <Animated.View style={[styles.drawer, { top: DRW_T0 + index * DRW_PITCH }, wrap]}>
      <Target id={id} correct={false} picked={picked} onPick={onPick}
              style={styles.fill} disabled={!live || answered}>
        <View
          style={[
            styles.drawerInner,
            answered && picked === id && styles.pickWrong,
          ]}
        >
          <Animated.Text style={[styles.drawerText, text]} numberOfLines={2}>
            {label}
          </Animated.Text>
          <View style={styles.pull} />
        </View>
      </Target>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 12, right: 14, top: GROUND, height: 1.5, backgroundColor: RULE },
  fill: { flex: 1 },

  kicker: {
    position: 'absolute', left: CAB_L, top: KICK_T, width: CAB_W,
    fontFamily: 'Inter_700Bold', fontSize: 7.5, letterSpacing: 1.2, color: SOFT,
    includeFontPadding: false,
  },

  cabinet: {
    position: 'absolute', left: CAB_L, top: CAB_T, width: CAB_W, height: CAB_H,
    borderWidth: 2, borderColor: INK, borderRadius: 3, backgroundColor: PAPER,
  },

  drawer: { position: 'absolute', left: DRW_L, width: DRW_W, height: DRW_H },
  drawerInner: {
    flex: 1, borderWidth: 2, borderColor: INK, borderRadius: 3, backgroundColor: PAPER,
    justifyContent: 'center', paddingLeft: 10, paddingRight: 26,
  },
  drawerText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.5, lineHeight: 11, letterSpacing: 0.3, color: INK,
    includeFontPadding: false,
  },
  // The handle, so a closed blank drawer still reads as a drawer.
  pull: {
    position: 'absolute', right: 8, top: DRW_H / 2 - 3.5, width: 14, height: 3,
    borderRadius: 2, backgroundColor: SOFT,
  },

  door: { position: 'absolute', left: DOOR_L, top: DOOR_T, width: DOOR_W, height: DOOR_H },
  doorInner: {
    flex: 1, borderWidth: 2, borderColor: INK, borderRadius: 3, backgroundColor: PAPER,
    alignItems: 'center', paddingTop: 8,
  },
  doorText: {
    fontFamily: 'Inter_700Bold', fontSize: 8, letterSpacing: 0.4, color: INK,
    includeFontPadding: false,
  },
  knob: { position: 'absolute', right: 8, top: 74, width: 8, height: 8, borderRadius: 4, backgroundColor: INK },
  knobOnInk: { backgroundColor: PAPER },

  onInk: { color: PAPER },
  pickRight: { backgroundColor: INK, borderColor: INK },
  pickWrong: { borderColor: SOFT, opacity: 0.45 },
});

// Ink runs from the kicker (296) to the ground line (500). Band 290…512 = 222 (H59).
export function Epistemology31Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Epistemology31Scene} band={[290, 512]} />;
}
