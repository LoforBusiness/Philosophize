import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import {
  WALK, dirsFrom, ease01, lerp, moveTr, pose, travelStance, type Bundle,
} from './rig';
// The whole movement library, not just rig's 49 emotes. Codes under 100 ARE
// rig's and mean exactly what they always did; 100+ reach moves.ts (emoteAny).
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './political11Script';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER } from './cinematicKit';
import { followMoves, kindOf, seedOf } from './camera';
import type { SceneApi } from './CinematicPlayer';
import { TargetRing } from './Target';

// A three-notch DIAL over three empty plots of ground. Set the dial and that plot
// builds: a tower, a small house, a ring. The plots accumulate, so by the question
// all three stand and the reader has to remember which diagnosis built which.
//
// COMPOSITION / OCCLUSION —
//   · the figure WALKS x = 56 → 120, once, on beat 2. Its widest body span across
//     the whole run is x 24…156 (measured off the rig at the poses these beats hold,
//     not off the nominal ±36 — B9a).
//   · the DIAL is a horizontal selector, x 24…176, y 306…356. It sits ENTIRELY above
//     the figure's crown at y 397, and it shares the figure's x column deliberately:
//     there is no vertical overlap, so nothing is covered either way (D23).
//   · the three PLOTS live at x 188…388 — right of everything the figure occupies,
//     with 32 units of clear paper between his widest reach and the first plot.
//     Plot columns are 64 wide on a 68 pitch: 188, 256, 324.
//   · structures rise from the plinth line y 448 up to y 306 at the tallest (the
//     tower). Label plates sit y 452…494, just above the ground line at 500.
//
// Nothing is drawn above y 306 or below y 500, hence band [298, 512] — 214 units,
// which is under the 280 at which the crop stops costing on-screen size, so this
// lesson renders at the full width-limited 2.31× (H59).
//
// A5 — DELIBERATE: the figure never touches the dial, and no beat's text says he
// does. A dial he could actually turn would have to sit in the reachable band
// (y 426…466, i.e. waist height) and that is exactly where the plots' label plates
// live. Rather than write "he turns it" and draw a hand nowhere near it (A1), the
// dial is an instrument on the wall above him and he presents it.

const DIAL_L = 24;
const DIAL_W = 152;
const DIAL_T = 306;
const TRACK_Y = 336;
const NOTCH_X = [44, 100, 156];          // absolute stage x of the three notches
const DIAL_LABELS = ['FEARFUL', 'RATIONAL', 'INNOCENT'];

const PLOT_L = 188;
const PLOT_W = 64;
// SIZED FOR A FINGER (E37b-2). The three plots are the answer targets and they are
// laid out HORIZONTALLY, so the pitch that matters is the horizontal one. The band is
// 214 units, so fit is width-limited at 0.88 dp/unit on a 360dp phone: a 68-unit pitch
// is 59.8dp and a 64-unit plate is 56.3dp, both clear of the 48dp Android minimum and
// of the ~45dp a fingertip actually covers.
const PLOT_PITCH = 68;
/** Half the 4-unit gutter. More would overlap the neighbour, and the topmost wins. */
const PLOT_SLOP = (PLOT_PITCH - PLOT_W) / 2;
// Vertically the plates have no neighbours at all, so the slop there is free.
const PLOT_SLOP_Y = 14;

const PLINTH_Y = 448;
const PLATE_T = 452;
const PLATE_H = 42;

const PLOTS = [
  { id: 'tower', label: 'ONE SOVEREIGN', correct: true },
  { id: 'house', label: 'LIMITED STATE', correct: false },
  { id: 'ring', label: 'THE GENERAL WILL', correct: false },
];

const P = BEATS.map((b) => b.p ?? 0);
const X = BEATS.map((b) => b.x ?? 56);
// The camera, from the staging: it follows the figure this track describes,
// pulls back to scale 1 on every graded beat so a tap lands where it is aimed,
// and leans in on the quote. See followMoves in ./camera.ts.
const CAM = followMoves(X, BEATS.map(kindOf), seedOf('political11'));
const DIR = dirsFrom(X, 1);
const DIALV = BEATS.map((b) => b.dial ?? 0);
const SETV = BEATS.map((b) => b.set ?? 0);
const BUILT = BEATS.map((b) => b.built ?? 0);

export default function Political11Scene({ clock, bt, bi, i, picked, onPick }: SceneApi) {
  const cur = BEATS[i];
  const prev = i > 0 ? BEATS[i - 1] : undefined;

  // Each element fades in only on the beat that CHANGES it, and otherwise holds at
  // full strength — the beat clock restarts on every tap, so anything keyed off it
  // unconditionally would re-reveal itself behind the reader on every advance (C20c).
  const dialOn = (cur.dial ?? 0) > 0;
  const dialFade = dialOn !== ((prev?.dial ?? 0) > 0);
  const built = cur.built ?? 0;
  const prevBuilt = prev?.built ?? 0;
  const answered = picked !== null;
  const platesOn = (cur.plates ?? 0) > 0 && !!cur.interact;

  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / moveTr(X[p], X[n], 0.85));
    const t = clock.value;
    const grow = ease01(bt.value / 0.55);

    const s = travelStance(
      X[p], X[n],
      emoteHold(P[p], t), emoteHold(P[n], t), emoteLive(P[n], t, bt.value),
      tr, WALK,
    );

    // The pointer SLIDES between notches rather than cutting, and it blends from the
    // previous beat's notch, so a beat that does not move it holds it still.
    const from = SETV[p] > 0 ? NOTCH_X[SETV[p] - 1] : NOTCH_X[0];
    const to = SETV[n] > 0 ? NOTCH_X[SETV[n] - 1] : NOTCH_X[0];

    return {
      fig: pose(s, lerp(X[p], X[n], tr), GROUND, K_FIG, DIR[n], 1),
      dial: lerp(DIALV[p], DIALV[n], tr) * (dialFade ? grow : 1),
      ptr: lerp(from, to, ease01(bt.value / 0.62)),
      ptrOn: SETV[n] > 0 ? 1 : 0,
      grow,
      t,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const dialStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.dial }));
  const ptrStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.dial * SCENE.value.ptrOn,
    transform: [{ translateX: SCENE.value.ptr - NOTCH_X[0] }],
  }));

  return (
    <Animated.View style={styles.scene}>
      {/* ── the dial: three notches and a pointer, hung above the figure ─────── */}
      <Animated.View style={[styles.dialBox, dialStyle]} pointerEvents="none">
        <Text style={styles.dialTag}>READING OF HUMAN NATURE</Text>
      </Animated.View>
      <Animated.View style={[styles.track, dialStyle]} pointerEvents="none" />
      {NOTCH_X.map((nx, k) => (
        <Animated.View key={`n${k}`} style={[styles.notch, { left: nx - 1 }, dialStyle]} pointerEvents="none" />
      ))}
      {DIAL_LABELS.map((l, k) => (
        <Animated.View key={`l${k}`} style={[styles.dialSlot, { left: NOTCH_X[k] - 26 }, dialStyle]} pointerEvents="none">
          <Text style={styles.dialLabel}>{l}</Text>
        </Animated.View>
      ))}
      <Animated.View style={[styles.ptr, { left: NOTCH_X[0] - 6 }, ptrStyle]} pointerEvents="none" />

      {/* ── three plots of ground, built one at a time ───────────────────────── */}
      {PLOTS.map((pl, k) => {
        const on = built > k;
        const justBuilt = built > k && prevBuilt <= k;
        const chosen = picked === pl.id;
        const left = PLOT_L + k * PLOT_PITCH;
        return (
          <PlotColumn
            key={pl.id}
            k={k}
            left={left}
            on={on}
            justBuilt={justBuilt}
            grow={SCENE}
            label={pl.label}
            live={platesOn}
            answered={answered}
            chosen={chosen}
            correct={pl.correct}
            onPress={() => onPick(pl.id, pl.correct)}
          />
        );
      })}

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DF} k={K_FIG} />
    </Animated.View>
  );
}

/** One plot: its plinth, whichever structure stands on it, and its label plate —
 *  which is also the answer target when the question beat is live. */
function PlotColumn({
  k, left, on, justBuilt, grow, label, live, answered, chosen, correct, onPress,
}: {
  k: number; left: number; on: boolean; justBuilt: boolean;
  grow: { value: { grow: number } };
  label: string; live: boolean; answered: boolean; chosen: boolean; correct: boolean;
  onPress: () => void;
}) {
  const st = useAnimatedStyle(() => ({ opacity: on ? (justBuilt ? grow.value.grow : 1) : 0 }));

  return (
    <>
      <View style={[styles.plinth, { left }]} pointerEvents="none" />

      <Animated.View style={[styles.structWrap, { left }, st]} pointerEvents="none">
        {k === 0 ? (
          // HOBBES — one tower, and a bar underneath it holding everyone down.
          <>
            <View style={styles.towerBody} />
            <View style={styles.towerCap} />
            <View style={styles.towerCrush} />
          </>
        ) : k === 1 ? (
          // LOCKE — a small house, with two figures left standing OUTSIDE it.
          <>
            <View style={styles.houseBody} />
            <View style={styles.houseRoof} />
            <View style={[styles.bystander, { left: 4 }]} />
            <View style={[styles.bystander, { left: 56 }]} />
          </>
        ) : (
          // ROUSSEAU — a ring, nobody above anybody.
          <>
            <View style={styles.ring} />
            <View style={[styles.ringDot, { left: 12, top: 96 }]} />
            <View style={[styles.ringDot, { left: 30, top: 84 }]} />
            <View style={[styles.ringDot, { left: 48, top: 96 }]} />
          </>
        )}
      </Animated.View>

      {live ? (
        <Pressable
          style={[styles.plate, { left }]}
          hitSlop={{ left: PLOT_SLOP, right: PLOT_SLOP, top: PLOT_SLOP_Y, bottom: PLOT_SLOP_Y }}
          disabled={answered}
          onPress={onPress}
        >
          <View style={[styles.plateInner, answered && correct && styles.plateRight, answered && chosen && !correct && styles.plateWrong]}>
            <Text style={[styles.plateText, answered && correct && styles.plateTextOn]}>{label}</Text>
          </View>
          <TargetRing answered={answered} radius={4} />
        </Pressable>
      ) : (
        <Animated.View style={[styles.plate, { left }, st]} pointerEvents="none">
          <View style={styles.plateInner}>
            <Text style={styles.plateText}>{label}</Text>
          </View>
        </Animated.View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 24, right: 14, top: GROUND, height: 1.5, backgroundColor: RULE },

  // ── dial ────────────────────────────────────────────────────────────────────
  dialBox: {
    position: 'absolute', left: DIAL_L, top: DIAL_T, width: DIAL_W, alignItems: 'center',
  },
  dialTag: {
    fontFamily: 'Inter_700Bold', fontSize: 7.5, letterSpacing: 1.1, color: SOFT,
    includeFontPadding: false,
  },
  track: {
    position: 'absolute', left: DIAL_L + 8, top: TRACK_Y, width: DIAL_W - 16, height: 2,
    backgroundColor: INK,
  },
  notch: { position: 'absolute', top: TRACK_Y - 5, width: 2, height: 12, backgroundColor: INK },
  ptr: {
    position: 'absolute', top: TRACK_Y - 15, width: 12, height: 12,
    borderWidth: 2, borderColor: INK, backgroundColor: INK, transform: [{ rotate: '45deg' }],
  },
  dialSlot: { position: 'absolute', top: TRACK_Y + 11, width: 52, alignItems: 'center' },
  dialLabel: {
    fontFamily: 'Inter_700Bold', fontSize: 7.5, letterSpacing: 0.5, color: INK,
    includeFontPadding: false,
  },

  // ── plots ───────────────────────────────────────────────────────────────────
  plinth: { position: 'absolute', top: PLINTH_Y, width: PLOT_W, height: 2, backgroundColor: RULE },
  structWrap: { position: 'absolute', top: PLINTH_Y - 142, width: PLOT_W, height: 142 },

  // Hobbes: tall, narrow, and everything pressed under it.
  towerBody: { position: 'absolute', left: 22, top: 8, width: 20, height: 126, borderWidth: 2, borderColor: INK, backgroundColor: INK },
  towerCap: { position: 'absolute', left: 14, top: 0, width: 36, height: 9, backgroundColor: INK },
  towerCrush: { position: 'absolute', left: 6, top: 134, width: 52, height: 4, backgroundColor: SOFT },

  // Locke: small, with the people still standing outside it.
  houseBody: { position: 'absolute', left: 16, top: 100, width: 32, height: 34, borderWidth: 2, borderColor: INK, backgroundColor: PAPER },
  houseRoof: {
    position: 'absolute', left: 14, top: 88, width: 0, height: 0,
    borderLeftWidth: 18, borderRightWidth: 18, borderBottomWidth: 14,
    borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: INK,
  },
  bystander: { position: 'absolute', top: 112, width: 5, height: 22, borderRadius: 2.5, backgroundColor: INK },

  // Rousseau: a ring, nobody above anybody.
  ring: {
    position: 'absolute', left: 6, top: 76, width: 52, height: 52, borderRadius: 26,
    borderWidth: 2.5, borderColor: INK,
  },
  ringDot: { position: 'absolute', width: 7, height: 7, borderRadius: 3.5, backgroundColor: INK },

  // ── the label plate, which is also the answer target ────────────────────────
  plate: { position: 'absolute', top: PLATE_T, width: PLOT_W },
  plateInner: {
    height: PLATE_H, borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: PAPER,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4,
  },
  plateRight: { backgroundColor: INK, borderColor: INK },
  plateWrong: { borderColor: SOFT, opacity: 0.45 },
  // D30 — letterSpacing 0. "SOVEREIGN" is the longest word on any plate and the inner
  // width is 52 (PLOT_W 64, less two 2-unit borders and two 4 of padding); at 0.2 of
  // tracking it measured 48.2, a 7.3% margin. These labels are deliberately two words
  // over two lines, so numberOfLines={1} is NOT available as the structural guarantee
  // it is elsewhere — a word that outgrows the line here has nothing to stop it
  // breaking, and margin is the only protection. Dropping the tracking costs nine
  // characters × 0.2 = 1.8 units and takes it to 10.8%. Widening the plate is not an
  // option: PLOT_PITCH leaves a 4-unit gutter that is tap-target slop (PLOT_SLOP).
  plateText: {
    fontFamily: 'Inter_700Bold', fontSize: 8, letterSpacing: 0, color: INK, textAlign: 'center',
    includeFontPadding: false,
  },
  plateTextOn: { color: PAPER },
});

// Art runs from the dial's tag at y 306 down to the ground line at 500, so the crop
// takes exactly that and the whole scene renders at the full width-limited scale.
export function Political11Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Political11Scene} band={[298, 512]} camera={CAM} />;
}
