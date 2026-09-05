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
import { BEATS } from './logic10Script';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER, useHeld, carryFrom, keepHeld,
  facing, useCarry, carry, STONE, lookPose,
} from './cinematicKit';
import { followMoves, kindOf, seedOf } from './camera';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';

// A rule straight across the stage labelled SAID. Above it, the two sentences that
// were actually spoken; below it, in dashed outline, the one that was not. The
// missing premise is hauled UP through the rule into the empty socket waiting for it,
// where it goes solid and readable — and only then can you see it is false.
//
// COMPOSITION / OCCLUSION —
//   · the figure WALKS x = 34 → 96 → 158, facing right the whole lesson. The track is
//     monotonic, so he never flips facing in one frame (C18).
//   · widest pose per mark, taken from the rig at the gesture that beat holds (B9a),
//     fist radius 5.5 included: at 34 gesture 25 spans x ≈ 20…59 · at 96 gesture 13
//     spans x ≈ 84…136 · at 158 gesture 21 (fists ±26) spans x ≈ 126…190.
//   · the card column is x = 200…384. So at the closest beat there are 10 units of
//     clear paper between the figure's furthest reach and the column, and the figure
//     never enters it.
//   · the SAID rule runs x 14…390 at y 314 — 83 units above a standing crown (397),
//     so it passes over the figure and touches nobody. Its two tags sit at x 18…78,
//     y 300 and y 319, left of the column and above the crown.
//   · above the rule: HE IS RICH y 198…226 · SO HE IS HAPPY y 230…258 · the empty
//     socket y 262…306.
//   · below the rule: the premise nobody said starts at y 322…366 and is hauled up
//     exactly 60 units into the socket at 262…306. It crosses the rule and nothing
//     else — there is no card between the two positions — so the crossing, which is
//     the whole lesson, is never covered (D23, D31).
//   · on the Q2 beat the demo is replaced in place: the same two rows carry the sleep
//     argument, the socket is left empty, and three candidate premises stand below the
//     rule at y 322…368 · 384…430 · 446…492, stopping 8 short of the ground line.
//   · band [192, 512] — 6 units of air above the top card, the ground line at 500,
//     height 320 (D25, D26, H59).
//
// DELIBERATE EXCEPTIONS (A5) —
//   · Every card sits above y 366 and this figure's hand tops out at y 411 (B11b), so
//     he CANNOT touch them and never pretends to. The haul is a lifting gesture (30
//     offer-up) with the card rising on the same beat, and the narration says the
//     sentence is spoken aloud and comes up — never that he grips it (A4).
//   · The unsaid cards are dashed with borderRadius 0 rather than H61's radius 4:
//     Android draws a dashed border as SOLID as soon as the radius is non-zero, and
//     dashed-against-solid is the one distinction this picture is made of. Everything
//     that has been SAID keeps the house radius 4, so the two states stay apart.

const CARD_L = 200;
const CARD_W = 184;

const SAID_A_T = 198;     // "HE IS RICH"
const SAID_B_T = 230;     // "SO HE IS HAPPY"
const SAID_H = 28;

const SLOT_T = 262;       // the socket the missing premise belongs in
const SLOT_H = 44;

const LINE_Y = 314;       // the SAID rule itself

const HID_T = 322;        // the missing premise before anybody says it

// SIZED FOR A FINGER (E37b-2). The band is 320 units, so on a 360dp phone this
// renders at fit ≈ 0.88: a 46-unit card is 40dp and a 62-unit PITCH is 55dp. The
// pitch is the number that matters — Android asks 48dp and a fingertip covers about
// 45dp, so 55dp centre-to-centre is what stops a tap landing on the neighbour. The
// slop below is exactly half the 16-unit gutter; any more and the targets would
// overlap and the topmost would silently win.
const PICK_T = 322;
const PICK_H = 46;
const PICK_GAP = 62;
/** Half the gap — more would overlap the neighbour, and the topmost would win. */
const PICK_SLOP = (PICK_GAP - PICK_H) / 2;

// Indexed by the beat's `arg`: 0 nothing · 1 the rich/happy argument · 2 the sleep one.
const SAID_A = ['', 'HE IS RICH', 'YOU LOOK EXHAUSTED'];
const SAID_B = ['', 'SO HE IS HAPPY', 'SO: SLEEP MORE'];

// Hand-broken to two balanced lines rather than left to wrap, so nothing is stranded
// on a line of its own (D30, D32b). All three are TRUE; only one is load-bearing,
// which is exactly what makes the wrong two real rival answers (H66).
const CANDIDATES = [
  { id: 'bridge', label: 'LOOKING TIRED MEANS\nYOU NEED SLEEP', correct: true },
  { id: 'eight', label: 'EVERYONE SHOULD\nSLEEP EIGHT HOURS', correct: false },
  { id: 'health', label: 'SLEEP IS GOOD\nFOR YOUR HEALTH', correct: false },
];

const P = BEATS.map((b) => b.p ?? 0);
const X = BEATS.map((b) => b.x ?? 158);
// The camera, from the staging: it follows the figure this track describes,
// pulls back to scale 1 on every graded beat so a tap lands where it is aimed,
// and leans in on the quote. See followMoves in ./camera.ts.
const CAM = followMoves(X, BEATS.map(kindOf), seedOf('logic10'));
const DIR = dirsFrom(X, 1);
const SLOTV = BEATS.map((b) => b.slot ?? 0);

// R7b — the stage follows the control on its own graded beat, and only there.
// Derived from the beat rather than declared as a channel so it cannot fall out
// of step with the control it is about.
const REACT = BEATS.map((b) => (b.interact?.sort ? 1 : 0));

// Where the missing premise sits, and how solid it is, on every beat. A beat that
// does not show it CARRIES FORWARD the last position and solidity, so it fades out
// where it stands instead of sliding back under the line as it goes (C20c).
const HIDTOP: number[] = [];
const HIDOP: number[] = [];
const HIDSOL: number[] = [];
{
  let top = HID_T;
  let sol = 0;
  for (const b of BEATS) {
    const h = b.hid ?? 0;
    if (h === 1) { top = HID_T; sol = 0; }
    if (h === 2) { top = SLOT_T; sol = 1; }
    HIDTOP.push(top);
    HIDOP.push(h > 0 ? 1 : 0);
    HIDSOL.push(sol);
  }
}

export default function Logic10Scene({ clock, bt, bi, i, picked, onPick, pickPos, gazeX, gazeY, gazeOn }: SceneApi) {
  const reacting = REACT[i] === 1;
  const heldS = useHeld();
  const cv = useCarry(5);
  const cur = BEATS[i];
  const prev = i > 0 ? BEATS[i - 1] : undefined;

  // Each element fades in only on the beat that CHANGES it, and otherwise holds —
  // so nothing on the board replays itself every time the reader taps on (C20c).
  const argN = cur.arg ?? 0;
  const argFade = argN !== (prev?.arg ?? 0);
  const slotFade = (cur.slot ?? 0) !== (prev?.slot ?? 0);
  const pickOn = (cur.pick ?? 0) > 0 && !!cur.interact;
  const pickFade = pickOn !== ((prev?.pick ?? 0) > 0 && !!prev?.interact);
  const answered = picked !== null;

  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / moveTr(X[p], X[n], 0.85));
    const t = clock.value;
    const grow = ease01(bt.value / 0.55);
    // The premise goes solid a little AFTER it starts moving, so the change lands ON
    // the crossing of the rule rather than at the top of the haul (C20d).
    const cross = ease01(clamp01((tr - 0.4) / 0.45));

    const s = keepHeld(heldS, travelStance(
      X[p], X[n],
      carryFrom(heldS, n, emoteHold(P[p], t)), emoteHold(P[n], t), emoteLive(P[n], t, bt.value),
      tr, WALK,
    ));
    return {
      fig: lookPose(s, carry(cv, 0, n, X[p], X[n], tr), GROUND, K_FIG, facing(DIR[p], DIR[n], bt.value), 1, gazeX.value, gazeY.value, gazeOn.value),
      arg: argFade ? grow : 1,
      slot: carry(cv, 1, n, SLOTV[p], SLOTV[n], tr, slotFade ? grow : 1),
      rise: carry(cv, 2, n, HIDTOP[p], HIDTOP[n], tr) - HID_T,
      // R7b — the arm hauls the unsaid premise up. It runs from absent, through
      // dashed below the line, to sitting in the socket: the reader drags the thing
      // nobody said into the open, which is the only way to check whether it is true.
      hid: carry(cv, 3, n, HIDOP[p], reacting ? pickPos.value * 2 : HIDOP[n], tr),
      sol: carry(cv, 4, n, HIDSOL[p], HIDSOL[n], cross),
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const argStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.arg }));
  const slotStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.slot }));
  const hidStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.hid,
    transform: [{ translateY: SCENE.value.rise }],
  }));
  const dashStyle = useAnimatedStyle(() => ({ opacity: 1 - SCENE.value.sol }));
  const solidStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.sol }));
  // Faint while it is only implied, full ink once it has been said out loud.
  // 0.62 IS THE FLOOR, NOT 0.45. Ink on paper is 16.6:1 at full strength and
  // 2.6:1 composited at 0.45 — a smear in the shape of a word, which is exactly
  // what D35 forbids: a caption is legible or absent, never dim. The state this
  // fade was carrying is already carried by the FRAME, which is dashed while the
  // premise is unsaid and solid once it is hauled up, so the word only has to be
  // lighter than solid rather than unreadable. 0.62 composites to 4.5:1.
  const hidTextStyle = useAnimatedStyle(() => ({ opacity: 0.62 + 0.38 * SCENE.value.sol }));
  const pickStyle = useAnimatedStyle(() => ({
    opacity: pickOn ? (pickFade ? ease01(bt.value / 0.6) : 1) : 0,
  }));

  return (
    <Animated.View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      {/* ── the line between what was said and what was not ──────────────────── */}
      <View style={styles.saidRule} pointerEvents="none" />
      <View style={styles.tagSaid} pointerEvents="none">
        <Text style={styles.tagText}>SAID</Text>
      </View>
      <View style={styles.tagUnsaid} pointerEvents="none">
        <Text style={styles.tagText}>UNSAID</Text>
      </View>

      {/* the two sentences that were actually spoken */}
      <Animated.View style={[styles.card, styles.cardA, argStyle]} pointerEvents="none">
        <Text style={styles.cardText}>{SAID_A[argN]}</Text>
      </Animated.View>
      <Animated.View style={[styles.card, styles.cardB, argStyle]} pointerEvents="none">
        <Text style={styles.cardText}>{SAID_B[argN]}</Text>
      </Animated.View>

      {/* the empty socket, waiting above the line for a premise nobody supplied */}
      <Animated.View style={[styles.socket, slotStyle]} pointerEvents="none">
        <Text style={styles.socketMark}>?</Text>
      </Animated.View>

      {/* the premise nobody said: dashed under the line, solid once it is hauled up */}
      <Animated.View style={[styles.hidCard, hidStyle]} pointerEvents="none">
        <Animated.View style={[styles.frame, styles.frameDash, dashStyle]} />
        <Animated.View style={[styles.frame, styles.frameSolid, solidStyle]} />
        <Animated.View style={hidTextStyle}>
          <Text style={styles.hidText}>{'ALL RICH PEOPLE\nARE HAPPY'}</Text>
        </Animated.View>
      </Animated.View>

      {/* ── Q2: which unsaid premise is this argument standing on? ───────────── */}
      {pickOn &&
        CANDIDATES.map((c, k) => {
          const chosen = picked === c.id;
          return (
            <Animated.View
              key={c.id}
              style={[styles.pickSlot, { top: PICK_T + k * PICK_GAP }, pickStyle]}
            >
              <Target id={c.id} correct={c.correct} picked={picked} onPick={onPick}
              hitSlop={{ top: PICK_SLOP, bottom: PICK_SLOP, left: PICK_SLOP, right: PICK_SLOP }} disabled={answered}>
                <View
                  style={[
                    styles.pickInner,
                    answered && c.correct && styles.pickRight,
                    answered && chosen && !c.correct && styles.pickWrong,
                  ]}
                >
                  <Text style={[styles.pickText, answered && c.correct && styles.pickTextOn]}>
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
  ground: { position: 'absolute', left: 14, right: 14, top: GROUND, height: 1.5, backgroundColor: RULE },
  // THE FLOOR THE GROUND LINE SITS ON. A rule on its own leaves the
  // figure and everything it is looking at standing on bare page;
  // political7 and political8 both stand their subject on a filled mass.
  floor: { position: 'absolute', left: 0, right: 0, top: GROUND, bottom: 0, backgroundColor: RULE },

  // The one line the whole lesson is about, so it is the heaviest stroke on stage.
  saidRule: { position: 'absolute', left: 14, right: 10, top: LINE_Y, height: 2, backgroundColor: INK },
  tagSaid: { position: 'absolute', left: 18, top: LINE_Y - 14 },
  tagUnsaid: { position: 'absolute', left: 18, top: LINE_Y + 5 },
  tagText: {
    fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 1.6, lineHeight: 11,
    color: SOFT, includeFontPadding: false,
  },

  card: {
    position: 'absolute', left: CARD_L, width: CARD_W, height: SAID_H,
    borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: STONE,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6,
  },
  cardA: { top: SAID_A_T },
  cardB: { top: SAID_B_T },
  cardText: {
    fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 0.4, color: INK,
    includeFontPadding: false,
  },

  // A socket, not a card: the faintest line on stage, so it reads as a hole in the
  // argument rather than as one more thing somebody said.
  socket: {
    position: 'absolute', left: CARD_L, top: SLOT_T, width: CARD_W, height: SLOT_H,
    borderWidth: 1.5, borderColor: RULE, borderStyle: 'dashed', borderRadius: 0,
    alignItems: 'center', justifyContent: 'center',
  },
  socketMark: {
    fontFamily: 'PlayfairDisplay_700Bold', fontSize: 17, color: SOFT, includeFontPadding: false,
  },

  // TONE, NOT WHITE. This scene drew every prop as an outline on paper — two
  // values and no depth, which is the flat case `check:shade` exists to find.
  // The structural mass takes STONE, a secondary surface takes RULE, and what
  // carries the message stays PAPER, so the picture has things at different
  // values rather than everything a shade darker. See cinematicKit's ramp.
  hidCard: {
    position: 'absolute', left: CARD_L, top: HID_T, width: CARD_W, height: SLOT_H,
    backgroundColor: STONE, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6,
  },
  frame: { position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 },
  frameDash: { borderWidth: 1.5, borderColor: SOFT, borderStyle: 'dashed', borderRadius: 0, backgroundColor: STONE },
  frameSolid: { borderWidth: 2, borderColor: INK, borderRadius: 4 },
  hidText: {
    fontFamily: 'Inter_700Bold', fontSize: 11, lineHeight: 14, letterSpacing: 0.4,
    color: INK, textAlign: 'center', includeFontPadding: false,
  },

  pickSlot: { position: 'absolute', left: CARD_L, width: CARD_W },
  pickInner: {
    height: PICK_H, borderWidth: 2, borderColor: SOFT, borderStyle: 'dashed', borderRadius: 0,
    backgroundColor: STONE, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6,
  },
  pickRight: { backgroundColor: INK, borderColor: INK, borderStyle: 'solid' },
  pickWrong: { borderColor: RULE },
  pickText: {
    fontFamily: 'Inter_700Bold', fontSize: 10.5, lineHeight: 13, letterSpacing: 0.3,
    color: INK, textAlign: 'center', includeFontPadding: false,
  },
  pickTextOn: { color: PAPER },
});

// Art runs from the top card (198) to the ground line (500), and the figure's crown
// at 397 sits well inside that. Nothing is drawn above or below, so the crop is 320
// units — a 2.02× fit against the 2.31× a scene gets for free at 280 or less, which
// the answer stack under the line pays for honestly (H59).
export function Logic10Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Logic10Scene} band={[192, 512]} camera={CAM} />;
}
