import {
  View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import {
  ease01, lerp, mixStance, pose, type Bundle, } from './rig';
// The whole movement library, not just rig's 49 emotes. Codes under 100 ARE
// rig's and mean exactly what they always did; 100+ reach moves.ts (emoteAny).
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './ethics32Script';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER, useHeld, carryFrom, keepHeld, useCarry, carry,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// TWO figures, and THE FIGURES ARE THE ANSWER TARGETS — you tap a person, not a
// card. Their standing plates carry the answer state so the fill still looks like
// every other correct answer in the app (H61); it is the thing being chosen that
// is new (E33).
//
// · the knower stands at x 82 facing right, the borrower at x 300 facing left.
//   218 apart, and neither walks, so that is also their closest (B9).
// · the reasons stack behind the knower at x 24…76, y 300…390 — left of him, so it
//   reads as what he is standing on rather than something he is holding.
// · the verdict cards ride at y 268…296 above each head; a standing crown is y 397
//   and the head centre is y 417, so a card at 268 clears the skull by 100 units.
// · the new case sits centre-stage at x 150…250, y 214…248 — between them, in the
//   gap neither body occupies (the knower reaches x 118 at worst, the borrower
//   x 264).
// · the name plates are at y 452…480, on the ground beside each pair of feet.
//
// B14 — the borrower runs on a shifted clock (t + 5.1). `stand()` takes no seed,
// and without the offset two idle figures breathe on identical frames.

const A_X = 82;
const B_X = 300;
const B_CLOCK = 5.1;

const CASE_L = 150;
const CASE_W = 100;
const CASE_T = 214;
const CASE_H = 34;

const CARD_W = 92;
const CARD_H = 28;
const CARD_T = 268;
const A_CARD_L = A_X - CARD_W / 2;
const B_CARD_L = B_X - CARD_W / 2;

const REASON_L = 24;
const REASON_W = 52;
const REASON_TOP = 300;
const REASON_H = 24;
const REASON_PITCH = 30;

const PLATE_T = 452;
const PLATE_W = 96;
const PLATE_H = 28;

const A = BEATS.map((b) => b.a ?? 0);
const B = BEATS.map((b) => b.b ?? 0);
const CARD = BEATS.map((b) => b.card ?? 0);

// THE CAMERA (H60b). `followMoves` reads the x track and gives each beat its own
// shot: it FOLLOWS the subject when a beat moves far enough to be worth following,
// pushes close on a quote, and PULLS BACK to the whole band on a question or a
// summary — the beats the reader has to read and act on.
// Two figures at 82 and 300, so the track is the point BETWEEN them (191) — following
// either one alone would frame the other out, and here the pair is the subject.
const X = BEATS.map((b) => b.x ?? 191);
const CAM = followMoves(X, BEATS.map(kindOf), seedOf('ethics32'));

export default function Ethics32Scene({ clock, bt, bi, i, picked, onPick }: SceneApi) {
  const heldSb = useHeld();
  const cv = useCarry(1);
  const heldSa = useHeld();
  const cur = BEATS[i];
  const prev = i > 0 ? BEATS[i - 1] : undefined;

  const shownReasons = cur.reasons ?? 0;
  const prevReasons = prev?.reasons ?? 0;
  const freshOn = (cur.fresh ?? 0) > 0;
  const freshFade = (cur.fresh ?? 0) !== (prev?.fresh ?? 0);

  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / 0.7);      // nobody walks; this is a pose blend
    const t = clock.value;
    const grow = ease01(bt.value / 0.55);

    const sa = keepHeld(heldSa, mixStance(carryFrom(heldSa, n, emoteHold(A[p], t)), emoteLive(A[n], t, bt.value), tr));
    const sb = keepHeld(heldSb, mixStance(carryFrom(heldSb, n,
      emoteHold(B[p], t + B_CLOCK)),
      emoteLive(B[n], t + B_CLOCK, bt.value),
      tr));
    const card = carry(cv, 0, n, CARD[p], CARD[n], tr);
    return {
      know: pose(sa, A_X, GROUND, K_FIG, 1, 1),
      borr: pose(sb, B_X, GROUND, K_FIG, -1, 1),
      // The knower's card appears at 1 and stays; the borrower's arrives as the
      // value crosses to 2, so the reader sees it travel rather than blink on.
      cardA: Math.min(1, card),
      cardB: Math.max(0, Math.min(1, card - 1)),
      reasons: lerp(prevReasons, shownReasons, grow),
      fresh: freshOn ? (freshFade ? grow : 1) : 0,
    };
  });

  const DA = useDerivedValue<Bundle>(() => SCENE.value.know);
  const DB = useDerivedValue<Bundle>(() => SCENE.value.borr);
  const cardAStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.cardA }));
  const cardBStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.cardB,
    // Slides in from the knower's side, so the hand-over is a movement.
    transform: [{ translateX: (1 - SCENE.value.cardB) * -70 }],
  }));
  const freshStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.fresh,
    transform: [{ translateY: (1 - SCENE.value.fresh) * -10 }],
  }));

  const answered = picked !== null;
  const live = (cur.pick ?? 0) > 0 && !!cur.interact;

  const plate = (id: string, correct: boolean, left: number, label: string) => (
    <Target id={id} correct={correct} picked={picked} onPick={onPick}
              style={[styles.plate, { left }]} disabled={!live || answered}>
      <View
        style={[
          styles.plateInner,
          answered && correct && styles.pickRight,
          answered && picked === id && !correct && styles.pickWrong,
        ]}
      >
        <Text
          style={[styles.plateText, answered && correct && styles.onInk]}
          numberOfLines={1}
        >
          {label}
        </Text>
      </View>
    </Target>
  );

  return (
    <Animated.View style={styles.scene}>
      {/* the new case, waiting between them */}
      <Animated.View style={[styles.newCase, freshStyle]} pointerEvents="none">
        <Text style={styles.newCaseKicker} numberOfLines={1}>A NEW CASE</Text>
        <Text style={styles.newCaseText} numberOfLines={1}>ALMOST THE SAME</Text>
      </Animated.View>

      {/* the reasons the knower is standing on */}
      {[0, 1, 2].map((k) => (
        <Reason key={k} index={k} SCENE={SCENE} />
      ))}

      {/* the verdict, and its copy */}
      <Animated.View style={[styles.card, { left: A_CARD_L }, cardAStyle]} pointerEvents="none">
        <Text style={styles.cardText} numberOfLines={1}>IT IS WRONG</Text>
      </Animated.View>
      <Animated.View style={[styles.card, { left: B_CARD_L }, cardBStyle]} pointerEvents="none">
        <Text style={styles.cardText} numberOfLines={1}>IT IS WRONG</Text>
      </Animated.View>

      {plate('knower', true, A_X - PLATE_W / 2, 'WORKED IT OUT')}
      {plate('borrower', false, B_X - PLATE_W / 2, 'WAS TOLD')}

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DA} k={K_FIG} />
      <Stickman D={DB} k={K_FIG} />
    </Animated.View>
  );
}

/** One reason in the stack. Draws on when its beat adds it, then holds (C20c). */
function Reason({ index, SCENE }: { index: number; SCENE: { value: { reasons: number } } }) {
  const st = useAnimatedStyle(() => {
    const a = Math.max(0, Math.min(1, SCENE.value.reasons - index));
    return { opacity: a, transform: [{ translateY: (1 - a) * 8 }] };
  });
  return (
    <Animated.View
      style={[styles.reason, { top: REASON_TOP + index * REASON_PITCH }, st]}
      pointerEvents="none"
    />
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 24, right: 14, top: GROUND, height: 1.5, backgroundColor: RULE },

  newCase: {
    position: 'absolute', left: CASE_L, top: CASE_T, width: CASE_W, height: CASE_H,
    borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: PAPER,
    alignItems: 'center', justifyContent: 'center',
  },
  newCaseKicker: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.4, color: SOFT,
    includeFontPadding: false,
  },
  newCaseText: {
    fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 0.3, color: INK, marginTop: 2,
    includeFontPadding: false,
  },

  reason: {
    position: 'absolute', left: REASON_L, width: REASON_W, height: REASON_H,
    borderWidth: 1.5, borderColor: SOFT, borderRadius: 2, backgroundColor: PAPER,
  },

  card: {
    position: 'absolute', top: CARD_T, width: CARD_W, height: CARD_H,
    borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: INK,
    alignItems: 'center', justifyContent: 'center',
  },
  cardText: {
    fontFamily: 'Inter_700Bold', fontSize: 9.5, letterSpacing: 0.6, color: PAPER,
    includeFontPadding: false,
  },

  plate: { position: 'absolute', top: PLATE_T, width: PLATE_W },
  plateInner: {
    height: PLATE_H, borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: PAPER,
    alignItems: 'center', justifyContent: 'center',
  },
  plateText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.4, color: INK,
    includeFontPadding: false,
  },
  onInk: { color: PAPER },
  pickRight: { backgroundColor: INK, borderColor: INK },
  pickWrong: { borderColor: SOFT, opacity: 0.45 },
});

// Ink runs from the new case (214) to the ground line (500). Band 208…512 = 304 (H59).
export function Ethics32Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Ethics32Scene} band={[208, 512]} camera={CAM} />;
}
