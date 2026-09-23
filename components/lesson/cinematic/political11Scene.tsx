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
import { BEATS } from './political11Script';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, PAPER, useHeld, carryFrom, keepHeld, facing, useCarry, carry, lookPose,
} from './cinematicKit';
import { stageTone } from './stageTones';
import { floorStyle, lipOf, PLATE_FACE } from './stageSkin';
import { followMoves, kindOf, seedOf } from './camera';
import type { SceneApi } from './CinematicPlayer';
import { TargetRing } from './Target';

// THE STAGE IS STRUCK IN THIS LESSON'S OWN BRANCH HUE (./stageTones).
// Same three tones, same luminance to the third decimal — so every contrast
// measured against the old greys still holds and nothing on the stage moved.
const TONE = stageTone('political-philosophy');
const { RULE, STONE, SHADE } = TONE;
const LIP = lipOf(TONE);   // the ledge a toned plate stands on (scripts/skin-stage.mjs)

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

// ── the four tap events (group AH) ──────────────────────────────────────────
//
// ASK — before the dial exists, a "?" hangs where it will stand, then fades as
// the instrument fades in over the same spot (beat 1).
const ASK_CX = DIAL_L + DIAL_W / 2;
const ASK_T = 310;

// PRESS — the sovereign's weight, pressing down from the tower's cap onto the
// crowd beneath it. Column 0 is the tower's own column (beat 4).
const TOWER_COL_L = PLOT_L;
const PRESS_X = TOWER_COL_L + 50;
const PRESS_TOP = 318;
const PRESS_H = 110;
const PRESS_HEAD_TOP = PRESS_TOP + PRESS_H;

// BOUND — the limited government's own boundary, drawn around Locke's house
// alone (column 1), clear of the bystanders standing outside it (beat 7).
const HOUSE_COL_L = PLOT_L + PLOT_PITCH;
const BOUND_L = HOUSE_COL_L + 12;
const BOUND_T = 388;
const BOUND_W = 40;
const BOUND_H = 60;

// BIND / SELF — Rousseau's ring, column 2. The three spokes join the ring's own
// three dots to the point at its centre (beat 9); a small open ring then marks
// that centre (beat 10) — open, not solid, because they remain free.
const RING_COL_L = PLOT_L + 2 * PLOT_PITCH;
const RING_CX = RING_COL_L + 32;
const RING_CY = PLINTH_Y - 142 + 102;
const RING_DOTS = [
  { x: RING_COL_L + 15.5, y: PLINTH_Y - 142 + 99.5 },
  { x: RING_COL_L + 33.5, y: PLINTH_Y - 142 + 87.5 },
  { x: RING_COL_L + 51.5, y: PLINTH_Y - 142 + 99.5 },
];
// Precomputed on the JS side, the aesthetics3Scene pattern: each spoke is one
// rotated bar, so no worklet ever does trigonometry on the ring.
const SPOKES = RING_DOTS.map((d) => {
  const dx = RING_CX - d.x;
  const dy = RING_CY - d.y;
  return { x: d.x, y: d.y, len: Math.hypot(dx, dy), rot: `${(Math.atan2(dy, dx) * 180) / Math.PI}deg` };
});

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
// The four tap events (group AH). ASK genuinely turns off (the dial replaces
// it), so it is carried rather than switched; PRESS/BOUND/BIND/SELF only ever
// turn on and then stay, like the plots themselves, so a plain fade suffices.
const ASKV = BEATS.map((b) => ((b.ask ?? 0) > 0 ? 1 : 0));
const PRESSV = BEATS.map((b) => b.press ?? 0);
const BOUNDV = BEATS.map((b) => b.bound ?? 0);
const BINDV = BEATS.map((b) => b.bind ?? 0);
const SELFV = BEATS.map((b) => b.self ?? 0);

// R7c — the stage follows the seam on its own graded beat, and only there.
// Derived from the beat rather than declared as a channel so it cannot fall out
// of step with the control it is about.
const REACT = BEATS.map((b) => (b.interact?.order ? 1 : 0));

// THE SEAM IS THE LEFT SIDE'S SHARE (R7b), and the left side is THE READING OF
// HUMAN NATURE — the very words on the dial. So the dial is as present as the
// reading is doing work: ABSENT across "each chose a state, then argued back to
// nature" (the plots stand with no reading behind them), arriving across "each
// view shaped the other", and FULL by that zone's middle, where the reading is an
// equal partner, through "the view of human nature determines the state". The
// boundaries are read off the question itself, so they cannot drift from it. The
// ramp is short on purpose: the dial carries words, and a word parked half-faded
// is a smear (D35).
const SPLIT = BEATS.find((b) => b.interact?.split)?.interact?.split;
const DIAL_GONE = SPLIT?.zones[0]?.upto ?? 0.3;
const DIAL_FULL = (DIAL_GONE + (SPLIT?.zones[1]?.upto ?? 0.66)) / 2;

export default function Political11Scene({ clock, bt, bi, i, picked, onPick, dragPos, pickPos, gazeX, gazeY, gazeOn }: SceneApi) {
  const reacting = REACT[i] === 1;
  const heldS = useHeld();
  const cv = useCarry(3);
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

  // ── the four tap events (group AH) ─────────────────────────────────────────
  const askFade = ((cur.ask ?? 0) > 0) !== ((prev?.ask ?? 0) > 0);
  const pressOn = (cur.press ?? 0) > 0;
  const pressFade = pressOn !== ((prev?.press ?? 0) > 0);
  const boundOn = (cur.bound ?? 0) > 0;
  const boundFade = boundOn !== ((prev?.bound ?? 0) > 0);
  const bindOn = (cur.bind ?? 0) > 0;
  const bindFade = bindOn !== ((prev?.bind ?? 0) > 0);
  const selfOn = (cur.self ?? 0) > 0;
  const selfFade = selfOn !== ((prev?.self ?? 0) > 0);

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

    // The pointer SLIDES between notches rather than cutting, and it blends from the
    // previous beat's notch, so a beat that does not move it holds it still.
    const from = SETV[p] > 0 ? NOTCH_X[SETV[p] - 1] : NOTCH_X[0];
    const to = SETV[n] > 0 ? NOTCH_X[SETV[n] - 1] : NOTCH_X[0];

    return {
      fig: lookPose(s, carry(cv, 0, n, X[p], X[n], tr), GROUND, K_FIG, facing(DIR[p], DIR[n], bt.value), 1, gazeX.value, gazeY.value, gazeOn.value),
      // R7c — on the split beat the dial rides the seam (DIAL_GONE…DIAL_FULL).
      dial: carry(cv, 1, n, DIALV[p], reacting ? clamp01((pickPos.value - DIAL_GONE) / (DIAL_FULL - DIAL_GONE)) : DIALV[n], tr, dialFade ? grow : 1),
      ptr: lerp(from, to, ease01(bt.value / 0.62)),
      ptrOn: SETV[n] > 0 ? 1 : 0,
      grow,
      // ASK genuinely turns off (the dial arrives in its place), so it is carried
      // rather than switched (C20c, "fade an event out, not off").
      ask: carry(cv, 2, n, ASKV[p], ASKV[n], askFade ? grow : 1),
      press: pressOn ? (pressFade ? grow : 1) : 0,
      bound: boundOn ? (boundFade ? grow : 1) : 0,
      bind: bindOn ? (bindFade ? grow : 1) : 0,
      self: selfOn ? (selfFade ? grow : 1) : 0,
      t,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const dialStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.dial }));
  const ptrStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.dial * SCENE.value.ptrOn,
    transform: [{ translateX: SCENE.value.ptr - NOTCH_X[0] }],
  }));
  const askStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.ask,
    transform: [{ scale: 0.85 + SCENE.value.ask * 0.15 }],
  }));
  const pressStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.press }));
  const boundStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.bound }));
  const bindStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.bind }));
  const selfStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.self,
    transform: [{ scale: 0.6 + SCENE.value.self * 0.4 }],
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

      {/* ASK — the open question, hanging where the dial will stand (beat 1). */}
      <Animated.View style={[styles.askWrap, askStyle]} pointerEvents="none">
        <Text style={styles.askText}>?</Text>
      </Animated.View>

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

      {/* PRESS — the sovereign's weight, pressing down onto the crowd (beat 4). */}
      <Animated.View style={[styles.pressBar, { left: PRESS_X - 1.5, top: PRESS_TOP, height: PRESS_H }, pressStyle]} pointerEvents="none" />
      <Animated.View style={[styles.pressHead, { left: PRESS_X - 5, top: PRESS_HEAD_TOP }, pressStyle]} pointerEvents="none" />

      {/* BOUND — the limited government's own boundary, around the house alone (beat 7). */}
      <Animated.View style={[styles.bound, { left: BOUND_L, top: BOUND_T, width: BOUND_W, height: BOUND_H }, boundStyle]} pointerEvents="none" />

      {/* BIND — three spokes joining Rousseau's people to the general will (beat 9). */}
      {SPOKES.map((s, k) => (
        <Animated.View
          key={`sp${k}`}
          style={[styles.spoke, { left: s.x, top: s.y - 0.75, width: s.len, transform: [{ rotate: s.rot }] }, bindStyle]}
          pointerEvents="none"
        />
      ))}

      {/* SELF — the point everyone answers to, open rather than solid (beat 10). */}
      <Animated.View style={[styles.selfRing, { left: RING_CX - 6, top: RING_CY - 6 }, selfStyle]} pointerEvents="none" />

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
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.1, color: SOFT,
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
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.5, color: INK,
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
    height: PLATE_H, borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: PLATE_FACE, boxShadow: LIP,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4,
  },
  plateRight: { backgroundColor: INK, borderColor: INK },
  plateWrong: { borderColor: SOFT },
  // D30 — letterSpacing 0. "SOVEREIGN" is the longest word on any plate and the inner
  // width is 52 (PLOT_W 64, less two 2-unit borders and two 4 of padding); at 0.2 of
  // tracking it measured 48.2, a 7.3% margin. These labels are deliberately two words
  // over two lines, so numberOfLines={1} is NOT available as the structural guarantee
  // it is elsewhere — a word that outgrows the line here has nothing to stop it
  // breaking, and margin is the only protection. Dropping the tracking costs nine
  // characters × 0.2 = 1.8 units and takes it to 10.8%. Widening the plate is not an
  // option: PLOT_PITCH leaves a 4-unit gutter that is tap-target slop (PLOT_SLOP).
  plateText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0, color: INK, textAlign: 'center',
    includeFontPadding: false,
  },
  plateTextOn: { color: PAPER },

  // ── the four tap events (group AH) ───────────────────────────────────────
  //
  // ASK — a bare "?", the size of a held thought rather than a caption, since it
  // carries no word of its own (D34 does not apply to a mark).
  askWrap: { position: 'absolute', left: DIAL_L, top: ASK_T, width: DIAL_W, alignItems: 'center' },
  askText: { fontFamily: 'Inter_700Bold', fontSize: 24, color: INK, includeFontPadding: false },

  // PRESS — a bar and a downward point, INK, the same weight as a held object.
  pressBar: { position: 'absolute', width: 3, backgroundColor: INK },
  pressHead: {
    position: 'absolute', width: 0, height: 0,
    borderLeftWidth: 5, borderRightWidth: 5, borderTopWidth: 7,
    borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: INK,
  },

  // BOUND — a boundary is a dashed edge, never a fill (D31); no word rides on it.
  bound: {
    position: 'absolute', borderWidth: 1.5, borderColor: SHADE, borderStyle: 'dashed', borderRadius: 6,
  },

  // BIND — a spoke is a thin rotated bar, the aesthetics3Scene pattern.
  spoke: { position: 'absolute', height: 1.5, backgroundColor: SHADE, transformOrigin: '0% 50%' },

  // SELF — open, not solid: the same ink as the tower, drawn as a ring instead
  // of a filled mass, because Rousseau's citizens remain free.
  selfRing: { position: 'absolute', width: 12, height: 12, borderRadius: 6, borderWidth: 1.5, borderColor: INK },
});

// Art runs from the dial's tag at y 306 down to the ground line at 500, so the crop
// takes exactly that and the whole scene renders at the full width-limited scale.
export function Political11Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Political11Scene} band={[298, 512]} camera={CAM} />;
}
