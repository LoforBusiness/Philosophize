import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import {
  WALK, clamp01, dirsFrom, ease01, emoteHold, emoteLive, lerp, moveTr, pose, travelStance, type Bundle,
} from './rig';
import { BEATS } from './political8Script';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER } from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';

// THE FENCE. Stage right, a picket fence with a goal beyond it and three onlookers
// of very different heights peering over. Stage left, a stack of three spare crates.
// The narrator walks the crates across, hands out identical shares, then moves one
// crate and the whole eye line goes level.
//
// COMPOSITION / OCCLUSION —
//   · the narrator only ever stands at x = 100 (by the crate pile) or x = 170 (at
//     the fence), and he walks that 70-unit gap SIX times. His widest reach is the
//     point-forward gesture at x = 170: fist 34 rig units out, +1 fist radius, at
//     K_FIG 1.35 → x ≈ 223. Facing left at x = 100 the carry pose reaches x ≈ 58.
//   · so the figure's body band is x ≈ 58 … 223 and NOTHING readable lives there:
//       – the crate pile is x = 6 … 46          (left of the band)
//       – the fence, crates, onlookers, badges and eye line are x = 232 … 396
//         (right of the band)
//       – the goal, the Q1 label and the three answer cards sit at y = 62 … 326,
//         entirely above y = 350 (a walking crown rides to y ≈ 357).
//   · nothing is drawn between x = 46 and x = 232 except the figure and the crate
//     he is carrying, which is meant to be on top of him.
//
// GEOMETRY — a crate is 22 tall, so standing on n crates lifts an onlooker 22n.
// Heights are chosen so that 0/1/2 crates puts all three heads at y = 382 and all
// three eye lines at y = 391, exactly 9 above the top rail at y = 400. One crate
// EACH instead leaves the shortest at 413 — still behind the fence.

const BOX_W = 40;
const BOX_H = 22;

const FENCE_L = 232;
const FENCE_W = 164;              // 232 … 396
const RAIL_TOP = 400;
const PICKETS = [234, 266, 298, 330, 362, 389];

const PILE_L = 6;                 // the spare crates, 6 … 46
// One shared stack geometry: slot 0 sits on the ground, each slot 22 above the last.
const SLOT_TOPS = [GROUND - BOX_H, GROUND - 2 * BOX_H, GROUND - 3 * BOX_H];

const EYE_Y = 390;
const EYE_X = Array.from({ length: 16 }, (_, k) => 236 + k * 10);

const CARD_L = 50;
const CARD_W = 300;
// SIZED FOR A FINGER. Band 460 units → fit 0.65, so a 34-unit card rendered at
// 22dp on a 27dp pitch: the smallest touch target in the app, less than half the
// 48dp minimum. The stack now runs 208 → 348, clear of the crown at 397.
const CARD_H = 48;
const CARD_T = 208;
const CARD_GAP = 70;
/** Half the gap — more would overlap the neighbour, and the topmost would win. */
const CARD_SLOP = (CARD_GAP - CARD_H) / 2;

// TALLEST / MIDDLE / SHORTEST — the bar is a little height glyph that ties each
// card back to the onlooker it stands for.
const CARDS = [
  { id: 'tall', label: 'TALLEST', bar: 22, correct: false },
  { id: 'mid', label: 'MIDDLE', bar: 17, correct: false },
  { id: 'short', label: 'SHORTEST', bar: 12, correct: true },
];

// mode 0 = no crates · 1 = one each · 2 = shared out by need.
const CNT0 = [0, 1, 0];           // tallest
const CNT1 = [0, 1, 1];           // middle
const CNT2 = [0, 1, 2];           // shortest
const SEES = [
  [true, false, false],
  [true, true, false],
  [true, true, true],
];

const P = BEATS.map((b) => b.p ?? 0);
const X = BEATS.map((b) => b.x ?? 170);
const DIR = dirsFrom(X, 1);
const MODE = BEATS.map((b) => b.mode ?? 0);
const N0 = MODE.map((m) => CNT0[m]);
const N1 = MODE.map((m) => CNT1[m]);
const N2 = MODE.map((m) => CNT2[m]);
const PILEV = BEATS.map((b) => b.pile ?? 0);
const CARRYV = BEATS.map((b) => b.carry ?? 0);
const MARKV = BEATS.map((b) => b.marks ?? 0);
const EYEV = BEATS.map((b) => b.eyeline ?? 0);

export default function Political8Scene({ clock, bt, bi, i, picked, onPick }: SceneApi) {
  const cur = BEATS[i];
  const prev = i > 0 ? BEATS[i - 1] : undefined;

  // The badges only re-animate on the beat that CHANGES the crate layout, so they
  // don't flicker every time the reader taps forward.
  const mode = cur.mode ?? 0;
  const modeFade = mode !== (prev?.mode ?? 0);
  const sees = SEES[mode];

  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / moveTr(X[p], X[n], 0.85));
    const t = clock.value;
    const grow = ease01(bt.value / 0.55);

    // The canonical travel body: walks the gap when the beat moves him, blends
    // gesture-to-gesture when it doesn't. WALK is passed EXPLICITLY — a Gait left
    // to a default parameter is not captured into the worklet runtime.
    const s = travelStance(
      X[p], X[n],
      emoteHold(P[p], t), emoteHold(P[n], t), emoteLive(P[n], t, bt.value),
      tr, WALK,
    );
    const fx = lerp(X[p], X[n], tr);

    return {
      fig: pose(s, fx, GROUND, K_FIG, DIR[n], 1),
      // The crate in his arms rides just in front of whichever way he faces.
      carry: lerp(CARRYV[p], CARRYV[n], tr),
      carryX: fx + DIR[n] * 30,
      pile: lerp(PILEV[p], PILEV[n], tr),
      marks: lerp(MARKV[p], MARKV[n], tr) * (modeFade ? grow : 1),
      eye: lerp(EYEV[p], EYEV[n], tr),
      // Crate counts lerp, so an onlooker RISES smoothly as a crate slides under
      // them and the crate itself fades in beneath their feet.
      n0: lerp(N0[p], N0[n], tr),
      n1: lerp(N1[p], N1[n], tr),
      n2: lerp(N2[p], N2[n], tr),
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);

  const riseT = useAnimatedStyle(() => ({ transform: [{ translateY: -BOX_H * SCENE.value.n0 }] }));
  const riseM = useAnimatedStyle(() => ({ transform: [{ translateY: -BOX_H * SCENE.value.n1 }] }));
  const riseS = useAnimatedStyle(() => ({ transform: [{ translateY: -BOX_H * SCENE.value.n2 }] }));
  const crateT = useAnimatedStyle(() => ({ opacity: clamp01(SCENE.value.n0) }));
  const crateM = useAnimatedStyle(() => ({ opacity: clamp01(SCENE.value.n1) }));
  const crateS0 = useAnimatedStyle(() => ({ opacity: clamp01(SCENE.value.n2) }));
  const crateS1 = useAnimatedStyle(() => ({ opacity: clamp01(SCENE.value.n2 - 1) }));
  const badgeStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.marks }));
  const pileStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.pile }));
  const eyeStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.eye }));
  const carryStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.carry,
    transform: [{ translateX: SCENE.value.carryX }],
  }));

  const answered = picked !== null;
  const showPick = (cur.pick ?? 0) > 0 && !!cur.interact;

  return (
    <Animated.View style={styles.scene}>
      {/* ── the match, away over the fence ──────────────────────────────────── */}
      <View style={styles.layer} pointerEvents="none">
        <Text style={styles.matchLabel}>THE MATCH  ·  FAR SIDE</Text>
        <View style={styles.crossbar} />
        <View style={styles.postL} />
        <View style={styles.postR} />
        <View style={[styles.netV, { left: 312 }]} />
        <View style={[styles.netV, { left: 340 }]} />
        <View style={styles.netH} />
        <View style={styles.pitchLine} />
        <View style={styles.ball} />
      </View>

      {/* ── the fence itself ────────────────────────────────────────────────── */}
      <View style={styles.layer} pointerEvents="none">
        {PICKETS.map((px) => (
          <View key={px} style={[styles.picket, { left: px }]} />
        ))}
        <View style={styles.midRail} />
        <View style={styles.topRail} />
      </View>

      {/* ── the level eye line, drawn BEHIND the onlookers so it reads through ─ */}
      <Animated.View style={[styles.layer, eyeStyle]} pointerEvents="none">
        {EYE_X.map((ex) => (
          <View key={ex} style={[styles.dash, { left: ex }]} />
        ))}
        <Text style={styles.eyeLabel}>EYE LINE</Text>
      </Animated.View>

      {/* ── the crates that end up under their feet ─────────────────────────── */}
      <Animated.View style={[styles.crate, { left: 252, top: SLOT_TOPS[0] }, crateT]} pointerEvents="none">
        <View style={styles.brace} />
      </Animated.View>
      <Animated.View style={[styles.crate, { left: 300, top: SLOT_TOPS[0] }, crateM]} pointerEvents="none">
        <View style={styles.brace} />
      </Animated.View>
      <Animated.View style={[styles.crate, { left: 346, top: SLOT_TOPS[0] }, crateS0]} pointerEvents="none">
        <View style={styles.brace} />
      </Animated.View>
      <Animated.View style={[styles.crate, { left: 346, top: SLOT_TOPS[1] }, crateS1]} pointerEvents="none">
        <View style={styles.brace} />
      </Animated.View>

      {/* ── the three onlookers: capsule bodies, not full rigs (cheap on purpose) */}
      {/* TALLEST — h 118, so head top y = 500 − 118 − 32 + 32 = 382 with no crate. */}
      <Animated.View style={[styles.folk, { left: 242, top: 350, height: 150 }, riseT]} pointerEvents="none">
        <Animated.View style={[styles.badge, sees[0] && styles.badgeOn, badgeStyle]}>
          <Text style={[styles.badgeText, sees[0] && styles.badgeTextOn]}>{sees[0] ? 'SEES' : 'BLOCKED'}</Text>
        </Animated.View>
        <View style={styles.folkHead} />
        <View style={[styles.folkTorso, { height: 74 }]} />
        <View style={[styles.folkLeg, { left: 25, top: 124 }]} />
        <View style={[styles.folkLeg, { left: 32, top: 124 }]} />
      </Animated.View>

      {/* MIDDLE — h 96: one crate brings the head to 382. */}
      <Animated.View style={[styles.folk, { left: 290, top: 372, height: 128 }, riseM]} pointerEvents="none">
        <Animated.View style={[styles.badge, sees[1] && styles.badgeOn, badgeStyle]}>
          <Text style={[styles.badgeText, sees[1] && styles.badgeTextOn]}>{sees[1] ? 'SEES' : 'BLOCKED'}</Text>
        </Animated.View>
        <View style={styles.folkHead} />
        <View style={[styles.folkTorso, { height: 52 }]} />
        <View style={[styles.folkLeg, { left: 25, top: 102 }]} />
        <View style={[styles.folkLeg, { left: 32, top: 102 }]} />
      </Animated.View>

      {/* SHORTEST — h 74: needs TWO crates to reach the same 382. */}
      <Animated.View style={[styles.folk, { left: 336, top: 394, height: 106 }, riseS]} pointerEvents="none">
        <Animated.View style={[styles.badge, sees[2] && styles.badgeOn, badgeStyle]}>
          <Text style={[styles.badgeText, sees[2] && styles.badgeTextOn]}>{sees[2] ? 'SEES' : 'BLOCKED'}</Text>
        </Animated.View>
        <View style={styles.folkHead} />
        <View style={[styles.folkTorso, { height: 30 }]} />
        <View style={[styles.folkLeg, { left: 25, top: 80 }]} />
        <View style={[styles.folkLeg, { left: 32, top: 80 }]} />
      </Animated.View>

      {/* ── the spare crates, far stage left of every walk ──────────────────── */}
      <Animated.View style={[styles.layer, pileStyle]} pointerEvents="none">
        {SLOT_TOPS.map((py) => (
          <View key={py} style={[styles.crate, { left: PILE_L, top: py }]}>
            <View style={styles.brace} />
          </View>
        ))}
      </Animated.View>

      {/* ── Q1: who gets the spare crate? High above the whole fence ────────── */}
      {showPick ? (
        <>
          <View style={styles.pickLabelWrap} pointerEvents="none">
            <Text style={styles.pickLabel}>WHO SHOULD GET THE SPARE CRATE?</Text>
          </View>
          {CARDS.map((c, k) => {
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
                  <View
                    style={[
                      styles.pickBar,
                      { height: c.bar },
                      answered && c.correct && styles.pickBarOn,
                    ]}
                  />
                  <Text style={[styles.pickText, answered && c.correct && styles.pickTextOn]}>
                    {c.label}
                  </Text>
                </View>
              </Target>
            );
          })}
        </>
      ) : null}

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DF} k={K_FIG} />

      {/* the crate in his arms, drawn last so it sits in front of the body */}
      <Animated.View style={[styles.carried, carryStyle]} pointerEvents="none">
        <View style={styles.braceSm} />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  // A full-stage carrier for props that fade together. Always pointerEvents="none":
  // an overlay at opacity 0 still swallows taps and silently kills the interaction.
  layer: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H },
  ground: { position: 'absolute', left: 8, right: 4, top: GROUND, height: 1.5, backgroundColor: RULE },

  // ── the match beyond the fence ──────────────────────────────────────────────
  matchLabel: {
    position: 'absolute', left: 236, top: 62, width: 160, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 1.8, color: SOFT,
    includeFontPadding: false,
  },
  crossbar: { position: 'absolute', left: 288, top: 86, width: 84, height: 4, backgroundColor: INK, borderRadius: 2 },
  postL: { position: 'absolute', left: 288, top: 86, width: 4, height: 52, backgroundColor: INK, borderRadius: 2 },
  postR: { position: 'absolute', left: 368, top: 86, width: 4, height: 52, backgroundColor: INK, borderRadius: 2 },
  netV: { position: 'absolute', top: 90, width: 1.5, height: 48, backgroundColor: RULE },
  netH: { position: 'absolute', left: 292, top: 112, width: 76, height: 1.5, backgroundColor: RULE },
  pitchLine: { position: 'absolute', left: 282, top: 138, width: 96, height: 1.5, backgroundColor: SOFT },
  ball: {
    position: 'absolute', left: 258, top: 120, width: 18, height: 18, borderRadius: 9,
    borderWidth: 2, borderColor: INK, backgroundColor: PAPER,
  },

  // ── the fence ───────────────────────────────────────────────────────────────
  picket: { position: 'absolute', top: 396, width: 4, height: GROUND - 396, backgroundColor: RULE, borderRadius: 2 },
  topRail: { position: 'absolute', left: FENCE_L, top: RAIL_TOP, width: FENCE_W, height: 5, backgroundColor: INK, borderRadius: 2 },
  midRail: { position: 'absolute', left: FENCE_L, top: 452, width: FENCE_W, height: 3, backgroundColor: SOFT, borderRadius: 1.5 },

  // ── the eye line ────────────────────────────────────────────────────────────
  dash: { position: 'absolute', top: EYE_Y, width: 6, height: 2, backgroundColor: INK, borderRadius: 1 },
  eyeLabel: {
    position: 'absolute', left: 236, top: 372, width: 160, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 1.8, color: SOFT,
    includeFontPadding: false,
  },

  // ── crates ──────────────────────────────────────────────────────────────────
  crate: {
    position: 'absolute', width: BOX_W, height: BOX_H,
    borderWidth: 2, borderColor: INK, borderRadius: 2, backgroundColor: PAPER,
  },
  brace: { position: 'absolute', left: 5, top: 8, width: 26, height: 1.5, backgroundColor: SOFT },
  // Centred on x = 0 so a plain translateX puts it at his hands.
  carried: {
    position: 'absolute', left: -17, top: 444, width: 34, height: 20,
    borderWidth: 2, borderColor: INK, borderRadius: 2, backgroundColor: PAPER,
  },
  braceSm: { position: 'absolute', left: 5, top: 7, width: 20, height: 1.5, backgroundColor: SOFT },

  // ── the three onlookers ─────────────────────────────────────────────────────
  folk: { position: 'absolute', width: 60 },
  badge: {
    position: 'absolute', left: 8, top: 0, width: 44, height: 16,
    borderWidth: 1.5, borderColor: SOFT, borderRadius: 8, backgroundColor: PAPER,
    alignItems: 'center', justifyContent: 'center',
  },
  badgeOn: { borderColor: INK, backgroundColor: INK },
  badgeText: { fontFamily: 'Inter_700Bold', fontSize: 8, letterSpacing: 0.8, color: SOFT,
    includeFontPadding: false,
  },
  badgeTextOn: { color: PAPER },
  folkHead: {
    position: 'absolute', left: 19, top: 32, width: 22, height: 22, borderRadius: 11,
    borderWidth: 2, borderColor: INK, backgroundColor: PAPER,
  },
  folkTorso: {
    position: 'absolute', left: 22, top: 50, width: 16, borderRadius: 8,
    borderWidth: 2, borderColor: INK, backgroundColor: PAPER,
  },
  folkLeg: { position: 'absolute', width: 3, height: 26, backgroundColor: INK, borderRadius: 1.5 },

  // ── Q1 cards ────────────────────────────────────────────────────────────────
  pickLabelWrap: { position: 'absolute', left: 0, top: 184, width: STAGE_W },
  pickLabel: {
    textAlign: 'center', fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 2, color: SOFT,
    includeFontPadding: false,
  },
  pickCard: { position: 'absolute', left: CARD_L, width: CARD_W },
  pickInner: {
    height: CARD_H, borderWidth: 2, borderColor: INK, borderRadius: 5, backgroundColor: PAPER,
    alignItems: 'center', justifyContent: 'center',
  },
  pickBar: { position: 'absolute', left: 18, bottom: 5, width: 6, backgroundColor: INK, borderRadius: 1 },
  pickBarOn: { backgroundColor: PAPER },
  pickRight: { backgroundColor: INK, borderColor: INK },
  pickWrong: { borderColor: SOFT, opacity: 0.45 },
  pickText: { fontFamily: 'Inter_700Bold', fontSize: 13, letterSpacing: 0.4, color: INK,
    includeFontPadding: false,
  },
  pickTextOn: { color: PAPER },
});

export function Political8Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Political8Scene} band={[56, 516]} />;
}
