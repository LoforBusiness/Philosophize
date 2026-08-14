import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { clamp01, ease01, lerp, mixStance, pose, type Bundle } from './rig';
// The whole movement library, not just rig's 49 emotes. Codes under 100 ARE
// rig's and mean exactly what they always did; 100+ reach moves.ts (emoteAny).
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './metaphysics4Script';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER, useHeld, carryFrom, keepHeld,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import { followMoves, kindOf, seedOf } from './camera';

// A LEDGER of failed attempts to name nothing, and the void that keeps refuting
// them. Parmenides' trap drawn as information rather than mood.
//
// COMPOSITION / OCCLUSION CONTRACT
//   · The figure stands at x = 344 on GROUND = 500, so it spans about x 296–392
//     and y 353–500 (crown ≈ 361, a little higher on a bobbing gesture).
//   · The VOID hangs directly ABOVE that figure — centre (338, 288), rim ø106 —
//     so the reaching gestures (24, 35) read as grabbing INTO it, and it never
//     covers the body (its rim bottoms out at y 343 on its breath, the crown sits
//     at 361+). At 106 units across it is the one object that must read instantly,
//     so it is drawn well past the ~90-unit "reads at a glance" floor.
//   · The LEDGER owns x 14–238, well left of the figure. Its rows are the whole
//     lesson: what you SAID, and the something it BECAME — closed off by a TALLY
//     that keeps the score of the trap: every grab counted, no escapes. Three
//     EMPTY row frames are ruled in from the first beat, so the table reads as a
//     ledger before anything is written in it and each grab lands in a waiting
//     slot rather than materialising out of blank paper.
//   · Nothing is drawn above y = 224 or below the ankle joints at y ≈ 507, which
//     is what lets the player crop to band [216, 512] and render ~2.19× instead
//     of the letterboxed 1.15×.

const FIG_X = 344;
const VOID = { x: 338, y: 288 };
const VOID_CORE = 84;
const VOID_RIM = 106;

const LED_L = 14;
const LED_W = 224;
const CELL_A_W = 98;
const ARROW_L = LED_L + CELL_A_W + 4;      // 116
const ARROW_W = 20;
const CELL_B_L = ARROW_L + ARROW_W + 4;    // 140
const CELL_B_W = LED_L + LED_W - CELL_B_L; // 98

const ROW_H = 36;
const ROW_T = [264, 304, 344];

// Each row is one grab at nothing: the words you reached with, and the something
// they turned into the instant you used them.
const ROWS = [
  { say: '"nothing"', became: 'a thought' },
  { say: '"the void"', became: 'an object' },
  { say: '"not-being"', became: 'a topic' },
];

// The somethings that drop out of the void on their way into the ledger.
const TOKENS = [{ x: 258, y: 306 }, { x: 266, y: 350 }, { x: 254, y: 392 }];

const P_CODE = BEATS.map((b) => b.p ?? 0);
const TOK = BEATS.map((b) => b.tokens ?? 0);
const BAR = BEATS.map((b) => b.barred ?? 0);
const FRZ = BEATS.map((b) => b.frozen ?? 0);

// THE CAMERA (H60b). `followMoves` reads the x track and gives each beat its own
// shot: it FOLLOWS him when a beat moves him far enough to be worth following,
// pushes close on a quote, and PULLS BACK to the whole band on a question or a
// summary — the beats the reader has to read and act on. Beats that do not set
// `x` stand at FIG_X, so a still lesson gets the one-in-three push rather than a
// camera that never rests.
const X = BEATS.map((b) => b.x ?? FIG_X);
const CAM = followMoves(X, BEATS.map(kindOf), seedOf('metaphysics4'));

export default function Metaphysics4Scene({ clock, bt, bi, i }: SceneApi) {
  const heldS = useHeld();
  const cur = BEATS[i];

  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / 0.85);
    const t = clock.value;

    const s = keepHeld(heldS, mixStance(carryFrom(heldS, n, emoteHold(P_CODE[p], t)), emoteLive(P_CODE[n], t, bt.value), tr));
    return {
      fig: pose(s, FIG_X, GROUND, K_FIG, -1, 1),
      rows: lerp(TOK[p], TOK[n], tr),
      barred: lerp(BAR[p], BAR[n], tr),
      frozen: lerp(FRZ[p], FRZ[n], tr),
      t,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);

  // The void breathes so the absence never sits still — a slow, shallow pulse.
  const coreStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + 0.05 * Math.sin(SCENE.value.t * 1.8) }],
  }));
  const rimStyle = useAnimatedStyle(() => ({
    opacity: 0.45 + 0.3 * Math.sin(SCENE.value.t * 1.8),
    transform: [{ scale: 1 + 0.05 * Math.sin(SCENE.value.t * 1.8 + 0.6) }],
  }));
  // The second way, struck through: the slash draws itself from its left end.
  const slashStyle = useAnimatedStyle(() => ({
    opacity: clamp01(SCENE.value.barred * 2),
    transform: [{ rotate: '-24deg' }, { scaleX: ease01(SCENE.value.barred) }],
  }));

  // "CHANGE IS REAL" arrives, then gets crossed out — the claim Parmenides' logic
  // cannot let stand.
  const frozenStyle = useAnimatedStyle(() => ({
    opacity: clamp01(SCENE.value.frozen * 2.5),
    transform: [{ translateY: (1 - clamp01(SCENE.value.frozen * 2.5)) * 8 }],
  }));
  const strikeStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: ease01(clamp01((SCENE.value.frozen - 0.45) / 0.55)) }],
  }));

  return (
    <Animated.View style={styles.scene}>
      {/* ── the ledger: every grab at nothing, and what it produced ──────────── */}
      <Text style={styles.ledTitle}>EVERY GRAB AT NOTHING</Text>
      <Text style={[styles.colHead, { left: LED_L, width: CELL_A_W }]}>YOU SAY</Text>
      <Text style={[styles.colHead, { left: CELL_B_L, width: CELL_B_W }]}>IT BECOMES</Text>
      <View style={styles.ledRule} pointerEvents="none" />

      {/* the empty frames first, so a written row always lands INTO a ruled slot */}
      {ROWS.map((r, k) => <GhostRow key={`g-${r.say}`} S={SCENE} k={k} />)}
      {ROWS.map((r, k) => <Row key={r.say} S={SCENE} k={k} say={r.say} became={r.became} />)}

      {/* the running score: the trap has never once been beaten */}
      <Text style={styles.ledFoot}>{`${cur.tokens ?? 0} GRABS  ·  0 ESCAPES`}</Text>

      {/* the tokens the void keeps handing over */}
      {TOKENS.map((tk, k) => <Token key={k} S={SCENE} tk={tk} k={k} />)}

      {/* ── the claim that cannot survive the trap ───────────────────────────── */}
      <Animated.View style={[styles.frozenBox, frozenStyle]} pointerEvents="none">
        <Text style={styles.frozenText}>CHANGE IS REAL</Text>
        <Animated.View style={[styles.strike, strikeStyle]} />
      </Animated.View>

      {/* ── the void: what-is-not, hanging over the figure's head ────────────── */}
      <Text style={styles.voidLabel}>WHAT-IS-NOT</Text>
      <Animated.View
        style={[styles.voidRim, { left: VOID.x - VOID_RIM / 2, top: VOID.y - VOID_RIM / 2 }, rimStyle]}
        pointerEvents="none"
      />
      <Animated.View
        style={[styles.voidCore, { left: VOID.x - VOID_CORE / 2, top: VOID.y - VOID_CORE / 2 }, coreStyle]}
        pointerEvents="none"
      />
      <Animated.View style={[styles.slash, slashStyle]} pointerEvents="none" />

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DF} k={K_FIG} />
    </Animated.View>
  );
}

/**
 * The empty slot a row will be written into. Ruled in from the first beat so the
 * ledger reads as a real table on the hook, then fades as its row lands in it.
 */
function GhostRow({ S, k }: { S: SharedValue<any>; k: number }) {
  const st = useAnimatedStyle(() => ({ opacity: 1 - ease01(clamp01(S.value.rows - k)) }));
  return (
    <Animated.View style={[styles.row, { top: ROW_T[k] }, st]} pointerEvents="none">
      <View style={styles.ghostA} />
      <View style={styles.ghostDots} />
      <View style={styles.ghostB} />
    </Animated.View>
  );
}

/** One ledger row — it slides in from the left as its token drops out of the void. */
function Row({
  S, k, say, became,
}: { S: SharedValue<any>; k: number; say: string; became: string }) {
  const st = useAnimatedStyle(() => {
    const on = ease01(clamp01(S.value.rows - k));
    return { opacity: on, transform: [{ translateX: (1 - on) * -14 }] };
  });
  return (
    <Animated.View style={[styles.row, { top: ROW_T[k] }, st]} pointerEvents="none">
      <View style={styles.cellA}><Text style={styles.cellAText} numberOfLines={1}>{say}</Text></View>
      <View style={styles.arrowShaft} />
      <View style={styles.arrowHead} />
      <View style={styles.cellB}><Text style={styles.cellBText} numberOfLines={1}>{became}</Text></View>
    </Animated.View>
  );
}

function Token({ S, tk, k }: { S: SharedValue<any>; tk: { x: number; y: number }; k: number }) {
  const st = useAnimatedStyle(() => {
    const on = clamp01(S.value.rows - k);
    const bob = Math.sin(S.value.t * 2.2 + k * 1.7) * 3;
    return { opacity: on, transform: [{ translateY: bob }, { scale: 0.4 + 0.6 * on }] };
  });
  return (
    <Animated.View style={[styles.token, { left: tk.x - 9, top: tk.y - 9 }, st]} pointerEvents="none">
      <View style={styles.tokenDot} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 24, right: 14, top: GROUND, height: 1.5, backgroundColor: RULE },

  ledTitle: {
    position: 'absolute', left: LED_L, top: 224, width: LED_W,
    fontFamily: 'Inter_700Bold', fontSize: 10.5, lineHeight: 13, letterSpacing: 1.4, color: SOFT,
    includeFontPadding: false,
  },
  colHead: {
    position: 'absolute', top: 243, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 10, lineHeight: 12.5, letterSpacing: 1.2, color: SOFT,
    includeFontPadding: false,
  },
  ledRule: { position: 'absolute', left: LED_L, top: 258, width: LED_W, height: 1.5, backgroundColor: RULE },
  // Closes the table off like a real ledger's total line.
  ledFoot: {
    position: 'absolute', left: LED_L, top: 384, width: LED_W,
    fontFamily: 'Inter_700Bold', fontSize: 10, lineHeight: 12.5, letterSpacing: 1.2, color: SOFT,
    includeFontPadding: false,
  },

  row: { position: 'absolute', left: 0, width: STAGE_W, height: ROW_H },
  // The waiting slot: the same geometry as a written row, ruled rather than inked.
  ghostA: {
    position: 'absolute', left: LED_L, top: 0, width: CELL_A_W, height: ROW_H,
    borderWidth: 1.5, borderColor: RULE, borderRadius: 4,
  },
  ghostB: {
    position: 'absolute', left: CELL_B_L, top: 0, width: CELL_B_W, height: ROW_H,
    borderWidth: 1.5, borderColor: RULE, borderRadius: 4,
  },
  ghostDots: {
    position: 'absolute', left: ARROW_L, top: ROW_H / 2 - 1, width: ARROW_W - 2, height: 2,
    backgroundColor: RULE,
  },
  cellA: {
    position: 'absolute', left: LED_L, top: 0, width: CELL_A_W, height: ROW_H,
    borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: INK,
    alignItems: 'center', justifyContent: 'center',
  },
  cellAText: {
    fontFamily: 'Inter_700Bold', fontSize: 12.5, letterSpacing: 0.2, color: PAPER,
    includeFontPadding: false,
  },
  arrowShaft: { position: 'absolute', left: ARROW_L, top: ROW_H / 2 - 1, width: ARROW_W - 7, height: 2, backgroundColor: INK },
  arrowHead: {
    position: 'absolute', left: ARROW_L + ARROW_W - 8, top: ROW_H / 2 - 5, width: 0, height: 0,
    borderTopWidth: 5, borderBottomWidth: 5, borderLeftWidth: 8,
    borderTopColor: 'transparent', borderBottomColor: 'transparent', borderLeftColor: INK,
  },
  cellB: {
    position: 'absolute', left: CELL_B_L, top: 0, width: CELL_B_W, height: ROW_H,
    borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: PAPER,
    alignItems: 'center', justifyContent: 'center',
  },
  cellBText: {
    fontFamily: 'Inter_700Bold', fontSize: 12.5, letterSpacing: 0.2, color: INK,
    includeFontPadding: false,
  },

  token: { position: 'absolute', width: 18, height: 18, alignItems: 'center', justifyContent: 'center' },
  tokenDot: { width: 15, height: 15, borderRadius: 8, borderWidth: 2, borderColor: INK, backgroundColor: PAPER },

  frozenBox: {
    position: 'absolute', left: LED_L, top: 400, width: LED_W, height: 40,
    borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: PAPER,
    alignItems: 'center', justifyContent: 'center',
  },
  frozenText: { fontFamily: 'Inter_700Bold', fontSize: 14.5, letterSpacing: 1, color: INK, includeFontPadding: false },
  strike: {
    position: 'absolute', left: 12, top: 18, width: LED_W - 28, height: 3.5,
    backgroundColor: INK, borderRadius: 2, transformOrigin: '0% 50%',
  },

  voidLabel: {
    position: 'absolute', left: 282, top: 224, width: 112, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 10.5, lineHeight: 13, letterSpacing: 1.4, color: SOFT,
    includeFontPadding: false,
  },
  voidCore: { position: 'absolute', width: VOID_CORE, height: VOID_CORE, borderRadius: VOID_CORE / 2, backgroundColor: INK },
  voidRim: { position: 'absolute', width: VOID_RIM, height: VOID_RIM, borderRadius: VOID_RIM / 2, borderWidth: 1.5, borderColor: SOFT },
  // Anchored at its LEFT end so the rotate and the scaleX share an origin and the
  // slash draws itself ACROSS the void instead of growing out of its middle. Its
  // length is the core's diameter and its colour is PAPER, so it reads as a stroke
  // cut through the black disc — the second way, barred. Left end solved from the
  // centre: left = 338 − 42·cos24° = 299.63, top = 288 + 42·sin24° − 3 = 302.08.
  slash: {
    position: 'absolute', left: 299.63, top: 302.08, width: VOID_CORE, height: 6,
    backgroundColor: PAPER, borderRadius: 3, transformOrigin: '0% 50%',
  },
});

// MEASURED BAND, top and bottom.
//   TOP    the ledger title and the void label, both at y 224. The void's rim tops
//          out at 288 − 53×1.05 = 232.4 at the peak of its breath, and the figure's
//          crown never rises above ~358 even on the reaching gestures (the raised
//          fists clamp to the arm's reach at y ≈ 367).
//   BOTTOM the ground line at 501.5, and — the true extreme — the ankle JOINTS,
//          circles of radius STR.limb·K_FIG/2 = 7.43 centred exactly on GROUND, so
//          ink reaches y = 507.4. The struck claim bottoms out at 448 mid-entry and
//          the tokens at 404 on their bob.
// [216, 512] therefore holds every extreme on every beat with 8 units of margin at
// the top and 4.6 at the foot, and renders the scene ~2.19× instead of the
// letterboxed 1.15×. (The stage is only ~5% off the width-limited ceiling of 2.31×,
// so there is nothing left to win by cropping harder.)
export function Metaphysics4Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Metaphysics4Scene} band={[216, 512]} camera={CAM} />;
}
