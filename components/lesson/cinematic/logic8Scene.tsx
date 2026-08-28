import {
  View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import {
  WALK, dirsFrom, ease01, lerp, moveTr, pose, travelStance, type Bundle, } from './rig';
// The whole movement library, not just rig's 49 emotes. Codes under 100 ARE
// rig's and mean exactly what they always did; 100+ reach moves.ts (emoteAny).
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './logic8Script';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, STONE, SOFT, RULE, PAPER, useHeld, carryFrom, keepHeld, facing, useCarry, carry,
} from './cinematicKit';
import { followMoves, kindOf, seedOf } from './camera';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';

// A street at night: a soaked patch of pavement stage LEFT, a garden with a
// sprinkler stage RIGHT, behind a kerb. The figure double-takes, walks back to the
// puddle, then walks up the road and finds the thing that has been wetting it.
//
// ── WHERE THE FIGURE WALKS, AND WHERE THE PROPS LIVE ────────────────────────────
// The figure only ever stands at x = 152, 230 or 248, so its body + arms occupy
// x ∈ [104, 296] and y ∈ [361, 500]. Nothing readable is allowed in that box:
//
//   · wet patch + its label   x  20 … 96    (left of the walk band — the figure
//                                            stops at its edge and points at it)
//   · kerb / lawn / hedge /   x 300 … 396   (right of the walk band — the figure
//     sprinkler + its label                  stops 4 units short of the kerb)
//   · rule card               y  32 … 110   (above the head)
//   · tempting-move card      y 120 … 184   (above the head)
//   · Q1 answer cards         y 190 … 338   (above the head)
//   · moon + stars            y  38 … 130   (above the head)
//   · spray dashes            arc from the nozzle (326, 396) up and left; by the
//                             time a droplet crosses x = 300 it is at y ≈ 330 and
//                             it never falls below y = 336, so it always clears
//                             the figure's crown at y = 361.
//
// The spray and the Q1 cards are never on screen together (Q1 is answered BEFORE
// the sprinkler is noticed), and even so the cards stop at x = 222 while the
// droplets stop at x = 230.

const FIG_NEAR = 152;               // at the kerb beside the wet patch
const FIG_FAR = 248;                // up the road, at the garden

// ── the wet patch ─────────────────────────────────────────────────────────────
const PUD_L = 20;
const PUD_W = 76;
const PUD_T = 486;

// ── the garden, all of it right of the walk band ──────────────────────────────
const GDN_L = 300;
const GDN_W = 96;
const LAWN_T = 470;

// ── the spray arc, x(u) = X0 − DX·u, y(u) = Y0 − A·u + B·u² ───────────────────
const SPRAY_X0 = 326;
const SPRAY_Y0 = 396;
const SPRAY_DX = 96;
const SPRAY_A = 310;
const SPRAY_B = 250;
const DASHES = [0, 1, 2, 3, 4, 5, 6, 7];

// ── the answer cards (Q1), in a band above the figure ─────────────────────────
const CARD_L = 26;
const CARD_W = 196;
// SIZED FOR A FINGER, not for the paper it sits on.
//
// These were 40 tall on a 46 pitch. This lesson's band is 493 units of a 560-unit
// design space, so it renders height-constrained at fit ≈ 0.60 on a 360dp phone —
// which turned 40 units into a 24dp card with 3.6dp between it and the next one.
// Android asks 48dp of any touch target and a fingertip covers about 45dp, so a
// tap aimed at one card physically overlapped its neighbours: it either missed or
// scored the wrong answer, both of which were reported.
//
// The pitch is the number that matters — enlarging a card without moving its
// neighbours away does nothing for mis-taps. The cards run from 206 down to 394,
// stopping at the figure's crown (GROUND 500 − 103), which is all the room this
// composition has. 56 on a 66 pitch = 34dp cards on a 40dp pitch.
const CARD_H = 56;
const CARD_T = 206;
const CARD_GAP = 66;
// Half the 10-unit gap, so every pixel between two cards belongs to one of them
// and NEITHER can steal from the other. Slop bigger than half the gap would make
// the targets overlap, and the topmost would win — which is the mis-registration
// this is here to remove, not to introduce.
const CARD_SLOP = (CARD_GAP - CARD_H) / 2;

// [252, 130] moved to [246, 96]: the tempting-move card now reaches x = 272, and
// that star sat inside it. The card has no fill, so it showed through as a speck
// in the middle of the sentence.
const STARS: number[][] = [[236, 44], [286, 96], [382, 116], [246, 96], [306, 38]];

const TRAPS = ['', 'WET STREETS → SO IT RAINED', 'NO RAIN → SO NO WET STREETS'];

const CARDS = [
  { id: 'rained', label: 'IT DEFINITELY RAINED', correct: false },
  { id: 'something', label: 'SOMETHING MADE IT WET', correct: true },
  { id: 'norain', label: 'IT DID NOT RAIN', correct: false },
];

const P = BEATS.map((b) => b.p ?? 0);
const X = BEATS.map((b) => b.x ?? FIG_NEAR);
// The camera, from the staging: it follows the figure this track describes,
// pulls back to scale 1 on every graded beat so a tap lands where it is aimed,
// and leans in on the quote. See followMoves in ./camera.ts.
const CAM = followMoves(X, BEATS.map(kindOf), seedOf('logic8'));
const DIR = dirsFrom(X, 1);
const WETV = BEATS.map((b) => b.wet ?? 0);
const RULEV = BEATS.map((b) => b.rule ?? 0);
const SPRV = BEATS.map((b) => b.spr ?? 0);

// R7b — the stage follows the control on its own graded beat, and only there.
// Derived from the beat rather than declared as a channel so it cannot fall out
// of step with the control it is about.
const REACT = BEATS.map((b) => (b.interact?.drag ? 1 : 0));

export default function Logic8Scene({ clock, bt, bi, i, picked, onPick, dragPos }: SceneApi) {
  const reacting = REACT[i] === 1;
  const heldS = useHeld();
  const cv = useCarry(4);
  const cur = BEATS[i];
  const prev = i > 0 ? BEATS[i - 1] : undefined;

  // A prop only fades in on the beat that CHANGES it; otherwise it stays solid, so
  // the street doesn't re-animate every time the reader taps forward.
  const wetFade = (cur.wet ?? 0) !== (prev?.wet ?? 0);
  const ruleFade = (cur.rule ?? 0) !== (prev?.rule ?? 0);
  const trapFade = (cur.trap ?? 0) !== (prev?.trap ?? 0);
  const crossFade = (cur.cross ?? 0) !== (prev?.cross ?? 0);
  const trapOn = (cur.trap ?? 0) > 0;
  const crossOn = (cur.cross ?? 0) > 0;

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
    return {
      fig: pose(s, carry(cv, 0, n, X[p], X[n], tr), GROUND, K_FIG, facing(DIR[p], DIR[n], bt.value), 1),
      // R7b — the knob wets the pavement. The rail runs from they must be dry to they
      // must be wet and the patch on the street follows it exactly, so the reader can
      // put the street in either state and see that the rule permits both.
      wet: carry(cv, 1, n, WETV[p], reacting ? dragPos.value : WETV[n], tr, wetFade ? grow : 1),
      rule: carry(cv, 2, n, RULEV[p], RULEV[n], tr, ruleFade ? grow : 1),
      spr: carry(cv, 3, n, SPRV[p], SPRV[n], tr),
      trap: trapOn ? (trapFade ? grow : 1) : 0,
      cross: crossOn ? (crossFade ? grow : 1) : 0,
      t,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const wetStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.wet }));
  const ruleStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.rule }));
  const trapStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.trap,
    transform: [{ translateX: (1 - SCENE.value.trap) * -10 }],
  }));
  // The garden is drawn from beat one, but ghosted — it was always there, the
  // walker just wasn't looking. Noticing it is the only thing that "reveals" it.
  const gardenStyle = useAnimatedStyle(() => ({ opacity: 0.24 + 0.76 * SCENE.value.spr }));
  // THE LABEL RIDES THE DRIVER, NOT THE DIMMED LAYER.
  //
  // Ghosting the art at 0.24 is the point. Ghosting the WORD is not: ink at 0.24
  // over paper reaches the eye at 1.3:1, which is a grey smear the shape of a
  // word — and a smear that will not resolve however hard you look is what the
  // reader has been calling a blank box. §19 already says this about a locked
  // rank pin: "the same thing, dimmer" is indistinguishable from a rendering
  // fault.
  //
  // So the caption is either legible or absent, and `spr` gives that for free:
  // it is 0 exactly when the layer is at its dim floor and 1 when the layer is
  // full, so the label is gone while the garden is a hint and arrives with it.
  // The unreadable band is crossed only while the fade is moving, which is what
  // a fade is. It also stops the answer being named before the question (group O).
  const gardenLabelStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.spr }));
  // The NO stamp lands: overshoot in scale, settle onto the card.
  const stampStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.cross,
    transform: [{ scale: 1 + (1 - SCENE.value.cross) * 0.4 }, { rotate: '-12deg' }],
  }));

  const answered = picked !== null;
  const showPick = (cur.pick ?? 0) > 0 && !!cur.interact;

  return (
    <Animated.View style={styles.scene}>
      <View style={styles.ground} pointerEvents="none" />

      {/* ── night sky: a crescent moon (a PAPER disc bites the outline) + stars ── */}
      <View style={styles.moon} pointerEvents="none" />
      <View style={styles.moonBite} pointerEvents="none" />
      {STARS.map((s, k) => (
        <View key={k} style={[styles.star, { left: s[0], top: s[1] }]} pointerEvents="none" />
      ))}

      {/* ── the soaked patch of pavement, stage left of the walk band ─────────── */}
      <Animated.View style={[styles.layer, wetStyle]} pointerEvents="none">
        <View style={styles.puddle} />
        <View style={styles.shineA} />
        <View style={styles.shineB} />
        <View style={styles.dropletA} />
        <View style={styles.dropletB} />
        <Text style={styles.puddleLabel}>WET PATCH</Text>
      </Animated.View>

      {/* ── next door's garden, right of the walk band ────────────────────────── */}
      <Animated.View style={[styles.layer, gardenStyle]} pointerEvents="none">
        <View style={styles.hedge} />
        <View style={[styles.leaf, { left: 312, top: 424 }]} />
        <View style={[styles.leaf, { left: 336, top: 434 }]} />
        <View style={[styles.leaf, { left: 360, top: 424 }]} />
        <View style={styles.kerb} />
        <View style={styles.lawn} />
        {[304, 317, 330, 343, 356, 369, 382].map((g) => (
          <View key={g} style={[styles.grass, { left: g }]} />
        ))}
        <View style={styles.stake} />
        <View style={styles.collar} />
        <View style={styles.head} />
        <View style={styles.nozzle} />
      </Animated.View>

      {/* ── the spray: droplets riding the arc, fading as they disperse ───────── */}
      {DASHES.map((k) => <Dash key={k} S={SCENE} k={k} />)}

      {/* THE LABEL PAINTS LAST, over the spray rather than under it. The arc
          launches from the nozzle at (326, 396) going up and left, so near the
          nozzle a droplet sits at y 370 — straight through SPRINKLER, which
          spans 368…379. The header reasoned about the arc clearing the FIGURE's
          crown and not about its own caption. Nothing moves: the word is the
          message and the message goes on top. */}
      <Animated.View style={[styles.layer, gardenLabelStyle]} pointerEvents="none">
        <Text style={styles.gardenLabel}>SPRINKLER</Text>
      </Animated.View>

      {/* ── the rule, pinned above the street ─────────────────────────────────── */}
      <Animated.View style={[styles.ruleBox, ruleStyle]} pointerEvents="none">
        <Text style={styles.cardLabel}>THE RULE</Text>
        <Text style={styles.ruleLine}>IF it rains</Text>
        <Text style={styles.ruleArrow}>↓</Text>
        <Text style={styles.ruleLine}>THEN streets wet</Text>
      </Animated.View>

      {/* ── the move that feels airtight, and the stamp that lands on it ──────── */}
      {trapOn ? (
        <Animated.View style={[styles.trapBox, trapStyle]} pointerEvents="none">
          <Text style={styles.cardLabel}>THE TEMPTING MOVE</Text>
          <Text style={styles.trapText}>{TRAPS[cur.trap ?? 0]}</Text>
        </Animated.View>
      ) : null}
      {crossOn ? (
        <Animated.View style={[styles.stamp, stampStyle]} pointerEvents="none">
          <View style={styles.stampRing} />
          <View style={styles.stampSlash} />
        </Animated.View>
      ) : null}

      {/* ── Q1: tap what the wet street actually proves ───────────────────────── */}
      {showPick ? (
        <View style={styles.pickLabelWrap} pointerEvents="none">
          <Text style={styles.pickLabel}>WHAT THE WET STREET PROVES · TAP ONE</Text>
        </View>
      ) : null}
      {showPick &&
        CARDS.map((c, k) => {
          const chosen = picked === c.id;
          return (
            <Target id={c.id} correct={c.correct} picked={picked} onPick={onPick}
              key={c.id} style={[styles.pickCard, { top: CARD_T + k * CARD_GAP }]} hitSlop={{ top: CARD_SLOP, bottom: CARD_SLOP, left: CARD_SLOP, right: CARD_SLOP }} disabled={answered}>
              <View
                style={[
                  styles.pickInner,
                  answered && c.correct && styles.pickRight,
                  answered && chosen && !c.correct && styles.pickWrong,
                ]}
              >
                <Text style={[styles.pickText, answered && c.correct && styles.pickTextOn]}>{c.label}</Text>
              </View>
            </Target>
          );
        })}

      <Stickman D={DF} k={K_FIG} />
    </Animated.View>
  );
}

// One droplet on the sprinkler arc. `u` is its progress along the parabola; the
// rotation is the arc's own tangent, so each dash lies along its flight path.
function Dash({ S, k }: { S: SharedValue<any>; k: number }) {
  const st = useAnimatedStyle(() => {
    const u = ((S.value.t * 0.6 + k * 0.125) % 1 + 1) % 1;
    const x = SPRAY_X0 - SPRAY_DX * u;
    const y = SPRAY_Y0 - SPRAY_A * u + SPRAY_B * u * u;
    const ang = Math.atan2(-SPRAY_A + 2 * SPRAY_B * u, -SPRAY_DX) * 57.29577951308232;
    return {
      opacity: S.value.spr * (1 - u * u * 0.85),
      transform: [
        { translateX: x - SPRAY_X0 },
        { translateY: y - SPRAY_Y0 },
        { rotate: `${ang}deg` },
      ],
    };
  });
  return <Animated.View style={[styles.dash, st]} pointerEvents="none" />;
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 18, top: GROUND, width: 282, height: 1.5, backgroundColor: RULE },
  // Full-bleed grouping layers, so one opacity drives a whole prop. Decorative
  // only — pointerEvents none, or they would swallow the tap-to-advance.
  layer: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H },

  // ── sky ──────────────────────────────────────────────────────────────────────
  moon: {
    position: 'absolute', left: 322, top: 40, width: 46, height: 46, borderRadius: 23,
    borderWidth: 2.5, borderColor: INK, backgroundColor: PAPER,
  },
  moonBite: {
    position: 'absolute', left: 336, top: 33, width: 46, height: 46, borderRadius: 23,
    backgroundColor: PAPER,
  },
  star: { position: 'absolute', width: 4, height: 4, backgroundColor: SOFT, transform: [{ rotate: '45deg' }] },

  // ── the wet patch ────────────────────────────────────────────────────────────
  puddle: {
    position: 'absolute', left: PUD_L, top: PUD_T, width: PUD_W, height: 22,
    borderRadius: 12, borderWidth: 2, borderColor: INK, backgroundColor: RULE,
  },
  shineA: { position: 'absolute', left: PUD_L + 10, top: PUD_T + 6, width: 22, height: 2, borderRadius: 1, backgroundColor: PAPER },
  shineB: { position: 'absolute', left: PUD_L + 40, top: PUD_T + 13, width: 15, height: 2, borderRadius: 1, backgroundColor: PAPER },
  dropletA: { position: 'absolute', left: PUD_L + 4, top: PUD_T - 10, width: 15, height: 6, borderRadius: 3, borderWidth: 1.5, borderColor: SOFT },
  dropletB: { position: 'absolute', left: PUD_L + 56, top: PUD_T + 26, width: 12, height: 5, borderRadius: 3, borderWidth: 1.5, borderColor: SOFT },
  puddleLabel: {
    // 104 WIDE, NOT 76. WET PATCH is 92.2dp of lettering at 13.5 with 1.4 of
    // tracking, so in the puddle's own 76 it wrapped to two lines and the second
    // one landed ON the puddle at y 486 — the reader's "words get covered by other
    // things", printed by the label over the thing it was naming. It runs
    // 6 … 110 now, still centred on the puddle at 58 and still clear of the
    // figure, who never stands left of x = 104.
    position: 'absolute', left: PUD_L - 14, top: 464, width: PUD_W + 28, textAlign: 'center',
    // INK, not SOFT: a control drives this layer, so it rests at values SOFT does
    // not survive — 5.3:1 on paper is 2.3:1 at 0.57 (D35, R7c).
    fontFamily: 'Inter_700Bold', fontSize: 13.5, letterSpacing: 1.4, color: INK,
    includeFontPadding: false,
  },

  // ── next door's garden ───────────────────────────────────────────────────────
  hedge: {
    position: 'absolute', left: GDN_L + 2, top: 412, width: GDN_W - 4, height: 48,
    borderRadius: 16, borderWidth: 2, borderColor: SOFT, backgroundColor: PAPER,
  },
  leaf: { position: 'absolute', width: 12, height: 2, borderRadius: 1, backgroundColor: SOFT, transform: [{ rotate: '-24deg' }] },
  kerb: { position: 'absolute', left: GDN_L, top: LAWN_T, width: 2.5, height: GROUND - LAWN_T, backgroundColor: INK },
  lawn: { position: 'absolute', left: GDN_L, top: LAWN_T, width: GDN_W, height: 2, backgroundColor: INK },
  grass: { position: 'absolute', top: LAWN_T - 9, width: 2, height: 9, backgroundColor: SOFT },
  stake: { position: 'absolute', left: 344, top: 402, width: 5, height: 68, backgroundColor: INK, borderRadius: 2 },
  collar: {
    position: 'absolute', left: 338, top: 460, width: 17, height: 8,
    borderWidth: 2, borderColor: INK, borderRadius: 3, backgroundColor: PAPER,
  },
  head: {
    position: 'absolute', left: 332, top: 386, width: 28, height: 18,
    borderWidth: 2.5, borderColor: INK, borderRadius: 4, backgroundColor: PAPER,
  },
  nozzle: { position: 'absolute', left: 324, top: 392, width: 10, height: 6, borderRadius: 2, backgroundColor: INK },
  gardenLabel: {
    position: 'absolute', left: GDN_L, top: 366, width: GDN_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 13.5, letterSpacing: 1.4, color: SOFT,
    includeFontPadding: false,
  },
  dash: {
    position: 'absolute', left: SPRAY_X0, top: SPRAY_Y0 - 1.4,
    width: 11, height: 2.8, borderRadius: 1.4, backgroundColor: INK,
  },

  // ── the two pinned cards ─────────────────────────────────────────────────────
  cardLabel: { fontFamily: 'Inter_700Bold', fontSize: 13.5, letterSpacing: 1.6, color: SOFT, marginBottom: 5,
    includeFontPadding: false,
  },
  ruleBox: {
    position: 'absolute', left: 22, top: 32, width: 176, height: 78,
    borderWidth: 2, borderColor: INK, borderRadius: 5, paddingTop: 8, alignItems: 'center',
  },
  ruleLine: { fontFamily: 'Inter_700Bold', fontSize: 13.5, lineHeight: 16, color: INK,
    includeFontPadding: false,
  },
  ruleArrow: { fontFamily: 'Inter_700Bold', fontSize: 13.5, lineHeight: 16.9, color: INK,
    includeFontPadding: false,
  },
  // 250 WIDE, NOT 176 — AND IT COULD NOT GET TALLER.
  //
  // The text column was 120 units (176 less 10 of padding and 46 held back for the
  // stamp), and nothing in this card fitted it: THE TEMPTING MOVE is 173dp and took
  // THREE lines, NO RAIN -> SO NO WET STREETS is 223dp and took three more. A 64-tall
  // box was being asked to hold 101 units of lettering, so most of the second trap
  // was simply cut off — this lesson is called Two Tempting Traps and the reader
  // could not read the second one.
  //
  // Growing it DOWNWARD was not available: beat 4 draws this card and the Q1
  // answer cards at the same time, and their kicker starts at y 188, four units
  // below this box's foot. So it grows sideways, into the empty right half of the
  // sky, and the stamp moves to the far end with it. At 184 of column the label is
  // one line and each trap is two, which is exactly the 17 + 5 + 34 the box holds.
  trapBox: {
    position: 'absolute', left: 22, top: 120, width: 250, height: 64,
    borderWidth: 2, borderColor: SOFT, borderRadius: 5,
    paddingTop: 8, paddingLeft: 10, paddingRight: 56,
  },
  trapText: { fontFamily: 'Inter_700Bold', fontSize: 13.5, lineHeight: 16.9, letterSpacing: 0.2, color: INK,
    includeFontPadding: false,
  },
  // Follows the card's right edge (22 + 250 − 56 + 12), so it still lands ON the
  // move it is cancelling rather than beside it.
  stamp: { position: 'absolute', left: 228, top: 135, width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
  stampRing: { position: 'absolute', width: 34, height: 34, borderRadius: 17, borderWidth: 3, borderColor: INK },
  stampSlash: { position: 'absolute', width: 34, height: 3.4, borderRadius: 2, backgroundColor: INK, transform: [{ rotate: '-45deg' }] },

  // ── Q1 answer cards ──────────────────────────────────────────────────────────
  // 354 WIDE, NOT 256. WHAT THE WET STREET PROVES · TAP ONE is 343.5dp and wrapped
  // to two lines in 256 — and there are only 18 units between this kicker and the
  // first answer card, so the second line was printed straight across the card the
  // reader was being asked to tap. Nothing painted over a word is acceptable (D31),
  // and a word painted over a BUTTON is worse: it is the instruction obscuring the
  // thing it is instructing you to press.
  pickLabelWrap: { position: 'absolute', left: CARD_L, top: 188, width: 354 },
  pickLabel: { fontFamily: 'Inter_700Bold', fontSize: 13.5, letterSpacing: 1.5, color: SOFT,
    includeFontPadding: false,
  },
  pickCard: { position: 'absolute', left: CARD_L, width: CARD_W },
  pickInner: {
    height: CARD_H, borderWidth: 2.5, borderColor: INK, borderRadius: 6, backgroundColor: STONE,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8,
  },
  pickRight: { backgroundColor: INK, borderColor: INK },
  pickWrong: { borderColor: SOFT, opacity: 0.45 },
  pickText: { fontFamily: 'Inter_700Bold', fontSize: 13.5, letterSpacing: 0.3, color: INK,
    includeFontPadding: false,
  },
  pickTextOn: { color: PAPER },
});

// Measured, not guessed: the highest ink is the rule card's border at y = 32 (its
// "THE RULE" label sits at 42) and the lowest is the puddle's stray droplet at 517.
// The old [96, 516] started BELOW the rule card, so the whole IF/THEN card — the
// thing the lesson is about — was sliced off at the top and only "THEN streets wet"
// showed, half cut. The scene really is this tall: the card column runs 32 → 338 and
// the figure occupies 361 → 500, so there is no slack to shift art into.
export function Logic8Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Logic8Scene} band={[28, 521]} camera={CAM} />;
}
