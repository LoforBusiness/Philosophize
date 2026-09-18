import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import {
  clamp01, ease01, mixStance, pose, type Bundle,
} from './rig';
// The whole movement library, not just rig's 49 emotes. Codes under 100 ARE
// rig's and mean exactly what they always did; 100+ reach moves.ts (emoteAny).
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './epistemology31Script';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, PAPER, useHeld, carryFrom, keepHeld, lookPose, useCarry, carry, pickAt,
} from './cinematicKit';
import { stageTone } from './stageTones';
import { floorStyle, lipOf, PLATE_FACE } from './stageSkin';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// THE STAGE IS STRUCK IN THIS LESSON'S OWN BRANCH HUE (./stageTones).
// Same three tones, same luminance to the third decimal — so every contrast
// measured against the old greys still holds and nothing on the stage moved.
const TONE = stageTone('epistemology');
const { RULE, STONE, SHADE } = TONE;
const LIP = lipOf(TONE);   // the ledge a toned plate stands on (scripts/skin-stage.mjs)

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

// THE CAMERA (H60b). `followMoves` reads the x track and gives each beat its own
// shot: it FOLLOWS him when a beat moves him far enough to be worth following,
// pushes close on a quote, and PULLS BACK to the whole band on a question or a
// summary — the beats the reader has to read and act on. Beats that do not set
// `x` stand at FIG_X, so a still lesson gets the one-in-three push rather than a
// camera that never rests.
const X = BEATS.map((b) => b.x ?? FIG_X);
const CAM = followMoves(X, BEATS.map(kindOf), seedOf('epistemology31'));
/** How many drawers are pulled out on each beat (see the script). */
const OPEN = BEATS.map((b) => b.open ?? 0);
const ONLY_EVIDENCE = BEATS.map((b) => (b.onlyEvidence ? 1 : 0));
const VIVID_RING = BEATS.map((b) => (b.vividRing ? 1 : 0));
const SAME_FACULTY = BEATS.map((b) => (b.sameFaculty ? 1 : 0));
const OUTSIDE_TAG = BEATS.map((b) => (b.outsideTag ? 1 : 0));

// R7c — the cabinet follows the sort on its own graded beat, and only there.
// Derived from the beat rather than declared as a channel so it cannot fall out
// of step with the control it is about.
const REACT = BEATS.map((b) => (b.interact?.sort ? 1 : 0));

// HOW MANY DRAWERS EACH ANSWER PULLS OUT, in the sort's OWN bin order (never the
// shuffled row order — see SceneApi.pickPos). Every drawer is a memory used as
// evidence, and each one past the first is a check on the one before (beats 2–8):
//   prove it first  0 — "against something outside memory": no memory is used until
//                       it is proved, so the cabinet stays shut
//   trust it        1 — the memory itself, I LOCKED IT, taken as it comes, with no
//                       reason to doubt and so no drawer behind it
//   suspect it      3 — "every memory suspect until it is confirmed": each check is
//                       another memory, so every drawer comes out
const OPEN_AT = [0, 1, 3];

export default function Epistemology31Scene({ clock, bt, bi, i, picked, onPick, pickPos, gazeX, gazeY, gazeOn }: SceneApi) {
  const heldS = useHeld();
  const cv = useCarry(5);
  const cur = BEATS[i];
  const reacting = REACT[i] === 1;

  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / 0.7);      // nobody walks; this is a pose blend
    const t = clock.value;
    // A drawer takes its own time to come out — 0.9s per drawer, so the pull reads
    // as a pull rather than a jump (C17).
    const slide = ease01(bt.value / 0.9);
    const s = keepHeld(heldS, mixStance(carryFrom(heldS, n, emoteHold(G[p], t)), emoteLive(G[n], t, bt.value), tr));
    return {
      fig: lookPose(s, FIG_X, GROUND, K_FIG, -1, 1, gazeX.value, gazeY.value, gazeOn.value),
      // Through the carry, so a drawer slides from where it was DRAWN — which after
      // the sort is wherever the reader left the cabinet.
      open: carry(cv, 0, n, OPEN[p], reacting ? pickAt(OPEN_AT, pickPos.value) : OPEN[n], slide),
      onlyEvidence: carry(cv, 1, n, ONLY_EVIDENCE[p], ONLY_EVIDENCE[n], tr),
      vividRing: carry(cv, 2, n, VIVID_RING[p], VIVID_RING[n], tr),
      sameFaculty: carry(cv, 3, n, SAME_FACULTY[p], SAME_FACULTY[n], tr),
      outsideTag: carry(cv, 4, n, OUTSIDE_TAG[p], OUTSIDE_TAG[n], tr),
    };
  });

  const D = useDerivedValue<Bundle>(() => SCENE.value.fig);

  const answered = picked !== null;
  const live = (cur.pick ?? 0) > 0 && !!cur.interact;

  const onlyEvidenceStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.onlyEvidence }));
  const vividRingStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.vividRing }));
  const sameFacultyStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.sameFaculty }));
  const outsideTagStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.outsideTag }));

  return (
    <Animated.View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      <Text style={styles.kicker} numberOfLines={1}>WHAT I REMEMBER</Text>
      <View style={styles.cabinet} pointerEvents="none" />
      <Animated.View style={[styles.onlyEvidence, onlyEvidenceStyle]} pointerEvents="none" />
      <Animated.View style={[styles.vividRing, vividRingStyle]} pointerEvents="none" />
      <Animated.View style={[styles.sameFaculty, sameFacultyStyle]} pointerEvents="none" />
      <Animated.View style={[styles.outsideTag, outsideTagStyle]} pointerEvents="none">
        <Text style={styles.outsideTagText}>OUTSIDE MEMORY</Text>
      </Animated.View>

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
  // THE FLOOR THE GROUND LINE SITS ON. A rule on its own leaves the
  // figure and everything it is looking at standing on bare page;
  // political7 and political8 both stand their subject on a filled mass.
  floor: floorStyle(TONE, GROUND),
  fill: { flex: 1 },

  // ONLY_EVIDENCE — a dashed outline round the whole closed cabinet: this,
  // closed, is your only evidence so far.
  onlyEvidence: {
    position: 'absolute', left: CAB_L - 4, top: CAB_T - 4, width: CAB_W + 8, height: CAB_T + CAB_H - (CAB_T - 4),
    borderWidth: 1.5, borderColor: INK, borderStyle: 'dashed', borderRadius: 10,
  },
  // VIVID_RING — a dashed ring on the open drawer's own front, at rest fully open.
  vividRing: {
    position: 'absolute', left: DRW_L + SLIDE - 4, top: DRW_T0 - 4, width: DRW_W + 8, height: DRW_H + 8,
    borderWidth: 1.5, borderColor: INK, borderStyle: 'dashed', borderRadius: 6,
  },
  // SAME_FACULTY — a dashed brace joining the two open drawers on their own
  // right edge: the second memory checks the first with the same faculty.
  sameFaculty: {
    position: 'absolute', left: DRW_L + SLIDE + DRW_W + 4, top: DRW_T0 + DRW_H / 2,
    width: 6, height: DRW_T0 + DRW_PITCH + DRW_H / 2 - (DRW_T0 + DRW_H / 2),
    borderLeftWidth: 1.5, borderColor: INK, borderStyle: 'dashed',
  },
  // OUTSIDE_TAG — a small plate above the door: the one thing that could check
  // a memory independently, because it isn't a memory itself.
  outsideTag: {
    position: 'absolute', left: DOOR_L - 18, top: DOOR_T - 30, width: DOOR_W + 36, height: 22,
    alignItems: 'center', justifyContent: 'center',
  },
  outsideTagText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.5, color: SOFT, textAlign: 'center',
    includeFontPadding: false,
  },
  kicker: {
    position: 'absolute', left: CAB_L, top: KICK_T, width: CAB_W,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.2, color: SOFT,
    includeFontPadding: false,
  },

  cabinet: {
    position: 'absolute', left: CAB_L, top: CAB_T, width: CAB_W, height: CAB_H,
    borderWidth: 2, borderColor: INK, borderRadius: 8, backgroundColor: STONE, boxShadow: LIP,
  },

  drawer: { position: 'absolute', left: DRW_L, width: DRW_W, height: DRW_H },
  drawerInner: {
    flex: 1, borderWidth: 2, borderColor: INK, borderRadius: 3, backgroundColor: PLATE_FACE, boxShadow: LIP,
    justifyContent: 'center', paddingLeft: 10, paddingRight: 26,
  },
  drawerText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 11, letterSpacing: 0.3, color: INK,
    includeFontPadding: false,
  },
  // The handle, so a closed blank drawer still reads as a drawer.
  pull: {
    position: 'absolute', right: 8, top: DRW_H / 2 - 3.5, width: 14, height: 3,
    borderRadius: 2, backgroundColor: SOFT,
  },

  door: { position: 'absolute', left: DOOR_L, top: DOOR_T, width: DOOR_W, height: DOOR_H },
  doorInner: {
    flex: 1, borderWidth: 2, borderColor: INK, borderRadius: 3, backgroundColor: STONE, boxShadow: LIP,
    alignItems: 'center', paddingTop: 8,
  },
  doorText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.4, color: INK,
    includeFontPadding: false,
  },
  knob: { position: 'absolute', right: 8, top: 74, width: 8, height: 8, borderRadius: 4, backgroundColor: INK },
  knobOnInk: { backgroundColor: PAPER },

  onInk: { color: PAPER },
  pickRight: { backgroundColor: INK, borderColor: INK },
  pickWrong: { borderColor: SOFT },
});

// Ink runs from the kicker (296) to the ground line (500). Band 290…512 = 222 (H59).
export function Epistemology31Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Epistemology31Scene} band={[290, 512]} camera={CAM} />;
}
