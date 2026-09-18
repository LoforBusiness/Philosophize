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
import { BEATS } from './ethics12Script';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, PAPER, useHeld, carryFrom, keepHeld, facing, useCarry, carry, lookPose, pickAt,
} from './cinematicKit';
import { stageTone } from './stageTones';
import { floorStyle, lipOf, PLATE_FACE } from './stageSkin';
import { followMoves, kindOf, seedOf } from './camera';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';

// THE STAGE IS STRUCK IN THIS LESSON'S OWN BRANCH HUE (./stageTones).
// Same three tones, same luminance to the third decimal — so every contrast
// measured against the old greys still holds and nothing on the stage moved.
const TONE = stageTone('ethics');
const { RULE, STONE, SHADE } = TONE;
const LIP = lipOf(TONE);   // the ledge a toned plate stands on (scripts/skin-stage.mjs)

// A copying press on the floor stage-right, and above it a board that fills with
// identical cards. One card reads "I PROMISE". The figure walks over, strikes the
// press, and the same card comes out again and again — and as the copies multiply
// the word PROMISE goes pale on every one of them until the whole board is blank.
// That is the whole argument: universalise the maxim and it eats the practice it
// depends on. Q2 replaces the board with three candidate maxims, on the same marks.
//
// COMPOSITION / OCCLUSION —
//   · the figure WALKS x = 56 → 124 once (68 units) and never moves again. At rest
//     it spans x ≈ 88 … 160; its widest beat is the summary's `47 frame-it-up` at
//     x ≈ 84 … 164, and its longest reach is beat 2's strike, fist edge at x 153.5.
//   · the PRESS occupies x 174 … 272, y 402 … 500 — 10 units clear of the figure's
//     widest extent, so neither ever covers the other (D23/D24). It is 98 units
//     tall against a 103-unit figure: a bench press about shoulder height (B7).
//   · the HANDLE (x 136 … 182, y 448 … 460, travelling 14 down) is DELIBERATELY
//     inside that envelope — it is the thing the figure strikes, so it is placed
//     off the hand `26 stamp` actually produces, not off his mark (C22d2, A5). The
//     hand's clamped rest is stage (148, 454), which is the bar's centre; its strike
//     carries it to about (142, 468), which is the bar's travel.
//   · the COPY FIELD is x 160 … 388, y 222 … 382 — twelve 70×34 cells in 3 columns.
//   · the Q2 cards are x 146 … 390, y 222 … 388, on the same rows.
//   · every crown is at y 397 (nobody kneels or sits here), so the field, the cards
//     and the label at y 202 … 214 all sit above every body: the lowest of them
//     stops 9 units clear of the top of the head.
//   · lowest ink is the figure's shadow at about y 506, hence band [198, 512].
//
// A5 — deliberate exceptions:
//   · the handle inside the figure's span, as above. Contact, not occlusion.
//   · on answering Q2 the two failing maxims BLANK THEIR OWN TEXT on top of the
//     standard answer states (H61 is kept: the survivor fills INK with PAPER text,
//     a wrong pick drops to a SOFT border at 0.45). The extra blanking is the
//     lesson's picture arriving at the answer, not a second answer UI.

// ── the press ────────────────────────────────────────────────────────────────
const PRESS_L = 174;
const PRESS_W = 98;
const PRESS_T = 402;

// ── the board of copies ──────────────────────────────────────────────────────
const FIELD_L = 160;
const FIELD_T = 222;
const CELL_W = 70;
const CELL_H = 34;
const COL = 79;              // 70 wide + 9 gutter → columns at 160, 239, 318
const ROW = 42;              // 34 tall + 8 gutter → rows at 222, 264, 306, 348

const C0 = COL * 0, C1 = COL * 1, C2 = COL * 2;
const R0 = ROW * 0, R1 = ROW * 1, R2 = ROW * 2, R3 = ROW * 3;

/** The original. Always on the board. */
const CELL_MAIN: [number, number] = [FIELD_L + C0, FIELD_T + R0];
/** The first stamping completes the top row (3 cards). */
const CELLS_B: [number, number][] = [
  [FIELD_L + C1, FIELD_T + R0], [FIELD_L + C2, FIELD_T + R0],
];
/** The second stamping fills the rest — in two waves so the board fills, not blinks. */
const CELLS_C1: [number, number][] = [
  [FIELD_L + C0, FIELD_T + R1], [FIELD_L + C1, FIELD_T + R1], [FIELD_L + C2, FIELD_T + R1],
];
const CELLS_C2: [number, number][] = [
  [FIELD_L + C0, FIELD_T + R2], [FIELD_L + C1, FIELD_T + R2], [FIELD_L + C2, FIELD_T + R2],
  [FIELD_L + C0, FIELD_T + R3], [FIELD_L + C1, FIELD_T + R3], [FIELD_L + C2, FIELD_T + R3],
];

// ── Q2's three maxims ────────────────────────────────────────────────────────
// SIZED FOR A FINGER (E37b-2). The band is 314 units, so on a 360dp phone this
// renders at fit ≈ 0.88 — a 46-unit card is 40.5dp and a 60-unit PITCH is 52.8dp,
// past the 48dp Android asks and the ~45dp a fingertip covers. The pitch is the
// number that matters; the slop below is exactly half the 14-unit gutter, because
// anything wider would overlap the neighbour and the topmost would silently win.
const PICK_L = 146;
const PICK_W = 244;
const PICK_T = 222;
const PICK_H = 46;
const PICK_GAP = 60;
/** Half the gap — more would overlap the neighbour, and the topmost would win. */
const PICK_SLOP = (PICK_GAP - PICK_H) / 2;

const MAXIMS = [
  { id: 'break', label: 'BREAK A PROMISE WHEN IT SUITS ME', correct: false },
  { id: 'keep', label: 'KEEP THE PROMISES YOU MAKE', correct: true },
  { id: 'lie', label: 'LIE WHEN THE TRUTH IS INCONVENIENT', correct: false },
];

const P = BEATS.map((b) => b.p ?? 0);
const X = BEATS.map((b) => b.x ?? 124);
// The camera, from the staging: it follows the figure this track describes,
// pulls back to scale 1 on every graded beat so a tap lands where it is aimed,
// and leans in on the quote. See followMoves in ./camera.ts.
const CAM = followMoves(X, BEATS.map(kindOf), seedOf('ethics12'));
const DIR = dirsFrom(X, 1);
const NV = BEATS.map((b) => b.n ?? 1);
const WV = BEATS.map((b) => b.word ?? 0);
// group AH — the two still-tap events.
const SUPPOSEV = BEATS.map((b) => (b.suppose ? 1 : 0));
const STRIKEV = BEATS.map((b) => (b.strike ? 1 : 0));
// The three reveal groups, derived from the card count so the script only ever
// states the number the reader can see on the board.
const BV = NV.map((n) => (n >= 3 ? 1 : 0));
const C1V = NV.map((n) => (n >= 6 ? 1 : 0));
const C2V = NV.map((n) => (n >= 12 ? 1 : 0));

// R7c — the board follows the sort on its own graded beat, and only there.
// Derived from the beat rather than declared as a channel so it cannot fall out
// of step with the control it is about.
const REACT = BEATS.map((b) => (b.interact?.sort ? 1 : 0));

// DOES THIS PRINCIPLE BUILD "THE WORLD IT MAKES"? Read in the sort's OWN bin order
// (never the shuffled row order — see SceneApi.pickPos): never a means · a
// universal rule · more people happy. The board is the maxim universalised, and
// only the universal-rule test universalises it — so only that row keeps the twelve
// copies and the emptied PROMISE. The other two judge this one promise, so the
// board goes back to the lone maxim card as beat 1 drew it, word still legible.
const LAW_AT = [0, 1, 0];

export default function Ethics12Scene({ clock, bt, bi, qv, i, picked, onPick, pickPos, gazeX, gazeY, gazeOn }: SceneApi) {
  const heldS = useHeld();
  const cv = useCarry(7);
  const cur = BEATS[i];
  const prev = i > 0 ? BEATS[i - 1] : undefined;
  const reacting = REACT[i] === 1;
  // The beat after the sort eases the board back from wherever the reader left it,
  // rather than snapping it full on the frame the beat changes (L1/L5).
  const settle = reacting || (i > 0 && REACT[i - 1] === 1);

  // Only what CHANGED this beat animates; everything else holds, so tapping forward
  // never re-stamps a board that is already full (C20c, H58).
  const nChanged = (cur.n ?? 1) !== (prev?.n ?? 1);
  const wordChanged = (cur.word ?? 0) !== (prev?.word ?? 0);
  const striking = (cur.p ?? 0) === 26;
  const pickOn = (cur.pick ?? 0) > 0;
  const pickFade = pickOn !== ((prev?.pick ?? 0) > 0);
  // group AH — still-tap events (C20c).
  const supposeFade = !!cur.suppose !== !!prev?.suppose;
  const strikeFade = !!cur.strike !== !!prev?.strike;

  const answered = picked !== null;
  const showPick = pickOn && !!cur.interact;

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

    // The handle goes down only on the beat the figure actually strikes it, over
    // exactly the window `26 stamp` swings its fist through — so the bar moves with
    // the hand rather than near it.
    const hu = clamp01((bt.value - 0.55) / 0.4);
    const handle = striking ? Math.sin(hu * Math.PI) * 14 : 0;

    // The ram answers the strike rather than sharing its instant (C20d), then damps
    // to rest: abs(sin) is three strokes, the (1 - wu) taper ends both at zero.
    const wu = clamp01((bt.value - 0.85) / 2.2);
    const ram = nChanged ? Math.abs(Math.sin(wu * Math.PI * 3)) * (1 - wu) * 22 : 0;

    // Cards land as the press works, in two waves.
    const growA = ease01(clamp01((bt.value - 1.1) / 0.9));
    const growB = ease01(clamp01((bt.value - 1.8) / 0.9));
    // How far the reader's bin builds the universalised world (LAW_AT), 1 off the sort.
    const law = reacting ? pickAt(LAW_AT, pickPos.value) : 1;
    // A beat that changes nothing still writes its carry slot (mix 1 returns the
    // track exactly), so the sort beat starts from what is really on the board.
    const mixB = nChanged ? growA : settle ? tr : 1;

    return {
      fig: lookPose(s, carry(cv, 0, n, X[p], X[n], tr), GROUND, K_FIG, facing(DIR[p], DIR[n], bt.value), 1, gazeX.value, gazeY.value, gazeOn.value),
      // Sequential, never a cross-fade: the board is fully gone before the three
      // maxims start arriving on the same marks (C22).
      field: pickOn ? (pickFade ? 1 - ease01(clamp01(bt.value / 0.3)) : 0) : 1,
      pick: pickOn ? (pickFade ? ease01(clamp01((bt.value - 0.38) / 0.42)) : 1) : 0,
      b: carry(cv, 1, n, BV[p], BV[n] * law, mixB),
      c1: carry(cv, 2, n, C1V[p], C1V[n] * law, mixB),
      c2: carry(cv, 3, n, C2V[p], C2V[n] * law, nChanged ? growB : settle ? tr : 1),
      word: carry(cv, 4, n, WV[p], WV[n] * law, wordChanged ? growA : settle ? tr : 1),
      handle,
      ram,
      // qv only leaves zero once the reader has answered, so the losing maxims are
      // fully legible right up to the moment they are shown to fail.
      blank: ease01(qv.value),
      // group AH — a one-beat pulse; it fades both ways since it must close
      // again on the very next beat (L5 / "fade an event out, not off").
      suppose: carry(cv, 5, n, SUPPOSEV[p], SUPPOSEV[n], supposeFade ? grow : 1),
      // The strike lands once and stays, inside the same layer as the board
      // it crosses, so it leaves with it once Q2 replaces the field.
      strike: carry(cv, 6, n, STRIKEV[p], STRIKEV[n], tr, strikeFade ? grow : 1),
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);

  const fieldStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.field }));
  const bStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.b }));
  const c1Style = useAnimatedStyle(() => ({ opacity: SCENE.value.c1 }));
  const c2Style = useAnimatedStyle(() => ({ opacity: SCENE.value.c2 }));
  const wordStyle = useAnimatedStyle(() => ({ opacity: 1 - SCENE.value.word }));
  const ramStyle = useAnimatedStyle(() => ({ transform: [{ translateY: SCENE.value.ram }] }));
  const handleStyle = useAnimatedStyle(() => ({ transform: [{ translateY: SCENE.value.handle }] }));
  const pickStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.pick }));
  const blankStyle = useAnimatedStyle(() => ({ opacity: 1 - SCENE.value.blank }));
  // group AH — the two still-tap events.
  const supposeStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.suppose }));
  const strikeStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.strike }));

  // One card on the board. `main` is the original the copies are taken from.
  const cell = (l: number, t: number, main: boolean) => (
    <View
      key={`${l}-${t}`}
      style={[styles.cell, { left: l, top: t }, main && styles.cellMain]}
      pointerEvents="none"
    >
      <Text style={[styles.cellI, main && styles.cellOn]}>I</Text>
      <Animated.View style={wordStyle} pointerEvents="none">
        <Text style={[styles.cellWord, main && styles.cellOn]}>PROMISE</Text>
      </Animated.View>
    </View>
  );

  return (
    <Animated.View style={styles.scene}>
      {/* ── the board the copies land on, high above every head ──────────────── */}
      <Animated.View style={[styles.layer, fieldStyle]} pointerEvents="none">
        <View style={styles.labelWrap} pointerEvents="none">
          <Text style={styles.label}>THE WORLD IT MAKES</Text>
        </View>
        <View style={styles.feed} pointerEvents="none" />
        {cell(CELL_MAIN[0], CELL_MAIN[1], true)}
        <Animated.View style={[styles.layer, bStyle]} pointerEvents="none">
          {CELLS_B.map((c) => cell(c[0], c[1], false))}
        </Animated.View>
        <Animated.View style={[styles.layer, c1Style]} pointerEvents="none">
          {CELLS_C1.map((c) => cell(c[0], c[1], false))}
        </Animated.View>
        <Animated.View style={[styles.layer, c2Style]} pointerEvents="none">
          {CELLS_C2.map((c) => cell(c[0], c[1], false))}
        </Animated.View>

        {/* A diagonal strike crosses the board, once, as the practice of
            promising is said to be destroyed (group AH). It rides inside this
            same fading layer, so it leaves with the board once Q2 replaces it. */}
        <Animated.View style={[styles.strikeLine, strikeStyle]} pointerEvents="none" />
      </Animated.View>

      {/* A dashed line brackets the field of copies, once, as the maxim is
          supposed adopted "at once" by everyone (group AH). */}
      <Animated.View style={[styles.supposeBracket, supposeStyle]} pointerEvents="none" />

      {/* ── Q2: the three candidate maxims, on the board's own marks ─────────── */}
      {showPick ? (
        <>
          <Animated.View style={[styles.labelWrap, pickStyle]} pointerEvents="none">
            <Text style={styles.label}>WHICH ONE SURVIVES?</Text>
          </Animated.View>
          {MAXIMS.map((m, k) => {
            const chosen = picked === m.id;
            return (
              <Animated.View
                key={m.id}
                style={[styles.pickSlot, { top: PICK_T + k * PICK_GAP }, pickStyle]}
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
                    {answered && !m.correct ? (
                      <Animated.View style={blankStyle} pointerEvents="none">
                        <Text style={styles.pickText}>{m.label}</Text>
                      </Animated.View>
                    ) : (
                      <Text style={[styles.pickText, answered && m.correct && styles.pickTextOn]}>
                        {m.label}
                      </Text>
                    )}
                  </View>
                </Target>
              </Animated.View>
            );
          })}
        </>
      ) : null}

      {/* ── the press: a bench machine the figure works from its left ────────── */}
      <View style={styles.beam} pointerEvents="none" />
      <View style={[styles.upright, styles.uprightL]} pointerEvents="none" />
      <View style={[styles.upright, styles.uprightR]} pointerEvents="none" />
      <Animated.View style={[styles.ram, ramStyle]} pointerEvents="none" />
      <Animated.View style={[styles.handle, handleStyle]} pointerEvents="none" />
      <View style={styles.base} pointerEvents="none">
        <Text style={styles.baseText}>MAKE IT A LAW</Text>
      </View>

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DF} k={K_FIG} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  // A full-stage carrier for props that fade together, explicitly positioned so its
  // children never depend on flex flow above them.
  layer: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H },
  ground: { position: 'absolute', left: 22, right: 14, top: GROUND, height: 1.5, backgroundColor: RULE },

  // ── the label over the board ────────────────────────────────────────────────
  labelWrap: { position: 'absolute', left: PICK_L, top: 202, width: PICK_W },
  label: {
    textAlign: 'center', fontFamily: 'Inter_700Bold', fontSize: 9.5, letterSpacing: 1.8,
    color: SOFT, includeFontPadding: false,
  },
  // The short run from the press up to the board, so the copies plainly come OUT of
  // the machine rather than appearing on their own.
  feed: { position: 'absolute', left: 221, top: 384, width: 2, height: 18, backgroundColor: RULE },

  // ── one card ────────────────────────────────────────────────────────────────
  cell: {
    position: 'absolute', width: CELL_W, height: CELL_H,
    borderWidth: 1.5, borderColor: INK, borderRadius: 8, backgroundColor: PLATE_FACE, boxShadow: LIP,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5,
  },
  cellMain: { backgroundColor: INK, borderWidth: 2 },
  cellI: {
    fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 0.1, color: INK,
    marginRight: 3, includeFontPadding: false,
  },
  cellWord: {
    fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 0.1, color: INK,
    includeFontPadding: false,
  },
  cellOn: { color: PAPER },

  // ── Q2 targets: the deck's option, on the stage (H61) ───────────────────────
  pickSlot: { position: 'absolute', left: PICK_L, width: PICK_W },
  pickInner: {
    height: PICK_H, borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: PLATE_FACE, boxShadow: LIP,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8,
  },
  pickRight: { backgroundColor: INK, borderColor: INK },
  pickWrong: { borderColor: SOFT },
  pickText: {
    fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 0.2, color: INK,
    textAlign: 'center', includeFontPadding: false,
  },
  pickTextOn: { color: PAPER },

  // ── the press ───────────────────────────────────────────────────────────────
  beam: {
    position: 'absolute', left: PRESS_L, top: PRESS_T, width: PRESS_W, height: 12,
    backgroundColor: INK, borderRadius: 2,
  },
  upright: { position: 'absolute', top: PRESS_T + 10, width: 8, height: 68, backgroundColor: SOFT },
  uprightL: { left: PRESS_L + 2 },
  uprightR: { left: PRESS_L + PRESS_W - 10 },
  ram: {
    position: 'absolute', left: PRESS_L + 12, top: PRESS_T + 18, width: PRESS_W - 24, height: 14,
    backgroundColor: INK, borderRadius: 2,
  },
  // The bar the figure strikes. Mounted on the near upright and sticking out toward
  // him, at the height his own fist settles to.
  handle: {
    position: 'absolute', left: 136, top: 448, width: 46, height: 12,
    borderWidth: 2, borderColor: INK, borderRadius: 6, backgroundColor: PAPER,
  },
  base: {
    position: 'absolute', left: PRESS_L, top: 476, width: PRESS_W, height: 24,
    borderWidth: 2, borderColor: INK, borderRadius: 8, backgroundColor: PLATE_FACE, boxShadow: LIP,
    alignItems: 'center', justifyContent: 'center',
  },
  baseText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.8, color: INK,
    includeFontPadding: false,
  },

  // ── the two still-tap events (group AH) ────────────────────────────────────
  // A dashed bracket around the row of three, for the one beat that supposes
  // them all adopted at once — a boundary, never a fill (D31).
  supposeBracket: {
    position: 'absolute', left: FIELD_L - 6, top: FIELD_T - 6,
    width: COL * 2 + CELL_W + 12, height: CELL_H + 12,
    borderWidth: 1.5, borderColor: SHADE, borderRadius: 10, borderStyle: 'dashed',
  },
  // The single strike that crosses the full board once the practice it counts
  // on is said to be destroyed. Corner to corner of the twelve-cell field.
  strikeLine: {
    position: 'absolute', left: 134, top: 300, width: 280, height: 3, borderRadius: 1.5,
    backgroundColor: INK, transform: [{ rotate: '-35deg' }],
  },
});

// Art runs from the board's label (202) to the figure's shadow (about 506). Nothing
// is drawn higher or lower, so the crop is [198, 512] — 314 units, which is what the
// three finger-sized Q2 targets cost and what they are worth.
export function Ethics12Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Ethics12Scene} band={[198, 512]} camera={CAM} />;
}
