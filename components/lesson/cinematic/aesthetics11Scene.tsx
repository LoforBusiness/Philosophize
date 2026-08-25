import {
  View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import {
  WALK, dirsFrom, ease01, lerp, moveTr, pose, travelStance, type Bundle, } from './rig';
// The whole movement library, not just rig's 49 emotes. Codes under 100 ARE
// rig's and mean exactly what they always did; 100+ reach moves.ts (emoteAny).
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './aesthetics11Script';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER, useHeld, carryFrom, keepHeld, facing, useCarry, carry,
} from './cinematicKit';
import { followMoves, kindOf, seedOf } from './camera';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';

// A gallery wall stage right, two canvases on it, the figure working downstage left.
//
// COMPOSITION, in coordinates:
// · the figure WALKS x = 70 → 168 → 124. Body span x ± 36, so its widest reach is
//   x 132…204 standing at 168; the working fist at gesture 41 reaches x 204.5.
// · the wall's ink starts at x 222 — at least 17 units of clear paper from anything
//   the figure occupies at any beat.
// · frames y 226…300, plaques y 306…326, the IDENTICAL tag y 332…350, and the three
//   answer cards y 358…474 on a 40 pitch. A standing crown is y 397, so the lower
//   cards share the figure's height band but never its x.
//
// THE TWO CANVASES ARE THE SAME OBJECT, DRAWN TWICE. Both read `styles.frameInner`
// and the same BARS array, so "identical" is a property of the source rather than a
// claim in the narration — there is no way for one to drift from the other in a
// later edit, which is the one thing this lesson cannot survive.
//
// A5 — DELIBERATE: the wall is above the figure's reach (its hand tops out at y 411,
// B11b) and it never touches it. The canvases are an information surface (D32); no
// beat's text claims contact.

const WALL_L = 222;
const WALL_R = 390;
const FRAME_W = 78;
const FRAME_LX = WALL_L;
const FRAME_RX = WALL_R - FRAME_W;
const FRAME_T = 226;
const FRAME_H = 74;

const PLAQUE_T = 306;
const PLAQUE_H = 20;

const SAME_T = 332;
const SAME_H = 18;

const CARD_T = 358;
const CARD_H = 32;
const CARD_PITCH = 40;
/** Half the gutter — wider would overlap the neighbour and the topmost would win. */
const CARD_SLOP = (CARD_PITCH - CARD_H) / 2;

// The picture inside each canvas: three bars of fixed widths. Shared by both frames.
const BARS = [0.72, 0.46, 0.61];

const CARDS = [
  { id: 'who', label: 'WHO MADE IT', correct: true },
  { id: 'brush', label: 'THE BRUSHWORK', correct: false },
  { id: 'colour', label: 'THE COLOURS', correct: false },
];

const P = BEATS.map((b) => b.p ?? 0);
const X = BEATS.map((b) => b.x ?? 124);
// The camera, from the staging: it follows the figure this track describes,
// pulls back to scale 1 on every graded beat so a tap lands where it is aimed,
// and leans in on the quote. See followMoves in ./camera.ts.
const CAM = followMoves(X, BEATS.map(kindOf), seedOf('aesthetics11'));
const DIR = dirsFrom(X, 1);
const FRAMES = BEATS.map((b) => b.frames ?? 0);

function Canvas({ left }: { left: number }) {
  return (
    <View style={[styles.frameInner, { left }]} pointerEvents="none">
      {BARS.map((w, k) => (
        <View key={k} style={[styles.bar, { width: (FRAME_W - 22) * w }]} />
      ))}
    </View>
  );
}

export default function Aesthetics11Scene({ clock, bt, bi, i, picked, onPick }: SceneApi) {
  const heldS = useHeld();
  const cv = useCarry(2);
  const cur = BEATS[i];
  const prev = i > 0 ? BEATS[i - 1] : undefined;

  const framesFade = (cur.frames ?? 0) !== (prev?.frames ?? 0);
  const plaqOn = (cur.plaques ?? 0) > 0;
  const plaqFade = (cur.plaques ?? 0) !== (prev?.plaques ?? 0);
  const sameOn = (cur.same ?? 0) > 0;
  const sameFade = (cur.same ?? 0) !== (prev?.same ?? 0);

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
      frames: carry(cv, 1, n, FRAMES[p], FRAMES[n], tr, framesFade ? grow : 1),
      plaques: plaqOn ? (plaqFade ? grow : 1) : 0,
      same: sameOn ? (sameFade ? grow : 1) : 0,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const framesStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.frames }));
  const plaqStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.plaques }));
  const sameStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.same,
    transform: [{ scaleX: 0.9 + 0.1 * SCENE.value.same }],
  }));

  const answered = picked !== null;
  const showPick = (cur.pick ?? 0) > 0 && !!cur.interact;

  return (
    <Animated.View style={styles.scene}>
      {/* ── the wall ────────────────────────────────────────────────────────── */}
      <Animated.View style={[styles.wall, framesStyle]} pointerEvents="none">
        <View style={[styles.frame, { left: FRAME_LX }]} />
        <View style={[styles.frame, { left: FRAME_RX }]} />
        <Canvas left={FRAME_LX + 9} />
        <Canvas left={FRAME_RX + 9} />
      </Animated.View>

      {/* the only thing on the wall that differs */}
      <Animated.View style={[styles.plaqWrap, plaqStyle]} pointerEvents="none">
        <View style={[styles.plaque, { left: FRAME_LX }]}>
          <Text style={styles.plaqueText} numberOfLines={1}>BY HAND</Text>
        </View>
        <View style={[styles.plaque, { left: FRAME_RX }]}>
          <Text style={styles.plaqueText} numberOfLines={1}>BY MACHINE</Text>
        </View>
      </Animated.View>

      {/* the measurement drawn across both */}
      <Animated.View style={[styles.sameTag, sameStyle]} pointerEvents="none">
        <Text style={styles.sameText} numberOfLines={1}>IDENTICAL, MARK FOR MARK</Text>
      </Animated.View>

      {/* ── Q1: tap what actually differs ───────────────────────────────────── */}
      {showPick &&
        CARDS.map((c, k) => {
          const chosen = picked === c.id;
          return (
            <Target id={c.id} correct={c.correct} picked={picked} onPick={onPick}
              key={c.id} style={[styles.card, { top: CARD_T + k * CARD_PITCH }]} hitSlop={{ top: CARD_SLOP, bottom: CARD_SLOP, left: CARD_SLOP, right: CARD_SLOP }} disabled={answered}>
              <View
                style={[
                  styles.cardInner,
                  answered && c.correct && styles.pickRight,
                  answered && chosen && !c.correct && styles.pickWrong,
                ]}
              >
                <Text
                  style={[styles.cardText, answered && c.correct && styles.onInk]}
                  numberOfLines={1}
                >
                  {c.label}
                </Text>
              </View>
            </Target>
          );
        })}

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DF} k={K_FIG} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 24, right: 14, top: GROUND, height: 1.5, backgroundColor: RULE },

  wall: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H },
  frame: {
    position: 'absolute', top: FRAME_T, width: FRAME_W, height: FRAME_H,
    borderWidth: 2.5, borderColor: INK, borderRadius: 3, backgroundColor: PAPER,
  },
  frameInner: {
    position: 'absolute', top: FRAME_T + 11, width: FRAME_W - 18,
    alignItems: 'flex-start', gap: 9,
  },
  bar: { height: 7, backgroundColor: INK, borderRadius: 1 },

  plaqWrap: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H },
  plaque: {
    position: 'absolute', top: PLAQUE_T, width: FRAME_W, height: PLAQUE_H,
    borderWidth: 1.5, borderColor: SOFT, borderRadius: 3, backgroundColor: PAPER,
    alignItems: 'center', justifyContent: 'center',
  },
  plaqueText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.8, color: INK,
    includeFontPadding: false,
  },

  sameTag: {
    position: 'absolute', left: FRAME_LX, top: SAME_T, width: WALL_R - WALL_L, height: SAME_H,
    borderWidth: 1.5, borderColor: INK, borderRadius: 3, backgroundColor: INK,
    alignItems: 'center', justifyContent: 'center',
  },
  sameText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1, color: PAPER,
    includeFontPadding: false,
  },

  card: { position: 'absolute', left: WALL_L, width: WALL_R - WALL_L },
  cardInner: {
    height: CARD_H, borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: PAPER,
    alignItems: 'center', justifyContent: 'center',
  },
  cardText: {
    fontFamily: 'Inter_700Bold', fontSize: 12, letterSpacing: 0.3, color: INK,
    includeFontPadding: false,
  },
  onInk: { color: PAPER },
  pickRight: { backgroundColor: INK, borderColor: INK },
  pickWrong: { borderColor: SOFT, opacity: 0.45 },
});

// Ink runs from the frames' top edge (226) to the ground line (500). Band 220…512
// is 292 units, inside the 280–300 its siblings occupy (H59).
export function Aesthetics11Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Aesthetics11Scene} band={[220, 512]} camera={CAM} />;
}
