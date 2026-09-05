import {
  View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { clamp01, WALK, dirsFrom, ease01, lerp, moveTr, pose, travelStance, type Bundle } from './rig';
// The whole movement library, not just rig's 49 emotes. Codes under 100 ARE
// rig's and mean exactly what they always did; 100+ reach moves.ts (emoteAny).
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './ethics11Script';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, STONE, SOFT, RULE, PAPER, useHeld, carryFrom, keepHeld, facing, useCarry, carry, lookPose,
} from './cinematicKit';
import { followMoves, kindOf, seedOf } from './camera';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';

// Bentham's counting table, stage right: one plank on two legs with three pleasure
// tokens standing on it, all drawn the SAME SIZE, and a ledger slung underneath
// adding them up. Mill's objection is a physical change to that picture — a second,
// higher shelf is built above the table, and when the reader taps the symphony it
// RISES onto it and is drawn a third larger. One row becomes two levels.
//
// COMPOSITION / OCCLUSION — everything is laid out in plain stage coordinates and
// there is NO scene-wide camera, so every tap target is exactly where its art is
// (E37b). The only transform is the one that carries the symphony token up.
//   · the figure stands at x = 60 for beats 0–2, then WALKS once to x = 126 (66
//     units, so `moveTr` gives it 0.89s) and holds there. Facing +1 throughout, so
//     the track never flips. Extents taken from the rig at the pose each beat
//     actually holds, swept across the whole transition (B9a), not from ±36: the
//     widest is beat 6's gesture 30 offer-up, x 106 … 153.5, and the walk itself
//     swings out to x 148. Crown y 394 at its highest (the gait's bob), feet 505.
//   · the TABLE plank is x 180 … 396, y 448 … 454; its legs x 192 and x 378 run
//     down to the ground line at 500. So 26 units of clear paper stand between the
//     figure and anything it is talking about (D23/D24).
//   · the three TOKENS stand ON the plank: 64 × 48 each at x 186 / 256 / 326,
//     y 400 … 448 — below the crown line and 32 clear of the figure's reach.
//   · the LEDGER card hangs UNDER the table, between its legs: x 224 … 352,
//     y 460 … 492, so it is 6 below the plank and 8 above the ground line.
//   · the SHELF plank is x 210 … 366, y 322 … 328, on two brackets y 328 … 344.
//     Its label sits above it at y 236 … 250, and the risen token occupies
//     x 245 … 331, y 258 … 322. Nothing is drawn above y 236, hence band [228,512]
//     = 284 units, which is inside the free 2.31× fit (H59).
//   · THE CORRIDOR the token rises through — y 344 … 400 between the brackets and
//     the token tops — is deliberately empty paper. The ledger started out in it,
//     centred at x 230 … 346, and the arithmetic says the token sweeps that band
//     from x 267 to 394 on its way up: it would have been drawn straight across
//     the sum for about half a second (D31). Under the table it is clear of
//     everything and reads as the tally the counting table keeps.
//
// A5 — DELIBERATE EXCEPTIONS.
//   · The figure never TOUCHES the upper shelf, and no beat's text says it does.
//     The shelf is above its crown and this figure cannot put a hand over its own
//     head at all (B11b), so the token rises on its own and the figure points UP at
//     it (gesture 6) instead. Writing "he lifts it" would have been A1's worst case.
//   · The table is 52 units tall against a 103-unit figure (0.50). A real table is
//     about 0.44 of a person; a shorter one would have put the tokens' tops through
//     the figure's crown line, so it is a counting counter rather than a dining
//     table — still in proportion, and the tokens stay clear of every head (B7).
//   · The completed two-level picture is on screen for the answered half of the
//     interact beat and the whole of the payoff beat after it. That is why there IS
//     a payoff beat: the rise is the argument, and it needs somewhere to be looked
//     at (H64).

// ── the lower table ───────────────────────────────────────────────────────────
const TABLE_L = 180;
const TABLE_W = 216;
const TABLE_T = 448;
const TABLE_TH = 6;
const LEG_W = 4;
const LEG_LX = 192;
const LEG_RX = 378;

// ── the three tokens, all identical on purpose ────────────────────────────────
// SIZED FOR A FINGER (E37b-2). The band is 284 units, so on a 360dp phone this
// lesson renders at fit ≈ min(0.88, 296/284) = 0.88. A 70-unit PITCH is therefore
// 61.6dp centre-to-centre — comfortably past the ~45dp a fingertip covers and the
// 48dp Android asks for — and a 64 × 48 card draws 56.3 × 42.2dp. The horizontal
// slop below is exactly half the 6-unit gutter, so the gutter is live but no card
// ever overlaps its neighbour (which would silently hand the tap to the topmost).
// The 6-unit vertical slop is free — the corridor above the row is empty paper and
// the plank is directly below — and it takes the card to 52.7dp tall.
const TOK_W = 64;
const TOK_H = 48;
const TOK_PITCH = 70;
const TOK_L = 186;
const TOK_T = TABLE_T - TOK_H;          // 400 — standing ON the plank
/** Half the gutter — more would overlap the neighbour, and the topmost would win. */
const TOK_SLOP = (TOK_PITCH - TOK_W) / 2;

// ── the ledger, slung under the table ─────────────────────────────────────────
const LED_L = 224;
const LED_W = 128;
const LED_T = 460;
const LED_H = 32;

// ── the higher shelf ──────────────────────────────────────────────────────────
const SHELF_L = 210;
const SHELF_W = 156;
const SHELF_T = 322;
const SHELF_TH = 6;
const BRACKET_H = 16;
const SHELF_CX = SHELF_L + SHELF_W / 2;   // 288 — also the table's centre

// WHERE THE SYMPHONY GOES. Derived, not typed: the token's resting centre is
// (326 + 32, 400 + 24) = (358, 424); on the shelf it is drawn 1.34× (so 85.8 × 64.3)
// with its BOTTOM on the plank at y 322, which puts its centre at (288, 289.9).
// A View scales about its centre, so these are simply the difference.
const RISE_K = 1.34;
const RISE_DX = SHELF_CX - (TOK_L + 2 * TOK_PITCH + TOK_W / 2);        // −70
const RISE_DY = SHELF_T - (TOK_H * RISE_K) / 2 - (TOK_T + TOK_H / 2);  // −134.2

const TOKENS = [
  { id: 'game', name: 'BAR GAME', sub: 'an idle hour', correct: false },
  { id: 'dessert', name: 'DESSERT', sub: 'one more bite', correct: false },
  { id: 'symphony', name: 'SYMPHONY', sub: 'learn to hear', correct: true },
];

const P = BEATS.map((b) => b.p ?? 0);
const X = BEATS.map((b) => b.x ?? 60);
// The camera, from the staging: it follows the figure this track describes,
// pulls back to scale 1 on every graded beat so a tap lands where it is aimed,
// and leans in on the quote. See followMoves in ./camera.ts.
const CAM = followMoves(X, BEATS.map(kindOf), seedOf('ethics11'));
const DIR = dirsFrom(X, 1);
const TOKV = BEATS.map((b) => b.tok ?? 0);
const SHELFV = BEATS.map((b) => b.shelf ?? 0);
const UPV = BEATS.map((b) => b.up ?? 0);
// 2 = "still there, but it no longer settles anything" — a dim, never a slab drawn
// across it (D31).
const LEDV = BEATS.map((b) => (b.led === 2 ? 0.3 : b.led === 1 ? 1 : 0));

// R7b — the stage follows the control on its own graded beat, and only there.
// Derived from the beat rather than declared as a channel so it cannot fall out
// of step with the control it is about.
const REACT = BEATS.map((b) => (b.interact?.split ? 1 : 0));

export default function Ethics11Scene({ clock, bt, bi, qv, i, picked, onPick, dragPos, gazeX, gazeY, gazeOn }: SceneApi) {
  const reacting = REACT[i] === 1;
  const heldS = useHeld();
  const cv = useCarry(5);
  const cur = BEATS[i];

  // The rise is the reader's own answer playing out, so on the interact beat it is
  // driven by `qv` (0 until they tap, then 0→1 over 780ms). On every later beat both
  // ends of the blend are 1, so it HOLDS instead of replaying on each tap (C20c).
  const riseNow = !!cur.interact;
  const showPick = (cur.pick ?? 0) > 0 && !!cur.interact;
  const answered = picked !== null;
  const live = showPick && !answered;

  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / moveTr(X[p], X[n], 0.85));
    const t = clock.value;

    const s = keepHeld(heldS, travelStance(
      X[p], X[n],
      carryFrom(heldS, n, emoteHold(P[p], t)), emoteHold(P[n], t), emoteLive(P[n], t, bt.value),
      tr, WALK,
    ));
    return {
      fig: lookPose(s, carry(cv, 0, n, X[p], X[n], tr), GROUND, K_FIG, facing(DIR[p], DIR[n], bt.value), 1, gazeX.value, gazeY.value, gazeOn.value),
      tok: carry(cv, 1, n, TOKV[p], TOKV[n], tr),
      shelf: carry(cv, 2, n, SHELFV[p], SHELFV[n], tr),
      led: carry(cv, 3, n, LEDV[p], LEDV[n], tr),
      // R7b — the seam lifts the symphony. Slide toward WHAT KIND and the token
      // climbs to the higher shelf; slide back to HOW MUCH and it drops among the
      // cheap thrills to be counted with them. Mill's whole claim, under a thumb.
      rise: riseNow ? ease01(qv.value) : carry(cv, 4, n, UPV[p], reacting ? dragPos.value : UPV[n], tr),
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const tokStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.tok }));
  const shelfStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.shelf }));
  const ledStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.led }));
  // THE FRAME RECEDES, THE WORDS DO NOT (D35).
  //
  // `led: 2` in the script means "still there, no longer the point", and LEDV turns
  // that into an opacity of 0.3 for the whole box — which put BENTHAM'S LEDGER on
  // the stage at 1.5:1 and held it there for two beats. Dimming cannot work on a
  // box with words in it: the text and its paper fade together, so the contrast
  // between them collapses at exactly the same rate. Measured, ink on paper needs
  // about 0.84 opacity to hold 3:1, which is not a dim at all.
  //
  // So the two are separated. The frame keeps the recede; the lines ride a track
  // that is legible or absent, which is what §19 already says about a locked pin:
  // unlit against lit, never the same thing dimmer.
  const ledTextStyle = useAnimatedStyle(() => ({ opacity: clamp01(SCENE.value.led * 3) }));
  const riseStyle = useAnimatedStyle(() => {
    const r = SCENE.value.rise;
    return {
      transform: [
        { translateX: RISE_DX * r },
        { translateY: RISE_DY * r },
        { scale: 1 + (RISE_K - 1) * r },
      ],
    };
  });

  return (
    <Animated.View style={styles.scene}>
      {/* ── the higher shelf, and the level it names ─────────────────────────── */}
      <Animated.View style={[styles.shelfWrap, shelfStyle]} pointerEvents="none">
        <Text style={styles.shelfLabel}>MILL · HIGHER IN KIND</Text>
        <View style={styles.shelfPlank} />
        <View style={[styles.bracket, { left: SHELF_L + 8 }]} />
        <View style={[styles.bracket, { left: SHELF_L + SHELF_W - 11 }]} />
      </Animated.View>

      {/* ── the counting table, and the ledger slung under it ────────────────── */}
      <View style={styles.plank} pointerEvents="none" />
      <View style={[styles.leg, { left: LEG_LX }]} pointerEvents="none" />
      <View style={[styles.leg, { left: LEG_RX }]} pointerEvents="none" />
      <Animated.View style={[styles.ledger, ledStyle]} pointerEvents="none" />
      <Animated.View style={[styles.ledgerText, ledTextStyle]} pointerEvents="none">
        <Text style={styles.ledgerCap}>BENTHAM’S LEDGER</Text>
        <Text style={styles.ledgerSum}>1 + 1 + 1 = 3</Text>
      </Animated.View>

      {/* ── the three tokens · Q2 is answered by tapping one of them ─────────── */}
      {TOKENS.map((tk, k) => {
        const chosen = picked === tk.id;
        const slot = [styles.tokenSlot, { left: TOK_L + k * TOK_PITCH }, tokStyle];
        return (
          <Animated.View
            key={tk.id}
            style={k === 2 ? [...slot, riseStyle] : slot}
            pointerEvents={live ? 'box-none' : 'none'}
          >
            <Target id={tk.id} correct={tk.correct} picked={picked} onPick={onPick}
              disabled={!live} hitSlop={{ top: 6, bottom: 6, left: TOK_SLOP, right: TOK_SLOP }}>
              <View
                style={[
                  styles.tokenInner,
                  showPick && answered && tk.correct && styles.tokenRight,
                  showPick && answered && chosen && !tk.correct && styles.tokenWrong,
                ]}
              >
                {/* numberOfLines={1} is the structural half of the fix: with room
                    made above these now fit comfortably, but a single line is what
                    makes splitting a word IMPOSSIBLE rather than merely unlikely on
                    a font whose metrics we do not control (D30). */}
                <Text
                  numberOfLines={1}
                  style={[styles.tokenName, showPick && answered && tk.correct && styles.tokenOn]}
                >
                  {tk.name}
                </Text>
                <Text
                  numberOfLines={1}
                  style={[styles.tokenSub, showPick && answered && tk.correct && styles.tokenOn]}
                >
                  {tk.sub}
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
  ground: { position: 'absolute', left: 24, right: 10, top: GROUND, height: 1.5, backgroundColor: RULE },

  // ── table ───────────────────────────────────────────────────────────────────
  plank: {
    position: 'absolute', left: TABLE_L, top: TABLE_T, width: TABLE_W, height: TABLE_TH,
    backgroundColor: INK, borderRadius: 2,
  },
  leg: {
    position: 'absolute', top: TABLE_T + TABLE_TH, width: LEG_W, height: GROUND - TABLE_T - TABLE_TH,
    backgroundColor: SOFT,
  },
  // ── tokens ──────────────────────────────────────────────────────────────────
  tokenSlot: { position: 'absolute', top: TOK_T, width: TOK_W },
  tokenInner: {
    height: TOK_H, borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: STONE,
    // paddingHorizontal 1, not 2. At 2 of padding and 0.2 of tracking "SYMPHONY"
    // measured 55.4 units in 56 — it fitted by six tenths of a unit, which is not a
    // fit, it is a coincidence. Android's metrics are a shade wider than the
    // browser's, so on a real phone the word was broken in half: SYMPHON / Y.
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 1,
  },
  tokenRight: { backgroundColor: INK, borderColor: INK },
  tokenWrong: { borderColor: SOFT },
  // D30 — an eight-character word must not break. Content width here is
  // 64 − 2×2 border − 2×1 padding = 58, and "SYMPHONY" measures 51.4, leaving 11.4%
  // for whatever Android's metrics do to it.
  //
  // The row's PITCH is tuned for tap targets (see TOK_PITCH), so the box cannot be
  // widened to buy margin without eating the gutter — the size of the type is the
  // only free variable, hence 8.6 rather than 9. It still sits clearly above the
  // 7px sub-label, which is what carries the hierarchy.
  tokenName: {
    // letterSpacing 0, not 0.2. Tracking is charged PER CHARACTER, so on an
    // eight-letter word it was buying 1.6 units of width for almost no optical
    // benefit at this size — more than the entire margin the label had left.
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 12, letterSpacing: 0,
    color: INK, includeFontPadding: false,
  },
  tokenSub: {
    fontFamily: 'Inter_400Regular', fontSize: 8.6, lineHeight: 10, marginTop: 2,
    color: INK, includeFontPadding: false,
  },
  tokenOn: { color: PAPER },

  // ── ledger ──────────────────────────────────────────────────────────────────
  ledger: {
    position: 'absolute', left: LED_L, top: LED_T, width: LED_W, height: LED_H,
    borderWidth: 1.5, borderColor: INK, borderRadius: 3, backgroundColor: PAPER,
  },
  /** The same box, without the furniture — see ledTextStyle. */
  ledgerText: {
    position: 'absolute', left: LED_L, top: LED_T, width: LED_W, height: LED_H,
    alignItems: 'center', justifyContent: 'center',
  },
  ledgerCap: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10, letterSpacing: 1.2,
    color: SOFT, includeFontPadding: false,
  },
  ledgerSum: {
    fontFamily: 'Inter_700Bold', fontSize: 12, lineHeight: 15, letterSpacing: 0.5,
    color: INK, includeFontPadding: false, marginTop: 1,
  },

  // ── shelf ───────────────────────────────────────────────────────────────────
  shelfWrap: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H },
  // The BOX is wider than the shelf so a 21-character label can never break onto a
  // second line (D30); the glyphs are centred on the shelf and measure ~143, so
  // they land inside x 216 … 360 — well within the plank below them.
  shelfLabel: {
    position: 'absolute', left: SHELF_CX - 110, top: 236, width: 220, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 9.5, lineHeight: 13, letterSpacing: 1.2,
    color: SOFT, includeFontPadding: false,
  },
  shelfPlank: {
    position: 'absolute', left: SHELF_L, top: SHELF_T, width: SHELF_W, height: SHELF_TH,
    backgroundColor: INK, borderRadius: 2,
  },
  bracket: {
    position: 'absolute', top: SHELF_T + SHELF_TH, width: 3, height: BRACKET_H,
    backgroundColor: SOFT,
  },
});

// The highest ink is the shelf's label at y 236; the lowest is the ground line at
// 500. Cropping to [228, 512] is 284 units, which still fits at the width-limited
// 2.31× — the shelf earns its rows because the shelf IS the lesson (H59, H64).
export function Ethics11Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Ethics11Scene} band={[228, 512]} camera={CAM} />;
}
