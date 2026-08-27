import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { clamp01, ease01, lerp, moveTr, pose, travelStance, WALK, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './metaphysics35Script';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER, useHeld, carryFrom, keepHeld, facing, useCarry, carry,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// ─────────────────────────────────────────────────────────────────────────────
// A LIFE DRAWN AS A LINE, AND ONE KNOT IN IT.
//
// THE COMPOSITION, IN NUMBERS (H56).
//
// · the caption sits at y 236…248, the highest ink in the scene.
// · the TIMELINE rule runs x 40…360 at y 300, 2 thick. Five marks stand on it at
//   x 40, 120, 200, 280, 360 — 1900, 1925, 1950, 1975, 2000 — each a 10-tall tick
//   with its year beneath at y 312…322.
// · the RETURN ARC is nine short bars stepping from (322, 288) up to (196, 258)
//   and down to (120, 288): a curve made of straight pieces, because a rotated
//   View is cheap and an <Svg> under an animated parent is not (§17 rule 7).
// · the KNOT is two links, one at 1925 (x 120) and one at 1975 (x 280), drawn as
//   28×28 rings at y 262…290 with a 2-thick tie between them along y 276.
// · the BRANCH is a second line leaving x 200 and dropping to y 344, then running
//   to x 360 — below the first, so the original is never crossed out.
// · the figure walks the line itself: x 322 → 120 → 210, feet on GROUND 500, and
//   the tallest ink he reaches is his crown at ~397.
//
// Ink therefore runs y 236 (caption) … y 500 (ground). BAND 230…512 = 282, which
// contains every pixel any beat can draw (H59) with 6 units of margin at the top.
//
// CAMERA: none authored. `followMoves` deals `hold` for a plain beat and `pull`
// for a graded one; the framings come from tours.ts, derived from what this scene
// actually reveals when (K3). The walk on beat 2 is what the follow is for.
// ─────────────────────────────────────────────────────────────────────────────

/** Crossfade for a beat that does NOT walk. 0.85 is the base `footfalls` assumes. */
const BASE_TR = 0.85;

// the timeline
const LINE_Y = 300;
const LINE_L = 40;
const LINE_R = 360;
const MARKS = [40, 120, 200, 280, 360];
const YEARS = ['1900', '1925', '1950', '1975', '2000'];

// the knot: the shot, and the birth it makes impossible
const KNOT_R = 14;
const KNOT_Y = 276;
const KNOT_SHOT = 120;
const KNOT_BORN = 280;

// the return arc, as nine straight pieces
type Bar = readonly [x: number, y: number, len: number, deg: number];
const ARC: readonly Bar[] = [
  [322, 288, 30, -34],
  [297, 271, 30, -22],
  [269, 260, 28, -10],
  [241, 258, 28, -2],
  [213, 257, 28, 4],
  [185, 259, 28, 14],
  [158, 266, 28, 26],
  [136, 278, 22, 40],
  [122, 287, 14, 62],
];

const CAP_T = 236;
const FIG_X = 322;

const X = BEATS.map((b) => b.x ?? FIG_X);
const P = BEATS.map((b) => b.p ?? 0);
const LINE = BEATS.map((b) => (b.line ? 1 : 0));
const ARC_ON = BEATS.map((b) => (b.arc ? 1 : 0));
const KNOT = BEATS.map((b) => (b.knot ? 1 : 0));
const SNAP = BEATS.map((b) => (b.snap ? 1 : 0));
const BRANCH = BEATS.map((b) => (b.branch ? 1 : 0));
const LIVE = BEATS.map((b) => (b.live ? 1 : 0));

// R7b — the stage follows the control on its own graded beat, and only there.
// Derived from the beat rather than declared as a channel so it cannot fall out
// of step with the control it is about.
const REACT = BEATS.map((b) => (b.interact?.drag ? 1 : 0));
const CAM = followMoves(X, BEATS.map(kindOf), seedOf('metaphysics35'));

export default function Metaphysics35Scene({ clock, bt, bi, qv, i, picked, onPick, dragPos }: SceneApi) {
  const reacting = REACT[i] === 1;
  const heldFig = useHeld();
  const cv = useCarry(5);
  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    // A WALKING BEAT TAKES AS LONG AS THE WALK NEEDS (rig.moveTr). A fixed length
    // here sprinted every long journey and left the footfalls — which the player
    // computes from moveTr — arriving after the figure had stopped.
    const tr = ease01(bt.value / moveTr(X[p], X[n], BASE_TR));
    const t = clock.value;
    const q = clamp01(qv.value);

    const x = carry(cv, 0, n, X[p], X[n], tr);
    // Facing eased through zero rather than flipped (L3): he turns through a
    // profile on the way back down the line instead of mirroring between frames.
    const dir = facing(X[p] > X[n] ? -1 : 1, X[n] > X[p] ? 1 : X[n] < X[p] ? -1 : 1, bt.value);

    // ONE STANCE SOURCE. `travelStance` decides for itself whether this beat is a
    // walk (the x's differ) or a held gesture, and carries the group-L continuity
    // through either way — so there is no second path here to get out of step.
    const figS = keepHeld(heldFig, travelStance(
      X[p], X[n],
      carryFrom(heldFig, n, emoteHold(P[p], t)), emoteHold(P[n], t), emoteLive(P[n], t, bt.value),
      tr, WALK,
    ));

    return {
      fig: pose(figS, x, GROUND, K_FIG, dir, 1),
      t,
      lineOn: carry(cv, 1, n, LINE[p], LINE[n], tr),
      arcOn: carry(cv, 2, n, ARC_ON[p], ARC_ON[n], tr),
      // R7b — the knob ties the knot. Drag toward SOMETHING PUSHES BACK and a knot
      // appears in the line the reader is walking; drag back and the line runs
      // straight, with the failures having no cause in common at all.
      knotOn: carry(cv, 3, n, KNOT[p], reacting ? dragPos.value : KNOT[n], tr),
      // The tie parts on the beat that snaps, and STAYS parted — a contradiction
      // that re-knots itself while the reader is still looking at it would undo the
      // one thing this beat is for.
      snap: SNAP[n] === 1 ? ease01((bt.value - 0.35) / 0.8) : 0,
      branchOn: carry(cv, 4, n, BRANCH[p], BRANCH[n], tr),
      // On the graded beat the surviving link closes as the answer lands.
      seal: LIVE[n] === 1 ? ease01(q) : 0,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const answered = picked !== null;
  // Tappable ONLY on the beat that asks. `LIVE` is read in JS here rather than on
  // the shared value because Target is a Pressable and its disabled state is a
  // React prop, not something the UI thread can flip.
  const live = !!BEATS[i]?.interact && LIVE[i] === 1;

  const lineStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.lineOn }));
  const arcStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.arcOn }));
  const branchStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.branchOn }));

  return (
    <View style={styles.scene}>
      <Text style={styles.cap}>ONE LIFE, DRAWN AS A LINE</Text>

      <Animated.View style={[StyleSheet.absoluteFill, lineStyle]} pointerEvents="none">
        <View style={styles.rule} />
        {MARKS.map((mx, k) => (
          <View key={mx}>
            <View style={[styles.tick, { left: mx - 1 }]} />
            <Text style={[styles.year, { left: mx - 22 }]}>{YEARS[k]}</Text>
          </View>
        ))}
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, arcStyle]} pointerEvents="none">
        {ARC.map(([bx, by, len, deg]) => (
          <View
            key={`${bx}-${by}`}
            style={[styles.arcBar, { left: bx, top: by, width: len, transform: [{ rotate: `${deg}deg` }] }]}
          />
        ))}
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, branchStyle]} pointerEvents="none">
        <View style={styles.branchDrop} />
        <View style={styles.branchRun} />
        <Text style={styles.branchLabel}>A SECOND HISTORY</Text>
      </Animated.View>

      <Knot S={SCENE} picked={picked} onPick={onPick} answered={answered} live={live} />

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DF} k={K_FIG} />
    </View>
  );
}

// ── the knot: two links and the tie that cannot hold them both ───────────────

function Knot({
  S, picked, onPick, answered, live,
}: {
  S: SharedValue<any>; picked: string | null; onPick: (id: string, ok: boolean) => void;
  answered: boolean; live: boolean;
}) {
  const wrap = useAnimatedStyle(() => ({ opacity: S.value.knotOn }));
  // The tie is one bar that OPENS at its middle: its left half slides left and the
  // right half slides right, so the break is a gap rather than a colour change.
  const tieL = useAnimatedStyle(() => ({ transform: [{ translateX: -S.value.snap * 22 }] }));
  const tieR = useAnimatedStyle(() => ({ transform: [{ translateX: S.value.snap * 22 }] }));
  const sealS = useAnimatedStyle(() => ({ opacity: S.value.seal }));

  const wrong = (id: string) => answered && picked === id;
  return (
    <Animated.View style={[StyleSheet.absoluteFill, wrap]}>
      <Animated.View style={[styles.tieHalf, { left: KNOT_SHOT + KNOT_R }, tieL]} pointerEvents="none" />
      <Animated.View style={[styles.tieHalf, { left: KNOT_BORN - KNOT_R - 66 }, tieR]} pointerEvents="none" />

      <Target
        id="shot"
        correct={false}
        picked={picked}
        onPick={onPick}
        disabled={!live || answered}
        radius={KNOT_R}
        style={[styles.link, { left: KNOT_SHOT - KNOT_R }]}
      >
        <View style={[styles.ring, wrong('shot') && styles.ringWrong]} pointerEvents="none" />
        <Text style={styles.linkLabel}>THE SHOT</Text>
      </Target>

      <Target
        id="born"
        correct
        picked={picked}
        onPick={onPick}
        disabled={!live || answered}
        radius={KNOT_R}
        style={[styles.link, { left: KNOT_BORN - KNOT_R }]}
      >
        <View style={styles.ring} pointerEvents="none" />
        <Animated.View style={[styles.ringSeal, sealS]} pointerEvents="none" />
        <Text style={styles.linkLabel}>YOUR BIRTH</Text>
      </Target>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 20, right: 14, top: GROUND, height: 1.5, backgroundColor: RULE },

  cap: {
    position: 'absolute', left: 40, top: CAP_T, width: 320,
    fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 1.6, color: SOFT, includeFontPadding: false,
  },

  rule: { position: 'absolute', left: LINE_L, top: LINE_Y, width: LINE_R - LINE_L, height: 2, backgroundColor: INK },
  tick: { position: 'absolute', top: LINE_Y - 5, width: 2, height: 12, backgroundColor: INK },
  year: {
    position: 'absolute', top: LINE_Y + 12, width: 44, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 0.6, color: SOFT, includeFontPadding: false,
  },

  // Rotated about the left end, so a bar's declared x,y is where it starts.
  arcBar: { position: 'absolute', height: 2, borderRadius: 1, backgroundColor: SOFT, transformOrigin: '0% 50%' },

  link: { position: 'absolute', top: KNOT_Y - KNOT_R, width: KNOT_R * 2, height: KNOT_R * 2 },
  ring: {
    position: 'absolute', left: 0, top: 0, width: KNOT_R * 2, height: KNOT_R * 2,
    borderRadius: KNOT_R, borderWidth: 2.5, borderColor: INK, backgroundColor: PAPER,
  },
  ringSeal: {
    position: 'absolute', left: 5, top: 5, width: KNOT_R * 2 - 10, height: KNOT_R * 2 - 10,
    borderRadius: KNOT_R, backgroundColor: INK,
  },
  ringWrong: { borderColor: SOFT, borderStyle: 'dashed' },
  linkLabel: {
    position: 'absolute', left: -24, top: KNOT_R * 2 + 4, width: 76, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1, color: SOFT, includeFontPadding: false,
  },

  tieHalf: { position: 'absolute', top: KNOT_Y - 1, width: 66, height: 2, backgroundColor: INK },

  branchDrop: { position: 'absolute', left: 200, top: LINE_Y, width: 2, height: 44, backgroundColor: SOFT },
  branchRun: { position: 'absolute', left: 200, top: 344, width: 160, height: 2, backgroundColor: SOFT },
  branchLabel: {
    position: 'absolute', left: 206, top: 350, width: 160,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.2, color: SOFT, includeFontPadding: false,
  },
});

export function Metaphysics35Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Metaphysics35Scene} band={[230, 512]} camera={CAM} />;
}
