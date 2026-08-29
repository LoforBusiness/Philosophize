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
import { BEATS } from './metaphysics9Script';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER, useHeld, carryFrom, keepHeld,
  facing, useCarry, carry, STONE,
} from './cinematicKit';
import { followMoves, kindOf, seedOf } from './camera';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';

// Two panels stand over the stage — MIND on the left, BODY on the right — with a
// strip of bare paper between them that is the whole lesson. A thought sets out
// across it, stops in the middle under a question mark, and later the panels slide
// together until the strip is gone.
//
// COMPOSITION / OCCLUSION —
//   · the narrator WALKS x = 96 → 160 → 232, in moves of 64 and 72.
//   · MIND panel y 206–286, resting at x 44–184; BODY panel x 216–356, fixed.
//     The GAP is the 32 units between them, centred on x 200. On the fused beats
//     MIND slides right by 32 so the two meet, and the gap is simply not there.
//   · the thought crossing it is a 14-unit disc travelling x 176 → 200 at y 242.
//   · the three claim cards live x 20–178, y 292–476 — below the panels, which
//     stop at 286, and clear of the figure, whose widest pose starts at x 199.
//   · HIS LAST MARK IS SET BY THOSE CARDS. On the tap beat he holds gesture 47,
//     which sizes something with both hands and is the widest pose in the lesson:
//     measured off the rig he spans x 199…265 there, not the ±36 a resting figure
//     spans. At the first layout the cards ran to x 200 and he stood at 240, and
//     the bottom card was drawn 2 units into his hand. Twenty-one units of clear
//     paper now — and the lesson is that the span to check is the one the POSE
//     makes, not the one the body makes.
//   · everything else is above the crown: a standing crown is y 397 and the panels
//     stop at 286, so the figure passes under them all lesson (D23).
// Nothing is drawn above y 206 or below the ground line, hence band [196, 512].

const PANEL_T = 206;
const PANEL_B = 286;
const MIND_X = 44;
const BODY_X = 216;
const PANEL_W = 140;
const GAP_MID = 200;
const CLOSE = 32;          // how far MIND travels to shut the gap

const CARD_L = 20;
const CARD_W = 158;
// SIZED FOR A FINGER: 30 tall on a 36 pitch is a 27dp card every 32dp, well under
// the ~45dp a fingertip covers. The old stack also ran to 408, eleven units PAST
// the figure's crown at 397. It now runs 205 → 389 and stops clear of him.
// BELOW THE PANELS, which is where the header always said they were. At 205 the
// first card ran 205…249 and the MIND panel's sub sits at 245…273, so the card's
// bottom edge crossed 'thinks / takes up no space' — the question drawn on top of
// the thing it is asking about. The panels stop at 286 and the cards share no x
// with the figure (they end at 178, his widest pose starts at 199), so they can
// run down past his crown without touching him.
const CARD_T = 292;
const CARD_H = 44;
const CARD_GAP = 70;
/** Half the gap — any more and neighbouring targets overlap, and the topmost wins. */
const CARD_SLOP = (CARD_GAP - CARD_H) / 2;

const CARDS = [
  { id: 'thinks', label: 'SOMETHING IS THINKING', correct: true },
  { id: 'sub', label: 'A SEPARATE SUBSTANCE', correct: false },
  { id: 'nobody', label: 'MY BODY DOES NOT EXIST', correct: false },
];

const P = BEATS.map((b) => b.p ?? 0);
const X = BEATS.map((b) => b.x ?? 96);
// The camera, from the staging: it follows the figure this track describes,
// pulls back to scale 1 on every graded beat so a tap lands where it is aimed,
// and leans in on the quote. See followMoves in ./camera.ts.
const CAM = followMoves(X, BEATS.map(kindOf), seedOf('metaphysics9'));
const DIR = dirsFrom(X, 1);
const PANELS = BEATS.map((b) => b.panels ?? 0);
const CROSS = BEATS.map((b) => (b.cross ?? 0));

// R7b — the stage follows the control on its own graded beat, and only there.
// Derived from the beat rather than declared as a channel so it cannot fall out
// of step with the control it is about.
const REACT = BEATS.map((b) => (b.interact?.lever ? 1 : 0));

export default function Metaphysics9Scene({ clock, bt, bi, i, picked, onPick, dragPos }: SceneApi) {
  const reacting = REACT[i] === 1;
  const heldS = useHeld();
  const cv = useCarry(4);
  const cur = BEATS[i];
  const prev = i > 0 ? BEATS[i - 1] : undefined;

  // A panel only animates on the beat that CHANGES it; otherwise it holds, so the
  // board does not re-draw itself behind the reader on every tap (C20c).
  const litFade = (cur.panels ?? 0) > 0 !== ((prev?.panels ?? 0) > 0);
  const puzzleOn = !!cur.puzzle;
  const puzzleFade = puzzleOn !== !!prev?.puzzle;
  const cardsOn = !!cur.cards;
  const cardsFade = cardsOn !== !!prev?.cards;
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

    // The thought sets out and STOPS. It eases toward the far panel and arrives at
    // 0.86 of the way — close enough to be trying, short enough that the strip of
    // paper it cannot cross is the thing you actually look at.
    const reach = carry(cv, 0, n, CROSS[p], CROSS[n], tr) * ease01(clamp01(bt.value / 1.5)) * 0.86;

    return {
      fig: pose(s, carry(cv, 1, n, X[p], X[n], tr), GROUND, K_FIG, facing(DIR[p], DIR[n], bt.value), 1),
      // Carried (L5). Out of the codemod's reach because the endpoints are
      // DERIVED from the track rather than being the track — same defect, same
      // fix, and the multiplier goes inside so what is remembered is the value
      // that reached the screen.
      lit: carry(cv, 2, n, PANELS[p] > 0 ? 1 : 0, PANELS[n] > 0 ? 1 : 0, tr, litFade ? grow : 1),
      // R7b — the arm parts the two panels. The settings run from the mind IS the
      // brain to the mind is a second kind of thing, and MIND and BODY come apart on
      // stage as the reader travels between them.
      shut: carry(cv, 3, n, PANELS[p] === 2 ? 1 : 0, reacting ? dragPos.value : (PANELS[n] === 2 ? 1 : 0), tr),
      reach,
      t,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const litStyle = useAnimatedStyle(() => ({ opacity: 0.55 + 0.45 * SCENE.value.lit }));
  // MIND slides right to meet BODY; that closing move IS the physicalist reply, so
  // it is the one thing on the stage allowed to move under its own text.
  const mindStyle = useAnimatedStyle(() => ({
    opacity: 0.55 + 0.45 * SCENE.value.lit,
    transform: [{ translateX: SCENE.value.shut * CLOSE }],
  }));
  const thoughtStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.reach > 0.02 ? 1 : 0,
    transform: [{ translateX: SCENE.value.reach * (GAP_MID - (MIND_X + PANEL_W - 8)) }],
  }));
  const puzzleStyle = useAnimatedStyle(() => ({
    opacity: puzzleOn ? (puzzleFade ? ease01(clamp01((bt.value - 1.1) / 0.5)) : 1) : 0,
  }));
  const cardStyle = useAnimatedStyle(() => ({
    opacity: cardsOn ? (cardsFade ? ease01(bt.value / 0.6) : 1) : 0,
  }));

  return (
    <Animated.View style={styles.scene}>
      {/* ── the two substances ─────────────────────────────────────────────── */}
      <Animated.View style={[styles.panel, styles.mind, mindStyle]} pointerEvents="none">
        <Text style={styles.panelName}>MIND</Text>
        <Text style={styles.panelSub}>thinks{'\n'}takes up no space</Text>
      </Animated.View>

      <Animated.View style={[styles.panel, styles.body, litStyle]} pointerEvents="none">
        <Text style={styles.panelName}>BODY</Text>
        <Text style={styles.panelSub}>takes up space{'\n'}does not think</Text>
      </Animated.View>

      {/* the thought that sets out to lift an arm, and gets as far as it gets */}
      <Animated.View style={[styles.thought, thoughtStyle]} pointerEvents="none" />
      <Animated.View style={[styles.puzzleWrap, puzzleStyle]} pointerEvents="none">
        <Text style={styles.puzzle}>?</Text>
      </Animated.View>

      {/* ── Q2: tap what the cogito actually gets you ──────────────────────── */}
      {cardsOn &&
        CARDS.map((c, k) => {
          const chosen = picked === c.id;
          return (
            <Animated.View key={c.id} style={[styles.cardSlot, { top: CARD_T + k * CARD_GAP }, cardStyle]}>
              <Target id={c.id} correct={c.correct} picked={picked} onPick={onPick}
              disabled={answered} hitSlop={{ top: CARD_SLOP, bottom: CARD_SLOP, left: CARD_SLOP, right: CARD_SLOP }}>
                <View
                  style={[
                    styles.card,
                    answered && c.correct && styles.cardRight,
                    answered && chosen && !c.correct && styles.cardWrong,
                  ]}
                >
                  <Text style={[styles.cardText, answered && c.correct && styles.cardTextOn]}>
                    {c.label}
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

  // TONE, NOT WHITE. This scene drew every prop as an outline on paper — two
  // values and no depth, which is the flat case `check:shade` exists to find.
  // The structural mass takes STONE, a secondary surface takes RULE, and what
  // carries the message stays PAPER, so the picture has things at different
  // values rather than everything a shade darker. See cinematicKit's ramp.
  panel: {
    position: 'absolute', top: PANEL_T, width: PANEL_W, height: PANEL_B - PANEL_T,
    borderWidth: 2.5, borderColor: INK, borderRadius: 4, backgroundColor: RULE,
    alignItems: 'center', justifyContent: 'center',
  },
  mind: { left: MIND_X },
  body: { left: BODY_X },
  panelName: {
    fontFamily: 'Inter_700Bold', fontSize: 17, letterSpacing: 2.4, color: INK,
    includeFontPadding: false,
  },
  panelSub: {
    // INK rather than SOFT: this sub rides a panel that rests at 0.55 while it
    // waits, and SOFT is 5.3:1 on paper at full strength — 2.0:1 once dimmed,
    // which is D35's smear. Size and weight carry the hierarchy.
    fontFamily: 'Inter_400Regular', fontSize: 10.5, lineHeight: 15, color: INK,
    textAlign: 'center', marginTop: 6, includeFontPadding: false,
  },

  // The thought is a small filled disc — the only round thing on the stage, so it
  // reads as a separate object crossing rather than as part of either panel.
  thought: {
    position: 'absolute', left: MIND_X + PANEL_W - 8, top: 242,
    width: 14, height: 14, borderRadius: 7, backgroundColor: INK,
  },
  puzzleWrap: { position: 'absolute', left: GAP_MID - 20, top: 196, width: 40, alignItems: 'center' },
  puzzle: {
    fontFamily: 'PlayfairDisplay_700Bold', fontSize: 30, color: INK, includeFontPadding: false,
  },

  cardSlot: { position: 'absolute', left: CARD_L, width: CARD_W },
  card: {
    height: CARD_H, borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: STONE,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6,
  },
  cardRight: { backgroundColor: INK, borderColor: INK },
  cardWrong: { borderColor: SOFT },
  cardText: {
    fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 0.3, color: INK,
    textAlign: 'center', includeFontPadding: false,
  },
  cardTextOn: { color: PAPER },
});

// Art runs from the panels' top edge (206) down to the ground line (500), and the
// tap cards stop at 408 — nothing is drawn above or below, so the player crops to
// that slice and the whole scene renders about 80% larger than a full-height fit.
export function Metaphysics9Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Metaphysics9Scene} band={[196, 512]} camera={CAM} />;
}
