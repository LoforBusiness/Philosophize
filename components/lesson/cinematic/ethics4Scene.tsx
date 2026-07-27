import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { clamp01, ease01, emoteHold, emoteLive, lerp, mixStance, pose, type Bundle } from './rig';
import { BEATS } from './ethics4Script';
import { K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER } from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';

// ─────────────────────────────────────────────────────────────────────────────
// A TWO-LAYER DIAGRAM with the argument happening inside it.
//
//   the SURFACE (y 206–276)   two culture tablets, side by side, whose rows are
//                             written in one at a time — codes that plainly differ
//   the ARGUERS  (y 287–434)  two figures under their own emblems, facing off
//   the FLOOR   (y 444–510)   Brown's human universals as a bar chart: four traits,
//                             four bars, every one of them running the full track
//
// On the verdict beat the tablets give way to two big stamps, so Q2 is answered by
// tapping the stage. The camera is identity — design coordinates ARE final stage
// coordinates, so the band below can be read straight off these constants.
// ─────────────────────────────────────────────────────────────────────────────

const A_X = 118;
const B_X = 282;
const FIG_G = 434;                       // the ground the two arguers stand on

// ── the surface: two codes that differ ──────────────────────────────────────
const TAB_T = 206;
const TAB_H = 70;
const TAB_W = 176;
const TAB_L = 14;
const TAB_R = 210;
const CODE_ROW = [234, 247, 260];
const CODE_A = ['BURY THE DEAD', 'HEADS COVERED', 'NO PORK'];
const CODE_B = ['BURN THE DEAD', 'HEADS BARE', 'NO BEEF'];

// ── the floor: every bar full, because every society has it ─────────────────
const CHART_T = 460;
const PITCH = 13;
const BAR_L = 152;
const BAR_W = 188;
const BAR_H = 11;
const TRAITS = ['FAIRNESS', 'RECIPROCITY', 'NO MURDER', 'INCEST TABOO'];

// ── the scene-answered verdict (Q2) ─────────────────────────────────────────
// 176 × 48 each — comfortably past the 132 × 38 floor for a thumb, and the labels
// are three short words so they sit on one line at 14px.
const V_T = 224;
const VERDICTS = [
  { id: 'follows', label: 'IT FOLLOWS', x: TAB_L, correct: false },
  { id: 'doesnt', label: 'IT DOES NOT', x: TAB_R, correct: true },
];

const A_CODE = BEATS.map((b) => b.a ?? 0);
const B_CODE = BEATS.map((b) => b.b ?? 0);
const FLOOR = BEATS.map((b) => b.floor ?? 0);
const ROWS = BEATS.map((b) => b.rows ?? 0);

export default function Ethics4Scene({ clock, bt, bi, i, picked, onPick }: SceneApi) {
  const cur = BEATS[i];
  const answered = picked !== null;
  const asking = !!cur.interact;

  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / 0.85);
    const t = clock.value;

    const a = mixStance(emoteHold(A_CODE[p], t), emoteLive(A_CODE[n], t, bt.value), tr);
    const b = mixStance(emoteHold(B_CODE[p], t), emoteLive(B_CODE[n], t, bt.value), tr);
    return {
      a: pose(a, A_X, FIG_G, K_FIG, 1, 1),
      b: pose(b, B_X, FIG_G, K_FIG, -1, 1),
      floor: lerp(FLOOR[p], FLOOR[n], tr),
      rows: lerp(ROWS[p], ROWS[n], tr),
      t,
    };
  });

  const DA = useDerivedValue<Bundle>(() => SCENE.value.a);
  const DB = useDerivedValue<Bundle>(() => SCENE.value.b);
  const chartStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.floor }));

  return (
    <Animated.View style={styles.scene}>
      {/* ── the surface: two tablets of differing custom ─────────────────── */}
      {!asking && (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <Text style={styles.layerLabel}>THE SURFACE — THESE CODES DIFFER</Text>
          <Tablet left={TAB_L} name="CULTURE A" emblem="tri" rows={CODE_A} S={SCENE} />
          <Tablet left={TAB_R} name="CULTURE B" emblem="dia" rows={CODE_B} S={SCENE} />
        </View>
      )}

      {/* ── the two arguers ───────────────────────────────────────────────── */}
      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DA} k={K_FIG} />
      <Stickman D={DB} k={K_FIG} />

      {/* ── the floor: Brown's universals, drawn as a bar chart ───────────── */}
      <Animated.View style={[StyleSheet.absoluteFill, chartStyle]} pointerEvents="none">
        <Text style={styles.chartHdr}>THE FLOOR — FOUND IN EVERY SOCIETY DOCUMENTED</Text>
        {TRAITS.map((tr, k) => (
          <Text key={`t${tr}`} style={[styles.traitT, { top: CHART_T + k * PITCH }]}>{tr}</Text>
        ))}
        {TRAITS.map((tr, k) => <Bar key={`b${tr}`} S={SCENE} k={k} />)}
        {TRAITS.map((tr, k) => (
          <Text key={`v${tr}`} style={[styles.valT, { top: CHART_T + k * PITCH }]}>ALL</Text>
        ))}
      </Animated.View>

      {/* ── Q2 answered in the scene: two verdict stamps ──────────────────── */}
      {asking && (
        <>
          <Text style={styles.askLabel}>TAP YOUR VERDICT</Text>
          {VERDICTS.map((v) => (
            <Pressable
              key={v.id}
              style={[styles.vHit, { left: v.x, top: V_T }]}
              disabled={answered}
              onPress={() => onPick(v.id, v.correct)}
            >
              <View
                style={[
                  styles.vBox,
                  answered && v.correct && styles.vRight,
                  answered && picked === v.id && !v.correct && styles.vWrong,
                ]}
              >
                <Text style={[styles.vText, answered && v.correct && styles.vTextOn]}>{v.label}</Text>
              </View>
            </Pressable>
          ))}
        </>
      )}
    </Animated.View>
  );
}

/** One culture's code: its emblem, its name, and rows that get written in. */
function Tablet({
  left, name, emblem, rows, S,
}: { left: number; name: string; emblem: 'tri' | 'dia'; rows: string[]; S: SharedValue<any> }) {
  return (
    <View style={[styles.tablet, { left }]} pointerEvents="none">
      <View style={styles.tabHead}>
        {emblem === 'tri' ? <View style={styles.triangle} /> : <View style={styles.diamond} />}
        <Text style={styles.tabName}>{name}</Text>
      </View>
      <View style={styles.tabRule} />
      {rows.map((r, k) => <CodeRow key={r} S={S} text={r} k={k} />)}
    </View>
  );
}

function CodeRow({ S, text, k }: { S: SharedValue<any>; text: string; k: number }) {
  const st = useAnimatedStyle(() => {
    const on = clamp01(S.value.rows - k);
    return { opacity: on, transform: [{ translateX: (1 - on) * -12 }] };
  });
  return (
    <Animated.View style={[styles.codeRow, { top: CODE_ROW[k] - TAB_T }, st]}>
      <Text style={styles.codeDash}>·</Text>
      <Text style={styles.codeT}>{text}</Text>
    </Animated.View>
  );
}

/** One universal's bar. Scaled, never re-laid-out — a width animation relayouts. */
function Bar({ S, k }: { S: SharedValue<any>; k: number }) {
  const fill = useAnimatedStyle(() => ({
    transform: [{ scaleX: clamp01((S.value.floor - k * 0.09) / 0.55) }],
  }));
  return (
    <View style={[styles.barTrack, { top: CHART_T + k * PITCH }]} pointerEvents="none">
      <Animated.View style={[styles.barFill, fill]} />
    </View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 24, right: 24, top: FIG_G, height: 1.5, backgroundColor: RULE },

  layerLabel: {
    position: 'absolute', left: 0, right: 0, top: 190, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 9.5, letterSpacing: 1.6, color: SOFT,
  },

  tablet: {
    position: 'absolute', top: TAB_T, width: TAB_W, height: TAB_H,
    borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: PAPER,
  },
  tabHead: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingLeft: 10, paddingTop: 6 },
  tabName: { fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.4, color: SOFT },
  tabRule: { marginTop: 5, marginHorizontal: 8, height: 1, backgroundColor: RULE },
  triangle: {
    width: 0, height: 0,
    borderLeftWidth: 8, borderRightWidth: 8, borderBottomWidth: 14,
    borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: INK,
  },
  diamond: { width: 12, height: 12, borderWidth: 2.5, borderColor: INK, transform: [{ rotate: '45deg' }] },

  codeRow: { position: 'absolute', left: 10, right: 8, flexDirection: 'row', alignItems: 'center', gap: 6 },
  codeDash: { fontFamily: 'Inter_700Bold', fontSize: 11, color: SOFT },
  codeT: { fontFamily: 'Inter_700Bold', fontSize: 10.5, letterSpacing: 0.3, color: INK, includeFontPadding: false },

  chartHdr: {
    position: 'absolute', left: 0, right: 0, top: 444, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 9.5, letterSpacing: 1.4, color: SOFT,
  },
  traitT: {
    position: 'absolute', left: 20, width: 124, textAlign: 'right', height: BAR_H, lineHeight: BAR_H,
    fontFamily: 'Inter_700Bold', fontSize: 9.5, letterSpacing: 0.4, color: INK, includeFontPadding: false,
  },
  barTrack: {
    position: 'absolute', left: BAR_L, width: BAR_W, height: BAR_H,
    borderWidth: 1, borderColor: RULE, backgroundColor: PAPER, overflow: 'hidden',
  },
  barFill: {
    position: 'absolute', left: 0, top: 0, width: '100%', height: '100%',
    backgroundColor: INK, transformOrigin: '0% 50%',
  },
  valT: {
    position: 'absolute', left: BAR_L + BAR_W + 8, width: 40, height: BAR_H, lineHeight: BAR_H,
    fontFamily: 'Inter_700Bold', fontSize: 9.5, letterSpacing: 0.8, color: INK, includeFontPadding: false,
  },

  askLabel: {
    position: 'absolute', left: 0, right: 0, top: 200, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.4, color: SOFT,
  },
  vHit: { position: 'absolute', width: TAB_W },
  vBox: {
    height: 48, borderWidth: 2.5, borderColor: INK, borderRadius: 5, backgroundColor: PAPER,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8,
  },
  vRight: { backgroundColor: INK, borderColor: INK },
  vWrong: { borderColor: SOFT, opacity: 0.45 },
  vText: { fontFamily: 'Inter_700Bold', fontSize: 14, letterSpacing: 0.3, color: INK, includeFontPadding: false },
  vTextOn: { color: PAPER },
});

// The band. Topmost ink is the surface label at y 190 (the verdict label sits at 200);
// the lowest is the last universals bar, whose track runs to 460 + 3×13 + 11 = 510.
// The arguers' crowns reach y ≈ 288 at their bounciest and their ankle joints reach
// 441, both comfortably inside. Cropping to 334 units instead of 560 renders the whole
// scene at ~1.95× rather than the letterboxed 1.15×.
export function Ethics4Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Ethics4Scene} band={[184, 518]} />;
}
