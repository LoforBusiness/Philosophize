import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { dirsFrom, clamp01, ease01, moveTr, travelStance, WALK, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './aesthetics38Script';
import {
  facing, GROUND, K_FIG, STAGE_W, STAGE_H, INK, STONE, SOFT, RULE, PAPER, useHeld, carryFrom, keepHeld, useCarry, carry, pickAt, lookPose,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// ─────────────────────────────────────────────────────────────────────────────
// FIVE SCENES, TWO BARS EACH, AND THE THREE CLAIMS THAT CANNOT ALL STAND.
//
// THE COMPOSITION, IN NUMBERS (H56).
//
// · the CHART sits on a baseline at y 380 running x 138…386. Five SCENE COLUMNS
//   of 44 at x 140 · 190 · 240 · 290 · 340, each holding two bars 18 wide with 4
//   between them, growing UP from the baseline to at most 100.
// · WHAT YOU KNOW is the left bar of each pair and is full height everywhere,
//   because the reader has seen the film. WHAT YOU FEEL is the right bar and runs
//   0.20 · 0.35 · 0.55 · 0.85 · 0.30 — it climbs to the scene before the end and
//   drops once he is out, which is the shape the paradox is about.
// · a BAR GROWS BY scaleY FROM ITS OWN FOOT (`transformOrigin: 50% 100%`), so the
//   bars never move their baseline and the chart cannot drift off its rule.
// · the LEGEND is two 10-swatches with their names at y 396, and the SCENE
//   NUMBERS sit at y 384.
// · the THREE CLAIMS are 80×40 plates at y 424, x 140 · 223 · 306, each inside its
//   own Target (E39). Two of them are observations and one is a theory, and they
//   are drawn identically so the reader has to notice which is which.
// · the POLL sags the KNOW bars in the middle three scenes by a weight of
//   0 · 0.6 · 1 · 0.6 · 0, so an account that says you set your knowledge aside
//   dips the line and one that says you forget drops it away.
// · the figure stands at x 52 and walks to 98; his right edge is 124, clear of the
//   chart's 138.
//
// Ink runs y 236 (the caption) … y 500 (ground). BAND 232…512 = 280 — a 103-unit
// figure at 36.8%, inside H58's 38%.
// ─────────────────────────────────────────────────────────────────────────────

/** Crossfade for a beat that does NOT walk. 0.85 is the base `footfalls` assumes. */
const BASE_TR = 0.85;

const BASE_Y = 380;
const BAR_MAX = 100;
const BAR_W = 18;
const COL_X = [140, 190, 240, 290, 340];
const COL_W = 44;
/** How tense the scene is, scene by scene — the reason the chart exists. */
const FEEL = [0.2, 0.35, 0.55, 0.85, 0.3];
/** How much a middle scene sags when an account says knowledge is set aside. */
const MIDW = [0, 0.6, 1, 0.6, 0];

const LEG_Y = 396;
const NUM_Y = 384;

const CL_Y = 424;
const CL_W = 80;
const CL_H = 40;
const CL_X = [140, 223, 306];
// TWO LINES, TWO <Text>s — a newline inside one string measures as ONE line to
// `check:fits`, and that is the instrument that has to be able to see this.
const CL_CAP = [['YOU KNOW', 'THE ENDING'], ['YOU ARE', 'STILL TENSE'], ['SUSPENSE', 'NEEDS DOUBT']];
const CL_ID = ['know', 'tense', 'doubt'];
/** The one that is a theory. The other two the reader can check tonight. */
const THEORY = 2;

const CAP_T = 236;
const FIG_X = 52;

const X = BEATS.map((b) => b.x ?? FIG_X);
// WHICH WAY HE IS POINTING, read off the same x track he walks along:
// +1 where it rises, -1 where it falls, and HOLD while he stands still.
const DIR = dirsFrom(X, 1);
const P = BEATS.map((b) => b.p ?? 0);
const CHART = BEATS.map((b) => (b.chart ? 1 : 0));
const BARS = BEATS.map((b) => b.bars ?? 0);
const CLAIMS = BEATS.map((b) => (b.claims ? 1 : 0));
const LIVE = BEATS.map((b) => (b.live ? 1 : 0));

// R7b — the stage follows the control on its own graded beat, and only there.
const REACT = BEATS.map((b) => (b.interact?.poll ? 1 : 0));

// THE THREE ACCOUNTS AS THREE SHAPES OF ONE LINE, in the BALLOT'S OWN ORDER —
// `pickPos` runs across the options as the author wrote them, which is the only
// order a picture may follow, because the rows the reader sees are shuffled.
//                  set aside · at stake · forget
const DIP_AT = [0.4, 0, 0.95];

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('aesthetics38'));

export default function Aesthetics38Scene({ clock, bt, bi, i, picked, onPick, pickPos, gazeX, gazeY, gazeOn }: SceneApi) {
  const reacting = REACT[i] === 1;
  const heldFig = useHeld();
  const cv = useCarry(5);
  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    // A WALKING BEAT TAKES AS LONG AS THE WALK NEEDS (rig.moveTr).
    const tr = ease01(bt.value / moveTr(X[p], X[n], BASE_TR));
    const t = clock.value;

    const figS = keepHeld(heldFig, travelStance(
      X[p], X[n],
      carryFrom(heldFig, n, emoteHold(P[p], t)), emoteHold(P[n], t), emoteLive(P[n], t, bt.value),
      tr, WALK,
    ));

    return {
      fig: lookPose(figS, carry(cv, 0, n, X[p], X[n], tr), GROUND, K_FIG, facing(DIR[p], DIR[n], bt.value), 1, gazeX.value, gazeY.value, gazeOn.value),
      t,
      chartOn: carry(cv, 1, n, CHART[p], CHART[n], tr),
      bars: carry(cv, 2, n, BARS[p], BARS[n], tr),
      claimsOn: carry(cv, 3, n, CLAIMS[p], CLAIMS[n], tr),
      // R7c — the ballot reshapes the line the reader is being asked about.
      dip: carry(cv, 4, n, 0, reacting ? pickAt(DIP_AT, pickPos.value) : 0, tr),
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const answered = picked !== null;
  const live = !!BEATS[i]?.interact && !BEATS[i]?.interact?.cards && LIVE[i] === 1;

  const chartStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.chartOn }));
  const claimsStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.claimsOn }));

  return (
    <View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      <Text style={styles.cap} pointerEvents="none">THE SAME FILM, THE SECOND TIME</Text>

      <Animated.View style={[StyleSheet.absoluteFill, chartStyle]} pointerEvents="none">
        <View style={styles.baseline} />
        {COL_X.map((cx, k) => (
          <View key={cx}>
            <Bar S={SCENE} col={k} kind={0} />
            <Bar S={SCENE} col={k} kind={1} />
            <Text style={[styles.num, { left: cx }]}>{k + 1}</Text>
          </View>
        ))}

        <View style={[styles.swatch, { left: 140 }]} />
        <Text style={[styles.legend, { left: 154 }]}>WHAT YOU KNOW</Text>
        <View style={[styles.swatchFeel, { left: 262 }]} />
        <Text style={[styles.legend, { left: 276 }]}>WHAT YOU FEEL</Text>
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, claimsStyle]}>
        {CL_X.map((cx, k) => (
          <Target
            key={cx}
            id={CL_ID[k]}
            correct={k === THEORY}
            picked={picked}
            onPick={onPick}
            disabled={!live || answered}
            style={[styles.hit, { left: cx }]}
          >
            <View
              style={[
                styles.claim,
                answered && picked === CL_ID[k] && k !== THEORY && styles.claimWrong,
                answered && k === THEORY && styles.claimRight,
              ]}
              pointerEvents="none"
            >
              <Text style={[styles.claimText, answered && k === THEORY && styles.claimTextOn]}>{CL_CAP[k][0]}</Text>
              <Text style={[styles.claimText, styles.claimText2, answered && k === THEORY && styles.claimTextOn]}>{CL_CAP[k][1]}</Text>
            </View>
          </Target>
        ))}
      </Animated.View>

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DF} k={K_FIG} />
    </View>
  );
}

/** One bar of one scene. `kind` 0 is what you know, 1 is what you feel. */
function Bar({ S, col, kind }: { S: SharedValue<any>; col: number; kind: number }) {
  const left = COL_X[col] + (kind === 0 ? 2 : 2 + BAR_W + 4);
  const st = useAnimatedStyle(() => {
    const grown = clamp01(S.value.bars * 5 - col);
    const full = kind === 0 ? 1 - S.value.dip * MIDW[col] : FEEL[col];
    return { opacity: grown, transform: [{ scaleY: grown * full }] };
  });
  return <Animated.View style={[kind === 0 ? styles.barKnow : styles.barFeel, { left }, st]} />;
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 20, right: 14, top: GROUND, height: 1.5, backgroundColor: RULE },
  // THE FLOOR THE GROUND LINE SITS ON — political7 and political8 both stand
  // their subject on a filled mass rather than on bare page.
  floor: { position: 'absolute', left: 0, right: 0, top: GROUND, bottom: 0, backgroundColor: RULE },

  cap: {
    position: 'absolute', left: 138, top: CAP_T, width: 248,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.4, color: SOFT, includeFontPadding: false,
  },

  baseline: { position: 'absolute', left: 138, top: BASE_Y, width: 248, height: 2, backgroundColor: INK },
  // A BAR GROWS FROM ITS OWN FOOT. Scaling about the middle would lift the chart
  // off its own rule, which is the one line in this picture that may not move.
  barKnow: {
    position: 'absolute', top: BASE_Y - BAR_MAX, width: BAR_W, height: BAR_MAX,
    backgroundColor: STONE, borderWidth: 1.5, borderColor: INK, transformOrigin: '50% 100%',
  },
  barFeel: {
    position: 'absolute', top: BASE_Y - BAR_MAX, width: BAR_W, height: BAR_MAX,
    backgroundColor: INK, transformOrigin: '50% 100%',
  },
  num: {
    position: 'absolute', top: NUM_Y, width: COL_W, textAlign: 'center',
    fontFamily: 'Inter_500Medium', fontSize: 8.6, color: SOFT, includeFontPadding: false,
  },

  swatch: {
    position: 'absolute', top: LEG_Y, width: 10, height: 10,
    backgroundColor: STONE, borderWidth: 1.5, borderColor: INK,
  },
  swatchFeel: { position: 'absolute', top: LEG_Y, width: 10, height: 10, backgroundColor: INK },
  legend: {
    position: 'absolute', top: LEG_Y + 1, width: 100,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.5, color: INK, includeFontPadding: false,
  },

  hit: { position: 'absolute', top: CL_Y, width: CL_W, height: CL_H },
  claim: {
    position: 'absolute', left: 0, top: 0, width: CL_W, height: CL_H,
    borderWidth: 2, borderColor: INK, borderRadius: 3, backgroundColor: PAPER,
  },
  claimRight: { backgroundColor: INK },
  claimWrong: { borderColor: SOFT, borderStyle: 'dashed' },
  claimText: {
    position: 'absolute', left: 0, top: 9, width: CL_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.5, color: INK, includeFontPadding: false,
  },
  claimText2: { top: 21 },
  claimTextOn: { color: PAPER },
});

export function Aesthetics38Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Aesthetics38Scene} band={[232, 512]} camera={CAM} />;
}
