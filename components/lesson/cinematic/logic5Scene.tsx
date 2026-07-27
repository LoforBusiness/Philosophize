import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { climb, ease01, emoteHold, emoteLive, lerp, mixStance, pose, type Bundle, type Stance } from './rig';
import { BEATS } from './logic5Script';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER } from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';

// The figure stands on the LEFT (and climbs a ladder in the same spot) so the whole
// right-hand column — x 150…386 — is free for information design that is drawn BIG:
//
//   · THE PIPELINE   PREMISE → PREMISE → [gears: INFERENCE] → ∴ CONCLUSION, a proper
//                    top-to-bottom flow diagram with a token riding the arrows.
//   · Q1 THE PROOF   Euclid I.1 written out as four stacked cards with one left blank.
//                    Tap the gap and the missing common notion writes itself in.
//   · THE STAIRCASE  a four-bar step chart beside the ladder — divide, then climb.
//   · Q2 THE CHUTES  two full-width bins; the proof card slides into whichever you tap.
//
// Camera is IDENTITY, so these constants ARE the final stage coordinates and the band
// at the bottom of this file can be read straight off them.

const FIG_X = 76;
const LADDER_X = 76;
const RUNG_SP = 30;
const LADDER_T = 300;
const LADDER_H = GROUND - LADDER_T;        // 200

// the right-hand column every diagram is laid out in
const COL_L = 150;
const COL_W = 236;
const MID = COL_L + COL_W / 2;             // 268

// ── the pipeline ─────────────────────────────────────────────────────────────
const P1_T = 238;
const P2_T = 288;
const PIPE_BOX_H = 44;
const A1_T = 334;                          // arrow 1: shaft 334–342, head 342–354
const GEAR_T = 354;
const GEAR_H = 66;                         // 354–420
const GEAR_L = 196;
const GEAR_W = 144;
const GEAR_CY = 396;
const A2_T = 422;                          // arrow 2: shaft 422–430, head 430–442
const CONCL_T = 444;                       // 444–488

// ── Q1: the four-card proof ──────────────────────────────────────────────────
const CHAIN_HDR_T = 232;
const CARD_T = 254;
const CARD_H = 44;
const CARD_GAP = 14;
const STEPS_TEXT = [
  { id: 's1', text: 'AB = AC', gap: false },
  { id: 's2', text: 'AB = BC', gap: false },
  { id: 'gap', text: '?   ?   ?', gap: true },
  { id: 's4', text: 'SO  AC = BC', gap: false },
];
const MISSING = 'EQUALS OF EQUALS ARE EQUAL';

// ── the staircase chart ──────────────────────────────────────────────────────
// Four rising bars, each capped with the move it stands for, so the staircase is
// the PIPELINE again — premise, premise, inference, conclusion — but climbed.
const STAIR_BASE = 494;
const STAIR_HDR_T = 318;
const STAIRS = [
  { n: '1', tag: 'PREMISE', left: 168, h: 34 },
  { n: '2', tag: 'PREMISE', left: 222, h: 68 },
  { n: '3', tag: 'INFER', left: 276, h: 102 },
  { n: '4', tag: 'CONCLUDE', left: 330, h: 136 },
];
const STAIR_W = 54;
const STAIR_TAG_H = 15;

// ── Q2: the two chutes ───────────────────────────────────────────────────────
const CHUTE_HDR_T = 232;
const PROOF_T = 256;
const PROOF_H = 46;
const BIN_H = 54;
const BINS = [
  { id: 'trust', label: 'TRUST IT', top: 328, correct: false },
  { id: 'check', label: 'CHECK IT', top: 398, correct: true },
];
const PROOF_CY = PROOF_T + PROOF_H / 2;    // 279

const P_CODE = BEATS.map((b) => b.p ?? 0);
const CLIMB = BEATS.map((b) => b.climb ?? 0);
const MACHINE = BEATS.map((b) => b.machine ?? 0);
const RUN = BEATS.map((b) => b.run ?? 0);
const CHAIN = BEATS.map((b) => b.chain ?? 0);
const LADDER = BEATS.map((b) => b.ladder ?? 0);
const STAIRV = BEATS.map((b) => b.steps ?? 0);
const CHUTE = BEATS.map((b) => b.chute ?? 0);

export default function Logic5Scene({ clock, bt, bi, qv, i, picked, onPick }: SceneApi) {
  const cur = BEATS[i];
  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / 0.85);
    const t = clock.value;

    const climbNow = CLIMB[n] > 0.5, climbPrev = CLIMB[p] > 0.5;
    const stanceOf = (idx: number, isClimb: boolean, useLive: boolean): Stance => {
      'worklet';
      if (isClimb) return climb(t * 3.4);
      return useLive ? emoteLive(P_CODE[idx], t, bt.value) : emoteHold(P_CODE[idx], t);
    };
    const s = mixStance(stanceOf(p, climbPrev, false), stanceOf(n, climbNow, true), tr);

    return {
      fig: pose(s, lerp(climbPrev ? LADDER_X : FIG_X, climbNow ? LADDER_X : FIG_X, tr), GROUND, K_FIG, 1, 1),
      machine: lerp(MACHINE[p], MACHINE[n], tr),
      run: lerp(RUN[p], RUN[n], tr),
      chain: lerp(CHAIN[p], CHAIN[n], tr),
      ladder: lerp(LADDER[p], LADDER[n], tr),
      stairs: lerp(STAIRV[p], STAIRV[n], tr),
      chute: lerp(CHUTE[p], CHUTE[n], tr),
      gear: t * 80,
      feed: (t * 0.55) % 1,
      scroll: (t * 46) % RUNG_SP,          // rungs scroll DOWN so the climber ascends
      qv: qv.value,
      t,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const machineStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.machine }));
  const gearA = useAnimatedStyle(() => ({ transform: [{ rotate: `${SCENE.value.gear}deg` }] }));
  const gearB = useAnimatedStyle(() => ({ transform: [{ rotate: `${-SCENE.value.gear}deg` }] }));
  const tokAStyle = useAnimatedStyle(() => {
    const u = Math.min(1, SCENE.value.feed / 0.5);
    return { opacity: SCENE.value.run * Math.sin(Math.PI * u), transform: [{ translateY: u * 18 }] };
  });
  const tokBStyle = useAnimatedStyle(() => {
    const u = Math.max(0, (SCENE.value.feed - 0.5) / 0.5);
    return { opacity: SCENE.value.run * Math.sin(Math.PI * u), transform: [{ translateY: u * 18 }] };
  });
  const ladderStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.ladder }));
  const rungsStyle = useAnimatedStyle(() => ({ transform: [{ translateY: SCENE.value.scroll }] }));
  const stairStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.stairs }));
  const chainStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.chain }));
  const chuteStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.chute }));

  const answered = picked !== null;
  const showChain = (cur.chain ?? 0) > 0 && !!cur.interact;
  const showChutes = (cur.chute ?? 0) > 0 && !!cur.interact;

  return (
    <View style={styles.scene}>
      <View style={styles.ground} pointerEvents="none" />

      {/* ── the ladder (rungs scroll down → the figure climbs upward) ──────── */}
      <Animated.View style={[styles.fill, ladderStyle]} pointerEvents="none">
        <View style={[styles.rail, { left: LADDER_X - 18 }]} />
        <View style={[styles.rail, { left: LADDER_X + 13 }]} />
        <View style={styles.rungClip}>
          <Animated.View style={[styles.rungInner, rungsStyle]}>
            {[-1, 0, 1, 2, 3, 4, 5, 6, 7].map((r) => (
              <View key={r} style={[styles.rung, { top: r * RUNG_SP }]} />
            ))}
          </Animated.View>
        </View>
      </Animated.View>

      {/* ── the staircase chart: divide it, then climb it ──────────────────── */}
      <Animated.View style={[styles.fill, stairStyle]} pointerEvents="none">
        <Text style={styles.stairHdr}>ONE STEP AT A TIME</Text>
        {STAIRS.map((s) => (
          <Text key={`t${s.n}`} style={[styles.stairTag, { left: s.left, top: STAIR_BASE - s.h - STAIR_TAG_H }]}>
            {s.tag}
          </Text>
        ))}
        {STAIRS.map((s) => (
          <View key={s.n} style={[styles.stair, { left: s.left, top: STAIR_BASE - s.h, height: s.h }]}>
            <Text style={styles.stairNum}>{s.n}</Text>
          </View>
        ))}
      </Animated.View>

      {/* ── the pipeline: premises → inference → conclusion ────────────────── */}
      <Animated.View style={[styles.fill, machineStyle]} pointerEvents="none">
        <View style={[styles.pipeBox, { top: P1_T }]}>
          <Text style={styles.pipeTag}>PREMISE</Text>
          <Text style={styles.pipeVal}>AB = AC</Text>
        </View>
        <View style={[styles.pipeBox, { top: P2_T }]}>
          <Text style={styles.pipeTag}>PREMISE</Text>
          <Text style={styles.pipeVal}>AB = BC</Text>
        </View>

        <View style={[styles.shaft, { top: A1_T }]} />
        <View style={[styles.head, { top: A1_T + 8 }]} />
        <Animated.View style={[styles.token, { top: A1_T }, tokAStyle]} />

        <View style={styles.gearBox}>
          <Text style={styles.gearLabel}>INFERENCE</Text>
        </View>
        <Animated.View style={[styles.gear, { left: 240 - 23 }, gearA]}><Gear /></Animated.View>
        <Animated.View style={[styles.gear, { left: 296 - 23 }, gearB]}><Gear /></Animated.View>

        <View style={[styles.shaft, { top: A2_T }]} />
        <View style={[styles.head, { top: A2_T + 8 }]} />
        <Animated.View style={[styles.token, { top: A2_T }, tokBStyle]} />

        <View style={[styles.pipeBox, styles.pipeOut, { top: CONCL_T }]}>
          <Text style={[styles.pipeTag, styles.onPaper]}>CONCLUSION</Text>
          <Text style={[styles.pipeVal, styles.onPaper]}>∴  AC = BC</Text>
        </View>
      </Animated.View>

      {/* the figure */}
      <Stickman D={DF} k={K_FIG} />

      {/* ── Q1: Euclid's proof with one step left blank ────────────────────── */}
      {showChain && (
        <>
          <Animated.View style={[styles.fill, chainStyle]} pointerEvents="none">
            <Text style={styles.qHdr}>TAP THE MISSING STEP</Text>
            {[0, 1, 2].map((g) => (
              <View key={g} style={[styles.chev, { top: CARD_T + (g + 1) * CARD_H + g * CARD_GAP + 3 }]} />
            ))}
          </Animated.View>
          {STEPS_TEXT.map((st, k) => (
            <ProofCard
              key={st.id} st={st} top={CARD_T + k * (CARD_H + CARD_GAP)}
              S={SCENE} answered={answered} picked={picked} onPick={onPick}
            />
          ))}
        </>
      )}

      {/* ── Q2: send the proof down a chute ────────────────────────────────── */}
      {showChutes && (
        <>
          <Animated.View style={[styles.fill, chuteStyle]} pointerEvents="none">
            <Text style={styles.qHdr}>TAP THE RIGHT CHUTE</Text>
          </Animated.View>
          {BINS.map((b) => (
            <Bin key={b.id} b={b} answered={answered} picked={picked} onPick={onPick} />
          ))}
          <ProofSlip S={SCENE} picked={picked} />
        </>
      )}
    </View>
  );
}

function Gear() {
  return (
    <View style={styles.gearInner}>
      {[0, 45, 90, 135].map((a) => <View key={a} style={[styles.tooth, { transform: [{ rotate: `${a}deg` }] }]} />)}
    </View>
  );
}

/** One line of the proof. The blank one fills with ink and writes its missing step in. */
function ProofCard({ st, top, S, answered, picked, onPick }: {
  st: { id: string; text: string; gap: boolean }; top: number;
  S: SharedValue<any>; answered: boolean; picked: string | null;
  onPick: (id: string, correct: boolean) => void;
}) {
  const chosen = picked === st.id;
  const wrap = useAnimatedStyle(() => ({ opacity: S.value.chain }));
  const fill = useAnimatedStyle(() => ({ opacity: st.gap ? S.value.qv : 0 }));
  const before = useAnimatedStyle(() => ({ opacity: st.gap ? 1 - S.value.qv : 1 }));
  const after = useAnimatedStyle(() => ({ opacity: st.gap ? S.value.qv : 0 }));
  return (
    <Animated.View style={[styles.cardHit, { top }, wrap]}>
      <Pressable disabled={answered} onPress={() => onPick(st.id, st.gap)} style={styles.press}>
        <View style={[styles.card, answered && chosen && !st.gap && styles.cardWrong]}>
          <Animated.View style={[styles.cardFill, fill]} pointerEvents="none" />
          <Animated.View style={[styles.cardText, before]}>
            <Text style={st.gap ? styles.cardGapT : styles.cardT}>{st.text}</Text>
          </Animated.View>
          {st.gap ? (
            <Animated.View style={[styles.cardText, after]}>
              <Text style={styles.cardRevealT}>{MISSING}</Text>
            </Animated.View>
          ) : null}
        </View>
      </Pressable>
    </Animated.View>
  );
}

function Bin({ b, answered, picked, onPick }: {
  b: { id: string; label: string; top: number; correct: boolean };
  answered: boolean; picked: string | null; onPick: (id: string, correct: boolean) => void;
}) {
  const chosen = picked === b.id;
  return (
    <Pressable
      style={[styles.binHit, { top: b.top }]}
      disabled={answered}
      onPress={() => onPick(b.id, b.correct)}
    >
      <View style={[styles.bin, answered && b.correct && styles.binRight, answered && chosen && !b.correct && styles.binWrong]}>
        <Text style={[styles.binT, answered && b.correct && styles.onPaper]}>{b.label}</Text>
      </View>
    </Pressable>
  );
}

/** The proof being judged — it slides into whichever bin was tapped. */
function ProofSlip({ S, picked }: { S: SharedValue<any>; picked: string | null }) {
  const target = BINS.find((b) => b.id === picked);
  const dy = target ? target.top + BIN_H / 2 - PROOF_CY : 0;
  const st = useAnimatedStyle(() => ({
    opacity: S.value.chute,
    transform: [{ translateY: dy * S.value.qv }],
  }));
  return (
    <Animated.View style={[styles.proof, st]} pointerEvents="none">
      <Text style={styles.proofTag}>THE PROOF</Text>
      <Text style={styles.proofT}>SKIPS 3 STEPS</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  fill: { position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 },
  ground: { position: 'absolute', left: 24, right: 20, top: GROUND, height: 1.5, backgroundColor: RULE },
  onPaper: { color: PAPER },

  // ── ladder ─────────────────────────────────────────────────────────────────
  rail: { position: 'absolute', top: LADDER_T, width: 5, height: LADDER_H, backgroundColor: INK, borderRadius: 3 },
  rungClip: { position: 'absolute', left: LADDER_X - 18, top: LADDER_T, width: 36, height: LADDER_H, overflow: 'hidden' },
  rungInner: { position: 'absolute', left: 0, top: 0, width: 36, height: LADDER_H },
  rung: { position: 'absolute', left: 0, width: 36, height: 5, backgroundColor: INK, borderRadius: 3 },

  // ── staircase chart ────────────────────────────────────────────────────────
  stairHdr: {
    position: 'absolute', left: COL_L, top: STAIR_HDR_T, width: COL_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.4, color: SOFT,
  },
  stairTag: {
    position: 'absolute', width: STAIR_W, height: STAIR_TAG_H, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 0.4, color: SOFT, includeFontPadding: false,
  },
  stair: {
    position: 'absolute', width: STAIR_W, borderWidth: 2.5, borderColor: INK,
    backgroundColor: PAPER, alignItems: 'center', paddingTop: 5,
  },
  stairNum: { fontFamily: 'Inter_700Bold', fontSize: 14, color: INK, includeFontPadding: false },

  // ── pipeline ───────────────────────────────────────────────────────────────
  pipeBox: {
    position: 'absolute', left: COL_L, width: COL_W, height: PIPE_BOX_H,
    borderWidth: 2.5, borderColor: INK, borderRadius: 6, backgroundColor: PAPER,
    alignItems: 'center', justifyContent: 'center',
  },
  pipeOut: { backgroundColor: INK },
  pipeTag: { fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 1.6, color: SOFT, includeFontPadding: false },
  pipeVal: { fontFamily: 'Inter_700Bold', fontSize: 16, letterSpacing: 0.6, color: INK, marginTop: 1, includeFontPadding: false },

  shaft: { position: 'absolute', left: MID - 3, width: 6, height: 8, backgroundColor: INK },
  head: {
    position: 'absolute', left: MID - 9, width: 0, height: 0,
    borderLeftWidth: 9, borderRightWidth: 9, borderTopWidth: 12,
    borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: INK,
  },
  token: { position: 'absolute', left: MID - 5, width: 10, height: 10, backgroundColor: INK, borderRadius: 2 },

  gearBox: {
    position: 'absolute', left: GEAR_L, top: GEAR_T, width: GEAR_W, height: GEAR_H,
    borderWidth: 2.5, borderColor: INK, borderRadius: 8, backgroundColor: PAPER, alignItems: 'center', paddingTop: 5,
  },
  gearLabel: { fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.6, color: SOFT, includeFontPadding: false },
  gear: {
    position: 'absolute', top: GEAR_CY - 23, width: 46, height: 46,
    alignItems: 'center', justifyContent: 'center', transformOrigin: '50% 50%',
  },
  gearInner: { width: 32, height: 32, borderRadius: 16, borderWidth: 3.5, borderColor: INK, alignItems: 'center', justifyContent: 'center' },
  tooth: { position: 'absolute', width: 46, height: 6, backgroundColor: INK, borderRadius: 1 },

  // ── Q1: proof cards ────────────────────────────────────────────────────────
  qHdr: {
    position: 'absolute', left: COL_L, top: CHAIN_HDR_T, width: COL_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.4, color: SOFT,
  },
  chev: {
    position: 'absolute', left: MID - 6, width: 0, height: 0,
    borderLeftWidth: 6, borderRightWidth: 6, borderTopWidth: 8,
    borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: SOFT,
  },
  cardHit: { position: 'absolute', left: COL_L, width: COL_W },
  press: { width: '100%' },
  card: {
    width: COL_W, height: CARD_H, borderWidth: 2.5, borderColor: INK, borderRadius: 6,
    backgroundColor: PAPER, overflow: 'hidden',
  },
  cardWrong: { borderColor: SOFT, opacity: 0.45 },
  cardFill: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: INK },
  cardText: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  cardT: { fontFamily: 'Inter_700Bold', fontSize: 16, letterSpacing: 0.6, color: INK, includeFontPadding: false },
  cardGapT: { fontFamily: 'Inter_700Bold', fontSize: 18, letterSpacing: 2, color: SOFT, includeFontPadding: false },
  cardRevealT: { fontFamily: 'Inter_700Bold', fontSize: 13.5, letterSpacing: 0.4, color: PAPER, includeFontPadding: false },

  // ── Q2: chutes ─────────────────────────────────────────────────────────────
  binHit: { position: 'absolute', left: COL_L, width: COL_W },
  bin: {
    width: COL_W, height: BIN_H, borderWidth: 3, borderColor: INK, borderRadius: 8,
    backgroundColor: PAPER, alignItems: 'center', justifyContent: 'center',
  },
  binRight: { backgroundColor: INK, borderColor: INK },
  binWrong: { borderColor: SOFT, opacity: 0.45 },
  binT: { fontFamily: 'Inter_700Bold', fontSize: 17, letterSpacing: 1, color: INK, includeFontPadding: false },

  proof: {
    position: 'absolute', left: MID - 90, top: PROOF_T, width: 180, height: PROOF_H,
    borderWidth: 2.5, borderColor: INK, borderRadius: 6, backgroundColor: PAPER,
    alignItems: 'center', justifyContent: 'center',
  },
  proofTag: { fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 1.6, color: SOFT, includeFontPadding: false },
  proofT: { fontFamily: 'Inter_700Bold', fontSize: 14, letterSpacing: 0.4, color: INK, marginTop: 1, includeFontPadding: false },
});

// Extremes across every beat: the Q headers at y 232, the pipeline 238–488, the proof
// cards 254–472, the ladder 300–500, the staircase (header 318, tallest step's cap at
// 343) down to its base at 494, the chutes 232–452, the figure's crown ≈358 down to its
// feet at 500, and the ground rule at 501.5. Nothing is drawn above 232 or below 501.5,
// so [224, 510] renders the stage at ~2.26×.
export function Logic5Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Logic5Scene} band={[224, 510]} />;
}
