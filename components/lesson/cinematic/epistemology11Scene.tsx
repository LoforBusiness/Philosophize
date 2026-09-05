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
import { BEATS } from './epistemology11Script';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, STONE, SOFT, RULE, PAPER, useHeld, carryFrom, keepHeld, facing, useCarry, carry, lookPose,
} from './cinematicKit';
import { followMoves, kindOf, seedOf } from './camera';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';

// Two clock dials side by side, high above the figure. The LEFT one is the hallway
// clock: its hands are frozen at 3:00 and never move again. The RIGHT one is the
// real time, and its hands are driven by the beat, so the sweep is exact rather
// than free-running. On the hook they read the same and a tie-line is drawn between
// them; from beat 1 the right dial moves on and they never agree again.
//
// COMPOSITION / OCCLUSION —
//   · the figure WALKS x = 80 → 154 (74 units) → 226 (72 units) and stops there.
//     Both walks clear the 60-unit floor (C18) and the track is monotonic, so he
//     faces right the whole lesson and never flips.
//   · MEASURED off the rig at the pose each beat actually holds, swept across the
//     whole transition (B9a) rather than assumed at ±36: the body spans
//     x 54.2 … 262.8 over the lesson, widest at beat 4 (gesture 5, arms opposed)
//     and beat 6 (gesture 21, both hands out). He is the only figure on stage.
//   · the figure's HIGHEST ink is y 396.2 standing and 394.7 mid-walk, where the
//     gait's bob lifts the crown. Nothing else is drawn below y 386, so props and
//     figure cannot occlude each other on any beat (D23) — and the beat that draws
//     the answer row carries no walk, so it is the 396.2 that has to clear.
//   · his LOWEST ink is y 505.5 (the ankle cap, radius 5.5, on GROUND 500).
//   · the two dials are 88 across: LEFT x 72 … 160, RIGHT x 240 … 328, both
//     y 226 … 314. 80 units of clear paper between the rims.
//   · captions y 204 … 218 — the left box x 8 … 224, the right x 224 … 344, so the
//     two never share a pixel (D31).
//   · the tie-line lives only in the gutter between the dials, x 164 … 236 at
//     y 269 … 271 — clear of both rims by 4 units. Its label sits above it at
//     y 246 … 258; the label's BOX is 96 wide (x 152 … 248) so the word cannot
//     wrap, but the glyphs themselves run about x 170 … 230, inside the gutter.
//   · the three moment cards (Q2 only) run y 336 … 386, x 14 … 386, stopping 10.2
//     units above the crown that beat holds.
//   · nothing is drawn above y 204 or below y 505.5 → band [200, 512], height 312,
//     with 4 units of air on top and 6.5 below. Same crop as logic-9 and for the
//     same reason: the vertical stack is caption + a dial big enough to read + an
//     answer row + a standing figure, and 312 still fits at 2.07× (H59).
//
// DELIBERATE EXCEPTIONS (A5) —
//   · The dials are 88 units against a 103-unit figure, which is far larger than a
//     real hallway clock next to a real person. They are an information surface
//     above the crown, not an object sharing his floor, and the whole lesson is
//     reading two dials against each other: legibility outranks literal scale
//     (D32). B7 governs ground-sharing props, and there are none here.
//   · The brief asked for the STOPPED mark UNDER the left dial. There is no clear
//     paper there once the answer row is live on beat 6 — a tag at y 316…332 would
//     sit 4 units off the cards, which is a collision, not a design (D31) — and the
//     mark has to stay visible on exactly that beat. It is folded into the left
//     dial's caption instead, and the frozen reading is printed inside the dial.

const DIAL_R = 44;
const DIAL_D = DIAL_R * 2;
const DIAL_CY = 270;
const DIAL_T = DIAL_CY - DIAL_R;      // 226
const LEFT_CX = 116;
const RIGHT_CX = 284;

const CAP_T = 204;                    // caption row, lineHeight 14 → 204 … 218

const HOUR_LEN = 26;
const MIN_LEN = 36;                   // tip 8 units inside the rim
const HOUR_W = 3.5;
const MIN_W = 2.5;
const SEC_LEN = 39;                   // longer than the minute hand, tip 5 inside the rim
const SEC_W = 1.5;

// The hallway clock is stopped at 3:00: hour hand a quarter turn (right), minute
// hand straight up. These are the only two literal angles in the file — every other
// angle is derived from the beat's `real` minutes.
const FROZEN_HOUR = 90;
const FROZEN_MIN = 0;

// The tie-line drawn in the gutter on the one beat the two dials agree.
const LINK_CX = 200;                  // the gutter centre, midway between the rims
const LINK_W = 72;                    // the line itself: x 164 … 236
const LINK_BOX = 96;                  // its label's box — wider, so the word cannot wrap
const LINK_Y = 269;
const LINK_CAP_T = 246;

// SIZED FOR A FINGER (E37b-2). Author the PITCH first: 128 units centre-to-centre,
// with a 116-wide card in it. The band is 312, so on a 360dp phone
// fit = min(352/400, 296/312) = 0.88 — the card renders 102 × 44 dp on a 113 dp
// pitch. The slop below is exactly half the gutter, taking the live target to
// 113 × 54 dp: past the 48 dp Android asks for and past the ~45 dp a fingertip
// actually covers. More slop would overlap the neighbour and the topmost would
// silently win, which makes wrong-answer taps worse rather than better.
const PICK_T = 336;
const PICK_H = 50;
const PICK_W = 116;
const PICK_PITCH = 128;
const PICK_L = 14;                    // lefts 14 · 142 · 270, right edge 386
/** Half the gutter — never more (E37b-2). */
const PICK_SLOP = (PICK_PITCH - PICK_W) / 2;

// The three candidate moments, and the hour-hand angle each one sits at on the
// right dial's rim, so the cards and the sweep are visibly the same three places.
const MOMENTS = [
  { id: 'two', time: '2:00', note: 'AN HOUR BEFORE', correct: false, ang: 60 },
  { id: 'three', time: '3:00', note: 'WHEN YOU LOOKED', correct: true, ang: 90 },
  { id: 'four', time: '4:00', note: 'AN HOUR AFTER', correct: false, ang: 120 },
];

// Quarter pips, so a bordered circle with two lines in it reads as a clock face.
const PIPS = [0, 90, 180, 270].map((a) => {
  const r = (a * Math.PI) / 180;
  return { dx: Math.sin(r) * (DIAL_R - 8), dy: -Math.cos(r) * (DIAL_R - 8) };
});

const P = BEATS.map((b) => b.p ?? 0);
const X = BEATS.map((b) => b.x ?? 154);
// The camera, from the staging: it follows the figure this track describes,
// pulls back to scale 1 on every graded beat so a tap lands where it is aimed,
// and leans in on the quote. See followMoves in ./camera.ts.
const CAM = followMoves(X, BEATS.map(kindOf), seedOf('epistemology11'));
const DIR = dirsFrom(X, 1);
const REAL = BEATS.map((b) => b.real ?? 180);
const LINKV = BEATS.map((b) => b.link ?? 0);

export default function Epistemology11Scene({ clock, bt, bi, i, picked, onPick, gazeX, gazeY, gazeOn }: SceneApi) {
  const heldS = useHeld();
  const cv = useCarry(3);
  const cur = BEATS[i];
  const prev = i > 0 ? BEATS[i - 1] : undefined;

  const pickOn = (cur.pick ?? 0) > 0;
  const pickFade = pickOn !== ((prev?.pick ?? 0) > 0);
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

    // The real time blends from the previous beat's minutes to this one's, so the
    // hands SWEEP between readings instead of cutting. Minutes are unbounded (6°
    // each) rather than taken modulo an hour — a modulo would make the minute hand
    // jump backwards mid-transition, and a rotation past 360° draws identically.
    const mins = carry(cv, 0, n, REAL[p], REAL[n], tr);

    return {
      fig: lookPose(s, carry(cv, 1, n, X[p], X[n], tr), GROUND, K_FIG, facing(DIR[p], DIR[n], bt.value), 1, gazeX.value, gazeY.value, gazeOn.value),
      hour: mins * 0.5,
      minute: mins * 6,
      // ── THE ONE THING THAT SAYS IT IS RUNNING ─────────────────────────────
      //
      // The hour and minute hands are driven by the BEAT, deliberately, so the
      // readings are exact rather than free-running — and the cost of that is
      // that between two taps this dial is as motionless as the stopped one
      // beside it. The whole lesson is that one of these clocks is going and the
      // other is not, and for most of the time on screen the reader could not
      // tell which. A second hand is the field mark: it costs the exactness
      // nothing, because it never carries a reading.
      sec: (t * 6) % 360,
      // A plain previous→current blend, not the grow pattern: this value only ever
      // goes 1 → 0, and multiplying a falling lerp by a rising `grow` would blink
      // it out on the first frame of the beat and then bulge back (C20c/H58).
      link: carry(cv, 2, n, LINKV[p], LINKV[n], tr),
      // This one only ever goes 0 → 1, so it takes the house grow — and holds at 1
      // on any later beat instead of re-revealing itself on every tap.
      pick: (pickOn ? 1 : 0) * (pickFade ? grow : 1),
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);

  const hourStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${SCENE.value.hour}deg` }] }));
  const minStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${SCENE.value.minute}deg` }] }));
  const secStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${SCENE.value.sec}deg` }] }));
  const linkStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.link }));
  const pickStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.pick }));

  return (
    <Animated.View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      {/* ── captions ────────────────────────────────────────────────────────── */}
      <Text style={[styles.cap, styles.capL]} pointerEvents="none">HALLWAY CLOCK · STOPPED</Text>
      <Text style={[styles.cap, styles.capR]} pointerEvents="none">REAL TIME</Text>

      {/* ── the hallway clock: frozen at 3:00, and it stays frozen ───────────── */}
      <View style={[styles.dial, styles.dialL]} pointerEvents="none" />
      {PIPS.map((q, k) => (
        <View
          key={`lp${k}`}
          style={[styles.pip, { left: LEFT_CX + q.dx - 2, top: DIAL_CY + q.dy - 2 }]}
          pointerEvents="none"
        />
      ))}
      <View
        style={[styles.hand, styles.hourHand, { left: LEFT_CX - HOUR_W / 2 }, { transform: [{ rotate: `${FROZEN_HOUR}deg` }] }]}
        pointerEvents="none"
      />
      <View
        style={[styles.hand, styles.minHand, { left: LEFT_CX - MIN_W / 2 }, { transform: [{ rotate: `${FROZEN_MIN}deg` }] }]}
        pointerEvents="none"
      />
      <View style={styles.reading} pointerEvents="none">
        <Text style={styles.readingText}>3:00</Text>
      </View>
      <View style={[styles.pin, { left: LEFT_CX - 3.5 }]} pointerEvents="none" />

      {/* ── the real time: the hands are driven by the beat ──────────────────── */}
      <View style={[styles.dial, styles.dialR]} pointerEvents="none" />
      {PIPS.map((q, k) => (
        <View
          key={`rp${k}`}
          style={[styles.pip, { left: RIGHT_CX + q.dx - 2, top: DIAL_CY + q.dy - 2 }]}
          pointerEvents="none"
        />
      ))}

      {/* the three moments the cards name, marked on the sweep they belong to */}
      {MOMENTS.map((m) => (
        <Animated.View
          key={`mk${m.id}`}
          style={[styles.tickWrap, { transform: [{ rotate: `${m.ang}deg` }] }, pickStyle]}
          pointerEvents="none"
        >
          <View style={styles.tick} />
        </Animated.View>
      ))}

      <Animated.View
        style={[styles.hand, styles.hourHand, { left: RIGHT_CX - HOUR_W / 2 }, hourStyle]}
        pointerEvents="none"
      />
      <Animated.View
        style={[styles.hand, styles.minHand, { left: RIGHT_CX - MIN_W / 2 }, minStyle]}
        pointerEvents="none"
      />
      <Animated.View
        style={[styles.hand, styles.secHand, { left: RIGHT_CX - SEC_W / 2 }, secStyle]}
        pointerEvents="none"
      />
      <View style={[styles.pin, { left: RIGHT_CX - 3.5 }]} pointerEvents="none" />

      {/* ── the one instant they agree, and then never again ─────────────────── */}
      <Animated.View style={[styles.linkWrap, linkStyle]} pointerEvents="none">
        <Text style={styles.linkCap}>THEY AGREE</Text>
        <View style={styles.linkLine} />
      </Animated.View>

      {/* ── Q2: which moment made the frozen reading true? ───────────────────── */}
      {pickOn &&
        MOMENTS.map((m, k) => {
          const chosen = picked === m.id;
          return (
            <Animated.View
              key={m.id}
              style={[styles.pickSlot, { left: PICK_L + k * PICK_PITCH }, pickStyle]}
            >
              <Target id={m.id} correct={m.correct} picked={picked} onPick={onPick}
              hitSlop={{ top: PICK_SLOP, bottom: PICK_SLOP, left: PICK_SLOP, right: PICK_SLOP }} disabled={answered}>
                <View
                  style={[
                    styles.pickInner,
                    answered && m.correct && styles.pickRight,
                    answered && chosen && !m.correct && styles.pickWrong,
                  ]}
                >
                  <Text style={[styles.pickTime, answered && m.correct && styles.pickTextOn]}>
                    {m.time}
                  </Text>
                  <Text style={[styles.pickNote, answered && m.correct && styles.pickTextOn]}>
                    {m.note}
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
  ground: { position: 'absolute', left: 24, right: 24, top: GROUND, height: 1.5, backgroundColor: RULE },
  // THE FLOOR THE GROUND LINE SITS ON. A rule on its own leaves the
  // figure and everything it is looking at standing on bare page;
  // political7 and political8 both stand their subject on a filled mass.
  floor: { position: 'absolute', left: 0, right: 0, top: GROUND, bottom: 0, backgroundColor: RULE },

  cap: {
    position: 'absolute', top: CAP_T, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 9, lineHeight: 14, letterSpacing: 1.2,
    color: SOFT, includeFontPadding: false,
  },
  capL: { left: 8, width: 216 },
  capR: { left: 224, width: 120 },

  dial: {
    position: 'absolute', top: DIAL_T, width: DIAL_D, height: DIAL_D,
    borderRadius: DIAL_R, borderWidth: 2.5, borderColor: INK, backgroundColor: STONE,
  },
  dialL: { left: LEFT_CX - DIAL_R },
  dialR: { left: RIGHT_CX - DIAL_R },
  pip: { position: 'absolute', width: 4, height: 4, borderRadius: 2, backgroundColor: SOFT },

  // A hand is its own rotating View, pinned by its BOTTOM edge to the dial centre,
  // so one rotate places it and nothing has to be re-derived per frame.
  hand: { position: 'absolute', backgroundColor: INK, borderRadius: 2, transformOrigin: '50% 100%' },
  hourHand: { top: DIAL_CY - HOUR_LEN, width: HOUR_W, height: HOUR_LEN },
  minHand: { top: DIAL_CY - MIN_LEN, width: MIN_W, height: MIN_LEN },
  // Thinner and longer than the minute hand, the way a real one is, so the two
  // are never mistaken for each other at a glance.
  secHand: { top: DIAL_CY - SEC_LEN, width: SEC_W, height: SEC_LEN },
  pin: { position: 'absolute', top: DIAL_CY - 3.5, width: 7, height: 7, borderRadius: 3.5, backgroundColor: INK },

  // The frozen reading, printed inside the lower half of the hallway dial. The box
  // is 60 wide at x 86…146, and at 20–32 below the centre the circle is still 60.4
  // wide — so it sits inside the rim rather than overhanging it. Neither frozen
  // hand (a quarter turn right, and straight up) comes near the bottom of the face.
  reading: { position: 'absolute', left: LEFT_CX - 30, top: DIAL_CY + 20, width: 60, alignItems: 'center' },
  readingText: {
    fontFamily: 'Inter_700Bold', fontSize: 12, letterSpacing: 0.6, color: SOFT,
    includeFontPadding: false,
  },

  tickWrap: {
    position: 'absolute', left: RIGHT_CX - 1.25, top: DIAL_T,
    width: 2.5, height: DIAL_R, transformOrigin: '50% 100%',
  },
  tick: { position: 'absolute', left: 0, top: 0, width: 2.5, height: 9, backgroundColor: INK },

  // The label's BOX is wider than the line it sits over (96 against 72) so a
  // ten-character word can never be broken onto a second line and strand a
  // fragment (D30). Only the box overhangs; the glyphs run about x 170 … 230.
  linkWrap: {
    position: 'absolute', left: LINK_CX - LINK_BOX / 2, top: LINK_CAP_T,
    width: LINK_BOX, alignItems: 'center',
  },
  linkCap: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 12, letterSpacing: 1.2,
    color: INK, includeFontPadding: false,
  },
  linkLine: { width: LINK_W, height: 2, backgroundColor: INK, marginTop: LINK_Y - LINK_CAP_T - 12 },

  pickSlot: { position: 'absolute', top: PICK_T, width: PICK_W },
  pickInner: {
    height: PICK_H, borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: STONE,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6,
  },
  pickRight: { backgroundColor: INK, borderColor: INK },
  pickWrong: { borderColor: SOFT },
  pickTime: {
    fontFamily: 'Inter_700Bold', fontSize: 15, lineHeight: 18, letterSpacing: 0.4,
    color: INK, includeFontPadding: false,
  },
  pickNote: {
    fontFamily: 'Inter_500Medium', fontSize: 8.6, lineHeight: 12, letterSpacing: 0.6,
    color: INK, marginTop: 2, includeFontPadding: false,
  },
  pickTextOn: { color: PAPER },
});

// Art runs from the caption row (204) to the ankle caps at 505.5. Nothing is drawn
// outside that, and the answer row stops 10.2 units short of the crown the beat
// that draws it actually holds (measured, not assumed — B9a).
export function Epistemology11Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Epistemology11Scene} band={[200, 512]} camera={CAM} />;
}
