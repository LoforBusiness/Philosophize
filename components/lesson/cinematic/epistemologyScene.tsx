import {
  View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { BEATS } from './epistemologyScript';
import {
  clamp01, ease01, lerp, mixStance, narratorHold, narratorLive, pose, stand, type Bundle, type Stance, } from './rig';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, PAPER, useHeld, carryFrom, keepHeld, useCarry, carry, lookPose,
} from './cinematicKit';
import { stageTone } from './stageTones';
import type { SceneApi } from './CinematicPlayer';
import { followMoves, kindOf, seedOf } from './camera';

// THE STAGE IS STRUCK IN THIS LESSON'S OWN BRANCH HUE (./stageTones).
// Same three tones, same luminance to the third decimal — so every contrast
// measured against the old greys still holds and nothing on the stage moved.
const { RULE, STONE, SHADE } = stageTone('epistemology');
const LIP = `0px 3px 0px ${SHADE}`;   // the shaded lip a toned plate stands on (scripts/lip-stage.mjs)

// ─────────────────────────────────────────────────────────────────────────────
// THE GATE OF KNOWING, held by three locks: TRUE · BELIEF · REASONS.
//
// The seeker stands stage right with a key; the gate fills the left half and
// carries the three locks as a readable labelled diagram. Stage right, above the
// figure's crown, a VERDICT panel reads the locks back as a tally (n of 3) and a
// stamped word — UNTESTED / KNOWLEDGE / JUST LUCK — so the abstract claim of the
// lesson is on screen as information, not just narration.
//
// THE DOOR ITSELF is drawn: an outlined leaf with a knob, hung in the gate beside
// the bolts. It used to be a 7-unit sliver of "light" that nobody could read, so
// the lesson's whole payoff — turn three locks and it OPENS — happened at the size
// of a pencil line. Now the leaf inks in from its hinge as `know` rises (INK = on,
// the same language the bolts and the tally already speak), so the beat where all
// three locks turn actually lands.
//
// ── EVERY TAP OF THE OPENING CHANGES THE PICTURE ────────────────────────────
// Five taps held one frame, and all three locks turned on the sentence that names
// only the first. The gate is worked as it is described now: EPISTEMOLOGY is
// lettered over the arch when the field is named (`field`, y 240…252, clear of the
// halo's top at 254 and left of the verdict panel at 220); TRUE turns alone on "the
// first is truth", BELIEF and then REASONS on the next sentence; the door waits for
// "the three together are sufficient" (`opens`); "without the third condition" rings
// the REASONS bolt in a dashed line (`third`); "justification is meant to connect
// a belief to the truth" runs a rod through the three studs, from REASONS up to TRUE
// (`tie`, shown while REASONS is turned); and "being persuaded is no good reason"
// writes PERSUADED under the REASONS bolt and strikes it out (`persuaded`, gone
// again when the first question is asked).
//
// CAMERA: none. The old scene shifted everything with a fixed camera transform,
// which made the band impossible to measure; design space is now final space, so
// the figure stands on GROUND=500 with its crown at ~361 exactly as the shared
// player documents. All art lives inside y 246..508 → band [234, 514].
// ─────────────────────────────────────────────────────────────────────────────

const TR = 0.8;                              // beat-to-beat blend, seconds

// the gate
const GATE_L = 30;
const GATE_W = 182;
const GATE_T = 268;
const GATE_B = 500;
const GATE_H = GATE_B - GATE_T;
const ARCH = GATE_W / 2;

// the three bolts, positioned INSIDE the gate (so the rattle carries them)
const BOLT_X = 10;
const BOLT_W = 124;
const BOLT_H = 38;
const BOLT_Y = [68, 116, 164];               // → stage y 336 / 384 / 432
const BOLT_LABEL = ['TRUE', 'BELIEF', 'REASONS'];

// The door leaf, hung between the bolts (which end at 134) and the right jamb.
// Its top edge is set at 60 rather than higher because the arch is a semicircle of
// radius 91 centred at (91, 91): at y = 60 the slab's inner face has curved in to
// x ≈ 174, so a leaf ending at 170 clears it, while a taller one would poke out
// through the curve. It runs down to the slab's inner floor (229), so it reads as
// a full-height door and not a window.
const DOOR_X = 138;
const DOOR_W = 32;
const DOOR_T = 60;
const DOOR_H = 169;                          // 60 + 169 = 229, the inner floor

// the verdict readout, clear of the gate and above the seeker's crown (361)
const VP_L = 220;
const VP_W = 166;
const VP_T = 246;
const VP_H = 84;

const SEEKER_X = 300;

const HPOSE = BEATS.map((b) => b.hpose ?? 0);
const LOCKS = BEATS.map((b) => b.locks ?? [0, 0, 0]);
// Which beats actually CHANGE the verdict — only those re-stamp the word, so it
// doesn't punch itself again on every forward tap.
const VKEY = LOCKS.map((l) => l.map((v) => (v >= 0.9 ? 1 : 0)).join(''));
const RESTAMP = VKEY.map((k, n) => (n === 0 || k !== VKEY[n - 1] ? 1 : 0));
const Q1 = BEATS.map((b) => (b.qkey === 'q1' ? 1 : 0));
const Q2 = BEATS.map((b) => (b.qkey === 'q2' ? 1 : 0));
const KEYED = BEATS.map((b) => ((b.hpose ?? 0) === 5 ? 1 : 0));
const FIELD = BEATS.map((b) => (b.field ? 1 : 0));
const OPENS = BEATS.map((b) => (b.opens ? 1 : 0));
const TIE = BEATS.map((b) => (b.tie ? 1 : 0));
const PERSUADED = BEATS.map((b) => (b.persuaded ? 1 : 0));
const THIRD = BEATS.map((b) => (b.third ? 1 : 0));

// The rod through the three studs: each stud is 18 square, 12 in from its bolt's
// top-left inside the gate, so their centres are x 31 and y BOLT_Y + 21.
const ROD_X = BOLT_X + 21;
const ROD_T = BOLT_Y[0] + 21;
const ROD_B = BOLT_Y[2] + 21;
// PERSUADED, under the ring round the REASONS bolt (which ends at 207) and above the
// slab's inner floor (229.5), set on the bolt labels' left edge.
const PERS_T = 212;
const PERS_L = BOLT_X + 38;

function reachKey(t: number): Stance {
  'worklet';
  const s = stand(t);
  return { ...s, tilt: s.tilt - 0.06, neck: 0.04, fistR: { x: 33, y: -8 }, fistL: { x: -4, y: -4 } };
}
function hHold(code: number, t: number): Stance {
  'worklet';
  if (code === 5) return reachKey(t);
  if (code === 0) return stand(t);
  return narratorHold(code, t);
}
function hLive(code: number, t: number, bt: number): Stance {
  'worklet';
  if (code === 5) return reachKey(t);
  if (code === 0) return stand(t);
  return narratorLive(code, t, bt);
}

// THE CAMERA (H60b). `followMoves` reads the x track and gives each beat its own
// shot: it FOLLOWS the subject when a beat moves far enough to be worth following,
// pushes close on a quote, and PULLS BACK to the whole band on a question or a
// summary — the beats the reader has to read and act on.
// Beats that do not set `x` stand at SEEKER_X.
const X = BEATS.map((b) => b.x ?? SEEKER_X);

// R7b — the stage follows the control on its own graded beat, and only there.
// Derived from the beat rather than declared as a channel so it cannot fall out
// of step with the control it is about.
const REACT = BEATS.map((b) => (b.interact?.drag ? 1 : 0));
const CAM = followMoves(X, BEATS.map(kindOf), seedOf('epistemology'));

export default function EpistemologyScene({ clock, bt, bi, qv, i, picked, pickedOk, dragPos, gazeX, gazeY, gazeOn }: SceneApi) {
  const reacting = REACT[i] === 1;
  const heldSeekerS = useHeld();
  const cv = useCarry(9);
  const cur = BEATS[i];
  // Only the RIGHT answer turns the third bolt. A door that swings open on a wrong
  // pick would tell the reader "you know" at the exact moment they showed they
  // don't — the whole point of the lesson.
  // It read `cur.mc`, and the question is `interact.cards` now, so a right answer
  // never turned the bolt at all. The player knows which answer was right.
  const rightPick = picked !== null && !!pickedOk;
  const turns = Q1[i] === 1 && rightPick ? 1 : 0;

  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / TR);
    const t = clock.value;
    const q = clamp01(qv.value);

    const seekerS = keepHeld(heldSeekerS, mixStance(carryFrom(heldSeekerS, n,hHold(HPOSE[p], t)), hLive(HPOSE[n], t, bt.value), tr));

    // Carried, like every other track (L5). The codemod could not reach these
    // three: it matches `lerp(NAME[p], NAME[n], tr)` and these are indexed out of
    // an array-of-arrays, so the shape never matched and three locks kept
    // blending from where the previous beat was HEADING rather than from where
    // they were drawn.
    const l1 = carry(cv, 1, n, LOCKS[p][0], LOCKS[n][0], tr);
    const l2 = carry(cv, 2, n, LOCKS[p][1], LOCKS[n][1], tr);
    // The third lock runs half a second behind the other two, so a sentence that
    // names the second and third conditions turns them one after the other.
    let l3 = carry(cv, 3, n, LOCKS[p][2], LOCKS[n][2], ease01((bt.value - 0.45) / TR));
    if (turns === 1) l3 = lerp(l3, 1, ease01(q));

    // Stepped so a half-lit bolt never renders as a muddy grey plate.
    const k1 = clamp01((l1 - 0.55) / 0.35);
    const k2 = clamp01((l2 - 0.55) / 0.35);
    const k3 = clamp01((l3 - 0.55) / 0.35);

    // All three turned AND the narration calling them sufficient → the gate opens.
    const opens = carry(cv, 5, n, OPENS[p], OPENS[n], ease01((bt.value - 0.3) / 0.9));
    const know = k1 * k2 * k3 * opens;

    // The stamped WORD swaps; it must never cross-dissolve. Two 17px words each
    // holding 50% opacity on top of each other read as a smudge for a quarter of
    // a second on every verdict change. Hardening the two SELECTORS collapses
    // that to a couple of frames — and only the selectors: the gate's own `know`
    // stays smooth, because the door has to swing open, not snap. The three
    // still sum to exactly 1, so the panel is never blank and never double.
    const both = clamp01((k1 * k2 - 0.5) * 6 + 0.5);   // true + belief turned
    const w3 = clamp01((k3 - 0.5) * 6 + 0.5);          // reasons turned

    return {
      seeker: lookPose(seekerS, SEEKER_X, GROUND, K_FIG, -1, 1, gazeX.value, gazeY.value, gazeOn.value),
      k1, k2, k3, know,
      wKnow: both * w3,                      // justified true belief
      wLuck: both * (1 - w3),                // true + believed, no reasons
      wUntested: 1 - both,
      shake: Q2[n] === 1 ? Math.sin(q * 40) * (1 - q) * 3.4 : 0,
      stamp: RESTAMP[n] === 1 ? ease01(bt.value / 0.42) : 1,
      // R7b — the knob reaches for the key. The gate has three locks and the third
      // one takes reasons, so dragging along the rail brings the hand to it: the
      // reader turns the lock they are being asked about.
      keyed: carry(cv, 0, n, KEYED[p], reacting ? dragPos.value : KEYED[n], tr),
      field: carry(cv, 4, n, FIELD[p], FIELD[n], ease01((bt.value - 0.2) / 0.6)),
      // The rod is only a link while there is a REASONS lock turned for it to link.
      tie: carry(cv, 6, n, TIE[p], TIE[n], ease01((bt.value - 0.3) / 0.8)) * k3,
      pers: carry(cv, 7, n, PERSUADED[p], PERSUADED[n], ease01((bt.value - 0.3) / 0.5)),
      third: carry(cv, 8, n, THIRD[p], THIRD[n], ease01((bt.value - 0.25) / 0.5)),
      // The strike is drawn once, on the beat the word is written, and then holds (C20c).
      persX: PERSUADED[n] > 0 && !(n > 0 && PERSUADED[p] > 0) ? ease01((bt.value - 1.0) / 0.45) : 1,
    };
  });

  const DS = useDerivedValue<Bundle>(() => SCENE.value.seeker);
  const keyStyle = useAnimatedStyle(() => {
    const w = DS.value.wrR;
    return {
      opacity: SCENE.value.keyed,
      transform: [{ translateX: w[0].translateX }, { translateY: w[1].translateY }],
    };
  });

  return (
    <View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      <View style={styles.ground} pointerEvents="none" />
      <Gate S={SCENE} />
      <Verdict S={SCENE} />
      <Stickman D={DS} k={K_FIG} />
      {/* the key in the seeker's hand, riding the wrist joint */}
      <Animated.View style={[styles.keyWrap, keyStyle]} pointerEvents="none">
        <View style={styles.keyBow} />
        <View style={styles.keyShaft} />
        <View style={[styles.keyTooth, { left: -25 }]} />
        <View style={[styles.keyTooth, { left: -18 }]} />
      </Animated.View>
    </View>
  );
}

// ── the gate ──────────────────────────────────────────────────────────────────

function Bolt({ S, idx }: { S: SharedValue<any>; idx: number }) {
  const on = useAnimatedStyle(() => ({
    opacity: idx === 0 ? S.value.k1 : idx === 1 ? S.value.k2 : S.value.k3,
  }));
  const off = useAnimatedStyle(() => ({
    opacity: 1 - (idx === 0 ? S.value.k1 : idx === 1 ? S.value.k2 : S.value.k3),
  }));
  return (
    <View style={[styles.bolt, { top: BOLT_Y[idx] }]} pointerEvents="none">
      <Animated.View style={[StyleSheet.absoluteFill, styles.boltFill, on]} />
      <Animated.View style={[styles.stud, off]} />
      <Animated.View style={[styles.studOn, on]} />
      <Animated.View style={[styles.boltLabel, off]}>
        <Text style={styles.boltText}>{BOLT_LABEL[idx]}</Text>
      </Animated.View>
      <Animated.View style={[styles.boltLabel, on]}>
        <Text style={[styles.boltText, styles.boltTextOn]}>{BOLT_LABEL[idx]}</Text>
      </Animated.View>
    </View>
  );
}

function Gate({ S }: { S: SharedValue<any> }) {
  const body = useAnimatedStyle(() => ({ transform: [{ translateX: S.value.shake }] }));
  const halo = useAnimatedStyle(() => ({ opacity: S.value.know * 0.3 }));
  // The leaf swings from its RIGHT edge (the hinge), so the opening grows out of
  // the jamb rather than inflating from the middle. Opacity outruns the scale so a
  // barely-cracked door is still solid ink instead of a grey smear.
  const door = useAnimatedStyle(() => ({
    opacity: clamp01(S.value.know * 4),
    transform: [{ scaleX: S.value.know }],
  }));
  const field = useAnimatedStyle(() => ({
    opacity: S.value.field,
    transform: [{ translateY: (1 - S.value.field) * 5 }],
  }));
  // The rod grows UP out of the REASONS stud to TRUE: justification connecting the
  // belief to the truth. Its rivets land as it passes each stud.
  const rod = useAnimatedStyle(() => ({ opacity: clamp01(S.value.tie * 3), transform: [{ scaleY: S.value.tie }] }));
  const rivet = [
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useAnimatedStyle(() => ({ opacity: clamp01((S.value.tie - 0.95) * 20) })),
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useAnimatedStyle(() => ({ opacity: clamp01((S.value.tie - 0.45) * 20) })),
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useAnimatedStyle(() => ({ opacity: clamp01(S.value.tie * 20) })),
  ];
  const pers = useAnimatedStyle(() => ({
    opacity: S.value.pers,
    transform: [{ translateX: (1 - S.value.pers) * -8 }],
  }));
  const persX = useAnimatedStyle(() => ({ transform: [{ scaleX: S.value.persX }] }));
  // "Without the third condition": a dashed ring settles round the REASONS bolt.
  const third = useAnimatedStyle(() => ({
    opacity: S.value.third,
    transform: [{ scale: 1.08 - 0.08 * S.value.third }],
  }));
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Animated.Text style={[styles.fieldSign, field]} numberOfLines={1}>EPISTEMOLOGY</Animated.Text>
      <Animated.View style={[styles.halo, halo]} />
      <Animated.View style={[styles.gateWrap, body]}>
        <View style={styles.gateSlab} />
        <Text style={styles.gateLabel}>KNOWLEDGE</Text>
        <View style={styles.gateDoor}>
          <View style={styles.gateKnob} />
          <Animated.View style={[StyleSheet.absoluteFill, styles.gateOpen, door]} />
        </View>
        <Bolt S={S} idx={0} />
        <Bolt S={S} idx={1} />
        <Bolt S={S} idx={2} />
        <Animated.View style={[styles.thirdRing, third]} />
        <Animated.View style={[styles.rod, rod]} />
        {BOLT_Y.map((y, k) => (
          <Animated.View key={y} style={[styles.rivet, { top: y + 21 - 3 }, rivet[k]]} />
        ))}
        <Animated.View style={[styles.pers, pers]}>
          <Text style={styles.persText} numberOfLines={1}>PERSUADED</Text>
          <Animated.View nativeID="crossout-persuaded" style={[styles.persStrike, persX]} />
        </Animated.View>
      </Animated.View>
    </View>
  );
}

// ── the verdict readout: a tally of turned locks + the stamped word ──────────

function Pip({ S, idx }: { S: SharedValue<any>; idx: number }) {
  const fill = useAnimatedStyle(() => ({
    opacity: idx === 0 ? S.value.k1 : idx === 1 ? S.value.k2 : S.value.k3,
  }));
  return (
    <View style={styles.pip}>
      <Animated.View style={[StyleSheet.absoluteFill, styles.pipFill, fill]} />
    </View>
  );
}

function Verdict({ S }: { S: SharedValue<any> }) {
  const stamp = useAnimatedStyle(() => ({ transform: [{ scale: lerp(1.16, 1, S.value.stamp) }] }));
  const wUntested = useAnimatedStyle(() => ({ opacity: S.value.wUntested }));
  const wKnow = useAnimatedStyle(() => ({ opacity: S.value.wKnow }));
  const wLuck = useAnimatedStyle(() => ({ opacity: S.value.wLuck }));
  return (
    <View style={styles.vp} pointerEvents="none">
      <Text style={styles.vpCap}>VERDICT</Text>
      <Animated.View style={[styles.vpWord, stamp]}>
        <Animated.View style={[StyleSheet.absoluteFill, styles.vpCenter, wUntested]}>
          <Text style={styles.vpText}>UNTESTED</Text>
        </Animated.View>
        <Animated.View style={[StyleSheet.absoluteFill, styles.vpCenter, wKnow]}>
          <Text style={styles.vpText}>KNOWLEDGE</Text>
        </Animated.View>
        <Animated.View style={[StyleSheet.absoluteFill, styles.vpCenter, wLuck]}>
          <Text style={styles.vpText}>JUST LUCK</Text>
        </Animated.View>
      </Animated.View>
      <View style={styles.vpTally}>
        <Text style={styles.vpTallyText}>LOCKS TURNED</Text>
        <Pip S={S} idx={0} />
        <Pip S={S} idx={1} />
        <Pip S={S} idx={2} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 24, right: 14, top: GROUND, height: 1.5, backgroundColor: RULE },
  // THE FLOOR THE GROUND LINE SITS ON. A rule on its own leaves the
  // figure and everything it is looking at standing on bare page;
  // political7 and political8 both stand their subject on a filled mass.
  floor: { position: 'absolute', left: 0, right: 0, top: GROUND, bottom: 0, backgroundColor: RULE },

  halo: {
    position: 'absolute', left: GATE_L - 14, top: GATE_T - 14,
    width: GATE_W + 28, height: GATE_H + 14,
    borderTopLeftRadius: ARCH + 14, borderTopRightRadius: ARCH + 14, backgroundColor: INK,
  },
  gateWrap: { position: 'absolute', left: GATE_L, top: GATE_T, width: GATE_W, height: GATE_H },
  gateSlab: {
    position: 'absolute', left: 0, top: 0, width: GATE_W, height: GATE_H,
    borderTopLeftRadius: ARCH, borderTopRightRadius: ARCH,
    borderWidth: 2.5, borderColor: INK, backgroundColor: STONE, boxShadow: LIP,
  },
  gateLabel: {
    position: 'absolute', top: 30, left: 0, right: 0, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 2.2, color: INK, includeFontPadding: false,
  },
  gateDoor: {
    position: 'absolute', left: DOOR_X, top: DOOR_T, width: DOOR_W, height: DOOR_H,
    borderWidth: 2, borderColor: INK, borderRadius: 3, backgroundColor: STONE, boxShadow: LIP, overflow: 'hidden',
  },
  gateKnob: {
    position: 'absolute', left: 5, top: 78, width: 8, height: 8, borderRadius: 4,
    borderWidth: 2, borderColor: INK,
  },
  gateOpen: { backgroundColor: INK, transformOrigin: '100% 50%' },

  bolt: {
    position: 'absolute', left: BOLT_X, width: BOLT_W, height: BOLT_H,
    borderWidth: 2, borderColor: INK, borderRadius: 5, backgroundColor: STONE, boxShadow: LIP, overflow: 'hidden',
  },
  boltFill: { backgroundColor: INK },
  stud: {
    position: 'absolute', left: 10, top: 10, width: 18, height: 18, borderRadius: 4,
    borderWidth: 2, borderColor: INK, backgroundColor: PAPER,
  },
  studOn: {
    position: 'absolute', left: 10, top: 10, width: 18, height: 18, borderRadius: 4, backgroundColor: PAPER,
  },
  boltLabel: { position: 'absolute', left: 36, top: 0, bottom: 0, justifyContent: 'center' },
  boltText: {
    fontFamily: 'Inter_700Bold', fontSize: 14, letterSpacing: 1.2, color: INK, includeFontPadding: false,
  },
  boltTextOn: { color: PAPER },

  // The field's name over the arch: 100 units of type centred on the gate.
  fieldSign: {
    position: 'absolute', left: GATE_L, top: 240, width: GATE_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 9.5, lineHeight: 12, letterSpacing: 2, color: INK,
    includeFontPadding: false,
  },
  // Paper with an ink edge, so it reads on a lit (ink) bolt and on the stone between.
  rod: {
    position: 'absolute', left: ROD_X - 2, top: ROD_T, width: 4, height: ROD_B - ROD_T,
    backgroundColor: PAPER, borderWidth: 1, borderColor: INK, transformOrigin: '50% 100%',
  },
  rivet: { position: 'absolute', left: ROD_X - 3, width: 6, height: 6, borderRadius: 3, backgroundColor: INK },
  // 2 outside the REASONS bolt at the sides (x 8…136, clear of the door leaf at 138)
  // and 3 above it, running down past its lip to 207.
  thirdRing: {
    position: 'absolute', left: BOLT_X - 2, top: BOLT_Y[2] - 3, width: BOLT_W + 4, height: BOLT_H + 8,
    borderWidth: 2, borderColor: INK, borderStyle: 'dashed', borderRadius: 7,
  },
  pers: { position: 'absolute', left: PERS_L, top: PERS_T, height: 13, justifyContent: 'center' },
  persText: {
    fontFamily: 'Inter_700Bold', fontSize: 10, lineHeight: 13, letterSpacing: 1.2, color: INK,
    includeFontPadding: false,
  },
  persStrike: {
    position: 'absolute', left: -2, right: -2, top: 5.5, height: 2, borderRadius: 1,
    backgroundColor: INK, transformOrigin: '0% 50%',
  },

  vp: {
    position: 'absolute', left: VP_L, top: VP_T, width: VP_W, height: VP_H,
    borderWidth: 2, borderColor: INK, borderRadius: 5, backgroundColor: STONE, boxShadow: LIP,
  },
  vpCap: {
    position: 'absolute', top: 8, left: 0, right: 0, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 9.5, letterSpacing: 1.8, color: INK, includeFontPadding: false,
  },
  vpWord: { position: 'absolute', top: 24, left: 0, right: 0, height: 28 },
  vpCenter: { alignItems: 'center', justifyContent: 'center' },
  vpText: {
    fontFamily: 'Inter_700Bold', fontSize: 18, letterSpacing: 0.6, color: INK, includeFontPadding: false,
  },
  vpTally: {
    position: 'absolute', top: 58, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
  },
  vpTallyText: {
    fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 1.1, color: INK,
    marginRight: 4, includeFontPadding: false,
  },
  pip: {
    width: 16, height: 16, borderRadius: 3, borderWidth: 2, borderColor: INK,
    backgroundColor: STONE, boxShadow: LIP, marginLeft: 7,
  },
  pipFill: { backgroundColor: INK, borderRadius: 1 },

  keyWrap: { position: 'absolute', left: 0, top: 0 },
  keyBow: {
    position: 'absolute', left: -6, top: -6, width: 12, height: 12, borderRadius: 6,
    borderWidth: 2.5, borderColor: INK,
  },
  keyShaft: { position: 'absolute', left: -26, top: -1.5, width: 22, height: 3, backgroundColor: INK },
  keyTooth: { position: 'absolute', top: 1.5, width: 3, height: 7, backgroundColor: INK },
});

// Every pixel this scene can draw lives between the EPISTEMOLOGY sign's top (240)
// and the seeker's ankle joints (~507): the verdict panel starts at 246, the gate halo at 254, the gate at
// 268, the door leaf at 328..497, the ground rule at 500, and the key rides the seeker's
// wrist no higher than ~389. A 280-unit band is also the tightest crop that still
// pays: the stage region is ~923×647 device px, so 647/280 ≈ 923/400 — anything
// narrower is capped by the width and gains nothing while risking a clipped crown.
export function EpistemologyLesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={EpistemologyScene} band={[234, 514]} camera={CAM} />;
}
