import {
  View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import {
  WALK, dirsFrom, ease01, lerp, moveTr, pose, seg, travelStance, type Bundle, } from './rig';
// The whole movement library, not just rig's 49 emotes: codes under 100 are
// exactly rig's and mean what they always did, 100+ reach moves.ts (see emoteAny).
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './logic11Script';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, STONE, SOFT, RULE, PAPER, useHeld, carryFrom, keepHeld, facing, useCarry, carry,
} from './cinematicKit';
import { followMoves, kindOf, seedOf } from './camera';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';

// A four-step proof standing as a stack of cards on a base line, stage right, with
// the narrator downstage left. The stack builds top-down, the base line slides in
// under it ("RESTING ON: EVIDENCE"), and when the reader taps the step that closes
// the circle a return arrow springs out of it and back up into step 1 — at which
// point the WHOLE STACK LIFTS off the line, leaving a visible gap underneath and a
// caption reading "RESTING ON: —". A structure holding itself up.
//
// COMPOSITION / OCCLUSION —
//   · the narrator WALKS x = 48 → 116 once (68 units) and never turns; DIR is +1 on
//     every beat. His widest settled pose here is 13 point-forward (fist x 34, fist
//     radius 5.5) → right extent x ≈ 155.5 at the far mark. The walk itself is
//     NARROWER (a swinging fist tops out at x +16.7, +5.5 → 138).
//   · the stack occupies x 168 … 368, and the return arrow's channel x 363 … 381.
//     The nearest ink to the figure is the stack's left border at 168 → 12.5 units
//     of clear paper at the worst beat. Poses 7 / 29 (both hands wide, x ±37.5) are
//     deliberately NOT used at x 116; they would close that gap to 3.
//   · the four cards run y 222 … 454 (tops 222 · 284 · 346 · 408, height 46, pitch
//     62). The base bar is y 466 … 469 with two posts down to the ground line at
//     500, and the caption y 476 … 490 sits between the posts (text x ≈ 193 … 343).
//   · LIFTED (18 units) the cards run y 204 … 436, leaving a 30-unit gap above the
//     base bar. y 204 is the topmost ink this scene can ever draw, hence band 198.
//   · the figure's crown is y 397 and its feet are on GROUND 500 — both inside the
//     band, and in a column the stack never enters.
//
// A5 — DELIBERATE EXCEPTIONS.
//   · The brief's stack column was x 180…386. It moved left to 168…368 to buy the
//     step labels ~20 more units of text width, which is what keeps a 24-character
//     label on ONE line (D30) at a size that is still readable. The figure's marks
//     moved left with it, so the 12.5-unit gutter above is unchanged.
//   · The stack runs LOW — bottom card y 408…454, its posts down to the ground —
//     rather than being squeezed above the figure's crown at 397. That is the only
//     way four cards fit at a 62-unit pitch, and a tap target has to be a finger
//     wide (E37b-2): 4 × 62 is 248 units of stack. The two columns never share an x.
//   · The band is 314 against the pack's 310 median — 2.06× where the median is
//     2.09×. The stack IS the lesson and every one of those rows is a card the
//     reader has to read and hit; there is nothing decorative in the crop to give
//     back.
//   · H61's wrong-pick dim (SOFT border at 0.45 opacity) puts the 0.45 inside the
//     frame worklet rather than in a static style, because each card's opacity key
//     is already carrying its reveal and the two would otherwise fight over it.

const STACK_L = 168;
const STACK_W = 200;                 // → right edge 368
const BOX_H = 46;
const PITCH = 62;
const BOX_T = 222;
// SIZED FOR A FINGER. Band 314 → fit ≈ min(0.88, 296/314) = 0.88 dp per design unit
// on a 360dp phone. So a card is 46 × 0.88 = 40.5dp on a PITCH of 62 × 0.88 =
// 54.6dp — clear of Android's 48dp target and of the ~45dp a fingertip actually
// covers. The slop below is exactly half the 16-unit gutter, so the live targets
// tile the pitch edge to edge and never OVERLAP (more, and the topmost would win).
const SLOP = (PITCH - BOX_H) / 2;

const BASE_Y = 466;                  // the line the whole proof is standing on
const POST_W = 3;
const CAP_T = 476;
const LIFT = 18;                     // how far the stack leaves the line

const ARROW_X = 378;                 // the return arrow's channel, right of the stack
const TOP_MID = BOX_T + BOX_H / 2;                 // step 1's middle — where it lands
const BOT_MID = BOX_T + 2 * PITCH + BOX_H / 2;     // step 3's middle — where it starts

// The four steps, in the data file's order, shortened to fit a card. Correct = s3:
// it establishes God from the book, while s1 has already established the book from
// God — so the two hold each other up and nothing from outside ever gets in.
const STEP_CARDS = [
  { id: 's1', n: '1', label: 'This book is God’s word.', correct: false },
  { id: 's2', n: '2', label: 'What God says is true.', correct: false },
  { id: 's3', n: '3', label: 'God exists, because the book says so.', correct: true },
  { id: 's4', n: '4', label: 'So the book is all true.', correct: false },
];

const P = BEATS.map((b) => b.p ?? 0);
const X = BEATS.map((b) => b.x ?? 116);
// The camera, from the staging: it follows the figure this track describes,
// pulls back to scale 1 on every graded beat so a tap lands where it is aimed,
// and leans in on the quote. See followMoves in ./camera.ts.
const CAM = followMoves(X, BEATS.map(kindOf), seedOf('logic11'));
const DIR = dirsFrom(X, 1);
const STEPS = BEATS.map((b) => b.steps ?? 0);
const BASEV = BEATS.map((b) => b.base ?? 0);
const SPINEV = BEATS.map((b) => b.spine ?? 0);
const ARCV = BEATS.map((b) => b.arc ?? 0);

// R7b — the stage follows the control on its own graded beat, and only there.
// Derived from the beat rather than declared as a channel so it cannot fall out
// of step with the control it is about.
const REACT = BEATS.map((b) => (b.interact?.drag ? 1 : 0));

/**
 * One card's opacity. It is SOLID once it is up and fades in only on the beat that
 * actually adds it, so tapping forward never re-reveals the stack (C20c).
 * Declared above the derived value that calls it — a worklet calling a worklet
 * defined later in the file captures `undefined` and blanks the stage (G47).
 */
function stepOp(k: number, p: number, n: number, grow: number) {
  'worklet';
  if (STEPS[n] <= k) return 0;
  return STEPS[p] > k ? 1 : grow;
}

export default function Logic11Scene({ clock, bt, bi, qv, i, picked, onPick, dragPos }: SceneApi) {
  const reacting = REACT[i] === 1;
  const heldS = useHeld();
  const cv = useCarry(3);
  const cur = BEATS[i];
  const prev = i > 0 ? BEATS[i - 1] : undefined;

  // Only the beat that CHANGES a prop animates it; otherwise it holds (H58, C20c).
  const baseFade = (cur.base ?? 0) !== (prev?.base ?? 0);
  const spineFade = (cur.spine ?? 0) !== (prev?.spine ?? 0);

  const answered = picked !== null;
  const live = (cur.pick ?? 0) > 0 && !!cur.interact && !answered;
  // Which card the reader got wrong, if any — dimmed inside the worklet so it
  // composes with the reveal instead of fighting it for the opacity key.
  const wrongIdx = answered ? STEP_CARDS.findIndex((c) => c.id === picked && !c.correct) : -1;

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

    // THE PAYOFF, IN ORDER (C22c): the stub leaves step 3, the line climbs the
    // outside, the head lands on step 1 — and only then does the stack leave its
    // base. `qv` is the player's 0→1 answer ramp and ARCV gates it to the one beat
    // that owns it, so answering the deck's question a beat earlier moves nothing.
    const a = ARCV[n];
    const drawA = a * ease01(seg(qv.value, 0.02, 0.30));
    const drawB = a * ease01(seg(qv.value, 0.12, 0.50));
    const drawC = a * ease01(seg(qv.value, 0.40, 0.62));
    const lift = a * ease01(seg(qv.value, 0.58, 1.0));

    return {
      fig: pose(s, carry(cv, 0, n, X[p], X[n], tr), GROUND, K_FIG, facing(DIR[p], DIR[n], bt.value), 1),
      base: carry(cv, 1, n, BASEV[p], BASEV[n], tr, baseFade ? grow : 1),
      // R7b — the knob draws the chain of support. Drag toward IT PROVES THE
      // CONCLUSION and the stubs down the stack's left appear — and the reader can see
      // the top one running back into the bottom, which is the circle.
      spine: carry(cv, 2, n, SPINEV[p], reacting ? dragPos.value : SPINEV[n], tr, spineFade ? grow : 1),
      s0: stepOp(0, p, n, grow) * (wrongIdx === 0 ? 0.45 : 1),
      s1: stepOp(1, p, n, grow) * (wrongIdx === 1 ? 0.45 : 1),
      s2: stepOp(2, p, n, grow) * (wrongIdx === 2 ? 0.45 : 1),
      s3: stepOp(3, p, n, grow) * (wrongIdx === 3 ? 0.45 : 1),
      drawA, drawB, drawC, lift,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);

  const stackStyle = useAnimatedStyle(() => ({ transform: [{ translateY: -SCENE.value.lift * LIFT }] }));
  const baseStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.base }));
  const spineStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.spine }));
  // The two captions never overlap: the old one is gone by lift 0.4 and the new one
  // starts at 0.6. A caption cross-dissolving with itself is a smear (C22).
  const capOnStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.base * (1 - ease01(seg(SCENE.value.lift, 0, 0.4))),
  }));
  const capOffStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.base * ease01(seg(SCENE.value.lift, 0.6, 1)),
  }));

  const armLowStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.drawA }));
  const armUpStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.drawB > 0 ? 1 : 0,
    transform: [{ scaleY: SCENE.value.drawB }],
  }));
  const headStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.drawC }));

  const st0 = useAnimatedStyle(() => ({ opacity: SCENE.value.s0 }));
  const st1 = useAnimatedStyle(() => ({ opacity: SCENE.value.s1 }));
  const st2 = useAnimatedStyle(() => ({ opacity: SCENE.value.s2 }));
  const st3 = useAnimatedStyle(() => ({ opacity: SCENE.value.s3 }));
  const STEP_STYLES = [st0, st1, st2, st3];

  return (
    <Animated.View style={styles.scene}>
      {/* ── what the proof is standing on. FIXED: the stack leaves it, not the reverse ── */}
      <Animated.View style={[styles.baseBar, baseStyle]} pointerEvents="none" />
      <Animated.View style={[styles.postL, baseStyle]} pointerEvents="none" />
      <Animated.View style={[styles.postR, baseStyle]} pointerEvents="none" />
      <Animated.View style={[styles.capWrap, capOnStyle]} pointerEvents="none">
        <Text style={styles.cap}>RESTING ON: EVIDENCE</Text>
      </Animated.View>
      <Animated.View style={[styles.capWrap, capOffStyle]} pointerEvents="none">
        <Text style={styles.cap}>RESTING ON: —</Text>
      </Animated.View>

      {/* ── the stack: cards, the chain down their left, the loop up their right.
          box-none so the container itself never eats a tap while its Pressables
          still get one — it spans the stage so hitSlop is not clipped (E35, H62). ── */}
      <Animated.View style={[styles.stack, stackStyle]} pointerEvents="box-none">
        {/* the chain of support: one stub in each gutter between consecutive steps */}
        <Animated.View style={[styles.link, { top: BOX_T + BOX_H }, spineStyle]} pointerEvents="none" />
        <Animated.View style={[styles.link, { top: BOX_T + PITCH + BOX_H }, spineStyle]} pointerEvents="none" />
        <Animated.View style={[styles.link, { top: BOX_T + 2 * PITCH + BOX_H }, spineStyle]} pointerEvents="none" />

        {STEP_CARDS.map((c, k) => {
          const chosen = picked === c.id;
          return (
            <Target id={c.id} correct={c.correct} picked={picked} onPick={onPick}
              key={c.id} style={[styles.step, { top: BOX_T + k * PITCH }]} pointerEvents={live ? 'auto' : 'none'} hitSlop={{ top: SLOP, bottom: SLOP, left: SLOP, right: SLOP }} disabled={!live}>
              <Animated.View
                style={[
                  styles.stepInner,
                  answered && c.correct && styles.stepRight,
                  answered && chosen && !c.correct && styles.stepWrong,
                  STEP_STYLES[k],
                ]}
              >
                <Text style={[styles.stepNum, answered && c.correct && styles.stepOn]}>{c.n}</Text>
                <Text style={[styles.stepText, answered && c.correct && styles.stepOn]}>{c.label}</Text>
              </Animated.View>
            </Target>
          );
        })}

        {/* the loop: out of step 3, up the outside, back into step 1 */}
        <Animated.View style={[styles.armLow, armLowStyle]} pointerEvents="none" />
        <Animated.View style={[styles.armUp, armUpStyle]} pointerEvents="none" />
        <Animated.View style={[styles.armTop, headStyle]} pointerEvents="none" />
        <Animated.View style={[styles.barbU, headStyle]} pointerEvents="none" />
        <Animated.View style={[styles.barbD, headStyle]} pointerEvents="none" />
      </Animated.View>

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DF} k={K_FIG} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 24, right: 14, top: GROUND, height: 1.5, backgroundColor: RULE },

  stack: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H },

  baseBar: { position: 'absolute', left: STACK_L, top: BASE_Y, width: STACK_W, height: 3, backgroundColor: INK },
  postL: { position: 'absolute', left: STACK_L + 4, top: BASE_Y + 3, width: POST_W, height: GROUND - BASE_Y - 3, backgroundColor: SOFT },
  postR: { position: 'absolute', left: STACK_L + STACK_W - 7, top: BASE_Y + 3, width: POST_W, height: GROUND - BASE_Y - 3, backgroundColor: SOFT },
  capWrap: { position: 'absolute', left: STACK_L, top: CAP_T, width: STACK_W },
  cap: {
    textAlign: 'center', fontFamily: 'Inter_700Bold', fontSize: 9.5, letterSpacing: 1.1,
    color: SOFT, includeFontPadding: false,
  },

  link: { position: 'absolute', left: STACK_L + 8, width: 3, height: PITCH - BOX_H, backgroundColor: INK },

  step: { position: 'absolute', left: STACK_L, width: STACK_W },
  stepInner: {
    height: BOX_H, borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: STONE,
    flexDirection: 'row', alignItems: 'center', paddingLeft: 6, paddingRight: 24,
  },
  stepNum: {
    width: 18, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 12, color: INK, includeFontPadding: false,
  },
  stepText: {
    flex: 1, fontFamily: 'Inter_500Medium', fontSize: 10.5, lineHeight: 14, color: INK, includeFontPadding: false,
  },
  stepRight: { backgroundColor: INK, borderColor: INK },
  stepWrong: { borderColor: SOFT },
  stepOn: { color: PAPER },

  armLow: { position: 'absolute', left: 364, top: BOT_MID - 1.5, width: ARROW_X + 3 - 364, height: 3, backgroundColor: INK },
  armUp: {
    position: 'absolute', left: ARROW_X, top: TOP_MID, width: 3, height: BOT_MID - TOP_MID,
    backgroundColor: INK, transformOrigin: '50% 100%',
  },
  armTop: { position: 'absolute', left: 363, top: TOP_MID - 1.5, width: ARROW_X + 3 - 363, height: 3, backgroundColor: INK },
  barbU: {
    position: 'absolute', left: 363, top: TOP_MID - 1.5, width: 12, height: 3, backgroundColor: INK,
    transformOrigin: '0% 50%', transform: [{ rotate: '-40deg' }],
  },
  barbD: {
    position: 'absolute', left: 363, top: TOP_MID - 1.5, width: 12, height: 3, backgroundColor: INK,
    transformOrigin: '0% 50%', transform: [{ rotate: '40deg' }],
  },
});

// The topmost ink the scene can draw is the stack at its LIFTED position, y 204;
// the lowest is the ground line at 500. Everything between — cards, base bar, posts,
// caption, figure — sits inside [198, 512], and nothing lives above the stack, so no
// empty sky is being paid for (D25, D26, H59).
export function Logic11Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Logic11Scene} band={[198, 512]} camera={CAM} />;
}
