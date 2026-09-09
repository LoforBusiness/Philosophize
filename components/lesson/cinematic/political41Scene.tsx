import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { dirsFrom, clamp01, ease01, moveTr, travelStance, WALK, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './political41Script';
import {
  facing, GROUND, K_FIG, STAGE_W, STAGE_H, INK, STONE, SOFT, RULE, PAPER, useHeld, carryFrom, keepHeld, useCarry, carry, lookPose,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// ─────────────────────────────────────────────────────────────────────────────
// A STACK OF RULES ON A STAND, AND THE HOLE THAT OPENS IN IT.
//
// THE COMPOSITION, IN NUMBERS (H56).
//
// · the STAND is 232×10 at x 144 (144…376), y 424…434, with a 12×46 post at x 254
//   below it — the body of law has to be standing on something the reader can see
//   it standing on.
// · SIX RULES of 208×15 at x 156 (156…364) sit on it at a pitch of 20, tops y 300
//   through 400, filled STONE with an ink edge. They are the scene's mass, and
//   they stay drawn at every beat: prerogative runs ALONGSIDE the law rather than
//   replacing it, and has to be seen against it.
// · a rule LIFTS by rising 26 units and fading, from the top of the stack down.
//   Nothing is added to the picture when the power is used — something is taken
//   out of it, which is the honest shape of what happens.
// · THREE SLOTS of 74×24 at x 144 · 226 · 308 (144…382), y 262…286, naming what
//   the power has. The third carries a dashed edge and no word, because the thing
//   it would name does not exist (D31: a slot with nothing in it, never a slot
//   with a word crossed out).
// · THREE PLATES of 84×26 at x 128 · 220 · 312 (128…396), top y 462 — below the
//   stand's post and above the ground, each carrying its own words (S11).
// · the figure stands at x 28 and walks to 88; his widest span at the walked mark
//   is x ≈ 63…113, fifteen units clear of the nearest plate at 128 and thirty-one
//   clear of the stand at 144.
//
// Ink runs y 244 (the caption) … y 500 (ground). BAND 240…512 = 272 — a 103-unit
// figure at 37.9%, inside H58's 38%.
// ─────────────────────────────────────────────────────────────────────────────

/** Crossfade for a beat that does NOT walk. 0.85 is the base `footfalls` assumes. */
const BASE_TR = 0.85;

const RULE_X = 156;
const RULE_W = 208;
const RULE_H = 15;
const RULE_N = 6;
const RULE_TOP = 300;
const RULE_PITCH = 20;
/** How far a lifted rule rises before it is gone. */
const RULE_RISE = 26;

const STAND_X = 144;
const STAND_Y = 424;
const STAND_W = 232;
const POST_X = 254;
const POST_Y = 434;

const SLOT_X = [144, 226, 308];
const SLOT_Y = 262;
const SLOT_W = 74;
const SLOT_H = 24;
const SLOT_CAP = ['A HOLDER', 'A PURPOSE', ''];

const PLATE_X = [128, 220, 312];
const PLATE_Y = 462;
const PLATE_W = 84;
const PLATE_H = 26;
const PLATE_CAP = ['A RULE', 'A HOLDER', 'A PURPOSE'];
const PLATE_ID = ['rule', 'holder', 'purpose'];
/** The empty slot. The other two are filled in above the reader's head. */
const NO_RULE = 0;

const CAP_T = 244;
const FIG_X = 28;

const X = BEATS.map((b) => b.x ?? FIG_X);
// WHICH WAY HE IS POINTING, read off the same x track he walks along.
const DIR = dirsFrom(X, 1);
const P = BEATS.map((b) => b.p ?? 0);
const BOOK = BEATS.map((b) => b.book ?? 0);
const SLOTS = BEATS.map((b) => (b.slots ? 1 : 0));
const LIFT = BEATS.map((b) => b.lift ?? 0);
const PLATES = BEATS.map((b) => (b.plates ? 1 : 0));
const LIVE = BEATS.map((b) => (b.live ? 1 : 0));

// R7c — the stage follows the control on its own graded beat, and only there.
// Derived from the beat so it cannot fall out of step with the control.
const REACT = BEATS.map((b) => (b.interact?.plot ? 1 : 0));

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('political41'));

export default function Political41Scene({ clock, bt, bi, i, picked, onPick, dragPos, gazeX, gazeY, gazeOn }: SceneApi) {
  const reacting = REACT[i] === 1;
  const heldFig = useHeld();
  const cv = useCarry(5);
  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    // A WALKING BEAT TAKES AS LONG AS THE WALK NEEDS (rig.moveTr).
    const tr = ease01(bt.value / moveTr(X[p], X[n], BASE_TR));
    const t = clock.value;

    const figS = keepHeld(heldFig, travelStance(
      X[p], X[n],
      carryFrom(heldFig, n, emoteHold(P[p], t)), emoteHold(P[n], t), emoteLive(P[n], t, bt.value),
      tr, WALK,
    ));

    return {
      fig: lookPose(figS, carry(cv, 0, n, X[p], X[n], tr), GROUND, K_FIG, facing(DIR[p], DIR[n], bt.value), 1, gazeX.value, gazeY.value, gazeOn.value),
      t,
      book: carry(cv, 1, n, BOOK[p], BOOK[n], tr),
      slotsOn: carry(cv, 2, n, SLOTS[p], SLOTS[n], tr),
      // R7c — `dragPos` on a plot is the MEAN height of the curve the reader has
      // drawn, which is exactly how much room to act they have granted overall.
      lift: carry(cv, 3, n, LIFT[p], reacting ? dragPos.value : LIFT[n], tr),
      platesOn: carry(cv, 4, n, PLATES[p], PLATES[n], tr),
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const answered = picked !== null;
  const live = !!BEATS[i]?.interact && !BEATS[i]?.interact?.cards && LIVE[i] === 1;

  const slotsStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.slotsOn }));
  const platesStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.platesOn }));
  const standStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.book }));

  return (
    <View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      <Text style={styles.cap} pointerEvents="none">WHAT THE LAW DID NOT FORESEE</Text>

      <Animated.View style={[StyleSheet.absoluteFill, slotsStyle]} pointerEvents="none">
        {SLOT_X.map((sx, k) => (
          <View key={sx}>
            <View style={[k === 2 ? styles.slotEmpty : styles.slot, { left: sx }]} />
            <Text style={[styles.slotText, { left: sx }]}>{SLOT_CAP[k]}</Text>
          </View>
        ))}
      </Animated.View>

      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {Array.from({ length: RULE_N }, (_, k) => <Rule key={k} S={SCENE} index={k} />)}
      </View>

      <Animated.View style={[StyleSheet.absoluteFill, standStyle]} pointerEvents="none">
        <View style={styles.stand} />
        <View style={styles.post} />
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, platesStyle]}>
        {PLATE_ID.map((id, k) => (
          <Target
            key={id}
            id={id}
            correct={k === NO_RULE}
            picked={picked}
            onPick={onPick}
            disabled={!live || answered}
            style={[styles.hit, { left: PLATE_X[k] }]}
            radius={4}
          >
            <View style={styles.plate} pointerEvents="none" />
            <Text style={styles.plateText} pointerEvents="none">{PLATE_CAP[k]}</Text>
          </Target>
        ))}
      </Animated.View>

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DF} k={K_FIG} />
    </View>
  );
}

/** One rule in the stack. The top of the pile is the first to go. */
function Rule({ S, index }: { S: SharedValue<any>; index: number }) {
  const top = RULE_TOP + index * RULE_PITCH;
  const st = useAnimatedStyle(() => {
    // LIFTED FROM THE TOP DOWN — rule 0 goes first. Indexing this from the other
    // end ate the stack from the BOTTOM, which left the remaining rules floating
    // above a stand they were no longer resting on. Only the render said so.
    const gone = clamp01(S.value.lift * RULE_N - index);
    return {
      opacity: clamp01(S.value.book * RULE_N - index) * (1 - gone),
      transform: [{ translateY: -RULE_RISE * gone }],
    };
  });
  return <Animated.View style={[styles.rule, { top }, st]} pointerEvents="none" />;
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 20, right: 14, top: GROUND, height: 1.5, backgroundColor: RULE },
  // THE FLOOR THE GROUND LINE SITS ON — a subject standing on a filled mass
  // rather than on bare page.
  floor: { position: 'absolute', left: 0, right: 0, top: GROUND, bottom: 0, backgroundColor: RULE },

  cap: {
    position: 'absolute', left: STAND_X, top: CAP_T, width: STAND_W,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.4, color: SOFT, includeFontPadding: false,
  },

  slot: {
    position: 'absolute', top: SLOT_Y, width: SLOT_W, height: SLOT_H,
    borderWidth: 2, borderColor: INK, backgroundColor: PAPER,
  },
  // AN EMPTY SLOT, NOT A CROSSED-OUT ONE. The thing it would name does not exist,
  // and a word with a line through it would be a word all the same (S9).
  slotEmpty: {
    position: 'absolute', top: SLOT_Y, width: SLOT_W, height: SLOT_H,
    borderWidth: 1.5, borderColor: SOFT, borderStyle: 'dashed',
  },
  slotText: {
    position: 'absolute', top: SLOT_Y + 8, width: SLOT_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.5, color: INK, includeFontPadding: false,
  },

  rule: {
    position: 'absolute', left: RULE_X, width: RULE_W, height: RULE_H,
    borderWidth: 1.5, borderColor: INK, backgroundColor: STONE,
  },
  stand: { position: 'absolute', left: STAND_X, top: STAND_Y, width: STAND_W, height: 10, backgroundColor: INK },
  post: { position: 'absolute', left: POST_X, top: POST_Y, width: 12, height: 46, backgroundColor: INK },

  hit: { position: 'absolute', top: PLATE_Y, width: PLATE_W, height: PLATE_H },
  plate: {
    position: 'absolute', left: 0, top: 0, width: PLATE_W, height: PLATE_H,
    borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: PAPER,
  },
  plateText: {
    position: 'absolute', left: 0, top: 8, width: PLATE_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.5, color: INK, includeFontPadding: false,
  },
});

export function Political41Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Political41Scene} band={[240, 512]} camera={CAM} />;
}
