import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { ease01, lerp, mixStance, pose, type Bundle } from './rig';
// The whole movement library, not just rig's 49 emotes. Codes under 100 ARE
// rig's and mean exactly what they always did; 100+ reach moves.ts (emoteAny).
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './valid3Script';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, STONE, SOFT, RULE, PAPER, useHeld, carryFrom, keepHeld, useCarry, carry,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// The argument pinned up as a FORM the inspector reads, stage right.
//
//   · three fixed boxes — premise, premise, ∴ conclusion — whose WORDS swap from
//     the abstract skeleton to the toaster argument without the boxes moving, so
//     "same form, different content" is something you watch rather than are told;
//   · a two-box CHECKLIST beneath — FORM VALID? · PREMISES TRUE? — each cycling
//     from "?" to ✓ or ✗. That checklist is the lesson: two tests, never confused;
//   · a rubber VALID stamp that lands on the form, and strike-throughs plus a
//     FALSE tag when the premises turn out untrue;
//   · stage left, THE FORBIDDEN PAIRING — "premises true / conclusion false" in a
//     box that gets struck out with a drawn-on ✗ and stamped IMPOSSIBLE. That is
//     the definition of validity as a picture, and it fills the column beside the
//     inspector that used to be blank paper.
//
// On the graded beat the form clears and four VERDICT CARDS take the board — the
// question is answered by tapping one of them, not by reading a list.
//
// No camera transform: everything is authored straight into stage space, so the
// band below is exact. The inspector's widest reach ends at x ≈ 118, the board
// frame starts at x = 126 and the ballot at x = 130, so the figure can never
// cover a card.

const K = K_FIG * 1.08;            // stage units per rig unit (figure ≈ 111 tall)
const FIG_X = 60;                  // widest reach lands at x ≈ 118

// ── the form ─────────────────────────────────────────────────────────────────
const FR_L = 126;                  // frame 126..302
const FR_W = 176;
const BX = 136;                    // rows 136..300
const BW = 164;
const P1_Y = 266;
const P2_Y = 312;
const ROW_H = 42;
const DIV_Y = 362;
const C_Y = 374;
const C_H = 44;

// ── the checklist ────────────────────────────────────────────────────────────
const CK1_Y = 436;
const CK2_Y = 468;
const CK_BOX = 28;

// ── the "what VALID forbids" block, stage left ───────────────────────────────
// Validity's definition, drawn: the ONE pairing a valid form can never produce —
// all premises true and the conclusion false — struck through as impossible. It
// fills the empty column beside the inspector and is the picture of beat 2's
// sentence. It occupies 236..341, and the figure's crown sits at 350, so it can
// never collide with the body; it is clear of the ballot (x ≥ 130) too.
const VD_L = 8;
const VD_W = 116;
const VD_TOP = 236;
const VD_BOX_T = 15;
const VD_BOX_H = 72;
// The strike bars run corner to corner: hypot(116, 72) = 136.5, trimmed to 136 so
// the PAINTED diagonal (136·cos31.8° = 115.6 wide) stays inside the 116-wide block
// and no platform's child-clipping can ever bite off its tip.
const VD_DIAG = 136;

// ── the verdict ballot (the scene-answered question) ─────────────────────────
const BAL_L = 130;
const BAL_W = 258;
const BAL_TOP = 296;
const BAL_H = 44;
const BAL_STEP = 50;               // 296 · 346 · 396 · 446 → ends at 490

const FORMS = [
  ['All A are B', 'All B are C', 'So all A are C'],
  ['All toasters are gold', 'All gold things are time machines', 'So all toasters are time machines'],
];

const CARDS = [
  { id: 'a', title: 'SOUND', sub: 'the conclusion is guaranteed', correct: true },
  { id: 'b', title: 'VALID ONLY', sub: 'conclusion could still be false', correct: false },
  { id: 'c', title: 'PROBABLE', sub: 'only likely, like a guess', correct: false },
  { id: 'd', title: 'INCOMPLETE', sub: 'still missing evidence', correct: false },
];

const P_CODE = BEATS.map((b) => b.p ?? 0);
const LINK = BEATS.map((b) => b.link ?? 0);
const STAMP = BEATS.map((b) => b.stamp ?? 0);
const FLAW = BEATS.map((b) => b.flaw ?? 0);
const TR = 0.85;

// THE CAMERA (H60b). `followMoves` reads the x track and gives each beat its own
// shot: it FOLLOWS him when a beat moves him far enough to be worth following,
// pushes close on a quote, and PULLS BACK to the whole band on a question or a
// summary — the beats the reader has to read and act on. Beats that do not set
// `x` stand at FIG_X, so a still lesson gets the one-in-three push rather than a
// camera that never rests.
const X = BEATS.map((b) => b.x ?? FIG_X);

// R7b — the stage follows the control on its own graded beat, and only there.
// Derived from the beat rather than declared as a channel so it cannot fall out
// of step with the control it is about.
const REACT = BEATS.map((b) => (b.interact?.field ? 1 : 0));
const CAM = followMoves(X, BEATS.map(kindOf), seedOf('valid3'));

export default function Valid3Scene({ clock, bt, bi, i, picked, onPick, dragPos, dragPos2 }: SceneApi) {
  const reacting = REACT[i] === 1;
  const heldInsp = useHeld();
  const cv = useCarry(3);
  const cur = BEATS[i];
  const prev = i > 0 ? BEATS[i - 1] : undefined;
  const showPick = !!cur.interact;
  const leaving = !!prev?.interact && !cur.interact;
  const answered = picked !== null;

  // The words only re-animate on the beat that CHANGES them, so the form does not
  // flicker every time the reader taps forward.
  const swapped = (cur.form ?? 0) !== (prev?.form ?? 0);
  const lines = FORMS[cur.form ?? 0];

  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / TR);
    const t = clock.value;
    const grow = ease01(bt.value / 0.55);

    const insp = keepHeld(heldInsp, mixStance(carryFrom(heldInsp, n, emoteHold(P_CODE[p], t)), emoteLive(P_CODE[n], t, bt.value), tr));
    return {
      fig: pose(insp, FIG_X, GROUND, K, 1, 1),
      link: carry(cv, 0, n, LINK[p], LINK[n], tr),
      // R7b — the pad stamps the argument. Across, from a broken form to a good one,
      // the VALID stamp comes down.
      stamp: carry(cv, 1, n, STAMP[p], reacting ? dragPos.value : STAMP[n], tr),
      // And down the y axis, toward a false conclusion, the false-premise mark
      // appears: good form with a false ending has to have a bad premise somewhere.
      // Two axes, and the reader finds the corner where truth and validity come apart.
      flaw: carry(cv, 2, n, FLAW[p], reacting ? 1 - dragPos2.value : FLAW[n], tr),
      words: swapped ? grow : 1,
      // The form and the ballot cross-fade: the form dissolves as the cards land,
      // and fades back in on the beat after, so neither ever pops.
      board: showPick ? 1 - grow : leaving ? grow : 1,
      ballot: showPick ? grow : 0,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const boardStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.board }));
  const linkStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.link * SCENE.value.board }));
  const wordStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.words,
    transform: [{ translateX: (1 - SCENE.value.words) * -8 }],
  }));
  const stampStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.stamp * SCENE.value.board,
    transform: [{ rotate: '-13deg' }, { scale: 0.72 + 0.28 * SCENE.value.stamp }],
  }));
  const flawStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.flaw * SCENE.value.board }));
  const okStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.stamp }));
  const okQStyle = useAnimatedStyle(() => ({ opacity: 1 - SCENE.value.stamp }));
  const badStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.flaw }));
  const badQStyle = useAnimatedStyle(() => ({ opacity: 1 - SCENE.value.flaw }));
  const ballotStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.ballot,
    transform: [{ translateY: (1 - SCENE.value.ballot) * 10 }],
  }));
  // The forbidden-pairing block rides `link` alone (not `board`), so it stays on
  // stage through the question beat and keeps that column from going empty.
  const vdStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.link }));
  // Rotation and scale must live in the SAME animated transform array — an
  // animated `transform` replaces the static one rather than merging with it, so a
  // rotate left in StyleSheet would simply be dropped.
  const cross1Style = useAnimatedStyle(() => ({
    transform: [{ rotate: '31.8deg' }, { scaleX: Math.max(0.001, SCENE.value.link) }],
  }));
  const cross2Style = useAnimatedStyle(() => ({
    transform: [{ rotate: '-31.8deg' }, { scaleX: Math.max(0.001, SCENE.value.link) }],
  }));

  return (
    <Animated.View style={styles.scene}>
      <View style={styles.ground} pointerEvents="none" />

      {/* ── the argument, pinned up as a form ───────────────────────────────── */}
      <Animated.View style={[styles.board, boardStyle]} pointerEvents="none">
        <View style={styles.frame} />
        <Text style={styles.frameLab}>THE ARGUMENT</Text>

        <View style={[styles.row, { top: P1_Y }]}>
          <Animated.Text style={[styles.rowT, wordStyle]}>{lines[0]}</Animated.Text>
        </View>
        <View style={[styles.row, { top: P2_Y }]}>
          <Animated.Text style={[styles.rowT, wordStyle]}>{lines[1]}</Animated.Text>
        </View>

        <Animated.View style={[styles.divider, linkStyle]} />
        <Animated.Text style={[styles.therefore, linkStyle]}>∴</Animated.Text>
        <Animated.View style={[styles.row, styles.concl, { top: C_Y, height: C_H }, linkStyle]}>
          <Animated.Text style={[styles.rowT, styles.conclT, wordStyle]}>{lines[2]}</Animated.Text>
        </Animated.View>

        {/* The false-premise strikes and their tag. `nativeID` is not decoration:
            check-cover treats ink over a word as a defect unless the scene DECLARES
            it an annotation, which is what these are (D33). */}
        <Animated.View nativeID="strike-premise-1" style={[styles.strike, { top: P1_Y + ROW_H / 2 - 1.25 }, flawStyle]} />
        <Animated.View nativeID="strike-premise-2" style={[styles.strike, { top: P2_Y + ROW_H / 2 - 1.25 }, flawStyle]} />
        <Animated.View style={[styles.falseTag, flawStyle]}>
          <Text style={styles.falseTagT}>FALSE</Text>
        </Animated.View>
      </Animated.View>

      {/* ── what "VALID" forbids, struck out as it is stated ────────────────── */}
      <Animated.View style={[styles.vd, vdStyle]} pointerEvents="none">
        <Text style={styles.vdCap}>VALID MEANS</Text>
        <View style={styles.vdBox}>
          <Text style={styles.vdLine}>PREMISES TRUE</Text>
          <View style={styles.vdRule} />
          <Text style={styles.vdLine}>{'CONCLUSION\nFALSE'}</Text>
        </View>
        <Animated.View nativeID="crossout-impossible-1" style={[styles.vdCross, { top: VD_BOX_T }, cross1Style]} />
        <Animated.View nativeID="crossout-impossible-2" style={[styles.vdCross, { top: VD_BOX_T + VD_BOX_H }, cross2Style]} />
        <Text style={styles.vdVerdict}>IMPOSSIBLE</Text>
      </Animated.View>

      {/* the rubber stamp on the form */}
      <Animated.View style={[styles.stamp, stampStyle]} pointerEvents="none">
        <Text style={styles.stampT}>VALID</Text>
      </Animated.View>

      {/* ── the two tests, as a checklist ───────────────────────────────────── */}
      <Animated.View style={[styles.check, boardStyle]} pointerEvents="none">
        <View style={[styles.ckBox, { top: CK1_Y }]}>
          <Animated.Text style={[styles.ckMark, okQStyle]}>?</Animated.Text>
          <Animated.Text style={[styles.ckMark, styles.ckOn, okStyle]}>✓</Animated.Text>
        </View>
        <Text style={[styles.ckLab, { top: CK1_Y + 5 }]}>FORM VALID?</Text>

        <View style={[styles.ckBox, { top: CK2_Y }]}>
          <Animated.Text style={[styles.ckMark, badQStyle]}>?</Animated.Text>
          <Animated.Text style={[styles.ckMark, styles.ckOn, badStyle]}>✗</Animated.Text>
        </View>
        <Text style={[styles.ckLab, { top: CK2_Y + 5 }]}>PREMISES TRUE?</Text>
      </Animated.View>

      <Stickman D={DF} k={K} />

      {/* ── the verdict ballot: the question is answered here ───────────────── */}
      {showPick ? (
        <Animated.View style={[styles.ballot, ballotStyle]} pointerEvents="box-none">
          <View style={styles.given} pointerEvents="none">
            <Text style={styles.givenT}>VALID FORM ✓   PREMISES TRUE ✓</Text>
          </View>
          <Text style={styles.ballotHdr}>TAP THE VERDICT</Text>

          {CARDS.map((c, k) => {
            const chosen = picked === c.id;
            return (
              <Target id={c.id} correct={c.correct} picked={picked} onPick={onPick}
              key={c.id} style={[styles.balSlot, { top: BAL_TOP - 236 + k * BAL_STEP }]} disabled={answered}>
                <View
                  style={[
                    styles.balCard,
                    answered && c.correct && styles.balRight,
                    answered && chosen && !c.correct && styles.balWrong,
                  ]}
                >
                  <Text style={[styles.balTitle, answered && c.correct && styles.balTitleOn]}>{c.title}</Text>
                  <Text style={[styles.balSub, answered && c.correct && styles.balSubOn]}>{c.sub}</Text>
                </View>
              </Target>
            );
          })}
        </Animated.View>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 12, right: 12, top: GROUND, height: 2, backgroundColor: RULE },
  // THE FLOOR THE GROUND LINE SITS ON. A rule on its own leaves the
  // figure and everything it is looking at standing on bare page;
  // political7 and political8 both stand their subject on a filled mass.
  floor: { position: 'absolute', left: 0, right: 0, top: GROUND, bottom: 0, backgroundColor: RULE },

  board: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H },
  frame: {
    position: 'absolute', left: FR_L, top: 236, width: FR_W, height: 190,
    borderWidth: 1.5, borderColor: RULE, borderRadius: 5,
  },
  frameLab: {
    position: 'absolute', left: BX, top: 245,
    fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.6, color: SOFT, includeFontPadding: false,
  },

  row: {
    position: 'absolute', left: BX, width: BW, height: ROW_H,
    borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: PAPER,
    justifyContent: 'center', paddingHorizontal: 10,
  },
  concl: { borderWidth: 2.5 },
  rowT: { fontFamily: 'Inter_700Bold', fontSize: 12.5, lineHeight: 16, color: INK, includeFontPadding: false },
  conclT: { fontSize: 13 },

  divider: { position: 'absolute', left: BX + 18, top: DIV_Y, width: BW - 18, height: 2, backgroundColor: INK },
  therefore: {
    position: 'absolute', left: BX, top: DIV_Y - 12,
    fontFamily: 'PlayfairDisplay_700Bold', fontSize: 19, color: INK, includeFontPadding: false,
  },

  // ── the forbidden pairing ─────────────────────────────────────────────────
  vd: { position: 'absolute', left: VD_L, top: VD_TOP, width: VD_W, overflow: 'visible' },
  vdCap: {
    fontFamily: 'Inter_700Bold', fontSize: 10.5, lineHeight: 14, letterSpacing: 1.4,
    color: SOFT, textAlign: 'center', includeFontPadding: false,
  },
  vdBox: {
    marginTop: 1, height: VD_BOX_H, borderWidth: 2, borderColor: INK, borderRadius: 4,
    backgroundColor: PAPER, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6,
  },
  vdLine: {
    fontFamily: 'Inter_700Bold', fontSize: 11, lineHeight: 15, color: INK,
    textAlign: 'center', includeFontPadding: false,
  },
  vdRule: { width: 84, height: 1.5, backgroundColor: RULE, marginVertical: 5 },
  vdCross: {
    position: 'absolute', left: 0, width: VD_DIAG, height: 2,
    backgroundColor: INK, transformOrigin: '0% 50%',
  },
  vdVerdict: {
    marginTop: 4, fontFamily: 'Inter_700Bold', fontSize: 11.5, lineHeight: 14, letterSpacing: 1.6,
    color: INK, textAlign: 'center', includeFontPadding: false,
  },

  // ── A STRIKE-THROUGH HAS TO COMMIT (D33) ───────────────────────────────────
  //
  // This was 172 wide at −4°, which is the worst available answer. −4° over that
  // length drifts twelve units vertically, and the second premise — "All gold
  // things are time machines" — WRAPS to two lines inside a 42-unit row. So the
  // bar entered at the height of the lower line and left at the height of the
  // upper one, slicing the tops of some letters and the bottoms of others without
  // ever reading as a strike. A reader described the result as a word "being
  // intersected … cut off", and called it cheap; they were right.
  //
  // Corner to corner instead: atan(42/164) = 14.4°, a bar of 168 whose painted
  // extent is 168·cos = 163 wide by 168·sin = 42 tall — exactly the row. That
  // reads as crossed out whether the text runs to one line or two, and it is the
  // SAME device this scene already uses for the impossible pairing twenty lines
  // above, so the lesson says "struck out" one way rather than two.
  strike: {
    position: 'absolute', left: BX - 2, width: 168, height: 2.5,
    backgroundColor: INK, transform: [{ rotate: '-14.4deg' }],
  },
  falseTag: {
    position: 'absolute', left: 240, top: 240, borderWidth: 2, borderColor: INK, backgroundColor: INK,
    paddingHorizontal: 7, paddingVertical: 2, borderRadius: 3, transform: [{ rotate: '-7deg' }],
  },
  falseTagT: { fontFamily: 'Inter_700Bold', fontSize: 10, color: PAPER, letterSpacing: 1.4, includeFontPadding: false },

  // 300..388 × 344..388 unrotated; the -13° tilt widens that to 296..392 × 335..397
  stamp: {
    position: 'absolute', left: 300, top: 344, width: 88, height: 44,
    borderWidth: 3, borderColor: INK, borderRadius: 5,
    alignItems: 'center', justifyContent: 'center', transformOrigin: '50% 50%',
  },
  stampT: { fontFamily: 'Inter_700Bold', fontSize: 18, color: INK, letterSpacing: 2.5, includeFontPadding: false },

  check: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H },
  ckBox: {
    position: 'absolute', left: FR_L, width: CK_BOX, height: CK_BOX,
    borderWidth: 2.5, borderColor: INK, borderRadius: 4, backgroundColor: STONE,
    alignItems: 'center', justifyContent: 'center',
  },
  ckMark: {
    position: 'absolute', fontFamily: 'Inter_700Bold', fontSize: 17, lineHeight: 22, color: SOFT, includeFontPadding: false,
  },
  ckOn: { color: INK },
  ckLab: {
    position: 'absolute', left: FR_L + CK_BOX + 12,
    fontFamily: 'Inter_700Bold', fontSize: 13.5, lineHeight: 18, letterSpacing: 0.6, color: INK, includeFontPadding: false,
  },

  // ── ballot ────────────────────────────────────────────────────────────────
  ballot: { position: 'absolute', left: BAL_L, top: 236, width: BAL_W, height: 258 },
  // 38, not 32: the givens line measures ~228 of the 254 of inner width, so a wide
  // ✓ glyph from a fallback font could tip it onto a second 16-tall line. At 32 that
  // second line was clipped; at 38 it simply wraps, and the header below still
  // starts at 42. Sits above the cards, never over them.
  given: {
    position: 'absolute', left: 0, top: 0, width: BAL_W, height: 38,
    borderWidth: 2, borderColor: SOFT, borderRadius: 4, alignItems: 'center', justifyContent: 'center',
  },
  givenT: { fontFamily: 'Inter_700Bold', fontSize: 12.5, lineHeight: 16, letterSpacing: 0.6, color: INK, includeFontPadding: false },
  ballotHdr: {
    position: 'absolute', left: 0, top: 42, width: BAL_W,
    fontFamily: 'Inter_700Bold', fontSize: 11, lineHeight: 14, letterSpacing: 1.4, color: SOFT, includeFontPadding: false,
  },
  // Tap target: 258 × 44 stage units, a 14px title over a 12px gloss.
  balSlot: { position: 'absolute', left: 0, width: BAL_W, height: BAL_H },
  balCard: {
    width: BAL_W, height: BAL_H, borderWidth: 2, borderColor: INK, borderRadius: 4,
    backgroundColor: PAPER, justifyContent: 'center', paddingHorizontal: 12,
  },
  balRight: { backgroundColor: INK, borderColor: INK },
  balWrong: { borderColor: SOFT, opacity: 0.45 },
  balTitle: { fontFamily: 'Inter_700Bold', fontSize: 14.5, lineHeight: 17, letterSpacing: 0.4, color: INK, includeFontPadding: false },
  balTitleOn: { color: PAPER },
  balSub: { fontFamily: 'Inter_500Medium', fontSize: 12, lineHeight: 15, color: SOFT, includeFontPadding: false },
  balSubOn: { color: RULE },
});

// BAND. Topmost ink is the form's frame and the forbidden-pairing caption, both at
// 236 (the tilted FALSE tag reaches 236.6); the lowest is the ground line at 500 +
// 2 thick. Everything else finishes above it: the ballot's last card at 490, the
// checklist at 496, the tilted VALID stamp at 397, the figure's crown at 350. So
// [228, 512] holds every extreme with 8 units of margin top and 10 bottom, and the
// scene renders about twice the size of the letterboxed full-height fit.
export function Valid3Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Valid3Scene} band={[228, 512]} camera={CAM} />;
}
