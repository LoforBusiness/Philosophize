import {
  View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { dirsFrom, clamp01, ease01, lerp, moveTr, pose, travelStance, WALK, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './epistemology36Script';
import { facing, GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, PAPER, useHeld, carryFrom, keepHeld, useCarry, carry, lookPose,
} from './cinematicKit';
import { stageTone } from './stageTones';
import { floorStyle, lipOf, PLATE_FACE } from './stageSkin';
import type { SceneApi } from './CinematicPlayer';
import Target, { AnswerLift } from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// THE STAGE IS STRUCK IN THIS LESSON'S OWN BRANCH HUE (./stageTones).
// Same three tones, same luminance to the third decimal — so every contrast
// measured against the old greys still holds and nothing on the stage moved.
const TONE = stageTone('epistemology');
const { RULE, STONE, SHADE } = TONE;
const LIP = lipOf(TONE);   // the ledge a toned plate stands on (scripts/skin-stage.mjs)

// ─────────────────────────────────────────────────────────────────────────────
// FOUR THINGS THAT ARE THE SAME THING, AND TWO LABELS THAT DISAGREE.
//
// THE COMPOSITION, IN NUMBERS (H56).
//
// · the COUNTER is a 3-thick rule from x 128 to x 384 at y 372, with a 2-thick
//   apron dropping to y 392.
// · the four PAIRS stand on it: each 48 wide × 62 tall at y 306…368, at x 140,
//   200, 260 and 320. Every one is drawn from the SAME three numbers — outline,
//   two seam lines — because the experiment's design is that they are identical
//   and the picture has to be too (A1). There is no per-item variation in this
//   file to find.
// · the POSITION SCALE under the counter runs x 140…368 at y 400, with a mark
//   under each pair rising 4, 8, 12, 20 — the real cause, drawn small and low.
// · the GIVEN REASON card is 128×46 at x 236, y 240…286: it sits beside the
//   shopper's head, which is where a spoken reason belongs.
// · the REAL CAUSE card is 128×30 at x 236, y 412…442, under the counter, so the
//   two never touch and the reader can hold both at once.
// · the figure stands at x 56 and walks to 128; crown ~397, clear of the counter
//   which starts at x 128 — he stands beside it, not in it.
//
// Ink runs y 240 (the reason card) … y 500 (ground). BAND 234…512 = 278 (H59).
// ─────────────────────────────────────────────────────────────────────────────

/** Crossfade for a beat that does NOT walk. 0.85 is the base `footfalls` assumes. */
const BASE_TR = 0.85;

const PAIR_X = [140, 200, 260, 320];
const PAIR_Y = 306;
const PAIR_W = 48;
const PAIR_H = 62;
const PAIR_ID = ['p1', 'p2', 'p3', 'p4'];

const COUNTER_Y = 372;
const SCALE_Y = 400;
const SCALE_RISE = [4, 8, 12, 20];

const CAP_T = 240;
const FIG_X = 56;

const X = BEATS.map((b) => b.x ?? FIG_X);
// WHICH WAY HE IS POINTING, read off the same x track he walks along:
// +1 where it rises, -1 where it falls, and HOLD while he stands still, so a
// figure who walks left to something keeps facing it while he talks about it.
const DIR = dirsFrom(X, 1);
const P = BEATS.map((b) => b.p ?? 0);
const SHELF = BEATS.map((b) => (b.shelf ? 1 : 0));
const GIVEN = BEATS.map((b) => (b.given ? 1 : 0));
const REAL = BEATS.map((b) => (b.real ? 1 : 0));
const CLASH = BEATS.map((b) => (b.clash ? 1 : 0));
const LIVE = BEATS.map((b) => (b.live ? 1 : 0));
// group AH — one event per still tap, each derived from a channel that CHANGES.
const ASK = BEATS.map((b) => ((b.ask ?? 0) > 0 ? 1 : 0));
const TALLY = BEATS.map((b) => (b.tally ?? 0));
const SINCERE = BEATS.map((b) => ((b.sincere ?? 0) > 0 ? 1 : 0));
const JUDGE_OK = BEATS.map((b) => ((b.judgeOk ?? 0) > 0 ? 1 : 0));
const BLIND = BEATS.map((b) => ((b.blind ?? 0) > 0 ? 1 : 0));

// R7b — the stage follows the control on its own graded beat, and only there.
// Derived from the beat rather than declared as a channel so it cannot fall out
// of step with the control it is about.
const REACT = BEATS.map((b) => (b.interact?.sort ? 1 : 0));

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('epistemology36'));

export default function Epistemology36Scene({ clock, bt, bi, i, picked, onPick, dragPos, pickPos, gazeX, gazeY, gazeOn }: SceneApi) {
  const reacting = REACT[i] === 1;
  const heldFig = useHeld();
  const cv = useCarry(10);
  const cur = BEATS[i];
  const prev = i > 0 ? BEATS[i - 1] : undefined;
  // group AH — each flag fires only on the beat that CHANGES its own channel
  // (C20c), so a beat that merely holds a value re-draws nothing.
  const askFade = (cur.ask ?? 0) !== (prev?.ask ?? 0);
  const tallyFade = (cur.tally ?? 0) !== (prev?.tally ?? 0);
  const sincereFade = (cur.sincere ?? 0) !== (prev?.sincere ?? 0);
  const judgeOkFade = (cur.judgeOk ?? 0) !== (prev?.judgeOk ?? 0);
  const blindFade = (cur.blind ?? 0) !== (prev?.blind ?? 0);
  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    // A WALKING BEAT TAKES AS LONG AS THE WALK NEEDS (rig.moveTr). A fixed length
    // here sprinted every long journey and left the footfalls — which the player
    // computes from moveTr — arriving after the figure had stopped.
    const tr = ease01(bt.value / moveTr(X[p], X[n], BASE_TR));
    const t = clock.value;
    // A faster ramp for the group-AH events below, decoupled from the walk's own
    // crossfade, so a mark can pop in over 0.55s whatever the figure is doing.
    const grow = ease01(bt.value / 0.55);

    const figS = keepHeld(heldFig, travelStance(
      X[p], X[n],
      carryFrom(heldFig, n, emoteHold(P[p], t)), emoteHold(P[n], t), emoteLive(P[n], t, bt.value),
      tr, WALK,
    ));

    return {
      fig: lookPose(figS, carry(cv, 0, n, X[p], X[n], tr), GROUND, K_FIG, facing(DIR[p], DIR[n], bt.value), 1, gazeX.value, gazeY.value, gazeOn.value),
      t,
      shelfOn: carry(cv, 1, n, SHELF[p], SHELF[n], tr),
      givenOn: carry(cv, 2, n, GIVEN[p], GIVEN[n], tr),
      realOn: carry(cv, 3, n, REAL[p], REAL[n], tr),
      // The two cards do not blink at each other; the clash is that both are up.
      // R7b — the seam opens the clash. Slide toward WHY YOU DID IT and the gap
      // between the reason given and the cause actually at work is drawn; the feeling
      // side of the bar leaves it untouched, which is the finding.
      clashOn: carry(cv, 4, n, CLASH[p], reacting ? pickPos.value : CLASH[n], tr),
      // group AH — one event per still tap:
      //  · ask      a question mark rises over the row (beat 1: they were asked)
      //  · tally    reasons pile up beside the given-reason card (beats 4, 5)
      //  · sincere  a check confirms the stated reason was sincerely held (beat 7)
      //  · judgeOk  a check confirms the shopper knew their own pick (beat 9)
      //  · blind    a blocked mark: the process itself went unseen (beat 10)
      askOn: carry(cv, 5, n, ASK[p], ASK[n], askFade ? grow : 1),
      tallyOn: carry(cv, 6, n, TALLY[p], TALLY[n], tallyFade ? grow : 1),
      sincereOn: carry(cv, 7, n, SINCERE[p], SINCERE[n], sincereFade ? grow : 1),
      judgeOkOn: carry(cv, 8, n, JUDGE_OK[p], JUDGE_OK[n], judgeOkFade ? grow : 1),
      blindOn: carry(cv, 9, n, BLIND[p], BLIND[n], blindFade ? grow : 1),
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const answered = picked !== null;
  const live = !!BEATS[i]?.interact && !BEATS[i]?.interact?.cards && LIVE[i] === 1;

  const shelfStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.shelfOn }));
  const givenStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.givenOn }));
  const realStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.realOn }));
  const clashStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.clashOn }));
  const askStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.askOn }));
  const tally0Style = useAnimatedStyle(() => ({ opacity: clamp01(SCENE.value.tallyOn) }));
  const tally1Style = useAnimatedStyle(() => ({ opacity: clamp01(SCENE.value.tallyOn - 1) }));
  const sincereStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.sincereOn }));
  const judgeOkStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.judgeOkOn }));
  const blindStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.blindOn }));

  return (
    <View style={styles.scene}>
      <Animated.View style={[StyleSheet.absoluteFill, shelfStyle]}>
        <View style={styles.counter} pointerEvents="none" />
        <View style={styles.apron} pointerEvents="none" />

        {/* EACH PAIR RIDES WITH ITS OWN TARGET (E39). */}
        {PAIR_X.map((px, k) => (
          <AnswerLift key={px} id={PAIR_ID[k]} picked={picked} correct={k === 3}>
            <View style={[styles.pair, { left: px }]} pointerEvents="none">
              <View style={styles.pairBox} />
              <View style={[styles.seam, { top: 16 }]} />
              <View style={[styles.seam, { top: 34 }]} />
            </View>
          </AnswerLift>
        ))}

        {PAIR_X.map((px, k) => (
          <Target
            key={`t${px}`}
            id={PAIR_ID[k]}
            correct={k === 3}
            picked={picked}
            onPick={onPick}
            disabled={!live || answered}
            style={[styles.hit, { left: px }]}
          >
            <View
              style={[styles.hitBox, live && !answered && styles.hitLive, answered && picked === PAIR_ID[k] && k !== 3 && styles.hitWrong]}
              pointerEvents="none"
            />
          </Target>
        ))}
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, realStyle]} pointerEvents="none">
        <View style={styles.scaleRule} />
        {PAIR_X.map((px, k) => (
          <View key={`s${px}`} style={[styles.scaleMark, { left: px + PAIR_W / 2 - 3, height: SCALE_RISE[k], top: SCALE_Y - SCALE_RISE[k] }]} />
        ))}
        <View style={styles.realCard} />
        <Text style={styles.realText}>WHAT MOVED THE HAND{'\n'}POSITION IN THE ROW</Text>
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, givenStyle]} pointerEvents="none">
        <View style={styles.givenCard} />
        <Text style={styles.givenText}>WHAT THEY SAID{'\n'}BETTER KNIT · FINER WEAVE{'\n'}NICER FEEL</Text>
      </Animated.View>

      <Animated.View style={[styles.clashMark, clashStyle]} pointerEvents="none" />

      {/* group AH — one event per still tap (see the SCENE comment above). */}
      <Animated.Text style={[styles.askMark, askStyle]} pointerEvents="none">?</Animated.Text>

      <Animated.View style={[styles.tallyDot, styles.tallyDot0, tally0Style]} pointerEvents="none" />
      <Animated.View style={[styles.tallyDot, styles.tallyDot1, tally1Style]} pointerEvents="none" />

      <Animated.Text style={[styles.sincereMark, sincereStyle]} pointerEvents="none">✓</Animated.Text>
      <Animated.Text style={[styles.judgeMark, judgeOkStyle]} pointerEvents="none">✓</Animated.Text>

      <Animated.View style={[styles.blindWrap, blindStyle]} pointerEvents="none">
        <View style={styles.blindRing} />
        <View style={styles.blindBar} />
      </Animated.View>

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DF} k={K_FIG} />
    </View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 20, right: 14, top: GROUND, height: 1.5, backgroundColor: RULE },

  counter: { position: 'absolute', left: 128, top: COUNTER_Y, width: 256, height: 3, backgroundColor: INK },
  apron: { position: 'absolute', left: 128, top: COUNTER_Y + 3, width: 256, height: 2, backgroundColor: SOFT },

  pair: { position: 'absolute', top: PAIR_Y, width: PAIR_W, height: PAIR_H },
  pairBox: {
    position: 'absolute', left: 0, top: 0, width: PAIR_W, height: PAIR_H,
    borderWidth: 2, borderColor: INK, borderRadius: 8, backgroundColor: PAPER,
  },
  seam: { position: 'absolute', left: 8, width: PAIR_W - 16, height: 1.5, backgroundColor: SOFT },

  scaleRule: { position: 'absolute', left: 140, top: SCALE_Y, width: 228, height: 1.5, backgroundColor: SOFT },
  scaleMark: { position: 'absolute', width: 6, backgroundColor: INK, borderRadius: 1 },

  realCard: {
    position: 'absolute', left: 236, top: 412, width: 128, height: 30,
    borderWidth: 1.5, borderColor: INK, borderRadius: 8, backgroundColor: PLATE_FACE, boxShadow: LIP,
  },
  realText: {
    position: 'absolute', left: 236, top: 417, width: 128, textAlign: 'center', lineHeight: 10,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.8, color: INK, includeFontPadding: false,
  },

  givenCard: {
    position: 'absolute', left: 236, top: CAP_T, width: 128, height: 46,
    borderWidth: 1.5, borderColor: SOFT, borderRadius: 4, backgroundColor: STONE, boxShadow: LIP,
  },
  givenText: {
    position: 'absolute', left: 236, top: CAP_T + 6, width: 128, textAlign: 'center', lineHeight: 11,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.8, color: INK, includeFontPadding: false,
  },

  // The one mark that says the two accounts do not meet: a stroke down the gap
  // between them, never a colour (§19).
  clashMark: { position: 'absolute', left: 298, top: 292, width: 2, height: 116, backgroundColor: SOFT },

  hit: { position: 'absolute', top: PAIR_Y, width: PAIR_W, height: PAIR_H },
  hitBox: { position: 'absolute', left: 0, top: 0, width: PAIR_W, height: PAIR_H, borderRadius: 6 },
  /** WHAT "TAP ONE OF THESE" LOOKS LIKE WHILE THE QUESTION IS OPEN.
   *
   * These hit boxes took a border only once the answer was IN, so up to that moment
   * the reader was choosing between regions with no edges — the complaint exactly:
   * "blank boxes that you cannot read so it is a guess for which one to press". The
   * outline says where the choices are; the picture under each one says what it is.
   */
  hitLive: { borderWidth: 1.5, borderColor: SOFT, borderStyle: 'dashed' },
  hitWrong: { borderWidth: 2, borderColor: SOFT, borderStyle: 'dashed' },

  // ── group AH: one event per still tap ──────────────────────────────────────
  //
  // The question mark: they are being asked. It borrows the given-reason card's
  // own footprint, which is empty this early — the card itself does not fade in
  // until beat 3 — so nothing is ever on screen twice.
  askMark: {
    position: 'absolute', left: 236, top: 240, width: 128, height: 46, lineHeight: 46,
    textAlign: 'center', fontFamily: 'Inter_700Bold', fontSize: 30, color: INK,
    includeFontPadding: false,
  },

  // Two dots that pile up to the left of the given-reason card as the shoppers'
  // stated reasons accumulate — knit, then weave and the rest — in the same clear
  // strip above pair one and two.
  tallyDot: { position: 'absolute', left: 210, width: 8, height: 8, borderRadius: 4, backgroundColor: INK },
  tallyDot0: { top: 248 },
  tallyDot1: { top: 262 },

  // The check beside the given-reason card: the shopper sincerely believed it.
  sincereMark: {
    position: 'absolute', left: 372, top: 250, width: 14, height: 16, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 14, color: INK, includeFontPadding: false,
  },
  // The check above the pair actually chosen: the shopper's own judgement was
  // correct, even though the reason for it was not.
  judgeMark: {
    position: 'absolute', left: 337, top: 288, width: 14, height: 16, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 14, color: INK, includeFontPadding: false,
  },

  // A blocked sign beside the real-cause card: the process itself cannot be seen,
  // never a fill — an outline, the way every boundary in this app is drawn (D31).
  blindWrap: { position: 'absolute', left: 372, top: 420, width: 14, height: 14 },
  blindRing: { position: 'absolute', left: 0, top: 0, width: 14, height: 14, borderWidth: 1.5, borderColor: INK, borderRadius: 7 },
  blindBar: { position: 'absolute', left: 0, top: 6, width: 14, height: 1.5, backgroundColor: INK, transform: [{ rotate: '45deg' }] },
});

export function Epistemology36Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Epistemology36Scene} band={[234, 512]} camera={CAM} />;
}
