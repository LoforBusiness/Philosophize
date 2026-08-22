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
import { BEATS } from './political10Script';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER, useHeld, carryFrom, keepHeld, facing, useCarry, carry,
} from './cinematicKit';
import { followMoves, kindOf, seedOf } from './camera';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';

// AN UNEQUAL STACK OF HOLDINGS, READ TWICE. Stage right, three columns of very
// different heights standing on a HISTORY TAPE whose four marks read ACQUIRED ·
// TRADED · TRADED · GIFTED. A reading head runs the tape left to right (Nozick), and
// later a LEVEL comes down across the tops and settles on the shortest column, which
// fills (Rawls). The stack itself never changes — only what is being read of it.
//
// The empty strip, its two posts and the three columns are furniture and are on from
// beat 0; the RECORD is written into the strip on the beat that says there is one.
//
// COMPOSITION / OCCLUSION —
//   · the figure stands at x = 44 (beats 0–1), then WALKS 64 units to x = 108 and
//     stays there. His widest pose is point-forward on the arrival beat: fist 34 rig
//     units out + a 5.5 fist radius at K_FIG 1.0 → x ≈ 147.5. Backwards, the widest
//     is the weigh at −26 − 5.5 → x ≈ 12 at the near mark. Body band x ≈ 12 … 148.
//   · the whole chart lives at x ≥ 172 — the tape and the level both start there —
//     so there are ~24 units of clear paper between his furthest reach and any ink
//     he is talking about. He points AT the record, never through it.
//   · vertically the chart is entirely above him: caption 238 … 252, the tallest
//     column top 266, the tape 434 … 460, the reading head 464 … 482, the level at
//     rest 374 … 386. A standing crown is y 397 and a walking one rides to ~393, so
//     the tape's posts (x 192 and 372, y 458 … 500) are the only chart ink that
//     shares his y-band, and they are 44 units right of his furthest reach.
//   · the two answer plates (Q2) take the empty left column: x 6 … 166, y 244 … 292
//     and 314 … 362. They stop 35 above his crown and 14 left of the caption, and
//     the only chart ink at their height is column 1 at x 266 … 312.
//   · nothing is drawn above y 238 or below the ground line, hence band [232, 512]
//     — 280 units, the tallest crop that still renders at the free 2.31×.
//
// DELIBERATE EXCEPTIONS (A5) —
//   · the chart floats 40 units clear of the ground on two posts. It is an
//     information surface, not an object in the room (D32), and putting it on the
//     floor would either shrink the columns to nothing or put them where the figure
//     walks.
//   · the figure walks ONCE. The columns own everything right of x 172 and his own
//     reach claims 40 units ahead of his mark, so the floor he has is x 44 … 108 —
//     room for exactly one walk that clears the 60-unit minimum (C18). A second
//     journey would have to double back, which flips `dir` in a frame.

const FIG_A = 44;                 // beats 0–1
const FIG_B = 108;                // beats 2–8, after a 64-unit walk

// ── the chart ────────────────────────────────────────────────────────────────
const TAPE_L = 172;
const TAPE_W = 220;               // 172 … 392
const TAPE_T = 434;
const TAPE_H = 26;                // 434 … 460
// RN boxes are border-box, so the four marks share the width INSIDE the 2-unit
// border — 216, not 220. Dividing the outer width instead makes the cells overflow
// and flex-shrink, which walks every mark a unit or two off the reading head.
const TAPE_IN_L = TAPE_L + 2;
const CELL_W = (TAPE_W - 4) / 4;  // 54
const MARKS = ['ACQUIRED', 'TRADED', 'TRADED', 'GIFTED'];

const CAP_T = 238;                // "HOLDINGS", 238 … 252
const CAP_H = 14;

// The columns stand ON the tape's top edge. Heights are deliberately lopsided —
// 168 against 54 is the three-to-one the hook talks about — and the shortest is the
// middle-right one, so the level has to cross two taller columns to reach it.
const COL_W = 46;
const COL_X = [190, 266, 342];    // 190…236 · 266…312 · 342…388
const COL_H = [88, 168, 54];      // tops 346 · 266 · 380
const LOW = 2;                    // the shortest — the one the level lands on

const PTR_T = 464;                // the reading head, 464 … 482

// The level: a 12-tall wrapper with the bar centred, so `top + 6` is the line the
// reader sees. At rest that is y 380 — exactly the top of the shortest column.
const LVL_L = 172;
const LVL_W = 224;                // 172 … 396
const LVL_H = 12;
const LVL_START = 258;            // comes down from just above the tallest column
const LVL_REST = 374;             // bar centre 380 = COL top of the shortest

// ── the two answer plates (Q2) ───────────────────────────────────────────────
// SIZED FOR A FINGER. The band is 280 units, so on a 360dp phone the scene renders
// at fit ≈ 0.88: a 48-unit plate is 42dp tall on a 70-unit (61.6dp) pitch, against
// a fingertip covering ~45dp. The slop below claims the whole 22-unit gutter and
// not one unit more — wider and the two targets would overlap, at which point the
// topmost silently wins (E37b-2).
const PL_L = 6;
const PL_W = 160;                 // 6 … 166
const PL_H = 48;
const PL_T = 244;
const PL_GAP = 70;
/** Half the gap — more would overlap the neighbour, and the topmost would win. */
const PL_SLOP = (PL_GAP - PL_H) / 2;

// The heights plate sits nearest the columns and the tape plate nearest the tape, so
// each target is on the side of the stage its answer lives on.
// Labels hand-cut to the box rather than to taste: the plate's inner width is
// 160 − 4 border − 16 padding = 140 units, and "COLUMN HEIGHTS" at 12.5 measures
// about 111. "THE COLUMN HEIGHTS" would have come to 134 — inside, but close enough
// that one wider glyph strands "HEIGHTS" on a second line (D30, D32b).
const PLATES = [
  { id: 'heights', label: 'COLUMN HEIGHTS', correct: false },
  { id: 'tape', label: 'HISTORY TAPE', correct: true },
];

const P = BEATS.map((b) => b.p ?? 0);
const X = BEATS.map((b) => b.x ?? FIG_B);
// The camera, from the staging: it follows the figure this track describes,
// pulls back to scale 1 on every graded beat so a tap lands where it is aimed,
// and leans in on the quote. See followMoves in ./camera.ts.
const CAM = followMoves(X, BEATS.map(kindOf), seedOf('political10'));
const DIR = dirsFrom(X, 1);

export default function Political10Scene({ clock, bt, bi, i, picked, onPick }: SceneApi) {
  const heldS = useHeld();
  const cv = useCarry(1);
  const cur = BEATS[i];
  const prev = i > 0 ? BEATS[i - 1] : undefined;

  // Everything below is "did THIS beat change it" — a prop whose value is the same
  // on both beats holds instead of re-revealing itself behind the reader (C20c).
  const tapeOn = (cur.tape ?? 0) > 0;
  const tapeFade = tapeOn && !((prev?.tape ?? 0) > 0);

  const curPtr = cur.ptr ?? 0;
  const prevPtr = prev?.ptr ?? 0;
  const ptrOn = curPtr > 0;
  const ptrFade = ptrOn && prevPtr === 0;
  // It always ENTERS at the first mark and then walks the tape, so the sweep is the
  // whole point of the beat rather than a jump cut to the far end.
  const ptrFrom = prevPtr > 0 ? prevPtr : 1;
  const ptrTo = ptrOn ? curPtr : ptrFrom;
  const ptrMoved = ptrOn && ptrFrom !== ptrTo;

  const lvlOn = (cur.ruler ?? 0) > 0;
  const lvlFade = lvlOn && !((prev?.ruler ?? 0) > 0);

  const platesOn = (cur.plates ?? 0) > 0;
  const platesFade = platesOn && !((prev?.plates ?? 0) > 0);

  const answered = picked !== null;

  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / moveTr(X[p], X[n], 0.85));
    const t = clock.value;
    // The tape is pinned up as he ARRIVES, not while he is still walking toward it,
    // so the two things happen in an order rather than at once (C22c).
    const late = ease01(clamp01((bt.value - 0.8) / 0.7));

    const s = keepHeld(heldS, travelStance(
      X[p], X[n],
      carryFrom(heldS, n, emoteHold(P[p], t)), emoteHold(P[n], t), emoteLive(P[n], t, bt.value),
      tr, WALK,
    ));

    // Smoothstepped at both ends, so the reading head leaves and arrives at zero
    // speed instead of snapping into its stop (C22e).
    const sweep = ptrMoved ? ease01(clamp01((bt.value - 0.55) / 2.0)) : 1;
    const drop = lvlFade ? ease01(clamp01(bt.value / 1.5)) : 1;

    return {
      fig: pose(s, carry(cv, 0, n, X[p], X[n], tr), GROUND, K_FIG, facing(DIR[p], DIR[n], bt.value), 1),
      tape: tapeOn ? (tapeFade ? late : 1) : 0,
      ptr: ptrOn ? (ptrFade ? ease01(clamp01(bt.value / 0.5)) : 1) : 0,
      ptrX: (lerp(ptrFrom, ptrTo, sweep) - 1) * CELL_W,
      lvl: lvlOn ? (lvlFade ? ease01(clamp01(bt.value / 0.45)) : 1) : 0,
      lvlY: lerp(LVL_START, LVL_REST, drop),
      // The column lighting up is a REACTION to the level landing, so it starts
      // after the drop is most of the way down and finishes just behind it (C20d).
      low: lvlOn ? (lvlFade ? ease01(clamp01((bt.value - 1.2) / 0.7)) : 1) : 0,
      plates: platesOn ? (platesFade ? ease01(clamp01(bt.value / 0.6)) : 1) : 0,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const tapeStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.tape }));
  const ptrStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.ptr,
    transform: [{ translateX: SCENE.value.ptrX }],
  }));
  const lvlStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.lvl,
    transform: [{ translateY: SCENE.value.lvlY }],
  }));
  const lowStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.low }));
  const plateStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.plates }));

  return (
    <Animated.View style={styles.scene}>
      {/* ── the stack of holdings ───────────────────────────────────────────── */}
      <Text style={styles.caption} pointerEvents="none">HOLDINGS</Text>

      {COL_X.map((cx, k) => (
        <View
          key={cx}
          style={[styles.col, { left: cx, top: TAPE_T - COL_H[k], height: COL_H[k] }]}
          pointerEvents="none"
        />
      ))}
      {/* the shortest one fills in once the level has come to rest on it */}
      <Animated.View
        style={[
          styles.colLow,
          { left: COL_X[LOW], top: TAPE_T - COL_H[LOW], height: COL_H[LOW] },
          lowStyle,
        ]}
        pointerEvents="none"
      />

      {/* ── the tape the columns stand on, and the posts holding it up ──────── */}
      {/* The empty strip is furniture and never moves — otherwise the columns spend
          the first two beats standing on nothing. Only the RECORD is written into
          it, on the beat the narration says there is one. */}
      <View style={styles.postL} pointerEvents="none" />
      <View style={styles.postR} pointerEvents="none" />
      <View style={styles.tape} pointerEvents="none">
        {MARKS.map((m, k) => (
          <View key={`slot${k}`} style={styles.cell}>
            {k > 0 ? <View style={styles.divider} /> : null}
          </View>
        ))}
      </View>
      <Animated.View style={[styles.marks, tapeStyle]} pointerEvents="none">
        {MARKS.map((m, k) => (
          <View key={`${m}${k}`} style={styles.cell}>
            <Text style={styles.mark}>{m}</Text>
          </View>
        ))}
      </Animated.View>

      {/* the reading head that runs the tape */}
      <Animated.View style={[styles.ptr, ptrStyle]} pointerEvents="none">
        <View style={styles.ptrHead} />
        <View style={styles.ptrBar} />
      </Animated.View>

      {/* ── the level laid across the tops ──────────────────────────────────── */}
      <Animated.View style={[styles.lvl, lvlStyle]} pointerEvents="none">
        <View style={styles.lvlTickL} />
        <View style={styles.lvlBar} />
        <View style={styles.lvlTickR} />
      </Animated.View>

      {/* ── Q2: which of the two does Nozick read? ──────────────────────────── */}
      {platesOn &&
        PLATES.map((pl, k) => {
          const chosen = picked === pl.id;
          return (
            <Animated.View key={pl.id} style={[styles.plateSlot, { top: PL_T + k * PL_GAP }, plateStyle]}>
              <Target id={pl.id} correct={pl.correct} picked={picked} onPick={onPick}
              hitSlop={{ top: PL_SLOP, bottom: PL_SLOP, left: PL_SLOP, right: PL_SLOP }} disabled={answered}>
                <View
                  style={[
                    styles.plate,
                    answered && pl.correct && styles.plateRight,
                    answered && chosen && !pl.correct && styles.plateWrong,
                  ]}
                >
                  <Text style={[styles.plateText, answered && pl.correct && styles.plateTextOn]}>
                    {pl.label}
                  </Text>
                </View>
              </Target>
            </Animated.View>
          );
        })}

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DF} k={K_FIG} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 20, right: 12, top: GROUND, height: 1.5, backgroundColor: RULE },

  caption: {
    position: 'absolute', left: TAPE_L, top: CAP_T, width: TAPE_W, height: CAP_H,
    textAlign: 'center', fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 1.6,
    color: SOFT, includeFontPadding: false,
  },

  // Outlined, not filled: the level has to be visible where it crosses a taller
  // column, and an ink bar on an ink bar is nothing.
  col: {
    position: 'absolute', width: COL_W,
    borderWidth: 2, borderColor: INK, borderRadius: 3, backgroundColor: PAPER,
  },
  colLow: {
    position: 'absolute', width: COL_W,
    borderWidth: 2, borderColor: INK, borderRadius: 3, backgroundColor: INK,
  },

  tape: {
    position: 'absolute', left: TAPE_L, top: TAPE_T, width: TAPE_W, height: TAPE_H,
    borderWidth: 2, borderColor: INK, borderRadius: 3, backgroundColor: PAPER,
    flexDirection: 'row',
  },
  marks: {
    position: 'absolute', left: TAPE_IN_L, top: TAPE_T + 2, width: TAPE_W - 4, height: TAPE_H - 4,
    flexDirection: 'row',
  },
  cell: { width: CELL_W, height: '100%', alignItems: 'center', justifyContent: 'center' },
  divider: { position: 'absolute', left: 0, top: 3, bottom: 3, width: 1, backgroundColor: RULE },
  // "ACQUIRED" is the longest mark: 8 caps at 8pt measures about 43 of the cell's
  // 54, which leaves ~5 units — 4.8dp at this lesson's fit — either side (D31b).
  mark: {
    fontFamily: 'Inter_700Bold', fontSize: 8, letterSpacing: 0.4, color: INK,
    includeFontPadding: false,
  },
  postL: { position: 'absolute', left: 192, top: TAPE_T + TAPE_H - 2, width: 2.5, height: GROUND - TAPE_T - TAPE_H + 2, backgroundColor: SOFT },
  postR: { position: 'absolute', left: 372, top: TAPE_T + TAPE_H - 2, width: 2.5, height: GROUND - TAPE_T - TAPE_H + 2, backgroundColor: SOFT },

  ptr: { position: 'absolute', left: TAPE_IN_L, top: PTR_T, width: CELL_W, alignItems: 'center' },
  ptrHead: { width: 11, height: 11, backgroundColor: INK, transform: [{ rotate: '45deg' }] },
  ptrBar: { width: 40, height: 3, marginTop: 4, backgroundColor: INK, borderRadius: 1.5 },

  lvl: { position: 'absolute', left: LVL_L, top: 0, width: LVL_W, height: LVL_H, flexDirection: 'row', alignItems: 'center' },
  lvlBar: { flex: 1, height: 3, backgroundColor: INK },
  lvlTickL: { width: 3, height: LVL_H, backgroundColor: INK },
  lvlTickR: { width: 3, height: LVL_H, backgroundColor: INK },

  plateSlot: { position: 'absolute', left: PL_L, width: PL_W },
  plate: {
    height: PL_H, borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: PAPER,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8,
  },
  plateRight: { backgroundColor: INK, borderColor: INK },
  plateWrong: { borderColor: SOFT, opacity: 0.45 },
  plateText: {
    fontFamily: 'Inter_700Bold', fontSize: 12.5, letterSpacing: 0.2, color: INK,
    includeFontPadding: false,
  },
  plateTextOn: { color: PAPER },
});

// Art runs from the HOLDINGS caption (238) down to the ground line (500), and the
// answer plates top out at 244 — so the crop is [232, 512], 280 units, which is the
// tallest band that still renders at the free 2.31× (H59).
export function Political10Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Political10Scene} band={[232, 512]} camera={CAM} />;
}
