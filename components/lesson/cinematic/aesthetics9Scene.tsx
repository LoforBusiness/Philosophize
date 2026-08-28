import {
  View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import {
  WALK, clamp01, dirsFrom, ease01, lerp, moveTr, pose, travelStance, type Bundle, } from './rig';
// The whole movement library, not just rig's 49 emotes. Codes under 100 ARE
// rig's and mean exactly what they always did; 100+ reach moves.ts (emoteAny).
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './aesthetics9Script';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER, useHeld, carryFrom, keepHeld,
  facing, useCarry, carry, STONE,
} from './cinematicKit';
import { followMoves, kindOf, seedOf } from './camera';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';

// Two boxes, drawn identically down to the last rule, because the lesson dies the
// moment the reader can tell them apart by looking. One sits on a shop shelf, one
// on a gallery plinth, and the only difference on the whole stage is what is
// underneath them.
//
// COMPOSITION / OCCLUSION —
//   · the narrator WALKS x = 80 → 144 → 208, monotonically rightward, in two 64-unit
//     moves. Widest body span at his last mark is x 172 … 244.
//   · the SHELF box is x 44 … 148, the PLINTH box x 252 … 356, both y 236 … 316,
//     and their stands run down to y 386 — above a standing crown of y 397, so the
//     figure passes in front of the gap between them and occludes neither (D23).
//   · the two captions sit ABOVE their boxes at y 214 … 228, not below them, because
//     below them is where the figure's head is.
//   · the three labels lean against the plinth on the tap beat: x 254 … 394,
//     y 388 … 496. THIS IS THE CONSTRAINT THAT SET HIS LAST MARK. Laid out centred
//     under the plinth they ran from x 214, and his body reaches 244 — the bottom
//     label would have been drawn across his skull. Ten units of clear paper now.
//   · the BEAUTY crown occupies y 200 … 230 and is gone after beat 0.
// Nothing is drawn above y 200 or below the ground line, hence band [194, 512].

const BOX_T = 236;
const BOX_H = 80;
const BOX_W = 104;
const SHELF_X = 44;
const PLINTH_X = 252;
const STAND_B = 386;

const LABEL_L = 254;
const LABEL_W = 140;
// SIZED FOR A FINGER, as far as this composition allows. 25 tall on a 28 pitch was
// a 22dp target every 25dp — the smallest in the app against a ~45dp fingertip.
// Unlike the other stacks there is nowhere to grow: the plinth's stand comes down
// to 386 above, the ground line is at 500 below, and the labels cannot move LEFT
// without being drawn across the figure's head (see the note above). 30 on a 39
// pitch fills 388 → 496 exactly, which is 35dp — better, still short of 45, and
// short for a reason worth writing down rather than quietly leaving.
const LABEL_T = 388;
const LABEL_H = 30;
const LABEL_GAP = 39;
/** Half the gap — more would overlap the neighbour, and the topmost would win. */
const LABEL_SLOP = (LABEL_GAP - LABEL_H) / 2;

// Short enough to hold one line at 8.5px in a 140-wide box — a label that wrapped
// would strand a fragment on its own line, which is the defect D30 names.
const LABELS = [
  { id: 'beauty', text: 'NOT PRETTY, NOT ART', correct: false },
  { id: 'meaning', text: 'NOT PRETTY, STILL ART', correct: true },
  { id: 'secret', text: 'SECRETLY PRETTY, SO ART', correct: false },
];

const P = BEATS.map((b) => b.p ?? 0);
const X = BEATS.map((b) => b.x ?? 96);

// R7b — the stage follows the control on its own graded beat, and only there.
// Derived from the beat rather than declared as a channel so it cannot fall out
// of step with the control it is about.
const REACT = BEATS.map((b) => (b.interact?.lever ? 1 : 0));
// The camera, from the staging: it follows the figure this track describes,
// pulls back to scale 1 on every graded beat so a tap lands where it is aimed,
// and leans in on the quote. See followMoves in ./camera.ts.
const CAM = followMoves(X, BEATS.map(kindOf), seedOf('aesthetics9'));
const DIR = dirsFrom(X, 1);

/** One Brillo box. Both are rendered from this, so they cannot drift apart. */
function BrilloBox({ left }: { left: number }) {
  return (
    <View style={[styles.box, { left }]} pointerEvents="none">
      <Text style={styles.boxBrand}>BRILLO</Text>
      <View style={styles.boxRule} />
      <Text style={styles.boxSub}>SOAP PADS</Text>
      <Text style={styles.boxSmall}>24 GIANT SIZE PKGS</Text>
    </View>
  );
}

export default function Aesthetics9Scene({ clock, bt, bi, i, picked, onPick, dragPos }: SceneApi) {
  const reacting = REACT[i] === 1;
  const heldS = useHeld();
  const cv = useCarry(1);
  const cur = BEATS[i];
  const prev = i > 0 ? BEATS[i - 1] : undefined;

  const boxesOn = !!cur.boxes;
  const boxesFade = boxesOn !== !!prev?.boxes;
  const standsOn = !!cur.stands;
  const standsFade = standsOn !== !!prev?.stands;
  const crownOn = !!cur.crown;
  const crownFade = crownOn !== !!prev?.crown;
  const labelsOn = !!cur.labels;
  const labelsFade = labelsOn !== !!prev?.labels;
  const answered = picked !== null;

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
      boxes: (boxesOn ? 1 : 0) * (boxesFade ? grow : 1),
      stands: (standsOn ? 1 : 0) * (standsFade ? grow : 1),
      // R7c — the crown over the left box is beauty while it still ruled, and the
      // lever is asking whether it still does. It sits back on at 'a work must be
      // beautiful' and is gone by 'thrown out altogether'.
      crown: reacting ? (1 - dragPos.value) * tr : (crownOn ? 1 : 0) * (crownFade ? grow : 1),
      t,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const boxStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.boxes }));
  const standStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.stands }));
  const crownStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.crown }));
  const labelStyle = useAnimatedStyle(() => ({
    opacity: labelsOn ? (labelsFade ? ease01(bt.value / 0.6) : 1) : 0,
  }));

  return (
    <Animated.View style={styles.scene}>
      {/* beauty, while it was still the rule */}
      <Animated.View style={[styles.crownWrap, crownStyle]} pointerEvents="none">
        <Text style={styles.crown}>BEAUTY</Text>
        <View style={styles.crownRule} />
      </Animated.View>

      {/* ── the pair. Identical by construction, not by care ─────────────────── */}
      <Animated.View style={boxStyle} pointerEvents="none">
        <BrilloBox left={SHELF_X} />
        <BrilloBox left={PLINTH_X} />
      </Animated.View>

      {/* ── and the only difference on the stage ─────────────────────────────── */}
      <Animated.View style={standStyle} pointerEvents="none">
        <View style={[styles.shelf, { left: SHELF_X - 12 }]} />
        <View style={[styles.shelfLeg, { left: SHELF_X + 4 }]} />
        <View style={[styles.shelfLeg, { left: SHELF_X + BOX_W - 8 }]} />
        <Text style={[styles.standTag, { left: SHELF_X - 12, width: BOX_W + 24 }]}>SUPERMARKET</Text>

        <View style={[styles.plinth, { left: PLINTH_X + 10 }]} />
        <Text style={[styles.standTag, { left: PLINTH_X - 12, width: BOX_W + 24 }]}>GALLERY</Text>
      </Animated.View>


      {/* ── Q2: which label belongs under the plinth? ───────────────────────── */}
      {labelsOn &&
        LABELS.map((l, k) => {
          const chosen = picked === l.id;
          return (
            <Animated.View key={l.id} style={[styles.labelSlot, { top: LABEL_T + k * LABEL_GAP }, labelStyle]}>
              <Target id={l.id} correct={l.correct} picked={picked} onPick={onPick}
              hitSlop={{ top: LABEL_SLOP, bottom: LABEL_SLOP, left: LABEL_SLOP, right: LABEL_SLOP }} disabled={answered}>
                <View
                  style={[
                    styles.label,
                    answered && l.correct && styles.labelRight,
                    answered && chosen && !l.correct && styles.labelWrong,
                  ]}
                >
                  <Text style={[styles.labelText, answered && l.correct && styles.labelTextOn]}>
                    {l.text}
                  </Text>
                </View>
              </Target>
            </Animated.View>
          );
        })}

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DF} k={K_FIG} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 20, right: 12, top: GROUND, height: 1.5, backgroundColor: RULE },

  box: {
    position: 'absolute', top: BOX_T, width: BOX_W, height: BOX_H,
    borderWidth: 2.5, borderColor: INK, borderRadius: 3, backgroundColor: STONE,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5,
  },
  boxBrand: {
    fontFamily: 'Inter_700Bold', fontSize: 17, letterSpacing: 1.4, color: INK,
    includeFontPadding: false,
  },
  boxRule: { width: 62, height: 2, backgroundColor: INK, marginVertical: 4 },
  boxSub: {
    fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 1.2, color: INK,
    includeFontPadding: false,
  },
  boxSmall: {
    fontFamily: 'Inter_400Regular', fontSize: 8.7, letterSpacing: 0.6, color: INK,
    marginTop: 3, includeFontPadding: false,
  },

  // A shelf is a plank on two thin legs; a plinth is one solid column. Both stop at
  // y 386, above the crown of a figure standing in front of them.
  shelf: { position: 'absolute', top: BOX_T + BOX_H, width: BOX_W + 24, height: 4, backgroundColor: INK },
  shelfLeg: { position: 'absolute', top: BOX_T + BOX_H + 4, width: 3, height: STAND_B - (BOX_T + BOX_H + 4), backgroundColor: SOFT },
  // TONE, NOT WHITE. This scene drew every prop as an outline on paper — two
  // values and no depth, which is the flat case `check:shade` exists to find.
  // The structural mass takes STONE, a secondary surface takes RULE, and what
  // carries the message stays PAPER, so the picture has things at different
  // values rather than everything a shade darker. See cinematicKit's ramp.
  plinth: {
    position: 'absolute', top: BOX_T + BOX_H, width: BOX_W - 20, height: STAND_B - (BOX_T + BOX_H),
    borderWidth: 2, borderColor: INK, backgroundColor: STONE,
  },
  // ABOVE the box, not under the stand — under the stand is where the figure's head
  // goes, and a caption there would be the D31 collision wearing a name badge.
  standTag: {
    position: 'absolute', top: 214, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.7, letterSpacing: 1.6, color: SOFT,
    includeFontPadding: false,
  },

  crownWrap: { position: 'absolute', left: SHELF_X - 12, top: 200, width: BOX_W + 24, alignItems: 'center' },
  crown: {
    fontFamily: 'PlayfairDisplay_700Bold', fontSize: 15, letterSpacing: 2, color: INK,
    includeFontPadding: false,
  },
  crownRule: { width: 54, height: 2, backgroundColor: INK, marginTop: 4 },

  labelSlot: { position: 'absolute', left: LABEL_L, width: LABEL_W },
  label: {
    height: LABEL_H, borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: RULE,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6,
  },
  labelRight: { backgroundColor: INK, borderColor: INK },
  labelWrong: { borderColor: SOFT, opacity: 0.45 },
  labelText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.7, letterSpacing: 0.3, color: INK,
    includeFontPadding: false,
  },
  labelTextOn: { color: PAPER },
});

// Art runs from the BEAUTY crown (200) to the ground line (500). The stands stop at
// 386, above a crown of 397; the plinth labels sit BELOW that, at 396–477, in the
// column right of x 254 where the figure never stands.
export function Aesthetics9Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Aesthetics9Scene} band={[194, 512]} camera={CAM} />;
}
