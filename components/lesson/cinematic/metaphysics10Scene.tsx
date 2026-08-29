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
import { BEATS } from './metaphysics10Script';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, STONE, SOFT, RULE, PAPER, useHeld, carryFrom, keepHeld, facing, useCarry, carry,
} from './cinematicKit';
import { followMoves, kindOf, seedOf } from './camera';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';

// A wall shelf holding three particular red things — a rose, a ruby, a flag — and
// one card reading REDNESS that has to live somewhere. The card is the only thing
// on stage that moves between beats: up into a framed slot of its own, down into
// three tags pinned on the objects, or out onto a pair of strings under the shelf
// where it touches nothing.
//
// COMPOSITION / OCCLUSION — every number measured, not eyeballed.
//   · the FIGURE walks once, x = 64 → 124, and never moves again (see the note on
//     the single walk below). Measured off the rig at every pose these nine beats
//     actually hold, and across the walk transition (B9a — the resting ± 36 is not
//     the number), his ink covers x 38.3 … 162.3 and y 393.4 … 506. The widest is
//     beat 3's sweep (code 5) at x 162.3, not the two-handed poses.
//   · EVERY prop lives at x ≥ 192, so there are 29.7 clear units between the
//     figure and the shelf column at its closest, and he never covers what he is
//     teaching from (D23/D24 — the shelf is a narrow column he stands BESIDE).
//   · the three candidate homes share one rect: x 192 … 382, height 46.
//       A "in a realm of its own"  y 214 … 260  (centre 237)
//       B "only in the red things" y 310 … 356  (centre 333)
//       C "nowhere · just a name"  y 448 … 494  (centre 471)
//     Pitches 96 and 138 — see the dp arithmetic on SLOT_SLOP below.
//   · the objects stand in y 364 … 404, on a plank at y 404 … 424 whose face
//     carries their names; brackets 424 … 438; the two bare strings 424 … 448.
//   · the REDNESS card is 120 × 34 at x 227 … 347, and only its TOP changes:
//     270 unplaced · 220 in the frame · 448 on the strings.
//   · highest ink is the frame at y 214; lowest is the foot cap at y 506 (the
//     ground line itself is 500) — hence band [206, 512], 306 units. Slot C's
//     touch slop reaches y 508, still inside the crop, so no part of a tap target
//     is clipped away by the overflow:hidden the band is drawn in.
//
// A5 — DELIBERATE COMPROMISES.
//   · ONE WALK ONLY. The props own x ≥ 192 and the figure's widest pose spans
//     ± 40, so x = 124 is as far right as he can stand; any second move would have
//     to go left, which flips his facing away from the shelf he is talking about
//     and snaps him to a mirrored copy in one frame (C18). He gets his variety
//     from the gesture instead — nine beats, nine silhouettes.
//   · THE ROSE IS A DISC ON A STEM. At 40 units tall a stroked flower closes into
//     a blob (B16c), so all three objects are drawn FILLED and simple, and the
//     plank face names them — a labelled plate beats an ambiguous shape.

// ── the three candidate homes ────────────────────────────────────────────────
const SLOT_L = 192;
const SLOT_W = 190;
const SLOT_H = 46;
const SLOT_A_T = 214;         // Plato: a framed slot above everything
const SLOT_B_T = 310;         // Aristotle: down on the things
const SLOT_C_T = 448;         // the nominalist: out on the strings, touching nothing
// SIZED FOR A FINGER (E37b-2). The band is 306 units, so this lesson renders at
// fit ≈ 0.88 on a 360dp phone: a 46-unit card is 40dp and the closest pitch (A→B,
// 96 units) is 85dp. `hitSlop` 14 makes each target 74 units — 65dp — which clears
// Android's 48dp and the ~45dp a fingertip covers, while the nearest two slop
// boxes still stop 22 units apart, so no target can ever swallow its neighbour.
const SLOT_SLOP = 14;

// ── the card that cannot settle ──────────────────────────────────────────────
const CARD_W = 120;
const CARD_H = 34;
const CARD_X = SLOT_L + (SLOT_W - CARD_W) / 2;    // 227
/** Card top per `card` state: 0 gone · 1 unplaced · 2 in the frame · 3 on the strings. */
const CARD_Y = [0, 270, 220, 448];
const CARD_Y0 = CARD_Y[1];                        // where the card is laid out; the rest is translateY

// ── the shelf, its objects and their strings ─────────────────────────────────
const PLANK_T = 404;
const PLANK_H = 20;
const OBJ_T = 364;                                // objects stand in y 364…404
const OBJ_X = [236, 287, 338];                    // rose · ruby · flag centres
const OBJ_NAMES = ['ROSE', 'RUBY', 'FLAG'];
const TAG_W = 36;
const TAG_H = 22;                                 // 22, not 20: 4 units of slack for Android font padding (D29)
const TAG_T = 336;                                // tag 336…358, pin 358…364, object top 364
const STR_T = PLANK_T + PLANK_H;                  // 424 — the strings leave the plank's underside
const STR_H = CARD_Y[3] - STR_T;                  // 24 — and meet the card's top edge exactly

const HOMES = [
  { id: 'realm', top: SLOT_A_T, label: 'IN A REALM OF ITS OWN', correct: false },
  { id: 'things', top: SLOT_B_T, label: 'ONLY IN THE RED THINGS', correct: false },
  { id: 'name', top: SLOT_C_T, label: 'NOWHERE · JUST A NAME', correct: true },
];

const P = BEATS.map((b) => b.p ?? 0);
const X = BEATS.map((b) => b.x ?? 124);
// The camera, from the staging: it follows the figure this track describes,
// pulls back to scale 1 on every graded beat so a tap lands where it is aimed,
// and leans in on the quote. See followMoves in ./camera.ts.
const CAM = followMoves(X, BEATS.map(kindOf), seedOf('metaphysics10'));
const DIR = dirsFrom(X, 1);
const CARDV = BEATS.map((b) => b.card ?? 0);
// The card's y per beat, carrying the last real position forward through the beats
// where it is gone — so a fade-out happens exactly where the card was standing
// instead of sliding away while it disappears (C20c).
const CARD_TOP = (() => {
  const out: number[] = [];
  let last = CARD_Y[1];
  for (const v of CARDV) {
    if (v > 0) last = CARD_Y[v];
    out.push(last);
  }
  return out;
})();

export default function Metaphysics10Scene({ clock, bt, bi, i, picked, onPick }: SceneApi) {
  const heldS = useHeld();
  const cv = useCarry(2);
  const cur = BEATS[i];
  const prev = i > 0 ? BEATS[i - 1] : undefined;

  // A prop only fades on the beat that CHANGES it; otherwise it holds, so nothing
  // re-reveals itself behind the reader every time they tap forward (H58, C20c).
  const frameOn = (cur.frame ?? 0) > 0;
  const frameFade = frameOn !== ((prev?.frame ?? 0) > 0);
  const tagsOn = (cur.tags ?? 0) > 0;
  const tagsFade = tagsOn !== ((prev?.tags ?? 0) > 0);
  const strOn = (cur.str ?? 0) > 0;
  const strFade = strOn !== ((prev?.str ?? 0) > 0);
  const slotsOn = (cur.slots ?? 0) > 0 && !!cur.interact;
  const slotsFade = slotsOn !== ((prev?.slots ?? 0) > 0);
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

    // Both ends on → the card TRAVELS between its two homes. One end off → it
    // fades in (or out) standing still, at the home it belongs to.
    const on = CARDV[n] > 0;
    const was = CARDV[p] > 0;

    return {
      fig: pose(s, carry(cv, 0, n, X[p], X[n], tr), GROUND, K_FIG, facing(DIR[p], DIR[n], bt.value), 1),
      frame: (frameOn ? 1 : 0) * (frameFade ? grow : 1),
      tags: (tagsOn ? 1 : 0) * (tagsFade ? grow : 1),
      str: (strOn ? 1 : 0) * (strFade ? grow : 1),
      slots: (slotsOn ? 1 : 0) * (slotsFade ? grow : 1),
      cardV: on ? (was ? 1 : grow) : (was ? 1 - grow : 0),
      cardT: was ? carry(cv, 1, n, CARD_TOP[p], CARD_TOP[n], tr) : CARD_TOP[n],
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const frameStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.frame }));
  const tagStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.tags,
    transform: [{ translateY: (1 - SCENE.value.tags) * -6 }],
  }));
  const strStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.str }));
  const slotStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.slots }));
  const cardStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.cardV,
    transform: [{ translateY: SCENE.value.cardT - CARD_Y0 }],
  }));

  return (
    <Animated.View style={styles.scene}>
      {/* ── Plato's empty slot, high above and separate from everything ─────── */}
      <Animated.View style={[styles.frame, frameStyle]} pointerEvents="none" />

      {/* ── the shelf of particulars ────────────────────────────────────────── */}
      <View style={styles.plank} pointerEvents="none" />
      <View style={[styles.bracket, styles.bracketL]} pointerEvents="none" />
      <View style={[styles.bracket, styles.bracketR]} pointerEvents="none" />
      {OBJ_NAMES.map((nm, k) => (
        <Text key={nm} style={[styles.plate, { left: OBJ_X[k] - 24 }]} pointerEvents="none">
          {nm}
        </Text>
      ))}

      {/* the rose: a filled head on a stem, with two leaves */}
      <View style={styles.roseHead} pointerEvents="none" />
      <View style={styles.roseStem} pointerEvents="none" />
      <View style={[styles.leaf, styles.leafL]} pointerEvents="none" />
      <View style={[styles.leaf, styles.leafR]} pointerEvents="none" />
      {/* the ruby: a filled square stood on its corner */}
      <View style={styles.ruby} pointerEvents="none" />
      {/* the flag: a pole and a filled panel */}
      <View style={styles.pole} pointerEvents="none" />
      <View style={styles.flag} pointerEvents="none" />

      {/* ── Aristotle: the card split into three tags, pinned onto the things ─ */}
      {OBJ_X.map((cx, k) => (
        <Animated.View key={`tag${cx}`} style={[styles.tagWrap, { left: cx - TAG_W / 2 }, tagStyle]} pointerEvents="none">
          <View style={styles.tag}>
            <Text style={styles.tagText}>RED</Text>
          </View>
          <View style={styles.pin} />
        </Animated.View>
      ))}

      {/* ── the nominalist's peg: two bare strings, holding nothing but a word ─ */}
      <Animated.View style={[styles.string, styles.stringL, strStyle]} pointerEvents="none" />
      <Animated.View style={[styles.string, styles.stringR, strStyle]} pointerEvents="none" />

      {/* ── the card that has to go somewhere ───────────────────────────────── */}
      <Animated.View style={[styles.card, cardStyle]} pointerEvents="none">
        <Text style={styles.cardText}>REDNESS</Text>
      </Animated.View>

      {/* ── Q2: put the card where a nominalist would ───────────────────────── */}
      {slotsOn &&
        HOMES.map((h) => {
          const chosen = picked === h.id;
          return (
            <Animated.View key={h.id} style={[styles.slotWrap, { top: h.top }, slotStyle]}>
              <Target id={h.id} correct={h.correct} picked={picked} onPick={onPick}
              hitSlop={{ top: SLOT_SLOP, bottom: SLOT_SLOP, left: SLOT_SLOP, right: SLOT_SLOP }} disabled={answered}>
                <View
                  style={[
                    styles.slot,
                    answered && h.correct && styles.slotRight,
                    answered && chosen && !h.correct && styles.slotWrong,
                  ]}
                >
                  <Text style={[styles.slotText, answered && h.correct && styles.slotTextOn]}>
                    {h.label}
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
  ground: { position: 'absolute', left: 24, right: 14, top: GROUND, height: 1.5, backgroundColor: RULE },

  // Plato's slot: an outline with nothing behind it, drawn dashed so it reads as a
  // place reserved rather than as another object on the shelf.
  frame: {
    position: 'absolute', left: SLOT_L, top: SLOT_A_T, width: SLOT_W, height: SLOT_H,
    borderWidth: 2, borderColor: SOFT, borderStyle: 'dashed', borderRadius: 4,
  },

  plank: {
    position: 'absolute', left: SLOT_L, top: PLANK_T, width: SLOT_W, height: PLANK_H,
    borderWidth: 2, borderColor: INK, borderRadius: 3, backgroundColor: STONE,
  },
  bracket: { position: 'absolute', top: PLANK_T + PLANK_H, width: 12, height: 14, backgroundColor: SOFT, borderRadius: 2 },
  bracketL: { left: SLOT_L + 8 },
  bracketR: { left: SLOT_L + SLOT_W - 20 },
  // The names are engraved on the plank's face, which is the only clear strip on
  // the shelf — 48 units wide, so four capitals never wrap (D30).
  plate: {
    position: 'absolute', top: PLANK_T + 5, width: 48, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.2, color: SOFT,
    includeFontPadding: false,
  },

  roseHead: { position: 'absolute', left: OBJ_X[0] - 11, top: OBJ_T + 1, width: 22, height: 22, borderRadius: 11, backgroundColor: INK },
  roseStem: { position: 'absolute', left: OBJ_X[0] - 1.25, top: OBJ_T + 21, width: 2.5, height: 19, backgroundColor: INK },
  leaf: { position: 'absolute', top: OBJ_T + 24, width: 11, height: 4, borderRadius: 2, backgroundColor: INK },
  leafL: { left: OBJ_X[0] - 12, transform: [{ rotate: '-24deg' }] },
  leafR: { left: OBJ_X[0] + 1, transform: [{ rotate: '24deg' }] },

  ruby: {
    position: 'absolute', left: OBJ_X[1] - 13, top: OBJ_T + 8, width: 26, height: 26,
    backgroundColor: INK, transform: [{ rotate: '45deg' }],
  },

  pole: { position: 'absolute', left: OBJ_X[2] - 1.25, top: OBJ_T, width: 2.5, height: 40, backgroundColor: INK },
  flag: { position: 'absolute', left: OBJ_X[2] + 1.25, top: OBJ_T + 2, width: 28, height: 20, backgroundColor: INK, borderRadius: 1 },

  tagWrap: { position: 'absolute', top: TAG_T, width: TAG_W, alignItems: 'center' },
  tag: {
    width: TAG_W, height: TAG_H, borderWidth: 1.5, borderColor: INK, borderRadius: 3,
    backgroundColor: STONE, alignItems: 'center', justifyContent: 'center',
  },
  tagText: { fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 0.6, color: INK, includeFontPadding: false },
  /** The pin that fixes the tag to the thing under it — 6 units down to the object. */
  pin: { width: 1.5, height: 6, backgroundColor: INK },

  string: { position: 'absolute', top: STR_T, width: 1.5, height: STR_H, backgroundColor: SOFT },
  stringL: { left: CARD_X + 26 },
  stringR: { left: CARD_X + CARD_W - 27.5 },

  card: {
    position: 'absolute', left: CARD_X, top: CARD_Y0, width: CARD_W, height: CARD_H,
    borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: INK,
    alignItems: 'center', justifyContent: 'center',
  },
  cardText: { fontFamily: 'Inter_700Bold', fontSize: 15, letterSpacing: 1.2, color: PAPER, includeFontPadding: false },

  slotWrap: { position: 'absolute', left: SLOT_L, width: SLOT_W },
  slot: {
    height: SLOT_H, borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: STONE,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8,
  },
  slotRight: { backgroundColor: INK, borderColor: INK },
  slotWrong: { borderColor: SOFT },
  slotText: { fontFamily: 'Inter_700Bold', fontSize: 11.5, letterSpacing: 0.3, color: INK, includeFontPadding: false },
  slotTextOn: { color: PAPER },
});

// Art runs from Plato's slot (214) down to the figure's foot caps (506), and the
// lowest touch slop reaches 508 — nothing is drawn above or below, so the player
// crops to [206, 512]. 306 units renders at 2.11×, against 1.15× for the whole
// design space, and sits on the 308-unit median of the other 59 scenes.
export function Metaphysics10Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Metaphysics10Scene} band={[206, 512]} camera={CAM} />;
}
