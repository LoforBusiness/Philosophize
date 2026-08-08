import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { ease01, lerp, mixStance, pose, type Bundle } from './rig';
// The whole movement library, not just rig's 49 emotes. Codes under 100 ARE
// rig's and mean exactly what they always did; 100+ reach moves.ts (emoteAny).
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './logic6Script';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER } from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';

// The conditional, drawn as one tall column of information down the right of the stage
// while the figure holds the left:
//
//   · THE TWO BOXES   [ANTECEDENT · IF it rains] over [CONSEQUENT · THEN the streets
//     get wet], stacked and full-column-width, wired by a bold arrow that DRAWS itself
//     and is captioned THE LINK — the one thing a conditional actually asserts.
//   · THE RAIN DEMO   drops fall onto the IF box; water rises in the THEN box.
//   · THE PROMISE TABLE  a plain-language truth table: rains? · streets wet? · promise.
//     Four rows, and exactly ONE — rain with dry streets — is stamped in solid ink as
//     the only way to break the promise. That single stamped row is the visual answer
//     to both graded questions: no rain at all still leaves the promise kept.
//
// Camera is IDENTITY (there is no wrapper transform), so every constant here is a FINAL
// stage coordinate and the band at the bottom reads straight off them. Composition
// rule: the figure never stands past x = 58 and its widest gesture reaches ~111, while
// the column starts at 138 — so the figure can never cover what it is teaching from.

const FIG_X = 58;

const COL_L = 138;
const COL_W = 250;
const COL_MID = COL_L + COL_W / 2;          // 263

// ── the rain, and the scene's tap instruction (same clear strip) ─────────────
const HDR_T = 206;
const RAIN_T = 206;
const RAIN_B = 230;                          // drops slip behind the IF box's top edge
const RAINCOLS = [164, 200, 236, 272, 308, 344];

// ── the two boxes and the arrow between them ────────────────────────────────
const BOX_H = 62;
const IF_T = 226;                            // 226–288
const SHAFT_T = 288;                         // 288–302
const HEAD_T = 302;                          // 302–315
const THEN_T = 316;                          // 316–378

// ── the promise table ───────────────────────────────────────────────────────
const TBL_T = 386;
const TBL_H = 105;                           // 386–491
const COLS = [74, 92, 84];
const HEADS = ['IT RAINS', 'STREETS WET', 'THE PROMISE'];
const ROWS = [
  { id: 'r1', cells: ['YES', 'YES', 'KEPT'], broken: false },
  { id: 'r2', cells: ['YES', 'NO', 'BROKEN'], broken: true },
  { id: 'r3', cells: ['NO', 'YES', 'KEPT'], broken: false },
  { id: 'r4', cells: ['NO', 'NO', 'KEPT'], broken: false },
];

const P_CODE = BEATS.map((b) => b.p ?? 0);
const LINK = BEATS.map((b) => b.link ?? 0);
const RAIN = BEATS.map((b) => b.rain ?? 0);
const TABLE = BEATS.map((b) => b.table ?? 0);

export default function Logic6Scene({ clock, bt, bi, i, picked, onPick }: SceneApi) {
  const cur = BEATS[i];
  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / 0.85);
    const t = clock.value;
    const s = mixStance(emoteHold(P_CODE[p], t), emoteLive(P_CODE[n], t, bt.value), tr);
    return {
      fig: pose(s, FIG_X, GROUND, K_FIG, 1, 1),
      link: lerp(LINK[p], LINK[n], tr),
      rain: lerp(RAIN[p], RAIN[n], tr),
      table: lerp(TABLE[p], TABLE[n], tr),
      t,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  // The shaft grows down from the IF box and the head rides to the end of it, so the
  // link is DRAWN rather than switched on.
  const shaftStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.link,
    transform: [{ scaleY: SCENE.value.link }],
  }));
  const headStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.link,
    transform: [{ translateY: (SCENE.value.link - 1) * 14 }],
  }));
  const linkLabelStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.link }));
  const wetStyle = useAnimatedStyle(() => ({ height: 6 + SCENE.value.rain * 20 }));
  const tableStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.table,
    transform: [{ translateY: (1 - SCENE.value.table) * 12 }],
  }));

  const answered = picked !== null;
  const showTap = (cur.tapBoxes ?? 0) > 0 && !!cur.interact;

  const box = (id: 'if' | 'then', top: number, tag: string, kw: string, val: string) => {
    const chosen = picked === id;
    const correct = id === 'if';
    const on = answered && correct;
    const inner = (
      <View style={[styles.box, on && styles.boxRight, answered && chosen && !correct && styles.boxWrong]}>
        {id === 'then' ? <Animated.View style={[styles.wet, wetStyle]} pointerEvents="none" /> : null}
        <Text style={[styles.boxTag, on && styles.onPaper]}>{tag}</Text>
        <View style={styles.boxLine}>
          <Text style={[styles.boxKw, on && styles.onPaper]}>{kw}</Text>
          <Text style={[styles.boxVal, on && styles.onPaper]}>{val}</Text>
        </View>
      </View>
    );
    return showTap ? (
      <Target id={id} correct={correct} picked={picked} onPick={onPick}
              key={id} style={[styles.boxHit, { top }]} disabled={answered}>
        {inner}
      </Target>
    ) : (
      <View key={id} style={[styles.boxHit, { top }]} pointerEvents="none">{inner}</View>
    );
  };

  return (
    <View style={styles.scene}>
      <View style={styles.ground} pointerEvents="none" />

      {/* the instruction, only on the beat that asks for a tap */}
      {showTap ? <Text style={styles.sceneHdr} pointerEvents="none">TAP THE CONDITION</Text> : null}

      {/* rain, drawn BEFORE the boxes so the drops vanish behind the IF box */}
      {RAINCOLS.map((x, k) => <Drop key={x} S={SCENE} x={x} k={k} />)}

      {/* ── the conditional itself ─────────────────────────────────────────── */}
      {box('if', IF_T, 'ANTECEDENT', 'IF', 'it rains')}

      <Animated.View style={[styles.shaft, shaftStyle]} pointerEvents="none" />
      <Animated.View style={[styles.head, headStyle]} pointerEvents="none" />
      <Animated.Text style={[styles.linkLabel, linkLabelStyle]} pointerEvents="none">THE LINK</Animated.Text>

      {box('then', THEN_T, 'CONSEQUENT', 'THEN', 'the streets get wet')}

      {/* ── the promise table ──────────────────────────────────────────────── */}
      <Animated.View style={[styles.table, tableStyle]} pointerEvents="none">
        <View style={styles.trHead}>
          {HEADS.map((h, c) => (
            <View key={h} style={[styles.cell, { flex: COLS[c] }, c < 2 && styles.cellDiv]}>
              <Text style={styles.th}>{h}</Text>
            </View>
          ))}
        </View>
        {ROWS.map((r) => (
          <View key={r.id} style={[styles.tr, r.broken && styles.trBroken]}>
            {r.cells.map((v, c) => (
              <View key={`${r.id}${c}`} style={[styles.cell, { flex: COLS[c] }, c < 2 && styles.cellDiv]}>
                <Text style={[styles.td, r.broken && styles.onPaper]}>{v}</Text>
              </View>
            ))}
          </View>
        ))}
      </Animated.View>

      <Stickman D={DF} k={K_FIG} />
    </View>
  );
}

/** One falling drop. Fades as it drops, then restarts — never a visible loop point. */
function Drop({ S, x, k }: { S: SharedValue<any>; x: number; k: number }) {
  const st = useAnimatedStyle(() => {
    const f = ((S.value.t * 1.1 + k * 0.17) % 1 + 1) % 1;
    return { opacity: S.value.rain * (1 - f), transform: [{ translateY: lerp(0, RAIN_B - RAIN_T, f) }] };
  });
  return <Animated.View style={[styles.drop, { left: x }, st]} pointerEvents="none" />;
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 14, width: 110, top: GROUND, height: 1.5, backgroundColor: RULE },
  onPaper: { color: PAPER },

  sceneHdr: {
    position: 'absolute', left: COL_L, top: HDR_T, width: COL_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 1.4, color: SOFT, includeFontPadding: false,
  },
  drop: { position: 'absolute', top: RAIN_T, width: 3.5, height: 12, backgroundColor: SOFT, borderRadius: 2 },

  // ── the two boxes ──────────────────────────────────────────────────────────
  boxHit: { position: 'absolute', left: COL_L, width: COL_W },
  box: {
    width: COL_W, height: BOX_H, borderWidth: 3, borderColor: INK, borderRadius: 9,
    backgroundColor: PAPER, alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  boxRight: { borderColor: INK, backgroundColor: INK },
  boxWrong: { borderColor: SOFT, opacity: 0.45 },
  wet: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: SOFT, opacity: 0.3 },
  boxTag: { fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 1.8, color: SOFT, includeFontPadding: false },
  boxLine: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
  boxKw: { fontFamily: 'Inter_700Bold', fontSize: 18, letterSpacing: 1.2, color: INK, includeFontPadding: false },
  boxVal: { fontFamily: 'Inter_400Regular', fontSize: 16, color: INK, marginLeft: 8, includeFontPadding: false },

  // ── the arrow ──────────────────────────────────────────────────────────────
  shaft: {
    position: 'absolute', left: COL_MID - 3.5, top: SHAFT_T, width: 7, height: HEAD_T - SHAFT_T,
    backgroundColor: INK, transformOrigin: '50% 0%',
  },
  head: {
    position: 'absolute', left: COL_MID - 10, top: HEAD_T, width: 0, height: 0,
    borderLeftWidth: 10, borderRightWidth: 10, borderTopWidth: 13,
    borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: INK,
  },
  linkLabel: {
    position: 'absolute', left: COL_L + 12, top: SHAFT_T + 6, width: 96, textAlign: 'right',
    fontFamily: 'Inter_700Bold', fontSize: 9.5, letterSpacing: 1.8, color: SOFT, includeFontPadding: false,
  },

  // ── the promise table ──────────────────────────────────────────────────────
  table: {
    position: 'absolute', left: COL_L, top: TBL_T, width: COL_W, height: TBL_H,
    borderWidth: 2.5, borderColor: INK, borderRadius: 6, backgroundColor: PAPER, overflow: 'hidden',
  },
  trHead: { flexDirection: 'row', height: 20 },
  tr: { flexDirection: 'row', height: 20, borderTopWidth: 1.5, borderTopColor: RULE },
  trBroken: { backgroundColor: INK },
  cell: { alignItems: 'center', justifyContent: 'center' },
  cellDiv: { borderRightWidth: 1.5, borderRightColor: RULE },
  th: { fontFamily: 'Inter_700Bold', fontSize: 8.5, letterSpacing: 1, color: SOFT, includeFontPadding: false },
  td: { fontFamily: 'Inter_700Bold', fontSize: 12, letterSpacing: 0.6, color: INK, includeFontPadding: false },
});

// Extremes across every beat: the tap instruction and the rain both start at y 206 (the
// drops fall to 230 and slip behind the IF box), the boxes 226–288 and 316–378 with the
// arrow 288–315 between them, the promise table 386–491, the figure's crown ≈357 down to
// its feet at 500, and the ground rule ends at 501.5. Nothing animates vertically beyond
// those bounds — the arrow head only rides UP toward its shaft — so cropping to
// [198, 508] renders the stage at ~2.09× instead of the letterboxed 1.15×.
export function Logic6Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Logic6Scene} band={[198, 508]} />;
}
