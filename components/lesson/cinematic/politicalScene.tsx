import {
  View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { BEATS } from './politicalScript';
import {
  boxMove, clamp01, ease01, lerp, mixStance, pose, stand, type Bundle, type Stance, } from './rig';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, PAPER, useHeld, carryFrom, keepHeld, useCarry, carry, reactPose,
} from './cinematicKit';
import { stageTone } from './stageTones';
import { floorStyle, lipOf, PLATE_FACE } from './stageSkin';
import { followMoves, kindOf, seedOf } from './camera';
import type { SceneApi } from './CinematicPlayer';

// THE STAGE IS STRUCK IN THIS LESSON'S OWN BRANCH HUE (./stageTones).
// Same three tones, same luminance to the third decimal — so every contrast
// measured against the old greys still holds and nothing on the stage moved.
const TONE = stageTone('political-philosophy');
const { RULE, STONE, SHADE } = TONE;
const LIP = lipOf(TONE);   // the ledge a toned plate stands on (scripts/skin-stage.mjs)

// ─────────────────────────────────────────────────────────────────────────────
// THE WAR OF ALL AGAINST ALL, AND THE SOVEREIGN THEY RAISE.
//
// Four neighbours stand on the ground line. As the narration strips away law and
// ruler they square up, then brawl — the state of nature arriving one tap at a
// time (`nature`). When the covenant is made, a pedestal grows out of the ground
// beneath a fifth figure — crowned, sword aloft — and the fighting settles into a
// calm stand. After it, an unsigned CONTRACT (no one ever signed one) and the
// subjects bowing to the sovereign they authorised.
//
// ── EVERY TAP OF THE OPENING CHANGES THE PICTURE ────────────────────────────
// This is the first lesson of the branch, and its first seven taps used to hold one
// frame: the brawl, the headline, the ledger and both meters were all on screen
// before a word about the state of nature was said. They now arrive as they are
// named — the flow on "the right to rule", the squaring-up on "imagine life
// without any law", the ledger and the fear on "solitary, poor, nasty", the
// headline on "war of every man against every man", and the covenant's arrow on
// "everyone authorises one sovereign" (`reveal`).
//
// ── AND THE BRAWL NO LONGER FREEZES AFTER THE FIRST TAP ─────────────────────
// All four citizens shared ONE `useHeld`, and the stance was
// `mixStance(carryFrom(held, n, melee), stand, auth)`: `carryFrom` returns the pose
// captured at the beat change and holds it for the whole beat, so from the second
// tap on the four stood frozen in the LAST citizen's pose. Each citizen now has its
// own held value, and blends from it into its live stance over the transition.
//
// Four pieces of information design carry Hobbes's argument above the action:
//   · the headline WAR OF ALL AGAINST ALL, struck through as authority arrives;
//   · under it a LEDGER of what life is worth, word-swapping on the same cue:
//     SOLITARY · POOR · NASTY · BRUTISH · SHORT becomes INDUSTRY · ARTS · LETTERS
//     · SOCIETY. Leviathan xiii lists both; the swap is what the sovereign buys;
//   · a flow, MULTITUDE → SOVEREIGN → PEACE, whose last two boxes ink in;
//   · two opposed meters, FEAR and PEACE, that trade places as `auth` rises.
//
// CAMERA: a `followMoves` camera on the SOVEREIGN'S x, not on a walker — this is
// the one lesson with no single protagonist. Four citizens sit at x 100..304 and
// the fifth rises at 200, so the stage centre is the honest thing to look at and
// the track is a constant; followMoves then deals the standing rhythm (push, pull,
// hold) rather than inventing travel that is not in the picture.
//
// It had NO camera before, and the header's reason was about something else
// entirely: the old scene translated the whole stage up 136 units, which put the
// ground line in mid-air and made the band unmeasurable. That was fixed by making
// design space final space — everything stands on GROUND=500, art occupies
// y 244..508, band [234, 514] — and nothing about it argued against a camera. H60b
// says moving is the default; this one had simply never been given one back.
//
// The headline, the ledger, the flow and the two meters all sit above the action,
// which is exactly what a push at the ground line crops, so this is only safe with
// the measured must-see boxes of H60c holding the shot open.
// ─────────────────────────────────────────────────────────────────────────────

const TR = 0.85;

// No walker to follow, so the track is the sovereign's x — see CAMERA above.
const X = BEATS.map((b) => b.x ?? 200);
const CAM = followMoves(X, BEATS.map(kindOf), seedOf('political'));

// Citizens pulled in from the edges so a lunging brawler never reaches the meters.
const CIT_X = [100, 154, 250, 304];
const CIT_DIR = [1, 1, -1, -1];              // all face the centre
const CIT_K = K_FIG * 0.82;
const SOV_X = 200;
const PED = 30;                              // the pedestal the covenant raises

// the flow, clear of the sovereign's crown (its highest point is y ≈ 320)
const FLOW_T = 274;
const FLOW_H = 34;
const FLOW_W = 100;
const FLOW_X = [26, 150, 274];
const FLOW_LABEL = ['MULTITUDE', 'SOVEREIGN', 'PEACE'];
const ARROW_X = [126, 250];

// the two meters, standing on the ground line either side of the crowd
const MTR_T = 382;
const MTR_H = 112;
const MTR_W = 24;

const SPARK_X = [127, 277];

const AUTH = BEATS.map((b) => b.auth ?? 0);
const NATURE = BEATS.map((b) => b.nature ?? 0);
const REVEAL = BEATS.map((b) => b.reveal ?? 0);
const PAPER_ON = BEATS.map((b) => b.paper ?? 0);
const BOW = BEATS.map((b) => b.bow ?? 0);
const Q1 = BEATS.map((b) => (b.weigh === 'q1' ? 1 : 0));

// R7b — the stage follows the control on its own graded beat, and only there.
// Derived from the beat rather than declared as a channel so it cannot fall out
// of step with the control it is about.
const REACT = BEATS.map((b) => (b.interact?.order ? 1 : 0));

// Each citizen runs an out-of-phase loop of blows — no two in sync, the brawl.
// Each also runs a DIFFERENT loop and carries its own `seed`, so their idle bounce
// and stance differ too: offsetting only the blows still left four bodies breathing
// on the same frame, which reads as one figure copied four times.
const MELEE: number[][] = [
  [1, 3, 2, 0, 5, 1, 6],                     // jab hook cross guard block jab duck
  [14, 1, 12, 2, 0, 10, 5],                  // feint jab parry cross guard lead-hook block
  [5, 11, 0, 13, 1, 3, 12],                  // block body-shot guard roll jab hook parry
  [15, 2, 6, 1, 16, 0, 4],                   // circle cross duck jab clinch guard uppercut
];
function melee(t: number, k: number): Stance {
  'worklet';
  const codes = MELEE[k % MELEE.length];
  const period = 0.66 + (k % 3) * 0.07;      // and their own tempo
  const local = t * 1.1 + k * 1.9;
  const idx = Math.floor(local / period) % codes.length;
  const u = (local / period) % 1;
  return boxMove(codes[idx], t, u, k + 1);
}
/** A citizen at peace: breathing, weight shifting, each on their own phase; bowing on cue. */
function calm(t: number, k: number, bow: number): Stance {
  'worklet';
  const s = stand(t + k * 1.7);
  const shift = Math.sin(t * (0.55 + k * 0.08) + k * 2.1);
  return {
    ...s,
    tilt: s.tilt + shift * 0.04 - bow * 0.16,
    neck: s.neck + shift * 0.05 + bow * 0.32,
    footL: { x: s.footL.x - shift * 1.8, y: s.footL.y },
    footR: { x: s.footR.x - shift * 1.8, y: s.footR.y },
    fistL: { x: -13 - shift * 1.2, y: 4 + shift * 1.5 + bow * 2 },
    fistR: { x: 13 - shift * 1.2, y: 4 - shift * 1.5 + bow * 2 },
  };
}
function sovereignPose(t: number): Stance {
  'worklet';
  const s = stand(t);
  return { ...s, tilt: s.tilt - 0.02, fistR: { x: 16, y: -42 }, fistL: { x: -9, y: -4 } };
}

export default function PoliticalScene({ clock, bt, bi, qv, dragPos, pickPos, i }: SceneApi) {
  const reacting = REACT[i] === 1;
  const held0 = useHeld();
  const held1 = useHeld();
  const held2 = useHeld();
  const held3 = useHeld();
  const cv = useCarry(5);
  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / TR);
    const t = clock.value;
    const q = clamp01(qv.value);

    // R7c — `auth` is the whole picture: the sovereign's height, his pedestal, and
    // whether the citizens are still lunging at each other. The drag asks how much
    // right to resist there is, so it is the same quantity read from the other end.
    const auth = Q1[n] === 1 ? ease01(q) : carry(cv, 0, n, AUTH[p], reacting ? 1 - pickPos.value : AUTH[n], tr);

    // How hard they fight: the state of nature, less whatever the sovereign settles.
    const nature = carry(cv, 1, n, NATURE[p], NATURE[n], tr);
    const fight = nature * (1 - auth);
    const reveal = carry(cv, 2, n, REVEAL[p], REVEAL[n], tr);
    const paper = carry(cv, 3, n, PAPER_ON[p], PAPER_ON[n], tr);
    const bow = carry(cv, 4, n, BOW[p], BOW[n], tr);

    const cit = (k: number, held: typeof held0): Bundle => {
      'worklet';
      const dir = CIT_DIR[k];
      const live = mixStance(melee(t, k), calm(t, k, bow), 1 - fight);
      const s = keepHeld(held, mixStance(carryFrom(held, n, live), live, tr));
      const x = CIT_X[k] + (s.adv ?? 0) * dir * fight;   // lunges only in the brawl
      return pose(s, x, GROUND, CIT_K, dir, 1);
    };

    // The pedestal GROWS from the ground under him, so his feet are always planted
    // on it — the old version floated him in mid-air on the way up.
    const sovGY = GROUND - PED * auth;
    return {
      c0: cit(0, held0), c1: cit(1, held1), c2: cit(2, held2), c3: cit(3, held3),
      sov: reactPose(sovereignPose(t), SOV_X, sovGY, K_FIG, -1, auth),
      auth, fight, reveal, paper, t,
    };
  });

  const DC0 = useDerivedValue<Bundle>(() => SCENE.value.c0);
  const DC1 = useDerivedValue<Bundle>(() => SCENE.value.c1);
  const DC2 = useDerivedValue<Bundle>(() => SCENE.value.c2);
  const DC3 = useDerivedValue<Bundle>(() => SCENE.value.c3);
  const DSov = useDerivedValue<Bundle>(() => SCENE.value.sov);

  const ped = useAnimatedStyle(() => ({ opacity: SCENE.value.auth, transform: [{ scaleY: SCENE.value.auth }] }));
  const crown = useAnimatedStyle(() => {
    const h = DSov.value.head;
    return {
      opacity: DSov.value.opacity,
      transform: [{ translateX: h[0].translateX }, { translateY: h[1].translateY - 30 }],
    };
  });
  const sword = useAnimatedStyle(() => {
    const w = DSov.value.wrR;
    return {
      opacity: DSov.value.opacity,
      transform: [{ translateX: w[0].translateX }, { translateY: w[1].translateY }],
    };
  });

  return (
    <View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      <Headline S={SCENE} />
      <Ledger S={SCENE} />
      <Flow S={SCENE} />
      <Meter S={SCENE} side="left" label="FEAR" invert />
      <Meter S={SCENE} side="right" label="PEACE" />
      <Contract S={SCENE} />
      {SPARK_X.map((x) => <Spark key={x} S={SCENE} x={x} />)}

      <View style={styles.ground} pointerEvents="none" />
      <Animated.View style={[styles.pedestal, ped]} pointerEvents="none" />

      <Stickman role="crowd" D={DC0} k={CIT_K} />
      <Stickman role="crowd" D={DC1} k={CIT_K} />
      <Stickman role="crowd" D={DC2} k={CIT_K} />
      <Stickman role="crowd" D={DC3} k={CIT_K} />
      <Stickman D={DSov} k={K_FIG} />

      {/* the sword held aloft, riding the sovereign's right wrist */}
      <Animated.View style={[styles.rider, sword]} pointerEvents="none">
        <View style={styles.swordBlade} />
        <View style={styles.swordGuard} />
        <View style={styles.swordPommel} />
      </Animated.View>
      {/* the crown, riding his head joint */}
      <Animated.View style={[styles.rider, crown]} pointerEvents="none">
        <View style={styles.crownBand} />
        <View style={[styles.crownPoint, { left: -14 }]} />
        <View style={[styles.crownPoint, { left: -3 }]} />
        <View style={[styles.crownPoint, { left: 8 }]} />
      </Animated.View>
    </View>
  );
}

// ── the headline, struck through when a common power arrives ─────────────────

function Headline({ S }: { S: SharedValue<any> }) {
  const strike = useAnimatedStyle(() => ({ transform: [{ scaleX: S.value.auth }] }));
  const shown = useAnimatedStyle(() => {
    const on = clamp01(S.value.reveal - 2);
    return { opacity: on, transform: [{ translateY: (1 - on) * -6 }] };
  });
  return (
    <View style={styles.headWrap} pointerEvents="none">
      <Animated.View style={shown}>
        <Text style={styles.headText}>WAR OF ALL AGAINST ALL</Text>
        <Animated.View style={[styles.strike, strike]} />
      </Animated.View>
    </View>
  );
}

// ── the ledger under the headline: what life is worth, before and after ──────
// Two lines of Hobbes's own vocabulary occupying one strip. They must NEVER
// cross-dissolve — two bold lines each at half opacity on the same baseline read
// as a printing fault — so the selectors are hardened around auth = 0.5: the swap
// collapses to a couple of frames, and the two weights always sum to 1, so the
// strip is never blank and never doubled.

function Ledger({ S }: { S: SharedValue<any> }) {
  // TWO DIFFERENT SENTENCES IN ONE BOX MAY NEVER BOTH BE ON SCREEN (D35).
  //
  // These cross-faded on one value: war was clamp01((0.5 - auth) * 6 + 0.5) and
  // civil the same expression read the other way, so at auth 0.5 BOTH came out at
  // exactly 0.5 and the reader got the two strings interleaved at half strength —
  // "SOLINTDAUSRTYPO·OARRTS·ALETTTERSRU·TSIOSCH·IETSHORT" — in the first lesson of
  // the branch. check:readable found it as two FAINT words at a=0.5 in one box.
  //
  // A cross-fade is the right move for a picture and the wrong one for a caption:
  // D35's rule is legible or absent, never dim. So the swap is instantaneous. It
  // is not a group-L teleport — nothing moves, one sentence replaces another, and
  // that is what reading a changed label looks like.
  //
  // The ternaries are INLINE on purpose. A `const shown = (v) => …` helper called
  // from a worklet is packed as a RemoteFunction and throws on the UI thread in
  // release (§17 rule 6), and it is invisible in a browser.
  const war = useAnimatedStyle(() => ({
    opacity: (S.value.auth < 0.5 ? 1 : 0) * clamp01(S.value.reveal - 1),
  }));
  const civil = useAnimatedStyle(() => ({ opacity: S.value.auth < 0.5 ? 0 : 1 }));
  return (
    <View style={styles.ledger} pointerEvents="none">
      {/* numberOfLines guards the 12-unit strip: the widest line measures ~281 of
          the 400 available, but a device with fatter metrics must never be allowed
          to wrap a second line down over the flow boxes at 274. */}
      <Animated.Text numberOfLines={1} style={[styles.ledgerText, war]}>
        SOLITARY · POOR · NASTY · BRUTISH · SHORT
      </Animated.Text>
      <Animated.Text numberOfLines={1} style={[styles.ledgerText, civil]}>
        INDUSTRY · ARTS · LETTERS · SOCIETY
      </Animated.Text>
    </View>
  );
}

// ── the flow: MULTITUDE → SOVEREIGN → PEACE ──────────────────────────────────

function FlowBox({ S, x, label, fixed }: { S: SharedValue<any>; x: number; label: string; fixed?: boolean }) {
  const on = useAnimatedStyle(() => ({ opacity: S.value.auth }));
  const off = useAnimatedStyle(() => ({ opacity: 1 - S.value.auth }));
  if (fixed) {
    return (
      <View style={[styles.flowBox, styles.flowFixed, { left: x }]} pointerEvents="none">
        <Text style={styles.flowTextFixed}>{label}</Text>
      </View>
    );
  }
  return (
    <View style={[styles.flowBox, { left: x }]} pointerEvents="none">
      <Animated.View style={[StyleSheet.absoluteFill, styles.flowOff, off]}>
        <Text style={styles.flowTextOff}>{label}</Text>
      </Animated.View>
      <Animated.View style={[StyleSheet.absoluteFill, styles.flowOn, on]}>
        <Text style={styles.flowTextOn}>{label}</Text>
      </Animated.View>
    </View>
  );
}

function FlowArrow({ S, x, covenant }: { S: SharedValue<any>; x: number; covenant?: boolean }) {
  // The first arrow is the covenant itself — the multitude authorising — so it inks
  // as the narration makes it, before the sovereign it points at has risen.
  const on = useAnimatedStyle(() => ({
    opacity: covenant ? Math.max(S.value.auth, clamp01(S.value.reveal - 3)) : S.value.auth,
  }));
  const off = useAnimatedStyle(() => ({
    opacity: 1 - (covenant ? Math.max(S.value.auth, clamp01(S.value.reveal - 3)) : S.value.auth),
  }));
  return (
    <View style={[styles.arrowWrap, { left: x }]} pointerEvents="none">
      <Animated.Text style={[styles.arrow, off]}>→</Animated.Text>
      <Animated.Text style={[styles.arrow, styles.arrowOn, on]}>→</Animated.Text>
    </View>
  );
}

function Flow({ S }: { S: SharedValue<any> }) {
  const shown = useAnimatedStyle(() => ({ opacity: clamp01(S.value.reveal) }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, shown]} pointerEvents="none">
      <FlowBox S={S} x={FLOW_X[0]} label={FLOW_LABEL[0]} fixed />
      <FlowArrow S={S} x={ARROW_X[0]} covenant />
      <FlowBox S={S} x={FLOW_X[1]} label={FLOW_LABEL[1]} />
      <FlowArrow S={S} x={ARROW_X[1]} />
      <FlowBox S={S} x={FLOW_X[2]} label={FLOW_LABEL[2]} />
    </Animated.View>
  );
}

// ── the two opposed meters ───────────────────────────────────────────────────

function Meter({
  S, side, label, invert,
}: { S: SharedValue<any>; side: 'left' | 'right'; label: string; invert?: boolean }) {
  // FEAR is the fight actually going on; PEACE is the sovereign. Both gauges arrive
  // with the ledger, when the narration first says what life without a power is.
  const fill = useAnimatedStyle(() => ({ transform: [{ scaleY: invert ? S.value.fight : S.value.auth }] }));
  const shown = useAnimatedStyle(() => ({ opacity: clamp01(S.value.reveal - 1) }));
  const x = side === 'left' ? 20 : STAGE_W - 20 - MTR_W;
  return (
    <Animated.View style={[StyleSheet.absoluteFill, shown]} pointerEvents="none">
      <Text style={[styles.meterLabel, { left: x - 12, width: MTR_W + 24 }]}>{label}</Text>
      <View style={[styles.meterTrack, { left: x }]}>
        <Animated.View style={[styles.meterFill, fill]} />
        {/* Quarter rules ON TOP of the fill, so a full meter still reads as a
            graduated gauge rather than a solid black domino. */}
        <View style={[styles.meterTick, { top: MTR_H * 0.25 }]} />
        <View style={[styles.meterTick, { top: MTR_H * 0.5 }]} />
        <View style={[styles.meterTick, { top: MTR_H * 0.75 }]} />
      </View>
    </Animated.View>
  );
}

// ── the contract nobody signed ───────────────────────────────────────────────
// "No one ever signed such a contract, and no one needs to." A sheet with a title
// and two empty signature lines, each with the mark a hand would sign beside.

function Contract({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({
    opacity: S.value.paper,
    transform: [
      { translateY: (1 - S.value.paper) * -8 },
      { rotate: `${-3 + Math.sin(S.value.t * 0.6) * 0.8}deg` },
    ],
  }));
  return (
    <Animated.View style={[styles.contract, st]} pointerEvents="none">
      <Text style={styles.contractTitle}>CONTRACT</Text>
      <View style={styles.signRow}>
        <Text style={styles.signMark}>×</Text>
        <View style={styles.signLine} />
      </View>
      <View style={styles.signRow}>
        <Text style={styles.signMark}>×</Text>
        <View style={styles.signLine} />
      </View>
    </Animated.View>
  );
}

// ── clash marks above the brawl, gone once the peace holds ───────────────────

function Spark({ S, x }: { S: SharedValue<any>; x: number }) {
  const st = useAnimatedStyle(() => {
    const blink = Math.max(0, Math.sin(S.value.t * 4.6 + x));
    return { opacity: blink * S.value.fight * 0.85, transform: [{ scale: 0.7 + blink * 0.3 }] };
  });
  return (
    <Animated.View style={[styles.sparkWrap, { left: x - 11 }, st]} pointerEvents="none">
      <View style={[styles.sparkBar, { transform: [{ rotate: '0deg' }] }]} />
      <View style={[styles.sparkBar, { transform: [{ rotate: '45deg' }] }]} />
      <View style={[styles.sparkBar, { transform: [{ rotate: '90deg' }] }]} />
      <View style={[styles.sparkBar, { transform: [{ rotate: '135deg' }] }]} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 56, right: 56, top: GROUND, height: 1.5, backgroundColor: RULE },
  // THE FLOOR THE GROUND LINE SITS ON. A rule on its own leaves the
  // figure and everything it is looking at standing on bare page;
  // political7 and political8 both stand their subject on a filled mass.
  floor: floorStyle(TONE, GROUND),
  pedestal: {
    position: 'absolute', left: SOV_X - 28, top: GROUND - PED, width: 56, height: PED,
    backgroundColor: PAPER, borderWidth: 2, borderColor: INK,
    transformOrigin: '50% 100%',
  },

  headWrap: { position: 'absolute', left: 0, right: 0, top: 244, alignItems: 'center' },
  headText: {
    fontFamily: 'Inter_700Bold', fontSize: 13, letterSpacing: 1.8, lineHeight: 17, color: INK,
    includeFontPadding: false,
  },
  strike: {
    position: 'absolute', left: -5, right: -5, top: 8, height: 2.5,
    backgroundColor: INK, transformOrigin: '0% 50%',
  },

  // 262..273 — under the headline's descender line (261) and one unit clear of
  // the flow boxes' top edge (274).
  ledger: { position: 'absolute', left: 0, right: 0, top: 262, height: 12 },
  ledgerText: {
    position: 'absolute', left: 0, right: 0, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.2, lineHeight: 11,
    color: SOFT, includeFontPadding: false,
  },

  flowBox: { position: 'absolute', top: FLOW_T, width: FLOW_W, height: FLOW_H },
  flowFixed: {
    borderWidth: 2, borderColor: INK, borderRadius: 5, backgroundColor: PLATE_FACE, boxShadow: LIP,
    alignItems: 'center', justifyContent: 'center',
  },
  flowOff: {
    borderWidth: 2, borderColor: SOFT, borderRadius: 5, backgroundColor: STONE, boxShadow: LIP,
    alignItems: 'center', justifyContent: 'center',
  },
  flowOn: {
    borderWidth: 2, borderColor: INK, borderRadius: 5, backgroundColor: INK,
    alignItems: 'center', justifyContent: 'center',
  },
  flowTextFixed: {
    fontFamily: 'Inter_700Bold', fontSize: 12, letterSpacing: 0.8, color: INK, includeFontPadding: false,
  },
  flowTextOff: {
    fontFamily: 'Inter_700Bold', fontSize: 12, letterSpacing: 0.8, color: INK, includeFontPadding: false,
  },
  flowTextOn: {
    fontFamily: 'Inter_700Bold', fontSize: 12, letterSpacing: 0.8, color: PAPER, includeFontPadding: false,
  },
  arrowWrap: { position: 'absolute', top: FLOW_T + 6, width: 24, height: 22 },
  arrow: {
    position: 'absolute', left: 0, right: 0, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 17, color: SOFT, includeFontPadding: false,
  },
  arrowOn: { color: INK },

  meterLabel: {
    position: 'absolute', top: 364, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 1.2, color: SOFT, includeFontPadding: false,
  },
  meterTrack: {
    position: 'absolute', top: MTR_T, width: MTR_W, height: MTR_H,
    borderWidth: 1.5, borderColor: INK, borderRadius: 8, backgroundColor: STONE, boxShadow: LIP, overflow: 'hidden',
  },
  meterFill: {
    position: 'absolute', left: 0, right: 0, top: 0, bottom: 0,
    backgroundColor: INK, transformOrigin: '50% 100%',
  },
  meterTick: { position: 'absolute', left: 0, right: 0, height: 1.5, backgroundColor: RULE },

  sparkWrap: { position: 'absolute', top: 353, width: 22, height: 22, alignItems: 'center', justifyContent: 'center' },
  sparkBar: { position: 'absolute', width: 2.5, height: 22, backgroundColor: INK, borderRadius: 1 },

  // Right of the sovereign's crown and sword, left of the PEACE gauge's label (344).
  contract: {
    position: 'absolute', left: 266, top: 318, width: 72, height: 40,
    backgroundColor: PAPER, borderWidth: 2, borderColor: INK, borderRadius: 8,
    alignItems: 'center', paddingTop: 4, transformOrigin: '50% 0%',
  },
  contractTitle: {
    fontFamily: 'Inter_700Bold', fontSize: 8.8, letterSpacing: 0.9, color: INK, includeFontPadding: false,
  },
  signRow: { flexDirection: 'row', alignItems: 'flex-end', width: 56, height: 11, marginTop: 1 },
  signMark: { fontFamily: 'Inter_700Bold', fontSize: 9, lineHeight: 10, color: INK, includeFontPadding: false, width: 9 },
  signLine: { flex: 1, height: 1.5, backgroundColor: SOFT, marginBottom: 2 },
  rider: { position: 'absolute', left: 0, top: 0 },
  swordBlade: { position: 'absolute', left: -2, top: -46, width: 4, height: 46, backgroundColor: INK },
  swordGuard: { position: 'absolute', left: -10, top: -4, width: 20, height: 3.5, backgroundColor: INK, borderRadius: 2 },
  swordPommel: { position: 'absolute', left: -3.5, top: 2, width: 7, height: 7, borderRadius: 3.5, backgroundColor: INK },
  crownBand: { position: 'absolute', left: -14, top: 0, width: 28, height: 8, backgroundColor: INK, borderRadius: 1 },
  crownPoint: {
    position: 'absolute', top: -8, width: 0, height: 0,
    borderLeftWidth: 3, borderRightWidth: 3, borderBottomWidth: 9,
    borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: INK,
  },
});

// Extremes: the headline's cap-line (244) down to the citizens' ankle joints
// (~506, on the ground rule at 500 with the smaller CIT_K). Between them: the
// ledger strip 262..273, the flow 274..308, the clash marks 353..375, the meter
// labels 364..375 and the meter tracks 382..494. The sovereign's crown points and
// his sword tip both top out at y ≈ 320, twelve units clear of the flow above.
//
// 280 units is also the tightest band that still pays: the stage region is about
// 923×647 device px, so 647/280 ≈ 923/400. Any narrower and the WIDTH caps the
// scale — the art stops growing while the clipping risk keeps climbing.
export function PoliticalLesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={PoliticalScene} band={[234, 514]} camera={CAM} />;
}
