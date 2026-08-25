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
// Where the hands are, and what they do under a load. Everything about the crate
// he fetches comes from these two — see the header of interact.ts.
import { carryHands, gripAt } from './interact';
import { BEATS } from './political8Script';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER, useHeld, carryFrom, keepHeld, facing, useCarry, carry,
} from './cinematicKit';
import { followMoves, kindOf, seedOf } from './camera';
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
// The camera, from the staging: it follows the figure this track describes,
// pulls back to scale 1 on every graded beat so a tap lands where it is aimed,
// and leans in on the quote. See followMoves in ./camera.ts.
const CAM = followMoves(X, BEATS.map(kindOf), seedOf('political8'));
const DIR = dirsFrom(X, 1);
const MODE = BEATS.map((b) => b.mode ?? 0);
const N0 = MODE.map((m) => CNT0[m]);
const N1 = MODE.map((m) => CNT1[m]);
const N2 = MODE.map((m) => CNT2[m]);
const PILEV = BEATS.map((b) => b.pile ?? 0);
// ── THE CRATE HE FETCHES ────────────────────────────────────────────────────
//
// `carry` used to be an OPACITY: 1 on the beat he holds it, 0 either side, so the
// crate appeared out of nothing in his arms and vanished again a beat later. A
// reader put it exactly — "the object is just floating and it just disapears all
// the suddon".
//
// It is a POSITION now. `HELD` is how much of the crate's weight is in his hands
// at the END of each beat, and the crate is drawn at lerp(where it rests, his
// grip, held). At 0 it is on the pile or on the ground; at 1 it is in his hands
// and tracks them frame by frame; in between it is being lifted or set down.
// Nothing fades. (Group P.)
const HELD = BEATS.map((b) => b.carry ?? 0);
// Its two resting places, both centres. It starts as the TOP crate of the spare
// stack — the pile draws only the two beneath it — and ends on the ground at
// arm's length in front of him at the fence.
// BOTTOM EDGES, not centres — `styles.carried` is anchored so the point given is
// where the crate's underside sits, which is what makes "resting on his hands"
// and "resting on the ground" the same statement. Written as centres first, and
// the crate duly came to rest eleven units above the floor.
const PILE_PT = { x: PILE_L + BOX_W / 2, y: SLOT_TOPS[2] + BOX_H };
const DROP_PT = { x: 206, y: GROUND };
const MARKV = BEATS.map((b) => b.marks ?? 0);
const EYEV = BEATS.map((b) => b.eyeline ?? 0);

export default function Political8Scene({ clock, bt, bi, i, picked, onPick }: SceneApi) {
  const heldS = useHeld();
  const cv = useCarry(8);
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
    const s0 = keepHeld(heldS, travelStance(
      X[p], X[n],
      carryFrom(heldS, n, emoteHold(P[p], t)), emoteHold(P[n], t), emoteLive(P[n], t, bt.value),
      tr, WALK,
    ));
    const fx = carry(cv, 0, n, X[p], X[n], tr);

    // A LOAD IS PICKED UP AND SET DOWN AT THE DESTINATION, NOT WHILE WALKING.
    // Packing the change into the last quarter of the move is what makes the trip
    // read as "walk over, lift, walk back, put down" rather than as an object
    // sliding into his hands somewhere along the way.
    const held = carry(cv, 1, n, HELD[p], HELD[n], ease01(clamp01((tr - 0.72) / 0.28)));
    // The arms stop swinging and come out under it — the legs, bob and lean are
    // left alone, so he still walks. This is the half a reader named first: "his
    // arms arent out".
    const s = carryHands(s0, held);
    const dir = facing(DIR[p], DIR[n], bt.value);
    const grip = gripAt(s, { x: fx, groundY: GROUND, k: K_FIG, dir });
    // It comes OFF the pile on the fetch beat and goes TO the ground from then on.
    const rest = n <= 2 ? PILE_PT : DROP_PT;

    return {
      fig: pose(s, fx, GROUND, K_FIG, dir, 1),
      // Between its resting place and his hands. Never an opacity.
      crateX: lerp(rest.x, grip.x, held),
      crateY: lerp(rest.y, grip.y, held),
      pile: carry(cv, 2, n, PILEV[p], PILEV[n], tr),
      marks: carry(cv, 3, n, MARKV[p], MARKV[n], tr, modeFade ? grow : 1),
      eye: carry(cv, 4, n, EYEV[p], EYEV[n], tr),
      // Crate counts lerp, so an onlooker RISES smoothly as a crate slides under
      // them and the crate itself fades in beneath their feet.
      n0: carry(cv, 5, n, N0[p], N0[n], tr),
      n1: carry(cv, 6, n, N1[p], N1[n], tr),
      n2: carry(cv, 7, n, N2[p], N2[n], tr),
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
    transform: [
      { translateX: SCENE.value.crateX },
      { translateY: SCENE.value.crateY },
    ],
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
          <Text style={[styles.badgeText, sees[0] && styles.badgeTextOn]}>{sees[0] ? 'SEES' : 'CANNOT'}</Text>
        </Animated.View>
        <View style={styles.folkHead} />
        <View style={[styles.folkTorso, { height: 74 }]} />
        <View style={[styles.folkLeg, { left: 25, top: 124 }]} />
        <View style={[styles.folkLeg, { left: 32, top: 124 }]} />
      </Animated.View>

      {/* MIDDLE — h 96: one crate brings the head to 382. */}
      <Animated.View style={[styles.folk, { left: 290, top: 372, height: 128 }, riseM]} pointerEvents="none">
        <Animated.View style={[styles.badge, sees[1] && styles.badgeOn, badgeStyle]}>
          <Text style={[styles.badgeText, sees[1] && styles.badgeTextOn]}>{sees[1] ? 'SEES' : 'CANNOT'}</Text>
        </Animated.View>
        <View style={styles.folkHead} />
        <View style={[styles.folkTorso, { height: 52 }]} />
        <View style={[styles.folkLeg, { left: 25, top: 102 }]} />
        <View style={[styles.folkLeg, { left: 32, top: 102 }]} />
      </Animated.View>

      {/* SHORTEST — h 74: needs TWO crates to reach the same 382. */}
      <Animated.View style={[styles.folk, { left: 336, top: 394, height: 106 }, riseS]} pointerEvents="none">
        <Animated.View style={[styles.badge, sees[2] && styles.badgeOn, badgeStyle]}>
          <Text style={[styles.badgeText, sees[2] && styles.badgeTextOn]}>{sees[2] ? 'SEES' : 'CANNOT'}</Text>
        </Animated.View>
        <View style={styles.folkHead} />
        <View style={[styles.folkTorso, { height: 30 }]} />
        <View style={[styles.folkLeg, { left: 25, top: 80 }]} />
        <View style={[styles.folkLeg, { left: 32, top: 80 }]} />
      </Animated.View>

      {/* ── the spare crates, far stage left of every walk ──────────────────── */}
      <Animated.View style={[styles.layer, pileStyle]} pointerEvents="none">
        {/* TWO, not three: the top one is the crate he carries, which is drawn
            separately because it moves. Three here would leave a ghost behind on
            the stack the moment he lifted it. */}
        {SLOT_TOPS.slice(0, 2).map((py) => (
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

      {/* The crate he fetches — drawn last so it sits in front of the body while
          he carries it. It is always on stage: on the pile, in his hands, or on
          the ground where he put it. */}
      <Animated.View style={[styles.carried, carryStyle]} pointerEvents="none">
        <View style={styles.brace} />
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
    fontFamily: 'Inter_700Bold', fontSize: 12.6, letterSpacing: 1.8, color: SOFT,
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
    fontFamily: 'Inter_700Bold', fontSize: 12.6, letterSpacing: 1.8, color: SOFT,
    includeFontPadding: false,
  },

  // ── crates ──────────────────────────────────────────────────────────────────
  crate: {
    position: 'absolute', width: BOX_W, height: BOX_H,
    borderWidth: 2, borderColor: INK, borderRadius: 2, backgroundColor: PAPER,
  },
  brace: { position: 'absolute', left: 5, top: 8, width: 26, height: 1.5, backgroundColor: SOFT },
  // Centred on x = 0 so a plain translateX puts it at his hands.
  // THE SAME OBJECT AS THE ONES ON THE PILE, and it has to be: it IS one of them.
  // It was 34x20 against their 40x22, so the crate that arrived at the fence was
  // not the crate that left the stack.
  //
  // Anchored so that (translateX, translateY) puts its BOTTOM EDGE on the point
  // given — a box rests ON the hands, it is not skewered by them.
  carried: {
    position: 'absolute', left: -BOX_W / 2, top: -BOX_H, width: BOX_W, height: BOX_H,
    borderWidth: 2, borderColor: INK, borderRadius: 2, backgroundColor: PAPER,
  },

  // ── the three onlookers ─────────────────────────────────────────────────────
  folk: { position: 'absolute', width: 60 },
  badge: {
    // 52 WIDE, NOT 44, AND THE LONGER WORD IS SHORTER.
    //
    // The pair used to be SEES / BLOCKED. At 12.6 with letter-spacing that is about
    // sixty units of lettering in a forty-four-unit badge, so BLOCKED was trimmed at
    // both ends and `check:readable` measured a seventh of it reaching the reader.
    // The type cannot come down to meet it: this scene's band is 460 units, so `fit`
    // is 0.64 and 12.6 already lands at 8.1pt, a tenth of a point above D34's floor.
    //
    // So the BOX grew to the width `folk` allows and the WORD came down to fit it.
    // SEES / CANNOT is the same claim in the same shape, and it is the one the badge
    // can actually hold. A box is sized to its longest label, and when it cannot be,
    // the label is the thing that gives.
    position: 'absolute', left: 4, top: 0, width: 52, height: 16,
    borderWidth: 1.5, borderColor: SOFT, borderRadius: 8, backgroundColor: PAPER,
    alignItems: 'center', justifyContent: 'center',
  },
  badgeOn: { borderColor: INK, backgroundColor: INK },
  badgeText: { fontFamily: 'Inter_700Bold', fontSize: 12.6, letterSpacing: 0.4, color: SOFT,
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
    textAlign: 'center', fontFamily: 'Inter_700Bold', fontSize: 12.6, letterSpacing: 2, color: SOFT,
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
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Political8Scene} band={[56, 516]} camera={CAM} />;
}
