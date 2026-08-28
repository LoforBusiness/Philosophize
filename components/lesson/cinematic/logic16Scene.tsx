import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { clamp01, ease01, moveTr, pose, travelStance, WALK, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './logic16Script';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, STONE, SOFT, RULE, PAPER,
  useHeld, carryFrom, keepHeld, useCarry, carry,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// ─────────────────────────────────────────────────────────────────────────────
// A WEEK OF MORNINGS, AND THE ONE WITH A HOLE IN IT.
//
// THE COMPOSITION, IN NUMBERS (H56).
//
// · the CLAIM sits above everything: the words CROW (x 30…90) and SUN (x 312…372)
//   at y 232, with a 2-thick arrow between them at y 246 running x 96…306 and a
//   head at 306. It is the inference, drawn, and it is the only thing on the
//   stage that is an assertion rather than an observation.
// · the STRIP is six panels, 52 wide and 78 tall, at y 264…342, lefts
//   30 · 88 · 146 · 204 · 262 · 320 — so the run ends at x 372 and the whole
//   picture is inside the 400 stage with 28 either side.
//   Inside each: a horizon rule at panel y 62 (stage y 326); a 16px sun that
//   climbs from y 318 to y 280 as that morning plays; and the CROW, a 7px disc
//   at panel x 11, stage y 330, which is the mark that goes missing.
// · the DAY LABELS are at y 346…356, one under each panel.
// · the THREE CANDIDATES replace the strip in place on the question beat — same
//   y 264…342, 108 wide at x 30 · 146 · 262. Nothing new is added below, so the
//   figure never has to move out of the way of a control.
// · the FIGURE walks x 60 → 132 → 250 on GROUND 500; crown ≈ 397. The lowest ink
//   above him is the day labels at 356, so there are 41 clear units between the
//   strip and the top of his head at every stop.
//
// Ink runs y 232 (the claim) … y 500 (the ground). BAND 226…512 = 286, which puts
// the 103-unit figure at 36% — inside H58's 38% with room, and 6 units past the
// free-scale line, which the sixth morning is worth.
// ─────────────────────────────────────────────────────────────────────────────

/** Crossfade for a beat that does NOT walk. 0.85 is the base `footfalls` assumes. */
const BASE_TR = 0.85;

const PANEL_Y = 264;
const PANEL_W = 52;
const PANEL_H = 78;
const PANEL_X = [30, 88, 146, 204, 262, 320];
const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

/** Panel-local geometry, in stage units. */
const HORIZON = PANEL_Y + 62;
const SUN_LOW = PANEL_Y + 54;
const SUN_HIGH = PANEL_Y + 16;
const SUN_D = 16;
const CROW_D = 7;

const CAND_Y = PANEL_Y;
const CAND_W = 108;
const CAND_X = [30, 146, 262];
const CAND_ID = ['again', 'nocrow', 'nosun'];
const CAND_TOP = ['CROW AGAIN', 'NO CROW', 'NO SUNRISE'];
const CAND_SUB = ['a sixth like the five', 'the bird stays quiet', 'hold the sun back'];

const CLAIM_Y = 232;
const ARROW_Y = 246;
const FIG_X = 60;

const X = BEATS.map((b) => b.x ?? FIG_X);
const P = BEATS.map((b) => b.p ?? 0);
const DAWNS = BEATS.map((b) => b.dawns ?? 0);
const ARROW = BEATS.map((b) => b.arrow ?? 0);
const CANDS = BEATS.map((b) => b.cands ?? 0);
const SILENT = BEATS.map((b) => b.silent ?? 0);
const LIVE = BEATS.map((b) => b.live ?? 0);

// R7b — the stage follows the control on its own graded beat, and only there.
// Derived from the beat rather than declared as a channel so it cannot fall out
// of step with the control it is about.
const REACT = BEATS.map((b) => (b.interact?.field ? 1 : 0));

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('logic16'));

export default function Logic16Scene({ clock, bt, bi, i, picked, onPick, dragPos, dragPos2 }: SceneApi) {
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

    const figS = keepHeld(heldFig, travelStance(
      X[p], X[n],
      carryFrom(heldFig, n, emoteHold(P[p], t)), emoteHold(P[n], t), emoteLive(P[n], t, bt.value),
      tr, WALK,
    ));

    return {
      fig: pose(figS, carry(cv, 0, n, X[p], X[n], tr), GROUND, K_FIG, 1, 1),
      // R7b — the pad plays the mornings. Up the y axis, from seen once to seen five
      // times, the strip fills in one dawn at a time.
      dawns: carry(cv, 1, n, DAWNS[p], reacting ? dragPos2.value * 6 : DAWNS[n], tr),
      // And across: the CROW → SUN arrow only appears as the token moves right, from
      // they merely pair up to one makes the other happen. The reader can pile up
      // mornings without ever earning the arrow, which is the whole lesson.
      arrow: carry(cv, 2, n, ARROW[p], reacting ? dragPos.value : ARROW[n], tr),
      cands: carry(cv, 3, n, CANDS[p], CANDS[n], tr),
      silent: carry(cv, 4, n, SILENT[p], SILENT[n], tr),
      t,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const answered = picked !== null;
  const live = !!BEATS[i]?.interact && !BEATS[i]?.interact?.cards && LIVE[i] === 1;

  // The strip and the candidates share the same rows, so one fades out as the
  // other fades in and the stage never grows.
  const stripStyle = useAnimatedStyle(() => ({ opacity: 1 - SCENE.value.cands }));
  const candStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.cands }));
  const arrowStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.arrow }));

  const panels = [0, 1, 2, 3, 4, 5];

  return (
    <View style={styles.scene}>
      {/* THE CLAIM. The only assertion on the stage; everything below it is a
          record of what happened. */}
      <Animated.View style={[StyleSheet.absoluteFill, arrowStyle]} pointerEvents="none">
        <Text style={[styles.claim, { left: 30 }]}>CROW</Text>
        <Text style={[styles.claim, { left: 312 }]}>SUN</Text>
        <View style={styles.arrowLine} />
        <View style={styles.arrowHead} />
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, stripStyle]} pointerEvents="none">
        {panels.map((k) => <Morning key={k} S={SCENE} index={k} />)}
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, candStyle]}>
        {CAND_X.map((cx, k) => (
          <Target
            key={CAND_ID[k]}
            id={CAND_ID[k]}
            correct={CAND_ID[k] === 'nocrow'}
            picked={picked}
            onPick={onPick}
            disabled={!live || answered}
            style={[styles.cand, { left: cx }]}
          >
            <View
              style={[
                styles.candBox,
                answered && CAND_ID[k] === 'nocrow' && styles.candRight,
                answered && picked === CAND_ID[k] && CAND_ID[k] !== 'nocrow' && styles.candWrong,
              ]}
              pointerEvents="none"
            >
              <Text
                style={[styles.candTop, answered && CAND_ID[k] === 'nocrow' && styles.candTopOn]}
                numberOfLines={1}
              >
                {CAND_TOP[k]}
              </Text>
              <Text
                style={[styles.candSub, answered && CAND_ID[k] === 'nocrow' && styles.candSubOn]}
                numberOfLines={2}
              >
                {CAND_SUB[k]}
              </Text>
            </View>
          </Target>
        ))}
      </Animated.View>

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DF} k={K_FIG} />
    </View>
  );
}

/**
 * One morning. The sun climbs when this panel's turn comes; the crow is a dot
 * that appears with it — except on the sixth, where `silent` holds it back and
 * the sun goes up regardless. That single missing dot is the lesson.
 */
function Morning({ S, index }: { S: SharedValue<any>; index: number }) {
  const left = PANEL_X[index];
  const sunStyle = useAnimatedStyle(() => {
    const u = clamp01(S.value.dawns - index);
    return { opacity: u, transform: [{ translateY: (SUN_HIGH - SUN_LOW) * u }] };
  });
  const crowStyle = useAnimatedStyle(() => {
    const u = clamp01(S.value.dawns - index);
    return { opacity: index === 5 ? u * (1 - S.value.silent) : u };
  });
  return (
    <View pointerEvents="none">
      <View style={[styles.panel, { left }]} />
      <View style={[styles.horizon, { left: left + 6 }]} />
      <Animated.View style={[styles.sun, { left: left + (PANEL_W - SUN_D) / 2 }, sunStyle]} />
      <Animated.View style={[styles.crow, { left: left + 11 }, crowStyle]} />
      <Text style={[styles.day, { left }]} pointerEvents="none">{DAYS[index]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 20, right: 14, top: GROUND, height: 1.5, backgroundColor: RULE },
  // THE FLOOR THE GROUND LINE SITS ON. A rule on its own leaves the
  // figure and everything it is looking at standing on bare page;
  // political7 and political8 both stand their subject on a filled mass.
  floor: { position: 'absolute', left: 0, right: 0, top: GROUND, bottom: 0, backgroundColor: RULE },

  claim: {
    position: 'absolute', top: CLAIM_Y, width: 60, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 1.4, color: INK, includeFontPadding: false,
  },
  arrowLine: { position: 'absolute', left: 96, top: ARROW_Y, width: 210, height: 2, backgroundColor: INK },
  arrowHead: {
    position: 'absolute', left: 300, top: ARROW_Y - 4, width: 10, height: 10,
    borderRightWidth: 2, borderTopWidth: 2, borderColor: INK, transform: [{ rotate: '45deg' }],
  },

  panel: {
    position: 'absolute', top: PANEL_Y, width: PANEL_W, height: PANEL_H,
    borderWidth: 1.5, borderColor: SOFT, borderRadius: 3, backgroundColor: STONE,
  },
  horizon: { position: 'absolute', top: HORIZON, width: PANEL_W - 12, height: 1, backgroundColor: RULE },
  sun: {
    position: 'absolute', top: SUN_LOW, width: SUN_D, height: SUN_D, borderRadius: SUN_D / 2,
    borderWidth: 2, borderColor: INK,
  },
  crow: {
    position: 'absolute', top: HORIZON + 4, width: CROW_D, height: CROW_D, borderRadius: CROW_D / 2,
    backgroundColor: INK,
  },
  day: {
    position: 'absolute', top: PANEL_Y + PANEL_H + 4, width: PANEL_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1, color: SOFT, includeFontPadding: false,
  },

  cand: { position: 'absolute', top: CAND_Y, width: CAND_W, height: PANEL_H },
  candBox: {
    width: CAND_W, height: PANEL_H, borderWidth: 2, borderColor: INK, borderRadius: 4,
    backgroundColor: STONE, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 7,
  },
  candRight: { backgroundColor: INK },
  candWrong: { borderColor: SOFT, opacity: 0.45 },
  candTop: {
    fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 0.9, color: INK,
    textAlign: 'center', includeFontPadding: false,
  },
  candTopOn: { color: PAPER },
  candSub: {
    fontFamily: 'Inter_400Regular', fontSize: 8.6, lineHeight: 11, color: INK,
    textAlign: 'center', marginTop: 5, includeFontPadding: false,
  },
  candSubOn: { color: PAPER },
});

export function Logic16Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Logic16Scene} band={[226, 512]} camera={CAM} />;
}
