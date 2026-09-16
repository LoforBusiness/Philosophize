import {
  View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { BEATS } from './ethics2Script';
import {
  BLANK, WALK, clamp01, ease01, lerp, mixStance, moveTr, pose, strideStance, type Bundle, } from './rig';
// The catalogue, not just rig's 49. `emoteAny` delegates to `emoteHold` for every
// code under 100, so this import is identity for the beats as written — it only
// means the script CAN now reach the 120 actions and the living holds (group N).
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, PAPER, useHeld, carryFrom, keepHeld, useCarry, carry, reactPose,
} from './cinematicKit';
import { stageTone } from './stageTones';
import { followMoves, kindOf, seedOf } from './camera';
import type { SceneApi } from './CinematicPlayer';

// THE STAGE IS STRUCK IN THIS LESSON'S OWN BRANCH HUE (./stageTones).
// Same three tones, same luminance to the third decimal — so every contrast
// measured against the old greys still holds and nothing on the stage moved.
const { RULE, STONE, SHADE } = stageTone('ethics');
const LIP = `0px 3px 0px ${SHADE}`;   // the shaded lip a toned plate stands on (scripts/lip-stage.mjs)

// ─────────────────────────────────────────────────────────────────────────────
// A VERDICT BOARD over a found wallet.
//
// The old stage was a figure, a guide and a 30×17 wallet — nothing to look at and
// nothing that taught. The lesson's real content is a comparison: three lenses,
// three different questions, and (here) the same verdict. So the top of the stage
// is now a three-row comparison table that builds as the guide works through Mill,
// Kant and Aristotle: the numbered step fills in, the row inks solid, and the
// verdict STAMPS on at a tilt. Below it, a properly drawn wallet with notes and a
// card poking out of it.
//
// The title is a WORD ANIMATION: it opens as "ONE CHOICE · THREE VERDICTS" and,
// once the third stamp lands, cross-fades to "THREE LENSES · ONE VERDICT" — the
// punchline of the lesson, delivered by the board rather than by the narration.
//
// Composition rule: the board lives entirely above y = 340 and the figures stand
// on GROUND = 500 with their crowns at ~353 at the highest (the beat-7 shrug), so
// the table never touches a head.
//
// The camera went, and has come back. It was dropped because it sat static on every
// rendered beat — but that is a case for a better camera, not for none (H60b), and
// the lesson then read at one distance throughout. It is a `followMoves` camera now,
// which was only safe once the board could defend itself: a 1.40x push at the
// finder's chest shows y 321..561 and the board lives above y=340, so before H60c
// this camera would have hidden the three lenses it is comparing. The measured
// must-see box holds the shot open instead.
// ─────────────────────────────────────────────────────────────────────────────

const P_CODE = BEATS.map((b) => b.p ?? 0);
// The finder's track, under the name validate-cinematic reads (it looks for
// `b.x ?? N` exactly). It used to be `b.px`, declared on this lesson's own beat
// type — which compiled and ran, and left the camera unreadable to the checker.
const X = BEATS.map((b) => b.x ?? 262);
// H60b: moving is the default. This lesson had no camera at all, on the reasoning
// (in the header below) that the old one was static on every beat — but "it was
// not doing anything" is an argument for a better camera, not for none. Safe to
// add only now that the verdict board reports a must-see box (H60c): a push at the
// finder's chest crops everything above y=321, and the board lives above y=340.
const CAM = followMoves(X, BEATS.map(kindOf), seedOf('ethics2'));
const G_CODE = BEATS.map((b) => (b.g ?? -1));
const GX = BEATS.map((b) => b.gx ?? 108);
const G_ON = BEATS.map((b) => ((b.g ?? -1) >= 0 ? 1 : 0));
const NAMED = BEATS.map((b) => b.named ?? 0);
const LENS = BEATS.map((b) => b.lens ?? 0);

// ── EVERY TAP OF THE OPENING CHANGES THE PICTURE ────────────────────────────
// Six taps used to hold one frame, mostly because the whole board — rows, names,
// questions, title — was up before a word about it had been said. Now:
//   · the lesson opens on the wallet alone, with a question hanging over it;
//   · the board drops in on "three theories will each deliver a verdict";
//   · the first row is named with the first lens, the other two with theirs;
//   · "ordinary moral thinking mixes the three" joins the rows, 1 + 2 + 3;
//   · and each lens, on its second beat, leaves a note in the right-hand margin —
//     Mill's 1 = 1 = 1 (each person counts equally), Kant's rule failing when
//     willed for all, Aristotle's steps of practice. The notes stay, so the margin
//     ends the lesson as a worked record of the three.
//
// R7c — LEFT STILL ON PURPOSE: the `sort` beat is deliberately not wired. Its three bins say which FACT
// settles rightness — common, legal, neither — and nothing on this stage means
// any of them: the wallet, the lenses and the notes are about the choice, not about
// Hume. Any picture the bins could drive is either the same for the two wrong
// answers and different for the right one (a tell), or shows LEGAL's picture before
// the reader has touched anything, because the chip rests at the middle bin
// (`pickPos` 0.5 is the author's second option). A scene may only follow a control
// with a quantity it already draws; this one has none, so it holds still.
/** 1 from the first beat that sets the flag, to the end. */
function latch(vals: number[]): number[] {
  const first = vals.findIndex((v) => v > 0);
  return vals.map((_, k) => (first >= 0 && k >= first ? 1 : 0));
}
const QUERY = BEATS.map((b) => b.query ?? 0);
const BOARD = latch(BEATS.map((b) => b.board ?? 0));
const BLEND = latch(BEATS.map((b) => b.blend ?? 0));
const EQUAL = latch(BEATS.map((b) => b.equal ?? 0));
const UNIVERSAL = latch(BEATS.map((b) => b.universal ?? 0));
const HABIT = latch(BEATS.map((b) => b.habit ?? 0));
/** The beat each margin note arrives on, so its inner marks draw only then. */
const NOTE_AT = [EQUAL, UNIVERSAL, HABIT].map((t) => t.indexOf(1));

// The wallet sits in the corridor BETWEEN the two figures. The guide stands at
// x 108 and the finder at x 262, and an arm reaches 34 rig units ≈ 46 stage units,
// so x 154…216 is the only strip neither of them can ever sweep. Centring the
// wallet at 190 keeps a 74-wide prop clear of both hands at every gesture.
const WALLET_X = 190;
const STITCH = [8, 21, 34, 47, 60];
const PAVE = [58, 122, 186, 250, 314];

const BOARD_L = 14;
const BOARD_W = 372;
const TITLE_T = 182;
const ROW_H = 44;
const ROW_T = [200, 248, 296];

// The "+" joiners sit on the badge column (x 26…52), in the 4-unit seams between rows.
const JOIN_D = 16;
const JOIN_X = BOARD_L + 12 + 13;                // the badge's centre, x 39

// THE MARGIN, right of the finder. His widest reach is x 308 (262 + 46), so the
// notes start at 314 and run to 394; stacked from 352 (the board's lip ends at 343)
// to 492 (the ground rule is at 500). Each is 80 × 44.
const NOTE_L = 314;
const NOTE_W = 80;
const NOTE_H = 44;
const NOTE_T = 352;
const NOTE_STEP = 48;
const STEPS = [0, 1, 2, 3, 4];
const STEP_N = 5;

const LENSES = [
  { n: '1', name: 'OUTCOMES', who: 'MILL · 1863', q: 'Did it make life better?' },
  { n: '2', name: 'DUTY', who: 'KANT · 1785', q: 'Could all follow this rule?' },
  { n: '3', name: 'CHARACTER', who: 'ARISTOTLE', q: 'Who does it make me?' },
];

export default function Ethics2Scene({ clock, bt, bi }: SceneApi) {
  const heldFinderS = useHeld();
  const cv = useCarry(11);
  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / moveTr(GX[p], GX[n], 0.85));
    const t = clock.value;

    // Finder — gesture blend, small steps.
    const finderS = keepHeld(heldFinderS, mixStance(carryFrom(heldFinderS, n, emoteHold(P_CODE[p], t)), emoteLive(P_CODE[n], t, bt.value), tr));
    const fx = carry(cv, 0, n, X[p], X[n], tr);

    // Guide — walks in when its position jumps; otherwise blends gestures in place.
    const gOn = carry(cv, 1, n, G_ON[p], G_ON[n], tr);
    const moving = Math.abs(GX[n] - GX[p]) > 10;
    const guideS = moving
      ? strideStance(GX[p], GX[n], emoteLive(G_CODE[n] < 0 ? 0 : G_CODE[n], t, bt.value), tr, WALK)
      : mixStance(emoteHold(G_CODE[p] < 0 ? 0 : G_CODE[p], t), emoteLive(G_CODE[n] < 0 ? 0 : G_CODE[n], t, bt.value), tr);
    const gx = carry(cv, 2, n, GX[p], GX[n], tr);

    return {
      finder: reactPose(finderS, fx, GROUND, K_FIG, -1, 1),
      guide: gOn > 0.02 ? pose(guideS, gx, GROUND, K_FIG, 1, gOn) : BLANK,
      named: carry(cv, 3, n, NAMED[p], NAMED[n], tr),
      // One continuous 0→3 value drives all three rows: row k lights as it crosses k.
      lens: carry(cv, 4, n, LENS[p], LENS[n], tr),
      query: carry(cv, 5, n, QUERY[p], QUERY[n], tr),
      board: carry(cv, 6, n, BOARD[p], BOARD[n], tr),
      blend: carry(cv, 7, n, BLEND[p], BLEND[n], tr),
      n0: carry(cv, 8, n, EQUAL[p], EQUAL[n], tr),
      n1: carry(cv, 9, n, UNIVERSAL[p], UNIVERSAL[n], tr),
      n2: carry(cv, 10, n, HABIT[p], HABIT[n], tr),
      // The marks inside a note draw after the note has landed, on its own beat only.
      m0: n === NOTE_AT[0] ? ease01((bt.value - 0.5) / 0.8) : n > NOTE_AT[0] && NOTE_AT[0] >= 0 ? 1 : 0,
      m1: n === NOTE_AT[1] ? ease01((bt.value - 0.5) / 0.8) : n > NOTE_AT[1] && NOTE_AT[1] >= 0 ? 1 : 0,
      m2: n === NOTE_AT[2] ? ease01((bt.value - 0.5) / 1.2) : n > NOTE_AT[2] && NOTE_AT[2] >= 0 ? 1 : 0,
      t,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.finder);
  const DG = useDerivedValue<Bundle>(() => SCENE.value.guide);

  // The headline swaps once the third verdict stamps: the board states the setup
  // first, then states the finding. Both sit at the same spot, so it costs no room.
  const titleAsk = useAnimatedStyle(() => ({
    opacity: SCENE.value.board * (1 - clamp01(SCENE.value.lens - 2)),
    transform: [{ translateY: (1 - SCENE.value.board) * -6 }],
  }));
  const titleAns = useAnimatedStyle(() => ({ opacity: clamp01(SCENE.value.lens - 2) }));
  // "What should you do with it?" — a question mark over the wallet, bobbing slowly,
  // gone once the board takes the question over.
  const query = useAnimatedStyle(() => ({
    opacity: SCENE.value.query,
    transform: [{ translateY: Math.sin(SCENE.value.t * 1.6) * 2 + (1 - SCENE.value.query) * 6 }],
  }));

  return (
    <Animated.View style={styles.scene} pointerEvents="none">
      {/* ── the verdict board ─────────────────────────────────────────────── */}
      <Animated.Text style={[styles.boardTitle, titleAsk]}>ONE CHOICE  ·  THREE VERDICTS</Animated.Text>
      <Animated.Text style={[styles.boardTitle, titleAns]}>THREE LENSES  ·  ONE VERDICT</Animated.Text>
      {LENSES.map((L, k) => <LensRow key={L.name} S={SCENE} k={k} />)}
      {[0, 1].map((k) => <Joiner key={k} S={SCENE} k={k} />)}

      {/* ── the margin: one worked note per lens ───────────────────────────── */}
      <Note S={SCENE} k={0} caption="EQUALLY" />
      <Note S={SCENE} k={1} caption="FOR ALL?" />
      <Note S={SCENE} k={2} caption="PRACTICE" />

      {/* ── the pavement, and the wallet lying on it ──────────────────────── */}
      <View style={styles.ground} />
      {PAVE.map((x) => <View key={x} style={[styles.pave, { left: x }]} />)}
      <Animated.Text style={[styles.query, query]}>?</Animated.Text>

      <View style={styles.walletShadow} />
      <View style={styles.noteBack} />
      <View style={styles.noteFront} />
      <View style={styles.wallet}>
        {STITCH.map((sx) => <View key={sx} style={[styles.stitch, { left: sx }]} />)}
        <View style={styles.walletFold} />
        <View style={styles.walletClasp} />
      </View>
      <View style={styles.walletCard} />

      <Stickman role="second" D={DG} k={K_FIG} />
      <Stickman D={DF} k={K_FIG} />
    </Animated.View>
  );
}

/** One row of the comparison table: step badge · lens · question · verdict stamp. */
function LensRow({ S, k }: { S: SharedValue<any>; k: number }) {
  const L = LENSES[k];

  // The rows drop onto the board one after another, each with its empty slot.
  const rowIn = useAnimatedStyle(() => {
    const u = ease01(clamp01((S.value.board - k * 0.2) / 0.6));
    return { opacity: u, transform: [{ translateY: (1 - u) * -8 }] };
  });
  const lit = useAnimatedStyle(() => ({ opacity: clamp01(S.value.lens - k) }));
  const pending = useAnimatedStyle(() => ({ opacity: 1 - clamp01(S.value.lens - k) }));
  // A row is named when its lens is — the first alone, the other two together.
  const named = useAnimatedStyle(() => {
    const u = clamp01(S.value.named - k);
    return { opacity: u, transform: [{ translateX: (1 - u) * -6 }] };
  });
  // The verdict lands like a rubber stamp: oversized and tilted, settling square.
  const stamp = useAnimatedStyle(() => {
    const e = ease01(clamp01(S.value.lens - k));
    return { opacity: e, transform: [{ scale: 1.45 - 0.45 * e }, { rotate: `${(1 - e) * -9}deg` }] };
  });

  return (
    <Animated.View style={[styles.row, { top: ROW_T[k] }, rowIn]}>
      <Animated.View style={[styles.rowLit, lit]} />
      <Animated.View style={[styles.rowAccent, lit]} />

      {/* step badge — outlined while pending, solid once this lens has ruled */}
      <View style={styles.badge}><Text style={styles.badgeText}>{L.n}</Text></View>
      <Animated.View style={[styles.badgeOn, lit]}><Text style={styles.badgeTextOn}>{L.n}</Text></Animated.View>

      <Animated.View style={[styles.nameCol, named]}>
        <Text style={styles.lensName}>{L.name}</Text>
        <Text style={styles.lensWho}>{L.who}</Text>
      </Animated.View>
      <Animated.Text style={[styles.lensQ, named]}>{L.q}</Animated.Text>

      <Animated.View style={[styles.slot, pending]}><Text style={styles.slotText}>?</Text></Animated.View>
      <Animated.View style={[styles.stamp, stamp]}><Text style={styles.stampText}>RETURN IT</Text></Animated.View>
    </Animated.View>
  );
}

/** A "+" between two rows' step badges: ordinary thinking uses all three at once. */
function Joiner({ S, k }: { S: SharedValue<any>; k: number }) {
  const st = useAnimatedStyle(() => {
    const u = ease01(clamp01((S.value.blend - k * 0.3) / 0.7));
    return { opacity: u, transform: [{ scale: 0.6 + 0.4 * u }] };
  });
  const y = (ROW_T[k] + ROW_H + ROW_T[k + 1]) / 2;
  return (
    <Animated.View style={[styles.joiner, { top: y - JOIN_D / 2 }, st]}>
      <View style={styles.joinH} />
      <View style={styles.joinV} />
    </Animated.View>
  );
}

// One person's happiness, as the note counts it: a token worth exactly 1. (Tokens,
// not little people — a person on this stage is drawn by the rig or not at all.)
function Token({ x }: { x: number }) {
  return (
    <View style={[styles.token, { left: x }]}>
      <Text style={styles.tokenText}>1</Text>
    </View>
  );
}

/**
 * One margin note: a numbered card for the lens it belongs to, landing on that
 * lens's second beat and staying. Its marks draw in once the card is down.
 *   1 — 1 = 1 = 1: each person's happiness counts as one, and equally.
 *   2 — the rule “KEEP ANY WALLET”, willed FOR ALL, crossed out: it cannot be willed.
 *   3 — five steps, each a little higher: virtue by practice.
 */
function Note({ S, k, caption }: { S: SharedValue<any>; k: 0 | 1 | 2; caption: string }) {
  const card = useAnimatedStyle(() => {
    const u = k === 0 ? S.value.n0 : k === 1 ? S.value.n1 : S.value.n2;
    return { opacity: u, transform: [{ translateX: (1 - u) * 10 }] };
  });
  const marks = useAnimatedStyle(() => ({ opacity: k === 0 ? S.value.m0 : k === 1 ? S.value.m1 : 1 }));
  const cross = useAnimatedStyle(() => {
    const u = ease01(clamp01((S.value.m1 - 0.5) * 2));
    return { opacity: u, transform: [{ scale: 1.3 - 0.3 * u }] };
  });
  return (
    <Animated.View style={[styles.note, { top: NOTE_T + k * NOTE_STEP }, card]}>
      <View style={styles.noteBadge}><Text style={styles.noteBadgeText}>{k + 1}</Text></View>
      <Text style={styles.noteCap}>{caption}</Text>
      {k === 0 ? (
        <Animated.View style={[StyleSheet.absoluteFill, marks]}>
          <Token x={10} />
          <Text style={[styles.noteEq, { left: 24 }]}>=</Text>
          <Token x={32} />
          <Text style={[styles.noteEq, { left: 46 }]}>=</Text>
          <Token x={54} />
        </Animated.View>
      ) : null}
      {k === 1 ? (
        <>
          <Animated.View style={[StyleSheet.absoluteFill, marks]}>
            <Text style={[styles.noteRule, { top: 18 }]}>“KEEP ANY</Text>
            <Text style={[styles.noteRule, { top: 28 }]}>WALLET”</Text>
          </Animated.View>
          <Animated.View style={[styles.noteCross, cross]}>
            <View style={[styles.noteCrossBar, { transform: [{ rotate: '45deg' }] }]} />
            <View style={[styles.noteCrossBar, { transform: [{ rotate: '-45deg' }] }]} />
          </Animated.View>
        </>
      ) : null}
      {k === 2 ? STEPS.map((j) => <Step key={j} S={S} j={j} />) : null}
    </Animated.View>
  );
}

/** One step of practice: each 12 wide and 4 taller than the last, rising in turn. */
function Step({ S, j }: { S: SharedValue<any>; j: number }) {
  const st = useAnimatedStyle(() => {
    const u = ease01(clamp01(S.value.m2 * STEP_N - j));
    return { opacity: u, transform: [{ scaleY: 0.2 + 0.8 * u }] };
  });
  return <Animated.View style={[styles.step, { left: 8 + j * 12, height: 4 + j * 4 }, st]} />;
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 30, right: 22, top: GROUND, height: 1.5, backgroundColor: RULE },

  boardTitle: {
    position: 'absolute', left: BOARD_L, top: TITLE_T, width: BOARD_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 11, lineHeight: 14, letterSpacing: 1.6, color: SOFT,
    includeFontPadding: false,
  },

  row: {
    position: 'absolute', left: BOARD_L, width: BOARD_W, height: ROW_H,
    borderWidth: 1.5, borderColor: RULE, borderRadius: 4, backgroundColor: STONE, boxShadow: LIP,
  },
  rowLit: {
    position: 'absolute', left: -1.5, top: -1.5, right: -1.5, bottom: -1.5,
    borderWidth: 1.5, borderColor: INK, borderRadius: 4,
  },
  rowAccent: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, backgroundColor: INK },

  badge: {
    position: 'absolute', left: 12, top: (ROW_H - 26) / 2, width: 26, height: 26, borderRadius: 13,
    borderWidth: 1.5, borderColor: SOFT, alignItems: 'center', justifyContent: 'center',
  },
  badgeText: { fontFamily: 'Inter_700Bold', fontSize: 13, lineHeight: 16, color: INK, includeFontPadding: false },
  badgeOn: {
    position: 'absolute', left: 12, top: (ROW_H - 26) / 2, width: 26, height: 26, borderRadius: 13,
    backgroundColor: INK, alignItems: 'center', justifyContent: 'center',
  },
  badgeTextOn: { fontFamily: 'Inter_700Bold', fontSize: 13, lineHeight: 16, color: PAPER, includeFontPadding: false },

  nameCol: { position: 'absolute', left: 46, top: 7, width: 102 },
  lensName: {
    fontFamily: 'Inter_700Bold', fontSize: 13.5, lineHeight: 17, letterSpacing: 0.3, color: INK,
    includeFontPadding: false,
  },
  lensWho: {
    fontFamily: 'Inter_700Bold', fontSize: 10.5, lineHeight: 13, letterSpacing: 1, color: INK,
    includeFontPadding: false,
  },
  lensQ: {
    position: 'absolute', left: 152, top: 8, width: 116,
    fontFamily: 'Inter_500Medium', fontSize: 11.5, lineHeight: 14.5, color: INK, includeFontPadding: false,
  },

  slot: {
    position: 'absolute', left: 274, top: 7, width: 92, height: 30,
    borderWidth: 1.5, borderColor: RULE, borderStyle: 'dashed', borderRadius: 4,
    alignItems: 'center', justifyContent: 'center',
  },
  slotText: { fontFamily: 'Inter_700Bold', fontSize: 16, lineHeight: 20, color: INK, includeFontPadding: false },
  stamp: {
    position: 'absolute', left: 274, top: 7, width: 92, height: 30,
    backgroundColor: INK, borderRadius: 4, alignItems: 'center', justifyContent: 'center',
  },
  stampText: {
    fontFamily: 'Inter_700Bold', fontSize: 12.5, lineHeight: 16, letterSpacing: 0.6, color: PAPER,
    includeFontPadding: false,
  },

  // ── the "+" between the step badges ─────────────────────────────────────
  joiner: {
    position: 'absolute', left: JOIN_X - JOIN_D / 2, width: JOIN_D, height: JOIN_D, borderRadius: JOIN_D / 2,
    backgroundColor: PAPER, borderWidth: 1.5, borderColor: INK,
  },
  joinH: { position: 'absolute', left: 2.5, top: 5.5, width: 8, height: 2, backgroundColor: INK },
  joinV: { position: 'absolute', left: 5.5, top: 2.5, width: 2, height: 8, backgroundColor: INK },

  // ── the question over the wallet (x 182…198, y 404…434; the notes start at 446)
  query: {
    position: 'absolute', left: WALLET_X - 8, top: 404, width: 16, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 26, lineHeight: 30, color: INK, includeFontPadding: false,
  },

  // ── the margin notes ───────────────────────────────────────────────────────
  // Inside a note (77 × 41 within the border): the badge at 5, the caption from 21
  // (FOR ALL? and PRACTICE end by 73 at 9.2px — this band's 8pt floor), and the
  // marks in the band 18…39.
  note: {
    position: 'absolute', left: NOTE_L, width: NOTE_W, height: NOTE_H,
    borderWidth: 1.5, borderColor: INK, borderRadius: 4, backgroundColor: STONE, boxShadow: LIP,
  },
  noteBadge: {
    position: 'absolute', left: 5, top: 4, width: 13, height: 13, borderRadius: 6.5,
    backgroundColor: INK, alignItems: 'center', justifyContent: 'center',
  },
  noteBadgeText: { fontFamily: 'Inter_700Bold', fontSize: 9.2, lineHeight: 11, color: PAPER, includeFontPadding: false },
  noteCap: {
    position: 'absolute', left: 21, top: 5, width: 55,
    fontFamily: 'Inter_700Bold', fontSize: 9.2, lineHeight: 11, letterSpacing: 0.3, color: INK, includeFontPadding: false,
  },
  noteEq: {
    position: 'absolute', top: 22.5, width: 8, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 10, lineHeight: 12, color: INK, includeFontPadding: false,
  },
  token: {
    position: 'absolute', top: 22, width: 13, height: 13, borderRadius: 6.5,
    backgroundColor: INK, alignItems: 'center', justifyContent: 'center',
  },
  tokenText: { fontFamily: 'Inter_700Bold', fontSize: 9.2, lineHeight: 11, color: PAPER, includeFontPadding: false },
  // Two lines, 52 and 44 wide at 9.2px, in a column that ends where the cross starts.
  noteRule: {
    position: 'absolute', left: 6, width: 54,
    fontFamily: 'Inter_700Bold', fontSize: 9.2, lineHeight: 10.5, color: INK, includeFontPadding: false,
  },
  // The cross stands beside the rule's second line, never on a word: the first
  // line's ink ends at x 58 above y 28, the second's at 50.
  noteCross: { position: 'absolute', left: 60, top: 25, width: 14, height: 14, alignItems: 'center', justifyContent: 'center' },
  noteCrossBar: { position: 'absolute', width: 15, height: 2.5, borderRadius: 1.25, backgroundColor: INK },
  step: { position: 'absolute', bottom: 3, width: 11, backgroundColor: INK, transformOrigin: '50% 100%' },

  // ── the pavement, drawn as slabs rather than one bare rule ────────────────
  pave: { position: 'absolute', top: GROUND + 2, width: 1.5, height: 5, backgroundColor: RULE },

  // ── the wallet: a stitched body with a fold and clasp, two notes and a card ─
  walletShadow: {
    position: 'absolute', left: WALLET_X - 42, top: GROUND - 2, width: 84, height: 5,
    borderRadius: 3, backgroundColor: RULE,
  },
  wallet: {
    position: 'absolute', left: WALLET_X - 37, top: GROUND - 40, width: 74, height: 40, borderRadius: 4,
    borderWidth: 2, borderColor: INK, backgroundColor: STONE, boxShadow: LIP,
  },
  stitch: { position: 'absolute', top: 5, width: 6, height: 1.5, backgroundColor: RULE },
  walletFold: { position: 'absolute', left: 0, right: 0, top: 16, height: 1.5, backgroundColor: SOFT },
  walletClasp: {
    position: 'absolute', left: 28, top: 21, width: 16, height: 10, borderRadius: 2,
    borderWidth: 1.5, borderColor: SOFT,
  },
  noteBack: {
    position: 'absolute', left: WALLET_X - 14, top: GROUND - 54, width: 30, height: 10,
    borderWidth: 1.2, borderColor: RULE, borderRadius: 1.5, backgroundColor: PAPER,
  },
  noteFront: {
    position: 'absolute', left: WALLET_X - 22, top: GROUND - 49, width: 32, height: 11,
    borderWidth: 1.5, borderColor: SOFT, borderRadius: 1.5, backgroundColor: PAPER,
  },
  walletCard: {
    position: 'absolute', left: WALLET_X + 8, top: GROUND - 44, width: 24, height: 15,
    borderWidth: 1.2, borderColor: SOFT, borderRadius: 1.5, backgroundColor: PAPER,
  },
});

// BAND. Measured against every beat, not just the first.
//   top    · the board title at 182 (the row borders start at 198.5, the stamps
//            never scale above 202), so 176 leaves 6 units of air.
//   bottom · the ankle JOINT is a circle of radius STR.limb/2 × K_FIG = 7.4 drawn
//            centred on GROUND, so a planted foot actually inks to 507.4 — lower
//            than the pavement slabs (507), the wallet shadow (503) or the ground
//            rule (501.5). 512 clears the true lowest pixel by 4.6.
// Figures: crown = GROUND − FIG_H × K_FIG ≈ 361, and the highest lift in this
// lesson is the beat-7 shrug (bob +3, live accent +2.5 → crown ~353.6), still
// 13 units below the table's last row at 340. Nothing is clipped, nothing collides.
// The margin notes (x 314…394, y 352…495 with their lip) and the question mark over
// the wallet (y 404…434) sit inside the same slice.
export function Ethics2Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Ethics2Scene} band={[176, 512]} camera={CAM} />;
}
