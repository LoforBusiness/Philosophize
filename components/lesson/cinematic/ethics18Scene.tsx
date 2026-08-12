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
import { BEATS } from './ethics18Script';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER } from './cinematicKit';
import { followMoves, kindOf, seedOf } from './camera';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';

// A boundary line with two groups either side of it, stage right.
//
// · figure WALKS x = 70 → 168 → 124; widest body span x 132…204 at 168, fist to
//   204.5 at gesture 41. All board ink is at x ≥ 216.
// · header y 226…240 · the two group chips y 252…292 · the boundary line y 246…298
//   sliding x 300 → 386 · the test card y 312…348 · answer row y 364…396.
// · A5 — the board is out of reach (hand tops out at y 411, B11b); read, not handled.
//
// THE LINE'S POSITION IS A FUNCTION OF THE TEST, not a separate channel the script
// can set independently — `wide` drives it and the test card together, so the two
// cannot be animated apart. The lesson's claim is that the boundary follows the
// criterion, and the source is written so it has to.

const BD_L = 216;
const BD_W = 176;
const BD_R = BD_L + BD_W;

const HEAD_T = 226;
const CHIP_T = 252;
const CHIP_H = 40;
const CHIP_W = 70;
const CHIP_LX = BD_L + 6;
const CHIP_RX = BD_L + 90;

const LINE_T = 246;
const LINE_H = 52;
const LINE_NARROW = 300;
const LINE_WIDE = 386;

const TEST_T = 312;
const TEST_H = 36;

// A VERTICAL stack, not the three-across row its siblings use. "SPECIESISM" and
// "RELATIVISM" are ten characters, and a 56-unit chip holds about eight at this
// size — RELATIVISM measured 49.1 into 51.3, a 4% margin, which under
// numberOfLines={1} truncates rather than wraps. Full width gives 172 (D30).
const ANS_T = 364;
const ANS_H = 32;
const ANS_PITCH = 36;
const ANS_SLOP = (ANS_PITCH - ANS_H) / 2;

const TESTS = ['', 'CAN IT REASON?', 'CAN IT SUFFER?'];

const ANSWERS = [
  { id: 'spec', label: 'SPECIESISM', correct: true },
  { id: 'rel', label: 'RELATIVISM', correct: false },
  { id: 'util', label: 'UTILITY', correct: false },
];

const P = BEATS.map((b) => b.p ?? 0);
const X = BEATS.map((b) => b.x ?? 124);
// The camera, from the staging: it follows the figure this track describes,
// pulls back to scale 1 on every graded beat so a tap lands where it is aimed,
// and leans in on the quote. See followMoves in ./camera.ts.
const CAM = followMoves(X, BEATS.map(kindOf), seedOf('ethics18'));
const DIR = dirsFrom(X, 1);
const LINEV = BEATS.map((b) => b.line ?? 0);
const WIDE = BEATS.map((b) => b.wide ?? 0);

export default function Ethics18Scene({ clock, bt, bi, i, picked, onPick }: SceneApi) {
  const cur = BEATS[i];
  const prev = i > 0 ? BEATS[i - 1] : undefined;

  const lineFade = (cur.line ?? 0) !== (prev?.line ?? 0);
  const wideFade = (cur.wide ?? 0) !== (prev?.wide ?? 0);
  const testFade = (cur.test ?? 0) !== (prev?.test ?? 0);
  const testOn = (cur.test ?? 0) > 0;

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
    const wide = lerp(WIDE[p], WIDE[n], wideFade ? grow : tr);
    return {
      fig: pose(s, lerp(X[p], X[n], tr), GROUND, K_FIG, DIR[n], 1),
      board: lerp(LINEV[p], LINEV[n], tr) * (lineFade ? grow : 1),
      wide,
      line: lerp(LINE_NARROW, LINE_WIDE, wide),
      test: testOn ? (testFade ? grow : 1) : 0,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const boardStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.board }));
  const lineStyle = useAnimatedStyle(() => ({ left: SCENE.value.line }));
  const testStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.test }));
  // The animals chip fills with ink exactly as the line passes it — one movement,
  // not two, so "the line took them in" is what the eye sees.
  const animalStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.wide }));

  const answered = picked !== null;
  const showPick = (cur.pick ?? 0) > 0 && !!cur.interact;

  return (
    <Animated.View style={styles.scene}>
      <Animated.View style={[styles.board, boardStyle]} pointerEvents="none">
        <Text style={[styles.head, { left: BD_L, textAlign: 'left' }]} numberOfLines={1}>INSIDE ETHICS</Text>
        <Text style={[styles.head, { left: BD_L, width: BD_W, textAlign: 'right' }]} numberOfLines={1}>OUTSIDE</Text>

        <View style={[styles.chip, { left: CHIP_LX }]}>
          <Text style={styles.chipOnInk} numberOfLines={1}>PEOPLE</Text>
        </View>

        {/* the animals: outlined while outside, filled as the line passes them */}
        <View style={[styles.chipOut, { left: CHIP_RX }]}>
          <Text style={styles.chipText} numberOfLines={1}>ANIMALS</Text>
        </View>
        <Animated.View style={[styles.chip, { left: CHIP_RX }, animalStyle]}>
          <Text style={styles.chipOnInk} numberOfLines={1}>ANIMALS</Text>
        </Animated.View>

        <Animated.View style={[styles.line, lineStyle]} />
      </Animated.View>

      <Animated.View style={[styles.test, testStyle]} pointerEvents="none">
        <Text style={styles.testKicker} numberOfLines={1}>THE TEST</Text>
        <Text style={styles.testText} numberOfLines={1}>{TESTS[cur.test ?? 0]}</Text>
      </Animated.View>

      {showPick &&
        ANSWERS.map((a, k) => {
          const chosen = picked === a.id;
          return (
            <Target id={a.id} correct={a.correct} picked={picked} onPick={onPick}
              key={a.id} style={[styles.ans, { top: ANS_T + k * ANS_PITCH }]} hitSlop={{ top: ANS_SLOP, bottom: ANS_SLOP, left: ANS_SLOP, right: ANS_SLOP }} disabled={answered}>
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
            </Target>
          );
        })}

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DF} k={K_FIG} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 24, right: 14, top: GROUND, height: 1.5, backgroundColor: RULE },

  board: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H },
  head: {
    position: 'absolute', top: HEAD_T, width: BD_W,
    fontFamily: 'Inter_700Bold', fontSize: 8, letterSpacing: 1.2, color: SOFT,
    includeFontPadding: false,
  },
  chip: {
    position: 'absolute', top: CHIP_T, width: CHIP_W, height: CHIP_H,
    borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: INK,
    alignItems: 'center', justifyContent: 'center',
  },
  chipOut: {
    position: 'absolute', top: CHIP_T, width: CHIP_W, height: CHIP_H,
    borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: PAPER,
    alignItems: 'center', justifyContent: 'center',
  },
  chipText: {
    fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 0.6, color: INK,
    includeFontPadding: false,
  },
  chipOnInk: {
    fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 0.6, color: PAPER,
    includeFontPadding: false,
  },
  line: { position: 'absolute', top: LINE_T, width: 3, height: LINE_H, backgroundColor: INK },

  test: {
    position: 'absolute', left: BD_L, top: TEST_T, width: BD_W, height: TEST_H,
    borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: PAPER,
    alignItems: 'center', justifyContent: 'center',
  },
  testKicker: {
    fontFamily: 'Inter_700Bold', fontSize: 7, letterSpacing: 1.4, color: SOFT,
    includeFontPadding: false,
  },
  testText: {
    fontFamily: 'Inter_700Bold', fontSize: 12, letterSpacing: 0.3, color: INK, marginTop: 2,
    includeFontPadding: false,
  },

  ans: { position: 'absolute', left: BD_L, width: BD_W },
  ansInner: {
    height: ANS_H, borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: PAPER,
    alignItems: 'center', justifyContent: 'center',
  },
  ansText: {
    fontFamily: 'Inter_700Bold', fontSize: 8, letterSpacing: 0, color: INK,
    includeFontPadding: false,
  },
  onInk: { color: PAPER },
  pickRight: { backgroundColor: INK, borderColor: INK },
  pickWrong: { borderColor: SOFT, opacity: 0.45 },
});

// Ink runs from the header (226) to the ground line (500). Band 220…512 = 292 (H59).
export function Ethics18Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Ethics18Scene} band={[220, 512]} camera={CAM} />;
}
