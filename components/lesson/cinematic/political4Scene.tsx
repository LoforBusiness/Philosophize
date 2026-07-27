import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { ease01, emoteHold, emoteLive, lerp, mixStance, pose, type Bundle } from './rig';
import { BEATS } from './political4Script';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER } from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';

// A figure walled in by interference, drawn as an information graphic rather than a
// mood piece:
//
//   · TWO COMPARISON CARDS up top — NEGATIVE LIBERTY / POSITIVE LIBERTY — one of
//     which STAMPS (an ink wipe left-to-right, labels flipping to paper) on the beat
//     that is about it. That is the lesson's spine, always on screen.
//   · A DIMENSION LINE between the walls, capped and captioned "ROOM TO MOVE", which
//     literally measures negative liberty: it is invisible when the walls press in and
//     grows to full width as they retreat.
//   · The HARM LINE — a dashed boundary with another person standing beyond it — the
//     single line Mill says power may cross.
//
// The camera is IDENTITY, so design coordinates are final stage coordinates and the
// band below can be read straight off these constants. Everything the scene can ever
// draw lives between y=222 (card tops) and y=501.5 (the ground rule).

const FIG_X = 196;

// ── the walls of interference ────────────────────────────────────────────────
const WALL_W = 10;
const WALL_L = 150;                       // left wall's left edge  (inner face 160)
const WALL_R = 242;                       // right wall's left edge (inner face 242)
const WALL_T = 336;
const WALL_H = GROUND - WALL_T;           // 164 — taller than the figure, so it looms
const WALL_OUT = 44;                      // how far each wall retreats at walls = 0
const COURSES = [26, 52, 78, 104, 130, 156];

// ── the comparison cards ─────────────────────────────────────────────────────
const CARD_T = 222;
const CARD_H = 64;
const CARD_W = 176;
const CARD_AL = 20;
const CARD_BL = 204;

// ── the dimension line that measures the gap ─────────────────────────────────
const MEAS_LABEL_T = 298;
const MEAS_Y = 324;
const MEAS_L = WALL_L + WALL_W;                    // 160, the left wall's inner face
const MEAS_W = WALL_R - MEAS_L;                    // 82 at full squeeze
const MEAS_MAX = MEAS_W + WALL_OUT * 2;            // 170 once both walls retreat

// ── the harm boundary ────────────────────────────────────────────────────────
const HARM_X = 326;
const DASHES = [0, 16, 32, 48, 64, 80, 96, 112, 128, 144, 152];

const P_CODE = BEATS.map((b) => b.p ?? 0);
const WALLS = BEATS.map((b) => b.walls ?? 0);
const HARM = BEATS.map((b) => b.harm ?? 0);
const NEG = BEATS.map((b) => ((b.panel ?? 0) === 1 ? 1 : 0));
const POS = BEATS.map((b) => ((b.panel ?? 0) === 2 ? 1 : 0));

export default function Political4Scene({ clock, bt, bi }: SceneApi) {
  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / 0.85);
    const t = clock.value;

    const s = mixStance(emoteHold(P_CODE[p], t), emoteLive(P_CODE[n], t, bt.value), tr);
    return {
      fig: pose(s, FIG_X, GROUND, K_FIG, 1, 1),
      walls: lerp(WALLS[p], WALLS[n], tr),
      harm: lerp(HARM[p], HARM[n], tr),
      neg: lerp(NEG[p], NEG[n], tr),
      pos: lerp(POS[p], POS[n], tr),
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);

  // Walls slide OUTWARD (away from the figure) and fade as liberty grows, so they
  // never cover the body.
  const wallLStyle = useAnimatedStyle(() => ({
    opacity: 0.25 + 0.75 * SCENE.value.walls,
    transform: [{ translateX: -(1 - SCENE.value.walls) * WALL_OUT }],
  }));
  const wallRStyle = useAnimatedStyle(() => ({
    opacity: 0.25 + 0.75 * SCENE.value.walls,
    transform: [{ translateX: (1 - SCENE.value.walls) * WALL_OUT }],
  }));

  // The measure: zero when the walls press in, full when they are gone.
  const measStyle = useAnimatedStyle(() => ({ opacity: 1 - SCENE.value.walls }));
  const measBarStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: (MEAS_W + (1 - SCENE.value.walls) * WALL_OUT * 2) / MEAS_W }],
  }));
  const capLStyle = useAnimatedStyle(() => ({ transform: [{ translateX: -(1 - SCENE.value.walls) * WALL_OUT }] }));
  const capRStyle = useAnimatedStyle(() => ({ transform: [{ translateX: (1 - SCENE.value.walls) * WALL_OUT }] }));

  const harmStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.harm }));

  return (
    <View style={styles.scene}>
      {/* ── the two liberty cards, one of which stamps ─────────────────────── */}
      <Card left={CARD_AL} title="NEGATIVE LIBERTY" sub="no one blocks you" S={SCENE} which="neg" />
      <Card left={CARD_BL} title="POSITIVE LIBERTY" sub="you can actually act" S={SCENE} which="pos" />

      {/* ── the dimension line measuring the gap between the walls ─────────── */}
      <Animated.View style={[styles.measWrap, measStyle]} pointerEvents="none">
        <Text style={styles.measLabel}>ROOM TO MOVE</Text>
        <Animated.View style={[styles.measBar, measBarStyle]} />
        <Animated.View style={[styles.measCap, { left: MEAS_L - 1 }, capLStyle]} />
        <Animated.View style={[styles.measCap, { left: WALL_R - 1 }, capRStyle]} />
      </Animated.View>

      {/* ── the walls of interference, coursed like brick ──────────────────── */}
      <Animated.View style={[styles.wall, { left: WALL_L }, wallLStyle]} pointerEvents="none">
        {COURSES.map((c) => <View key={c} style={[styles.course, { top: c }]} />)}
      </Animated.View>
      <Animated.View style={[styles.wall, { left: WALL_R }, wallRStyle]} pointerEvents="none">
        {COURSES.map((c) => <View key={c} style={[styles.course, { top: c }]} />)}
      </Animated.View>

      {/* ── the harm boundary + the person it protects ─────────────────────── */}
      <Animated.View style={[styles.harmWrap, harmStyle]} pointerEvents="none">
        {DASHES.map((d) => <View key={d} style={[styles.dash, { top: WALL_T + d }]} />)}
        <Text style={styles.harmLabel}>HARM LINE</Text>
        <View style={styles.otherHead} />
        <View style={styles.otherSpine} />
        <View style={styles.otherArms} />
        <View style={[styles.otherLeg, { left: 348 }]} />
        <View style={[styles.otherLeg, { left: 361 }]} />
      </Animated.View>

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DF} k={K_FIG} />
    </View>
  );
}

/**
 * One comparison card. The ink fill wipes in from the left and the ink-coloured label
 * cross-fades to a paper one, so the card reads as being STAMPED on its beat.
 */
function Card({
  left, title, sub, S, which,
}: {
  left: number; title: string; sub: string;
  S: SharedValue<any>; which: 'neg' | 'pos';
}) {
  const fillStyle = useAnimatedStyle(() => ({ transform: [{ scaleX: which === 'neg' ? S.value.neg : S.value.pos }] }));
  const offStyle = useAnimatedStyle(() => ({ opacity: 1 - (which === 'neg' ? S.value.neg : S.value.pos) }));
  const onStyle = useAnimatedStyle(() => ({ opacity: which === 'neg' ? S.value.neg : S.value.pos }));
  return (
    <View style={[styles.card, { left }]} pointerEvents="none">
      <Animated.View style={[styles.cardFill, fillStyle]} />
      <Animated.View style={[styles.cardText, offStyle]}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardSub}>{sub}</Text>
      </Animated.View>
      <Animated.View style={[styles.cardText, onStyle]}>
        <Text style={[styles.cardTitle, styles.onPaper]}>{title}</Text>
        <Text style={[styles.cardSub, styles.onPaper]}>{sub}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 24, right: 24, top: GROUND, height: 1.5, backgroundColor: RULE },

  // ── comparison cards ───────────────────────────────────────────────────────
  card: {
    position: 'absolute', top: CARD_T, width: CARD_W, height: CARD_H,
    borderWidth: 2, borderColor: INK, borderRadius: 5, backgroundColor: PAPER, overflow: 'hidden',
  },
  cardFill: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: INK, transformOrigin: '0% 50%' },
  cardText: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontFamily: 'Inter_700Bold', fontSize: 15, letterSpacing: 0.6, color: INK, includeFontPadding: false },
  cardSub: { fontFamily: 'Inter_400Regular', fontSize: 11.5, color: SOFT, marginTop: 4, includeFontPadding: false },
  onPaper: { color: PAPER },

  // ── the measure ────────────────────────────────────────────────────────────
  measWrap: { position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 },
  measLabel: {
    position: 'absolute', left: 0, right: 0, top: MEAS_LABEL_T, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.4, color: SOFT,
  },
  measBar: {
    position: 'absolute', left: MEAS_L, top: MEAS_Y, width: MEAS_W, height: 2,
    backgroundColor: INK, transformOrigin: '50% 50%',
  },
  measCap: { position: 'absolute', top: MEAS_Y - 8, width: 2, height: 18, backgroundColor: INK },

  // ── the walls ──────────────────────────────────────────────────────────────
  wall: {
    position: 'absolute', top: WALL_T, width: WALL_W, height: WALL_H,
    backgroundColor: INK, borderRadius: 2, overflow: 'hidden',
  },
  course: { position: 'absolute', left: 0, width: WALL_W, height: 1.5, backgroundColor: PAPER, opacity: 0.55 },

  // ── the harm boundary + the other person ───────────────────────────────────
  harmWrap: { position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 },
  dash: { position: 'absolute', left: HARM_X, width: 2, height: 9, backgroundColor: SOFT },
  harmLabel: {
    position: 'absolute', left: 296, top: 340, width: 108, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.4, color: SOFT,
  },
  otherHead: { position: 'absolute', left: 346, top: 422, width: 20, height: 20, borderRadius: 10, backgroundColor: INK },
  otherSpine: { position: 'absolute', left: 354, top: 444, width: 4, height: 34, backgroundColor: INK, borderRadius: 2 },
  otherArms: { position: 'absolute', left: 341, top: 452, width: 30, height: 3.5, backgroundColor: INK, borderRadius: 2 },
  otherLeg: { position: 'absolute', top: 476, width: 4, height: 24, backgroundColor: INK, borderRadius: 2 },
});

// Everything this scene can draw sits between the card tops (222) and the ground
// rule (501.5): cards 222–286, measure 298–332, walls 336–500, harm line 336–500,
// the other person 422–500, the figure's crown ≈358 down to its feet at 500. Cropping
// to [214, 510] renders the stage at ~2.19× instead of the letterboxed 1.15×.
export function Political4Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Political4Scene} band={[214, 510]} />;
}
