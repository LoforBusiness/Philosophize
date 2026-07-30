import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import {
  WALK, clamp01, dirsFrom, ease01, emoteHold, emoteLive, lerp, moveTr, pose, travelStance,
  type Bundle,
} from './rig';
import { BEATS } from './aesthetics9Script';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER } from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';

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
//     y 396 … 477. THIS IS THE CONSTRAINT THAT SET HIS LAST MARK. Laid out centred
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
const LABEL_T = 396;
const LABEL_H = 25;
const LABEL_GAP = 28;

// Short enough to hold one line at 8.5px in a 140-wide box — a label that wrapped
// would strand a fragment on its own line, which is the defect D30 names.
const LABELS = [
  { id: 'beauty', text: 'NOT PRETTY, NOT ART', correct: false },
  { id: 'meaning', text: 'NOT PRETTY, STILL ART', correct: true },
  { id: 'secret', text: 'SECRETLY PRETTY, SO ART', correct: false },
];

const P = BEATS.map((b) => b.p ?? 0);
const X = BEATS.map((b) => b.x ?? 96);
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

export default function Aesthetics9Scene({ clock, bt, bi, i, picked, onPick }: SceneApi) {
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

    const s = travelStance(
      X[p], X[n],
      emoteHold(P[p], t), emoteHold(P[n], t), emoteLive(P[n], t, bt.value),
      tr, WALK,
    );
    return {
      fig: pose(s, lerp(X[p], X[n], tr), GROUND, K_FIG, DIR[n], 1),
      boxes: (boxesOn ? 1 : 0) * (boxesFade ? grow : 1),
      stands: (standsOn ? 1 : 0) * (standsFade ? grow : 1),
      crown: (crownOn ? 1 : 0) * (crownFade ? grow : 1),
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
              <Pressable disabled={answered} onPress={() => onPick(l.id, l.correct)}>
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
              </Pressable>
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
    borderWidth: 2.5, borderColor: INK, borderRadius: 3, backgroundColor: PAPER,
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
    fontFamily: 'Inter_400Regular', fontSize: 6.5, letterSpacing: 0.6, color: SOFT,
    marginTop: 3, includeFontPadding: false,
  },

  // A shelf is a plank on two thin legs; a plinth is one solid column. Both stop at
  // y 386, above the crown of a figure standing in front of them.
  shelf: { position: 'absolute', top: BOX_T + BOX_H, width: BOX_W + 24, height: 4, backgroundColor: INK },
  shelfLeg: { position: 'absolute', top: BOX_T + BOX_H + 4, width: 3, height: STAND_B - (BOX_T + BOX_H + 4), backgroundColor: SOFT },
  plinth: {
    position: 'absolute', top: BOX_T + BOX_H, width: BOX_W - 20, height: STAND_B - (BOX_T + BOX_H),
    borderWidth: 2, borderColor: INK, backgroundColor: PAPER,
  },
  // ABOVE the box, not under the stand — under the stand is where the figure's head
  // goes, and a caption there would be the D31 collision wearing a name badge.
  standTag: {
    position: 'absolute', top: 214, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.5, letterSpacing: 1.6, color: SOFT,
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
    height: LABEL_H, borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: PAPER,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6,
  },
  labelRight: { backgroundColor: INK, borderColor: INK },
  labelWrong: { borderColor: SOFT, opacity: 0.45 },
  labelText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.5, letterSpacing: 0.3, color: INK,
    includeFontPadding: false,
  },
  labelTextOn: { color: PAPER },
});

// Art runs from the BEAUTY crown (200) to the ground line (500). The stands stop at
// 386, above a crown of 397; the plinth labels sit BELOW that, at 396–477, in the
// column right of x 254 where the figure never stands.
export function Aesthetics9Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Aesthetics9Scene} band={[194, 512]} />;
}
