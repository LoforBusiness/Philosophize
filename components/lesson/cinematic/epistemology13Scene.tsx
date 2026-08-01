import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import {
  WALK, dirsFrom, ease01, emoteHold, emoteLive, lerp, moveTr, pose, travelStance, type Bundle,
} from './rig';
import { BEATS } from './epistemology13Script';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER } from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';

// A board of lottery tickets stage right, the figure working downstage left.
//
// COMPOSITION, in coordinates:
// · the figure WALKS x = 70 → 168 → 124. Body span x ± 36, widest x 132…204 at 168;
//   the working fist at gesture 41 reaches x 204.5.
// · the grid occupies x 216…392 exactly (5 columns of 32 on a 36 pitch), so the
//   closest ink to the figure is 11.5 units away at the worst beat.
// · grid y 226…316 (4 rows of 22 on a 26 pitch) · the winner line y 328…350 · the
//   answer row y 364…396. A standing crown is y 397, so nothing on the board ever
//   shares a row with the head — and none of it shares the figure's x in any case.
//
// The strike-throughs are drawn as a bar ACROSS each cell rather than as an overlay
// pinned near it, so they cannot land on a neighbouring ticket's number (D31).

const GRID_L = 216;
const COLS = 5;
const ROWS = 4;
const CELL_W = 32;
const CELL_H = 22;
const CELL_GX = 4;
const CELL_GY = 4;
const GRID_T = 226;
const GRID_W = COLS * CELL_W + (COLS - 1) * CELL_GX;      // 176
const GRID_R = GRID_L + GRID_W;                            // 392

const WIN_T = 328;
const WIN_H = 22;

const ANS_T = 364;
const ANS_H = 32;
const ANS_GAP = 5;
const ANS_W = (GRID_W - 2 * ANS_GAP) / 3;

// Ticket numbers, fixed rather than generated, so the picture is identical on every
// run and a reader who replays sees the same draw.
const TICKETS = Array.from({ length: COLS * ROWS }, (_, k) => 400_001 + k * 7919);

// The third option is the honest one, and the two decoys are the two things people
// actually reach for: pick any ticket, or pick the one you did not buy (H66).
const ANSWERS = [
  { id: 'none', label: 'NO IDEA', correct: true },
  { id: 'first', label: 'FIRST', correct: false },
  { id: 'other', label: 'NOT MINE', correct: false },
];

const P = BEATS.map((b) => b.p ?? 0);
const X = BEATS.map((b) => b.x ?? 124);
const DIR = dirsFrom(X, 1);
const GRIDV = BEATS.map((b) => b.grid ?? 0);
const OFF = BEATS.map((b) => b.off ?? 0);

function cellLeft(k: number) { return GRID_L + (k % COLS) * (CELL_W + CELL_GX); }
function cellTop(k: number) { return GRID_T + Math.floor(k / COLS) * (CELL_H + CELL_GY); }

export default function Epistemology13Scene({ clock, bt, bi, i, picked, onPick }: SceneApi) {
  const cur = BEATS[i];
  const prev = i > 0 ? BEATS[i - 1] : undefined;

  const gridFade = (cur.grid ?? 0) !== (prev?.grid ?? 0);
  const off = cur.off ?? 0;
  const prevOff = prev?.off ?? 0;
  const winOn = (cur.winner ?? 0) > 0;
  const winFade = (cur.winner ?? 0) !== (prev?.winner ?? 0);

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
    return {
      fig: pose(s, lerp(X[p], X[n], tr), GROUND, K_FIG, DIR[n], 1),
      grid: lerp(GRIDV[p], GRIDV[n], tr) * (gridFade ? grow : 1),
      // How far the strike-through has spread, 0…2, so a cell can read its own share.
      strike: lerp(OFF[p], OFF[n], grow),
      winner: winOn ? (winFade ? grow : 1) : 0,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const gridStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.grid }));
  const winStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.winner }));

  const answered = picked !== null;
  const showPick = (cur.pick ?? 0) > 0 && !!cur.interact;

  return (
    <Animated.View style={styles.scene}>
      {/* ── the draw ────────────────────────────────────────────────────────── */}
      <Animated.View style={[styles.grid, gridStyle]} pointerEvents="none">
        {TICKETS.map((num, k) => (
          <View key={num} style={[styles.cell, { left: cellLeft(k), top: cellTop(k) }]}>
            <Text style={styles.cellText} numberOfLines={1}>{num}</Text>
          </View>
        ))}
        {TICKETS.map((num, k) => (
          <Strike key={`s${num}`} index={k} off={off} prevOff={prevOff} SCENE={SCENE} />
        ))}
      </Animated.View>

      {/* the thing the grid now contradicts */}
      <Animated.View style={[styles.winLine, winStyle]} pointerEvents="none">
        <Text style={styles.winText} numberOfLines={1}>…AND THIS DRAW HAS A WINNER</Text>
      </Animated.View>

      {/* ── Q2: point at the winner ─────────────────────────────────────────── */}
      {showPick &&
        ANSWERS.map((a, k) => {
          const chosen = picked === a.id;
          return (
            <Pressable
              key={a.id}
              style={[styles.ans, { left: GRID_L + k * (ANS_W + ANS_GAP) }]}
              hitSlop={{ top: 6, bottom: 6, left: ANS_GAP / 2, right: ANS_GAP / 2 }}
              disabled={answered}
              onPress={() => onPick(a.id, a.correct)}
            >
              <View
                style={[
                  styles.ansInner,
                  answered && a.correct && styles.pickRight,
                  answered && chosen && !a.correct && styles.pickWrong,
                ]}
              >
                <Text
                  style={[styles.ansText, answered && a.correct && styles.onInk]}
                  numberOfLines={1}
                >
                  {a.label}
                </Text>
              </View>
            </Pressable>
          );
        })}

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DF} k={K_FIG} />
    </Animated.View>
  );
}

/**
 * One ticket's strike-through. `off` 1 marks only the first cell; `off` 2 marks all
 * of them, and each cell's bar wipes in on its own small delay so the sweep reads
 * as a sweep rather than as one frame changing.
 */
function Strike({
  index, off, prevOff, SCENE,
}: {
  index: number; off: number; prevOff: number;
  SCENE: { value: { strike: number } };   // read-only view; DerivedValue<T> is invariant
}) {
  const target = off >= 2 || (off >= 1 && index === 0) ? 1 : 0;
  const had = prevOff >= 2 || (prevOff >= 1 && index === 0) ? 1 : 0;
  const stagger = index / (COLS * ROWS);
  const st = useAnimatedStyle(() => {
    if (target === 0) return { opacity: 0, transform: [{ scaleX: 0 }] };
    if (had === 1) return { opacity: 1, transform: [{ scaleX: 1 }] };
    // Arriving: SCENE.strike runs prevOff → off, so map its tail onto this cell.
    const u = Math.max(0, Math.min(1, (SCENE.value.strike - prevOff) / Math.max(0.001, off - prevOff)));
    const a = Math.max(0, Math.min(1, (u - stagger * 0.5) / 0.5));
    return { opacity: a, transform: [{ scaleX: a }] };
  });
  return (
    <Animated.View
      style={[styles.strike, { left: cellLeft(index) + 3, top: cellTop(index) + CELL_H / 2 - 1 }, st]}
      pointerEvents="none"
    />
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 24, right: 14, top: GROUND, height: 1.5, backgroundColor: RULE },

  grid: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H },
  cell: {
    position: 'absolute', width: CELL_W, height: CELL_H,
    borderWidth: 1.5, borderColor: INK, borderRadius: 2, backgroundColor: PAPER,
    alignItems: 'center', justifyContent: 'center',
  },
  cellText: {
    fontFamily: 'Inter_500Medium', fontSize: 7, letterSpacing: 0, color: SOFT,
    includeFontPadding: false,
  },
  strike: {
    position: 'absolute', width: CELL_W - 6, height: 2, backgroundColor: INK,
    transformOrigin: '0% 50%',
  },

  winLine: {
    position: 'absolute', left: GRID_L, top: WIN_T, width: GRID_W, height: WIN_H,
    borderWidth: 2, borderColor: INK, borderRadius: 3, backgroundColor: INK,
    alignItems: 'center', justifyContent: 'center',
  },
  winText: {
    fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 0.8, color: PAPER,
    includeFontPadding: false,
  },

  ans: { position: 'absolute', top: ANS_T, width: ANS_W },
  ansInner: {
    height: ANS_H, borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: PAPER,
    alignItems: 'center', justifyContent: 'center',
  },
  // 9/0 rather than 9.5/0.3: these chips are ~52 units of inner width on ONE line,
  // so the whole string must fit, not its longest word. The house size for a
  // three-across answer row (D30).
  ansText: {
    fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 0, color: INK,
    includeFontPadding: false,
  },
  onInk: { color: PAPER },
  pickRight: { backgroundColor: INK, borderColor: INK },
  pickWrong: { borderColor: SOFT, opacity: 0.45 },
});

// Ink runs from the grid's top row (226) to the ground line (500). Band 220…512 is
// 292 units, inside the 280–300 its siblings occupy (H59).
export function Epistemology13Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Epistemology13Scene} band={[220, 512]} />;
}
